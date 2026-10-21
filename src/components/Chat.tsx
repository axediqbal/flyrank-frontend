'use client';

// Streaming chat client (FE-06). Consumes the plain-text stream from
// /api/chat with fetch + a reader (the brief allows useChat or a hand-rolled
// consumer — this is the hand-rolled one, so stop/scroll behaviour is fully
// under our control):
//  - a thinking indicator shows until the first token lands, then swaps to
//    the streaming text without a flicker;
//  - Stop aborts the request — the partial message stays, the input
//    re-enables, and the next send works;
//  - auto-scroll pins to the bottom ONLY while the reader is already near
//    it; scrolling up releases the pin and offers "Jump to latest";
//  - the conversation persists in localStorage so a refresh is not data loss.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'capstone-chat-v1';

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

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [waiting, setWaiting] = useState(false); // sent, no token yet
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

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    const history: Message[] = [...messages, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);
    setWaiting(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error('request failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const delta = decoder.decode(value, { stream: true });
        if (!delta) continue;
        setWaiting(false);
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + delta };
          return next;
        });
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = {
            ...last,
            content:
              last.content +
              (last.content ? ' ' : '') +
              '[The reply stopped early — please send that again.]',
          };
          return next;
        });
      }
    } finally {
      setWaiting(false);
      setStreaming(false);
      abortRef.current = null;
    }
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
          {messages.length === 0 && (
            <p className="text-sm leading-relaxed text-neutral-500">
              Ask about a project you want built — what it is, what it needs,
              when it has to launch. The assistant scopes it and points you to
              the contact form.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
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
          ))}
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
          className="max-h-28 flex-1 resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none placeholder:text-neutral-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-full bg-accent px-5 py-2.5 font-medium text-white transition-colors hover:bg-coal"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-full bg-ink px-5 py-2.5 font-medium text-paper transition-colors hover:bg-accent disabled:opacity-40"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
