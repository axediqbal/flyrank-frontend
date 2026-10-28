// FE-11 production hygiene: per-IP rate limiting for the API routes.
//
// Same shape as the Week 7 dedup guard: an in-memory Map, so the limit
// is per serverless instance, not global. That is stated openly, not
// hidden: it stops trivial abuse (one script hammering one instance),
// it is not a distributed firewall. A cross-instance limiter would need
// shared state (e.g. Upstash/Redis) — deliberately not added on a free
// tier, and the README says so.
//
// Usage: checkRateLimit(request, { limit, windowMs, route }) returns
// null when the call is allowed, or a 429 Response when the bucket is
// empty. Every POST counts, successes and failures alike — the point
// is to bound attempts, not just successes. Callers check it first,
// before any other work.

const buckets = new Map<string, number[]>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first !== undefined && first !== '' ? first : 'unknown';
}

export function checkRateLimit(
  request: Request,
  opts: { limit: number; windowMs: number; route: string },
): Response | null {
  const key = `${opts.route}:${clientIp(request)}`;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < opts.windowMs);
  if (hits.length >= opts.limit) {
    return Response.json(
      { error: 'Too many requests — wait a bit, then retry.' },
      { status: 429 },
    );
  }
  hits.push(now);
  buckets.set(key, hits);
  return null;
}
