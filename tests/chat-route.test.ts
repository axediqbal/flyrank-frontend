// FE-11 production hygiene for /api/chat: input caps and the per-IP
// rate limit. The route streams demo replies (no API key needed), so
// these tests need no mocks — they call the real POST and, for the
// 200s, cancel the stream body straight away.

import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/chat/route';

const URL = 'http://localhost/api/chat';

function req(messages: unknown, ip?: string): Request {
  return new Request(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ip ? { 'x-forwarded-for': ip } : {}),
    },
    body: JSON.stringify({ messages }),
  });
}

async function drop(res: Response): Promise<void> {
  try {
    await res.body?.cancel();
  } catch {
    // Already closed — nothing to clean up.
  }
}

describe('POST /api/chat input caps', () => {
  it('rejects more than 50 messages', async () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: 'user' as const,
      content: `message ${i}`,
    }));
    const res = await POST(req(messages, '203.0.113.21'));
    expect(res.status).toBe(400);
  });

  it('rejects a message over 4000 characters', async () => {
    const res = await POST(
      req([{ role: 'user', content: 'x'.repeat(4001) }], '203.0.113.22'),
    );
    expect(res.status).toBe(400);
  });
});

describe('POST /api/chat rate limit', () => {
  it('answers 429 after 30 rapid POSTs from one IP, and lets another IP through', async () => {
    const ip = '203.0.113.23';
    for (let i = 0; i < 30; i++) {
      const res = await POST(
        req([{ role: 'user', content: `rate limit probe ${i}` }], ip),
      );
      expect(res.status).toBe(200);
      await drop(res);
    }
    const over = await POST(
      req([{ role: 'user', content: 'rate limit probe over the cap' }], ip),
    );
    expect(over.status).toBe(429);
    const other = await POST(
      req([{ role: 'user', content: 'rate limit probe from another IP' }], '203.0.113.24'),
    );
    expect(other.status).toBe(200);
    await drop(other);
  });
});
