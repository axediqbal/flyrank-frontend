'use client';

// Streaming chat client (FE-06), extended for FE-07 + FE-08.
//
// Consumes the NDJSON event stream from /api/chat (see the route handler
// for the protocol). Three things live here that the briefs grade:
//  - FE-07: tool parts render as a state machine — input-streaming,
//    input-available, output-available (a real ScoreCard component),
//    output-error (a designed error card) — each answering a different
//    question, none of them a JSON dump.
//  - FE-08: a failed turn keeps its partial text and gains an error card
//    whose Retry resends exactly the failed message (never the whole
//    conversation); the first-run empty state teaches with click-to-fill
//    examples and hosts the tool + failure demos; a layout-matched
//    skeleton covers first load.
//  - FE-06, unchanged: thinking indicator until the first token, Stop
//    keeps the partial message, auto-scroll pins only near the bottom,
//    the conversation persists in localStorage.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useSearchParams } from 'next/navigation';
import type { LeadScore } from '@/lib/score-lead';
import { BROKEN_LEAD, SAMPLE_LEAD } from '@/lib/chat-config';

type ToolState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error';

interface ToolPart {
  id: string;
  name: 'score_lead';
  state: ToolState;
  partial?: string;
  input?: Record<string, unknown>;
  output?: LeadScore;
  errorText?: string;
}

interface TurnError {
  kind: 'mid-stream' | 'rate-limit' | 'network';
  text: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  parts?: ToolPart[];
  error?: TurnError;
}

type Intent = { tool: 'score_lead'; lead: unknown };

const STORAGE_KEY = 'capstone-chat-v2';

const EXAMPLES = [
  'I need a landing page for my cafe',
  'What does a restaurant website need?',
  'My shop needs online booking',
];

function loadStored(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Message =>
        typeof m === 'object' &&
        m !== null &&
        ((m as Message).role === 'user' || (m as Message).role === 'assistant') &&
        typeof (m as Message).content === 'string',
    );
  } catch {
    return [];
  }
}

function plain(messages: Message[]): { role: string; content: string }[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'None known';
  if (value === undefined || value === null || value === '') return 'Not provided';
  return String(value);
}

const INPUT_LABELS: Record<string, string> = {
  business: 'Business',
  type: 'Type',
  rating: 'Rating',
  reviews: 'Reviews',
  hasWebsite: 'Has a website',
  runningAds: 'Running ads',
  contactPaths: 'Reachable by',
};

export function ScoreCard({ output }: { output: LeadScore }) {
  const verdictStyle =
    output.verdict === 'Strong fit'
      ? 'bg-ink text-paper'
      : output.verdict === 'Worth a conversation'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-neutral-200 text-neutral-700';
  return (
    <div className="animate-rise mt-1 w-full max-w-md rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Lead score
          </p>
          <p className="mt-1 font-display text-4xl font-bold text-ink">
            {output.score}
            <span className="text-lg font-medium text-neutral-400"> / 100</span>
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${verdictStyle}`}
        >
          {output.verdict}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {output.breakdown.map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-coal">{row.label}</span>
              <span className="text-neutral-500">
                {row.points}/{row.max}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-700"
                style={{ width: `${Math.round((row.points / row.max) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">{row.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-coal">
        {output.recommendation}
      </p>
    </div>
  );
}

function ToolPartView({
  part,
  onRescoreSample,
  streaming,
}: {
  part: ToolPart;
  onRescoreSample: () => void;
  streaming: boolean;
}) {
  if (part.state === 'input-streaming') {
    const keys = Array.from(
      new Set(
        Array.from((part.partial ?? '').matchAll(/"([A-Za-z]+)":/g)).map(
          (m) => INPUT_LABELS[m[1]] ?? m[1],
        ),
      ),
    );
    return (
      <div
        key="streaming"
        className="animate-rise mt-1 w-full max-w-md rounded-xl border border-dashed border-neutral-300 bg-paper p-4"
      >
        <p className="text-sm font-medium text-coal">
          Reading the lead<span className="animate-pulse">…</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {keys.length === 0 ? (
            <span className="h-5 w-16 animate-pulse rounded-full bg-neutral-200" />
          ) : (
            keys.map((k) => (
              <span
                key={k}
                className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600"
              >
                {k}
              </span>
            ))
          )}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          score_lead is receiving its input, field by field.
        </p>
      </div>
    );
  }

  if (part.state === 'input-available') {
    const input = part.input ?? {};
    return (
      <div
        key="available"
        className="animate-rise mt-1 w-full max-w-md rounded-xl border border-line bg-paper p-4"
      >
        <p className="text-sm font-medium text-coal">Scoring this lead…</p>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {Object.entries(input).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-2">
              <dt className="text-neutral-500">{INPUT_LABELS[key] ?? key}</dt>
              <dd className="font-medium text-coal">{formatValue(value)}</dd>
            </div>
          ))}
        </dl>
        <span className="mt-3 inline-flex items-center gap-1 text-neutral-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]" />
          <span className="sr-only">Scoring</span>
        </span>
      </div>
    );
  }

  if (part.state === 'output-error') {
    return (
      <div
        key="error"
        className="animate-rise mt-1 w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-4"
        role="alert"
      >
        <p className="text-sm font-semibold text-red-900">
          This lead could not be scored
        </p>
        <p className="mt-1 text-sm leading-relaxed text-red-800">{part.errorText}</p>
        <p className="mt-1 text-xs leading-relaxed text-red-700">
          The tool refused the input instead of guessing — a score built on
          invented facts would be worse than no score.
        </p>
        <button
          type="button"
          onClick={onRescoreSample}
          disabled={streaming}
          className="mt-3 rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-40"
        >
          Score the sample lead instead
        </button>
      </div>
    );
  }

  return part.output ? (
    <div key="output" className="animate-rise">
      <ScoreCard output={part.output} />
    </div>
  ) : null;
}

const ERROR_TITLES: Record<TurnError['kind'], string> = {
  'mid-stream': 'The reply dropped midway',
  'rate-limit': 'Rate limit hit',
  network: 'Connection problem',
};

export default function Chat() {
  const searchParams = useSearchParams();
  // Crit fix (Oct 2026): the tool-demo + failure-drill controls are
  // internship evidence, not a sales tool — the public page hides them.
  // Reviewers reach them at /chat?demo=1; everyone else sees a clean chat.
  const showDemos = searchParams?.get('demo') === '1';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [mode, setMode] = useState<'live' | 'demo' | null>(null);
  const [nearBottom, setNearBottom] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  useEffect(() => {
    setMessages(loadStored());
    fetch('/api/chat')
      .then((r) => r.json())
      .then((d: { mode?: string }) => setMode(d.mode === 'live' ? 'live' : 'demo'))
      .catch(() => setMode('demo'));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full/blocked: the conversation still works in memory.
    }
    if (nearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    nearBottomRef.current = near;
    setNearBottom(near);
  }, []);

  function jumpToLatest() {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    nearBottomRef.current = true;
    setNearBottom(true);
  }

  function patchLast(patch: (last: Message) => Message) {
    setMessages((prev) => {
      const next = [...prev];
      next[next.length - 1] = patch(next[next.length - 1]);
      return next;
    });
  }

  async function runTurn(
    history: Message[],
    opts?: { intent?: Intent; sabotage?: 'drop' | 'rate-limit' },
  ) {
    setMessages([...history, { role: 'assistant', content: '' }]);
    setStreaming(true);
    setWaiting(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: plain(history),
          intent: opts?.intent,
          sabotage: opts?.sabotage,
        }),
        signal: controller.signal,
      });
      if (res.status === 429) {
        patchLast((last) => ({
          ...last,
          error: {
            kind: 'rate-limit',
            text: 'Too many requests in a row. Wait a few seconds, then retry — your message is kept.',
          },
        }));
        return;
      }
      if (!res.ok || !res.body) throw new Error('request failed');
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
          if (!line.trim()) continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line) as Record<string, unknown>;
          } catch {
            continue; // A partial line waits for the next chunk.
          }
          setWaiting(false);
          if (event.t === 'text' && typeof event.d === 'string') {
            const d = event.d;
            patchLast((last) => ({ ...last, content: last.content + d }));
          } else if (event.t === 'tool' && typeof event.phase === 'string') {
            const phase = event.phase as ToolState;
            patchLast((last) => {
              const parts = [...(last.parts ?? [])];
              const idx = parts.findIndex((p) => p.id === event.id);
              const prevPart: ToolPart =
                idx >= 0
                  ? parts[idx]
                  : { id: String(event.id), name: 'score_lead', state: phase };
              const updated: ToolPart = {
                ...prevPart,
                state: phase,
                partial:
                  phase === 'input-streaming'
                    ? String(event.partial ?? '')
                    : prevPart.partial,
                input:
                  phase === 'input-available'
                    ? (event.input as Record<string, unknown>)
                    : prevPart.input,
                output:
                  phase === 'output-available'
                    ? (event.output as LeadScore)
                    : prevPart.output,
                errorText:
                  phase === 'output-error'
                    ? String(event.error ?? '')
                    : prevPart.errorText,
              };
              if (idx >= 0) parts[idx] = updated;
              else parts.push(updated);
              return { ...last, parts };
            });
          } else if (event.t === 'stream-error') {
            patchLast((last) => ({
              ...last,
              error: {
                kind: 'mid-stream',
                text: 'The connection dropped before the reply finished. What arrived is kept above — retry sends your last message again.',
              },
            }));
          }
        }
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        patchLast((last) => ({
          ...last,
          error: {
            kind: 'network',
            text: 'The reply could not be fetched — the connection may be down. Your message is kept; retry when you are back.',
          },
        }));
      }
    } finally {
      setWaiting(false);
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function send(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    void runTurn([...messages, { role: 'user', content: text }]);
  }

  function sendAction(
    label: string,
    opts?: { intent?: Intent; sabotage?: 'drop' | 'rate-limit' },
  ) {
    if (streaming) return;
    void runTurn([...messages, { role: 'user', content: label }], opts);
  }

  // Retry resends exactly the failed turn: everything before the failed
  // assistant message (which ends with the visitor's message), nothing else.
  function retry(assistantIndex: number) {
    if (streaming) return;
    void runTurn(messages.slice(0, assistantIndex));
  }

  function stop() {
    abortRef.current?.abort();
  }

  function clear() {
    if (streaming) return;
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear if storage is unavailable.
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-sm font-medium text-coal">
          Project assistant
          {mode && (
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                mode === 'live'
                  ? 'bg-ink text-paper'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {mode === 'live' ? 'Live · Gemini' : 'Demo mode'}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={clear}
          disabled={streaming || messages.length === 0}
          className="text-sm text-neutral-500 underline-offset-2 hover:underline disabled:opacity-40"
        >
          Clear chat
        </button>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="h-[380px] space-y-3 overflow-y-auto px-4 py-4"
          aria-live="polite"
        >
          {/* No loading skeleton here on purpose: the skeleton→content
              swap was the measured CLS source (0.124) on /chat — the
              skeleton's blocks and the empty state's blocks are different
              heights, so the tool-demo block moved after load. First
              paint now shows the real empty state, so nothing moves. */}
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-neutral-600">
                Ask about a project you want built — what it is, what it
                needs, when it has to launch. Or start from one of these:
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setInput(example)}
                    className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm text-coal transition-colors hover:border-accent hover:text-ink"
                  >
                    {example}
                  </button>
                ))}
              </div>
              {/* Demo controls live behind ?demo=1 (see showDemos above). */}
              {showDemos && (
                <>
              <div className="border-t border-line pt-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Tool demo — score_lead
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={streaming}
                    onClick={() =>
                      sendAction('Score this lead: Boss Cafe', {
                        intent: { tool: 'score_lead', lead: SAMPLE_LEAD },
                      })
                    }
                    className="rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-40"
                  >
                    Score a sample lead
                  </button>
                  <button
                    type="button"
                    disabled={streaming}
                    onClick={() =>
                      sendAction('Score this lead: (name not given)', {
                        intent: { tool: 'score_lead', lead: BROKEN_LEAD },
                      })
                    }
                    className="rounded-full border border-line px-3.5 py-1.5 text-sm text-coal transition-colors hover:border-accent disabled:opacity-40"
                  >
                    Score a broken lead
                  </button>
                </div>
              </div>
              <div className="border-t border-line pt-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Test the failure states
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={streaming}
                    onClick={() =>
                      sendAction('What kinds of projects does Ahmed take on?', {
                        sabotage: 'drop',
                      })
                    }
                    className="rounded-full border border-dashed border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-600 transition-colors hover:border-accent disabled:opacity-40"
                  >
                    Simulate a dropped reply
                  </button>
                  <button
                    type="button"
                    disabled={streaming}
                    onClick={() =>
                      sendAction('What kinds of projects does Ahmed take on?', {
                        sabotage: 'rate-limit',
                      })
                    }
                    className="rounded-full border border-dashed border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-600 transition-colors hover:border-accent disabled:opacity-40"
                  >
                    Simulate a rate limit
                  </button>
                </div>
              </div>
                </>
              )}
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i}>
                <div
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-ink text-paper'
                        : 'rounded-bl-md border border-line bg-paper text-coal'
                    }`}
                  >
                    {m.content === '' && i === messages.length - 1 && waiting ? (
                      <span className="inline-flex items-center gap-1 text-neutral-500">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]" />
                        <span className="sr-only">Thinking</span>
                      </span>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
                {m.parts?.map((part) => (
                  <ToolPartView
                    key={part.id}
                    part={part}
                    streaming={streaming}
                    onRescoreSample={() =>
                      sendAction('Score this lead: Boss Cafe', {
                        intent: { tool: 'score_lead', lead: SAMPLE_LEAD },
                      })
                    }
                  />
                ))}
                {m.error && (
                  <div
                    className="animate-rise mt-2 w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-4"
                    role="alert"
                  >
                    <p className="text-sm font-semibold text-red-900">
                      {ERROR_TITLES[m.error.kind]}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-red-800">
                      {m.error.text}
                    </p>
                    <button
                      type="button"
                      onClick={() => retry(i)}
                      disabled={streaming}
                      className="mt-3 rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-40"
                    >
                      Retry this message
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {!nearBottom && streaming && (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-coal px-3.5 py-1.5 text-xs font-medium text-paper shadow-lg"
          >
            Jump to latest ↓
          </button>
        )}
      </div>

      <form
        onSubmit={send}
        className="flex items-end gap-2 border-t border-line px-4 py-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Describe your project
        </label>
        <textarea
          id="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void send(event);
            }
          }}
          rows={2}
          placeholder="Describe your project…"
          className="max-h-28 min-w-0 flex-1 resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-base outline-none placeholder:text-neutral-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 font-medium text-white transition-colors hover:bg-coal"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="shrink-0 rounded-full bg-ink px-5 py-2.5 font-medium text-paper transition-colors hover:bg-accent disabled:opacity-40"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
