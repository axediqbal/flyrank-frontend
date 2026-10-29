# Ship It — Your First Production AI Product (Frontend capstone)

**Project Brief.** Startup founders and hiring managers cannot tell from
claims whether a front-end developer can actually ship, so this portfolio
proves it with a working product instead of a pitch: a production-grade
front-end portfolio where every feature — the qualification chat, the
lead-scoring tool, the contact form, the 3D configurator — is live and
usable, built for founders and hiring managers whose one action is to
contact Ahmed about their next build. The edge it demonstrates is
AI-assisted speed without AI-assisted fakery: everything the visitor
sees either works or says plainly that it is a demo.

**Live application:** https://ahmediqbal.vercel.app (Vercel, HTTPS)
**Repository:** https://github.com/axediqbal/flyrank-frontend
**Setup (under 5 minutes):** `git clone` the repo, `npm install`,
`npm run dev`. No API keys needed to run it — without keys the chat
runs in demo mode and the contact form reports itself as unconfigured.

## AI integration (meaningful, not a gimmick)

The app's AI is the project-qualification chat at `/chat`: a visitor
describes their project and the route either calls Gemini (live mode,
when `GEMINI_API_KEY` is set server-side) or walks a scripted
qualification flow (demo mode, badged as a demo in the UI itself). The
integration goes beyond a chatbot in one specific way: the
`score_lead` tool. When the conversation turns to a lead, the route
orchestrates a structured-output tool call — the lead's facts are
validated against a Zod schema, scored deterministically (0–100 with a
verdict and breakdown), and rendered as a score card; a schema failure
renders as a designed error card, never a crash or a JSON dump. The
prompt and model config live in `src/lib/chat-config.ts`; the tool
contract is documented in the README.

Current state, stated honestly: no Gemini key is set, so the deployed
app runs in demo mode. The live path exists in code and is tested by
contract (the same NDJSON protocol serves both modes); turning it on
is a one-variable change, and the submission notes say so. The demo
mode is not presented as live AI anywhere in the UI.

## Testing evidence

- **22 unit/component tests, all passing** (Vitest + React Testing
  Library): chat lifecycle + score_lead tool, ScoreCard, validated
  contact form, contact-route idempotency + rate limit, chat-route
  input caps + rate limit, SmartButton lifecycle, Reveal, Nav,
  ButtonsDemo, DownloadPdfButton.
- **Coverage** (reproduce with
  `npx vitest run --coverage --coverage.include='src/**/*.{ts,tsx}'`):
  components **59.09% statements, 61.17% branch, 51.45% functions,
  62.15% lines** — above 50% on every metric. All-files context:
  53.85% statements. WebGL scene files (StudioScene, ThreeExperience)
  are not unit-testable in jsdom and are covered by build + manual
  checks instead (see the README's manual check list).
- **1 end-to-end test** (Playwright, CI): home → chat → sample lead's
  ScoreCard → streamed reply, run in demo mode (`/chat?demo=1`).
- **CI green** on the submitted commit (unit + e2e on every push).

## Performance & accessibility audit (FE-10)

PageSpeed Insights (Lighthouse 13.5.0, mobile, Moto G Power, Slow 4G),
before → after the audit fixes: Home 98/100/100/100 → 97/100/100/100
(the one-point perf dip is run variance; the change was colour-only),
/chat 96/100/100/100 → **99/100/100/100**, /work/lumiere 99/96/100/100 →
**99/100/100/100**. WAVE after the fixes: **0 errors, 0 contrast
errors** on all three pages. One concrete improvement from the
findings: the chat loading skeleton was removed because its swap with
the empty state was the entire 0.124 CLS on /chat — CLS is 0 after the
fix. Keyboard pass: the primary flow is Tab-reachable with visible
focus; the chat has an aria-live polite region and a keyboard-reachable
Stop button.

## Deployment & operation

- Deployment checklist: [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
  (filled out and signed off 2026-10-29, one open item: the Safari /
  mobile Safari manual check, owned by Ahmed).
- Failure states: [STATES.md](STATES.md) inventories every failure/edge
  case of the primary flow and how each is handled; /chat rehearses the
  failure drills live behind `?demo=1`.
- Rollback: promote any prior production deployment in the Vercel
  dashboard (no rebuild, no DNS change); known-good: `907bfb6a`
  (current), `25ab576f` (prior).
- Monitoring: Vercel Web Analytics live on the production domain;
  GitHub CI on every push.

## Limitations & future work

- Rate limiting and the double-submit guard are per serverless
  instance, not global (in-memory) — they stop trivial abuse, not a
  distributed attack. A shared limiter is required before any paid LLM
  key goes live.
- Safari + mobile Safari are not verified from the build environment
  (manual check pending, see the checklist).
- 3D frame rate was not lab-measured; the geometry/light budget in the
  README is what bounds it.
- No cross-instance duplicate guard (would need a DB read the
  insert-only anon key cannot perform).

## Reflection (DRAFT — Ahmed reviews and edits before submission)

The hardest part was not the building, it was the honesty. AI tools
make it easy to demo something that looks alive — a chat that looks
like it understands, a form that looks like it sends. The real work was
the guardrails around that temptation: badging the demo as a demo in
the UI itself, rendering schema failures as error cards instead of
crashes, validating on the server because client checks are a courtesy,
and refusing to claim a result I had not verified. Twice that
discipline saved the project from embarrassment: the break-test found
silent truncation I had shipped, and a live visual check caught two
colour galleries I had swapped while the document check had passed.

What I would do differently: test on a real phone from the start. I
lost a day to emulated viewports and a browser-resize task that had no
size option, while ten minutes with my own phone found two real bugs —
a dead slot in the tab bar and a clipped Send button. And I would fix
the test in the same commit as the UX change that breaks it: gating
the demo controls behind `?demo=1` was the right call, but leaving the
e2e test on plain `/chat` turned CI red until the production pass
caught it.

The surprising lesson: live proof beats copy. The headline went through
several rewrites, but what made the portfolio credible was the marquee
of real projects and a contact form that actually inserts a row — the
reviewer said so in the crit, passing the ten-second test and calling
the early-career story credible. Nobody believes "production-grade"
until they can click it.
