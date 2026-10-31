# Deployment checklist — flyrank-frontend (FE-11 template, filled out)

Production: https://ahmediqbal.vercel.app
Repo: https://github.com/axediqbal/flyrank-frontend
Hosting: Vercel (hobby) + Supabase (free). Deploys track `main`.

## Pre-deploy
- [x] Type-check clean (`npx tsc --noEmit`)
- [x] Unit tests pass (22 tests, Vitest + React Testing Library)
- [x] Production build clean (`npm run build`)
- [x] E2E test passes in CI (Playwright, home → chat → ScoreCard → stream)
- [x] CI green on the commit being deployed (`.github/workflows/ci.yml`)
- [x] No secrets committed (only `.env.example` ships; `.gitignore` covers
      local env files; tree checked via the GitHub API)
- [x] Env vars set on Vercel for `production` + `preview`:
      `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
- [x] `GEMINI_API_KEY` intentionally UNSET — chat runs in honestly-badged
      demo mode until a key is added (see the note at the bottom)

## Deploy
- [x] Push to `main` → Vercel auto-deploys to production
- [x] Deployment reaches READY (checked via the Vercel API, not assumed)

## Post-deploy verification (run, don't assume)
- [x] Home, /chat, /3d, case pages return 200
- [x] Contact form: invalid input → 422; valid input → 201 + row in Supabase
- [x] Chat streams NDJSON (`/api/chat` returns `text` events)
- [x] Analytics script serves 200 (`/_vercel/insights/script.js`)
- [x] Footer badge serves and links to the credential verification page
- [x] Rate limits + input caps live (chat caps answer 400; limiter proven
      on a single instance + unit tests — see the per-instance note)
- [ ] Safari + mobile Safari manual check (owner: Ahmed, on his iPhone —
      not verifiable from the build environment)

## Rollback
Fastest path: Vercel dashboard → Deployments → pick a prior production
deployment → "Promote to Production". No rebuild, no DNS change.
Known-good production deployments: `907bfb6a` (current), `25ab576f`
(prior). Alternative: `git revert` the bad commit and push to `main`
(Vercel redeploys automatically).

## Monitoring
- Vercel Web Analytics (`@vercel/analytics`) — live on the production
  domain; dashboard visibility can lag first visits.
- GitHub CI on every push (unit + e2e); branch protection requires it
  green on `main`.
- Supabase dashboard for contact rows (the form's only backend).

## Known limits (stated, not hidden)
- Rate limiting + double-submit guard are per serverless instance, not
  global (in-memory). They stop trivial abuse, not a distributed attack.
- Chat runs in demo mode until `GEMINI_API_KEY` is set. Before any paid
  LLM key goes live, add a shared limiter — per-instance limits will not
  bound LLM spend.

## Sign-off
Date: 2026-10-29. Status: production READY, checklist complete except
the Safari/mobile Safari manual check above (open, non-blocking, owned
by Ahmed).
