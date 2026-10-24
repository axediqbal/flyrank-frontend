# flyrank-frontend

Ahmed Iqbal's FlyRank capstone: a portfolio that proves the through-line
**"I ship production-grade front ends at AI speed."** Next.js 15 + React 19 +
Tailwind v4, deployed on Vercel from this repo's `main` branch.

Live: https://flyrank-frontend-five.vercel.app

## Routes

| Route | What it is |
|---|---|
| `/` | Home: claim, live-proof marquee, featured work, about, contact |
| `/work/[slug]` | Case studies (Lumière, ApexMediaCo) |
| `/health` | Fetches this repo's data from the GitHub API server-side (ISR, 1h) |
| `/chat` | The streaming project-qualification chat (FE-06/07/08) |
| `/api/chat` | The chat route handler (streaming, tools, failure drills) |

## The chat

One NDJSON event protocol serves both modes — live (Gemini, when
`GEMINI_API_KEY` is set server-side) and demo (a scripted qualification
flow, honestly badged in the UI). Prompt and model config live in
`src/lib/chat-config.ts`; the route is `src/app/api/chat/route.ts`; the
client is `src/components/Chat.tsx`.

### Tool contract — `score_lead` (FE-07)

Defined in `src/lib/score-lead.ts` (that file is the deliverable).

- **Name:** `score_lead`
- **Purpose:** score how strong a sales lead is for a website build, from
  the few facts a visitor can state in one message.
- **Input schema (Zod):**

  | Field | Type | Notes |
  |---|---|---|
  | `business` | string, min 1 | Required — a lead cannot be scored without a name |
  | `type` | enum: cafe, restaurant, gym, clinic, salon, retail, other | Closest fit |
  | `rating` | number 0–5, optional | Omitted when unknown — never estimated; renders as "not provided" |
  | `reviews` | integer ≥ 0, optional | Same rule as rating |
  | `hasWebsite` | boolean | A working website of their own |
  | `runningAds` | boolean | Currently paying for social/search ads |
  | `contactPaths` | array of phone/whatsapp/instagram/form, default [] | How customers reach them today |

- **Return shape:** `{ score: 0–100, verdict: 'Strong fit' | 'Worth a
  conversation' | 'Weak fit', breakdown: [{ label, points, max, note }],
  recommendation: string }`. Deterministic — the same input always
  scores the same.
- **Invocation:** the route orchestrates the call — the client's intent
  (the /chat tool-demo buttons) or a "score … lead" phrasing. The four
  lifecycle states stream as typed parts (`input-streaming`,
  `input-available`, `output-available`, `output-error`) and each renders
  distinctly in the UI; the result renders as a score-card component, and
  a schema failure renders as a designed error card — never a crash,
  never a JSON dump.
- **Errors:** input failing the schema returns the Zod issues as the
  `output-error` part (e.g. `business: A business name is required to
  score a lead.`).

## Failure & empty states (FE-08)

The full inventory — every failure/edge case of the primary flow, how it
is triggered, and how it is handled — lives in [STATES.md](STATES.md),
including the sabotage checklist and its results. The /chat empty state
hosts live demos of the tool's success and error paths and of two failure
states (dropped stream, rate limit), each with a working retry.

## Environment

- `GEMINI_API_KEY` — server-side only; unset = demo mode (badged in UI).
- `NEXT_PUBLIC_SITE_URL` — canonical site URL for metadata.

## Other apps in this repo

- `react-ai-app/` — the Week 3 React + AI build (Outreach Tracker).
- `playground/` — the Week 4 hand-built accessible components
  (modal, tabs, disclosure) with a shadcn comparison in its NOTES.md.
- `workflow/` — the FL-04 outreach opener pipeline: project instructions
  and the five documented runs.

## Testing (FE-09)

- `npm run test` — Vitest + React Testing Library. Nine component
  tests: the chat across pending / streaming / error-with-retry and
  the score_lead tool lifecycle, the ScoreCard tool-result component,
  and the validated contact form (empty-submit errors, a successful
  send, a failed send that keeps the visitor's text). Queries are by
  role and label throughout; the AI route is mocked with in-memory
  NDJSON streams — the suite never calls the real API.
- `npm run test:e2e` — one Playwright test walks the primary flow:
  home -> chat -> the sample lead's ScoreCard -> a streamed reply.
- CI (`.github/workflows/ci.yml`) runs both suites on every push and
  must be green before merging; branch protection requires it on
  `main`.

## FE-AA2 — 3D experience (`/3d`)

Live: https://flyrank-frontend-five.vercel.app/3d

**What was built:** a procedural "studio product shot" rendered live in
the browser — a torus-knot sculpture with two amber accent spheres on
a shadow-catching floor, lit by a small lighting rig. No external
models, no external HDRs: the geometry and every light are defined in
code (`src/components/StudioScene.tsx`). The interaction beyond
orbiting is a custom configurator (`src/components/ThreeExperience.tsx`):
material colour swatches (Ink, Amber, Porcelain, Coal), metalness and
roughness sliders, a wireframe toggle, an auto-rotate toggle, and three
lighting presets (Studio / Daylight / Dusk). Orbit + pinch zoom come
from three's OrbitControls wrapped in a small R3F component — no drei,
no leva, by design. The page is deliberately unlinked from the nav: it
is an assignment deliverable, not part of the portfolio's
client-facing flow.

**Perf note (FE-10 lens):** `/3d` First Load JS is **106 kB** — the
route itself adds only 2.83 kB over the 103 kB shared baseline, because
the canvas loads via `next/dynamic` with `ssr:false`: three.js +
React Three Fiber ship in separate async chunks fetched only when
`/3d` opens (about 740 kB uncompressed on disk, about 189 kB gzipped
combined). What kept it sane: zero model/HDR downloads, one
shadow-casting light at 1024 px, small procedural geometry (torus knot
plus two spheres), device pixel ratio capped at `[1, 2]`, and a
fixed-height canvas container so the page never shifts while the scene
loads. Reduced-motion fallback: with `prefers-reduced-motion` the
canvas runs `frameloop="demand"` — a single static frame — while the
configurator still updates the material and lighting (config changes
invalidate explicitly). Frame rate was not lab-measured for this
deliverable; the geometry and light budget above is what bounds it.

**What I'd add with more time:** a drag-and-drop GLB viewer on top of
this staged scene (the brief's example direction), so visitors can
inspect their own models with the same configurator.
