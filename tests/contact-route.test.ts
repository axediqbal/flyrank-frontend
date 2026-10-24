// Week 7 break hardening (Ali's review) — server-side idempotency on
// /api/contact: an identical double-POST must insert once and answer the
// second with the same success shape (duplicate: true) instead of a
// second row. The route's fetch is mocked; nothing leaves the test.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/contact/route';

const URL = 'http://localhost/api/contact';

function req(body: unknown): Request {
  return new Request(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contact idempotency', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => ({ ok: true }) as Response);
    vi.stubGlobal('fetch', fetchMock);
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('inserts once for an identical double-POST and flags the second as duplicate', async () => {
    const body = {
      name: 'W7-GUARD-TEST',
      email: 'guard-test-1@example.com',
      message: 'W7-GUARD-TEST double-submit probe message body',
    };
    const first = await POST(req(body));
    expect(first.status).toBe(201);
    expect(await first.json()).toEqual({ ok: true });
    const second = await POST(req(body));
    expect(second.status).toBe(201);
    expect(await second.json()).toEqual({ ok: true, duplicate: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('inserts a different message normally', async () => {
    const first = await POST(
      req({
        name: 'W7-GUARD-TEST',
        email: 'guard-test-2@example.com',
        message: 'W7-GUARD-TEST first distinct message body',
      }),
    );
    expect(first.status).toBe(201);
    const second = await POST(
      req({
        name: 'W7-GUARD-TEST',
        email: 'guard-test-2@example.com',
        message: 'W7-GUARD-TEST second distinct message body',
      }),
    );
    expect(second.status).toBe(201);
    expect(await second.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
