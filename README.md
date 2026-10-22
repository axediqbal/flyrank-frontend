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
