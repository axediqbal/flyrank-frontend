import {
  DEMO_REPLIES,
  MODEL,
  SAMPLE_LEAD,
  SYSTEM_PROMPT,
  TOOL_INTRO,
} from '@/lib/chat-config';
import { executeScoreLead, leadInputSchema } from '@/lib/score-lead';
import { checkRateLimit } from '@/lib/rate-limit';

// Streaming chat route handler (FE-06, extended for FE-07 + FE-08).
//
// The stream is newline-delimited JSON events, one protocol for both
// modes (live Gemini / scripted demo) and for tool calls:
//
//   { t: 'text', d }                                   a text delta
//   { t: 'tool', phase: 'input-streaming', partial }   tool input arriving
//   { t: 'tool', phase: 'input-available', input }     full tool input
//   { t: 'tool', phase: 'output-available', output }   tool result
//   { t: 'tool', phase: 'output-error', error }        tool failed, designed
//   { t: 'stream-error', kind, message }               the stream itself died
//
// Tool calls (FE-07): the route orchestrates the score_lead tool — the
// trigger is the client's intent (the /chat tool-demo buttons) or a
// "score … lead" phrasing in the visitor's message. The tool's schema and
// execute function live in src/lib/score-lead.ts; its contract is
// documented in the README.
//
// Failure drills (FE-08): the client can pass sabotage: 'rate-limit' |
// 'drop' (the /chat "test the failure states" buttons) to rehearse the
// designed error states on demand. STATES.md inventories every case.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// FE-11: a streamed reply is word-paced with small sleeps; 30s bounds
// a runaway stream without cutting any real reply short.
export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type ChatEvent =
  | { t: 'text'; d: string }
  | {
      t: 'tool';
      phase: 'input-streaming';
      id: string;
      name: 'score_lead';
      partial: string;
    }
  | {
      t: 'tool';
      phase: 'input-available';
      id: string;
      name: 'score_lead';
      input: unknown;
    }
  | {
      t: 'tool';
      phase: 'output-available';
      id: string;
      name: 'score_lead';
      output: unknown;
    }
  | {
      t: 'tool';
      phase: 'output-error';
      id: string;
      name: 'score_lead';
      error: string;
    }
  | { t: 'stream-error'; kind: 'mid-stream'; message: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === 'user' || v.role === 'assistant') &&
    typeof v.content === 'string'
  );
}

// Lets the client badge the mode honestly ("Live" vs "Demo mode").
export async function GET() {
  return Response.json({ mode: process.env.GEMINI_API_KEY ? 'live' : 'demo' });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function* wordEvents(text: string): AsyncIterable<ChatEvent> {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    yield { t: 'text', d: words[i] + (i < words.length - 1 ? ' ' : '') };
    await sleep(24);
  }
}

// One tool call, all four lifecycle states. Validation failure is a
// designed outcome, not an exception: the schema's issues become the
// output-error part the client renders as an error card.
async function* toolEvents(lead: unknown): AsyncIterable<ChatEvent> {
  const id = 'tool-score-lead';
  yield* wordEvents(TOOL_INTRO + ' ');
  const raw = JSON.stringify(lead);
  const third = Math.ceil(raw.length / 3);
  for (let i = 1; i <= 3; i++) {
    yield {
      t: 'tool',
      phase: 'input-streaming',
      id,
      name: 'score_lead',
      partial: raw.slice(0, third * i),
    };
    await sleep(140);
  }
  yield { t: 'tool', phase: 'input-available', id, name: 'score_lead', input: lead };
  await sleep(500);

  const parsed = leadInputSchema.safeParse(lead);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`)
      .join(' ');
    yield { t: 'tool', phase: 'output-error', id, name: 'score_lead', error: issues };
    yield* wordEvents(
      ' That lead could not be scored — the card shows exactly what was missing. Nothing was guessed to fill the gap.',
    );
    return;
  }
  const output = executeScoreLead(parsed.data);
  yield { t: 'tool', phase: 'output-available', id, name: 'score_lead', output };
  yield* wordEvents(
    ' The full picture is on the card. If this were your business, the next step would be the contact form on the home page.',
  );
}

async function* geminiText(messages: ChatMessage[]): AsyncIterable<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL.id}:streamGenerateContent?alt=sse&key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: MODEL.maxOutputTokens },
    }),
  });
  if (!res.ok || !res.body) throw new Error(`Gemini request failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const json: unknown = JSON.parse(line.slice(6));
        const text = extractText(json);
        if (text) yield text;
      } catch {
        // A partial JSON line waits for the next chunk; never fatal.
      }
    }
  }
}

function extractText(json: unknown): string {
  if (typeof json !== 'object' || json === null) return '';
  const candidates = (json as Record<string, unknown>).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return '';
  const content = (candidates[0] as Record<string, unknown>).content;
  if (typeof content !== 'object' || content === null) return '';
  const parts = (content as Record<string, unknown>).parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) =>
      typeof p === 'object' && p !== null && typeof (p as Record<string, unknown>).text === 'string'
        ? ((p as Record<string, unknown>).text as string)
        : '',
    )
    .join('');
}

// The demo flow walks the same qualification steps the system prompt
// describes, chosen by how many assistant turns already exist.
function demoReply(messages: ChatMessage[]): string {
  const assistantTurns = messages.filter((m) => m.role === 'assistant').length;
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const offTopic =
    lastUser !== undefined &&
    !/(site|website|store|shop|page|app|dashboard|restaurant|landing|build|project|booking|reservation|catalog|portfolio|score|lead)/i.test(
      lastUser.content,
    );
  return assistantTurns === 0
    ? DEMO_REPLIES.greeting
    : offTopic && assistantTurns >= 3
      ? DEMO_REPLIES.fallback
      : assistantTurns === 1
        ? DEMO_REPLIES.scope
        : assistantTurns === 2
          ? DEMO_REPLIES.timeline
          : DEMO_REPLIES.summary;
}

async function* eventSource(
  messages: ChatMessage[],
  intent: { tool?: string; lead?: unknown } | undefined,
  sabotage: string | undefined,
): AsyncIterable<ChatEvent> {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const wantsTool =
    intent?.tool === 'score_lead' ||
    (lastUser !== undefined && /score (this|that|a|the) lead/i.test(lastUser.content));

  if (wantsTool) {
    yield* toolEvents(intent?.lead ?? SAMPLE_LEAD);
    return;
  }

  if (process.env.GEMINI_API_KEY) {
    for await (const chunk of geminiText(messages)) {
      yield { t: 'text', d: chunk };
    }
    return;
  }

  const reply = demoReply(messages);
  if (sabotage === 'drop') {
    // FE-08 drill: stream part of a reply, then the connection "dies".
    const cut = Math.max(1, Math.floor(reply.split(' ').length * 0.4));
    const partial = reply.split(' ').slice(0, cut).join(' ');
    yield* wordEvents(partial);
    yield {
      t: 'stream-error',
      kind: 'mid-stream',
      message: 'The connection dropped mid-reply.',
    };
    return;
  }
  yield* wordEvents(reply);
}

function eventStream(events: AsyncIterable<ChatEvent>, signal: AbortSignal) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of events) {
            if (signal.aborted) break;
            controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
          }
        } catch {
          // An upstream failure ends the stream; the client keeps the
          // partial message and offers a retry (see STATES.md).
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    },
  );
}

export async function POST(request: Request) {
  // FE-11: bound attempts before any other work — the same
  // per-instance limit shape as /api/contact (see rate-limit.ts).
  // The FE-08 'rate-limit' sabotage drill is separate: that one is a
  // simulated 429 the client rehearses on demand, this one is real.
  const limited = checkRateLimit(request, {
    limit: 30,
    windowMs: 60_000,
    route: 'chat',
  });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const record = body as Record<string, unknown> | null;
  const raw = record?.messages;
  if (!Array.isArray(raw) || !raw.every(isChatMessage) || raw.length === 0) {
    return Response.json({ error: 'messages required' }, { status: 400 });
  }
  // FE-11 input caps: a qualification chat never needs more than this,
  // and an unbounded array or message is a trivial abuse vector.
  if (raw.length > 50) {
    return Response.json(
      { error: 'Too many messages — send at most 50 at a time.' },
      { status: 400 },
    );
  }
  if (raw.some((m) => m.content.length > 4000)) {
    return Response.json(
      { error: 'Keep each message to 4000 characters or fewer.' },
      { status: 400 },
    );
  }
  // FE-08 drill: a rate-limit is a status, not a stream.
  if (record?.sabotage === 'rate-limit') {
    return Response.json(
      { error: 'rate-limit', message: 'Too many requests — wait a few seconds, then retry.' },
      { status: 429 },
    );
  }
  const intent =
    typeof record?.intent === 'object' && record?.intent !== null
      ? (record.intent as { tool?: string; lead?: unknown })
      : undefined;
  const sabotage = typeof record?.sabotage === 'string' ? record.sabotage : undefined;
  const messages = raw.slice(-20);
  return eventStream(eventSource(messages, intent, sabotage), request.signal);
}
