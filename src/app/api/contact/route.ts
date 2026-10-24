import { CONTACT_LIMITS, validateContact } from '@/lib/contact';

// Contact form backend (Week 6 — "Make It Do Something").
//
// The one dynamic feature the portfolio wires end to end: a visitor's
// message travels browser → this route handler → a Postgres row in
// Ahmed's Supabase project (table: contact_messages), which he reads in
// the Supabase dashboard. Free tier throughout (Vercel hobby + Supabase
// free).
//
// Safety shape: validation runs again here (the client's checks are a
// courtesy, never the gate); writes use the project's ANON key with an
// insert-only row-level-security policy — the key can add a row and can
// never read, change or delete one. A honeypot field silently drops bot
// submissions while returning the same success shape. Week 7 break
// hardening (Ali's review): identical submissions inside 60s return the
// original success without a second row (see the dedup cache below).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Week 7 break hardening (Ali's review): short-window server-side
// idempotency. The form button already disables while sending, but a
// direct API double-POST used to insert twice. An identical submission
// (same email + message) inside 60s now returns the original success
// shape with a duplicate flag and inserts nothing. LIMIT, stated openly:
// this cache lives in the serverless instance's memory, so a retry routed
// to a different instance is not caught. A cross-instance guard would
// need a DB read, which the insert-only anon key cannot perform — that
// trade-off is documented here and in the break log, not hidden. The key
// is recorded only after a successful insert, so a failed insert (502 /
// 503) never poisons a legitimate retry.
const DEDUP_WINDOW_MS = 60_000;
const recentSubmissions = new Map<string, number>();

function dedupKey(values: { email: string; message: string }): string {
  return `${values.email.trim().toLowerCase()}\n${values.message.trim()}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const record = (body ?? {}) as Record<string, unknown>;

  // Honeypot: humans never see or fill this field. Bots do.
  if (typeof record.company === 'string' && record.company.trim() !== '') {
    return Response.json({ ok: true }, { status: 201 });
  }

  const values = {
    name: typeof record.name === 'string' ? record.name : '',
    email: typeof record.email === 'string' ? record.email : '',
    message: typeof record.message === 'string' ? record.message : '',
  };
  // Week 7 break fix F3: caps are a REJECTION, not a silent trim. The
  // old code sliced first and validated after, so an over-long message
  // came back 201 with the tail quietly cut off. Now the sender gets a
  // clear 422 and can shorten the message themselves.
  const errors = validateContact(values);
  if (values.name.length > CONTACT_LIMITS.name)
    errors.name = 'Keep your name to 100 characters or fewer.';
  if (values.email.length > CONTACT_LIMITS.email)
    errors.email = 'Keep your email address to 200 characters or fewer.';
  if (values.message.length > CONTACT_LIMITS.message)
    errors.message = 'Keep your message to 2000 characters or fewer.';
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: 'Validation failed', errors }, { status: 422 });
  }

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return Response.json({ error: 'Contact backend not configured' }, { status: 503 });
  }

  const key = dedupKey(values);
  const now = Date.now();
  for (const [k, t] of recentSubmissions) {
    if (now - t > DEDUP_WINDOW_MS) recentSubmissions.delete(k);
  }
  if (recentSubmissions.has(key)) {
    return Response.json({ ok: true, duplicate: true }, { status: 201 });
  }

  const res = await fetch(`${url}/rest/v1/contact_messages`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    return Response.json({ error: 'Could not save the message' }, { status: 502 });
  }
  recentSubmissions.set(key, Date.now());
  return Response.json({ ok: true }, { status: 201 });
}
