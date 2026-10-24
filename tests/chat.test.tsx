// FE-09 — Chat component tests. The /api/chat route is mocked with
// in-memory NDJSON streams; the suite never touches the real API.
// Queries are by role and label, the way a user meets the UI — renaming
// a CSS class breaks none of these (brief criterion).

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Chat from '@/components/Chat';

// Crit fix (Oct 2026): the demo controls live behind ?demo=1 in
// production. The suite exercises demo mode, so the navigation mock
// reports demo=1 for every test here.
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('demo=1'),
}));
import { executeScoreLead } from '@/lib/score-lead';
import { SAMPLE_LEAD } from '@/lib/chat-config';

const encoder = new TextEncoder();

function streamOf(lines: string[], delayFirstMs = 0): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      if (delayFirstMs > 0) {
        await new Promise((r) => setTimeout(r, delayFirstMs));
      }
      for (const line of lines) {
        controller.enqueue(encoder.encode(line + '\n'));
      }
      controller.close();
    },
  });
}

function mockFetch(postBody: () => ReadableStream<Uint8Array>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return { ok: true, status: 200, body: postBody(), json: async () => ({}) };
      }
      return { ok: true, status: 200, json: async () => ({ mode: 'demo' }), body: null };
    }),
  );
}

const GREETING =
  'Hello — I can help you scope a project with Ahmed. What are you looking to build?';

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('Chat', () => {
  it('shows the designed empty state with examples and the tool demo', async () => {
    mockFetch(() => streamOf([]));
    render(<Chat />);
    expect(
      await screen.findByRole('button', { name: /score a sample lead/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /score a broken lead/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/I need a landing page for my cafe/i)).toBeInTheDocument();
  });

  it('shows a thinking state, then streams the reply in', async () => {
    mockFetch(() =>
      streamOf([JSON.stringify({ t: 'text', d: GREETING })], 90),
    );
    render(<Chat />);
    await screen.findByRole('button', { name: /score a sample lead/i });
    fireEvent.change(screen.getByLabelText(/describe your project/i), {
      target: { value: 'A landing page for my cafe' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
    // Pending state first (the sr-only "Thinking" indicator)…
    expect(await screen.findByText('Thinking')).toBeInTheDocument();
    // …then the streamed text replaces it.
    expect(await screen.findByText(new RegExp('Hello — I can help you scope'))).toBeInTheDocument();
  });

  it('renders the tool lifecycle and lands on a ScoreCard', async () => {
    const output = executeScoreLead(SAMPLE_LEAD as never);
    mockFetch(() =>
      streamOf([
        JSON.stringify({ t: 'text', d: 'Scoring that lead. ' }),
        JSON.stringify({
          t: 'tool',
          phase: 'input-streaming',
          id: 'tool-score-lead',
          name: 'score_lead',
          partial: '{"business":"Boss',
        }),
        JSON.stringify({
          t: 'tool',
          phase: 'input-available',
          id: 'tool-score-lead',
          name: 'score_lead',
          input: SAMPLE_LEAD,
        }),
        JSON.stringify({
          t: 'tool',
          phase: 'output-available',
          id: 'tool-score-lead',
          name: 'score_lead',
          output,
        }),
      ]),
    );
    render(<Chat />);
    fireEvent.click(await screen.findByRole('button', { name: /score a sample lead/i }));
    expect(await screen.findByText('Strong fit')).toBeInTheDocument();
    expect(screen.getByText(String(output.score))).toBeInTheDocument();
    expect(screen.getByText(/Lead score/i)).toBeInTheDocument();
  });

  it('a dropped stream keeps the partial and offers a retry of that message', async () => {
    let attempt = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          attempt += 1;
          if (attempt === 1) {
            return {
              ok: true,
              status: 200,
              json: async () => ({}),
              body: streamOf([
                JSON.stringify({ t: 'text', d: 'Ahmed takes on ' }),
                JSON.stringify({
                  t: 'stream-error',
                  kind: 'mid-stream',
                  message: 'The connection dropped mid-reply.',
                }),
              ]),
            };
          }
          return {
            ok: true,
            status: 200,
            json: async () => ({}),
            body: streamOf([JSON.stringify({ t: 'text', d: GREETING })]),
          };
        }
        return { ok: true, status: 200, json: async () => ({ mode: 'demo' }), body: null };
      }),
    );
    render(<Chat />);
    await screen.findByRole('button', { name: /score a sample lead/i });
    fireEvent.change(screen.getByLabelText(/describe your project/i), {
      target: { value: 'What does Ahmed build?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/reply dropped midway/i);
    expect(screen.getByText(/Ahmed takes on/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry this message/i }));
    expect(await screen.findByText(/Hello — I can help you scope/)).toBeInTheDocument();
  });
});
