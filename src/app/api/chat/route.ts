import { DEMO_REPLIES, MODEL, SYSTEM_PROMPT } from '@/lib/chat-config';

// Streaming chat route handler (FE-06). Two modes, one stream:
//  - Live: when GEMINI_API_KEY is set (server-side only), messages go to
//    the Gemini API and its SSE stream is translated into plain text deltas.
//  - Demo: with no key configured, a scripted qualification flow streams
//    word-by-word so the interface is fully testable (streaming, stop,
//    multi-turn state) before the key exists.
// Either way the client receives the same thing: a plain-text stream.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

function textStream(chunks: AsyncIterable<string>, signal: AbortSignal) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of chunks) {
            if (signal.aborted) break;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch {
          // A failed upstream ends the stream; the client keeps whatever
          // partial message it received, which is the honest outcome.
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    },
  );
}

async function* geminiStream(
  messages: ChatMessage[],
): AsyncIterable<string> {
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
async function* demoStream(messages: ChatMessage[]): AsyncIterable<string> {
  const assistantTurns = messages.filter((m) => m.role === 'assistant').length;
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const offTopic =
    lastUser !== undefined &&
    !/(site|website|store|shop|page|app|dashboard|restaurant|landing|build|project|booking|reservation|catalog|portfolio)/i.test(
      lastUser.content,
    );
  const reply =
    assistantTurns === 0
      ? DEMO_REPLIES.greeting
      : offTopic && assistantTurns >= 3
        ? DEMO_REPLIES.fallback
        : assistantTurns === 1
          ? DEMO_REPLIES.scope
          : assistantTurns === 2
            ? DEMO_REPLIES.timeline
            : DEMO_REPLIES.summary;
  const words = reply.split(' ');
  for (let i = 0; i < words.length; i++) {
    yield words[i] + (i < words.length - 1 ? ' ' : '');
    await new Promise((resolve) => setTimeout(resolve, 24));
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const raw = (body as Record<string, unknown> | null)?.messages;
  if (!Array.isArray(raw) || !raw.every(isChatMessage) || raw.length === 0) {
    return Response.json({ error: 'messages required' }, { status: 400 });
  }
  const messages = raw.slice(-20);
  const source = process.env.GEMINI_API_KEY
    ? geminiStream(messages)
    : demoStream(messages);
  return textStream(source, request.signal);
}
