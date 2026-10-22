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
// submissions while returning the same success shape.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    name: typeof record.name === 'string' ? record.name.slice(0, CONTACT_LIMITS.name) : '',
    email: typeof record.email === 'string' ? record.email.slice(0, CONTACT_LIMITS.email) : '',
    message:
      typeof record.message === 'string' ? record.message.slice(0, CONTACT_LIMITS.message) : '',
  };
  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: 'Validation failed', errors }, { status: 422 });
  }

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return Response.json({ error: 'Contact backend not configured' }, { status: 503 });
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
  return Response.json({ ok: true }, { status: 201 });
}
