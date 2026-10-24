# FE-10 — Accessibility and performance audit

Site audited: https://flyrank-frontend-five.vercel.app
Pages: home (`/`), project chat (`/chat`), Lumière case study (`/work/lumiere`)
Method: Google PageSpeed Insights — the same Lighthouse engine
(Lighthouse 13.5.0, mobile preset, emulated Moto G Power, Slow 4G).
No real-user (CrUX) field data exists for this site yet, so lab metrics
are reported. WAVE checks ran on wave.webaim.org for the same three pages.
All audits 24 Oct 2026 (PKT). Baseline 22:52–22:54, after-fixes 22:59–23:15.

## Before / after — Lighthouse mobile (Performance / Accessibility / Best Practices / SEO)

| Page | Before | After | CLS before → after |
| --- | --- | --- | --- |
| Home | 98 / 100 / 100 / 100 | 97 / 100 / 100 / 100 | 0 → 0 |
| /chat | 96 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 0.124 → 0 |
| /work/lumiere | 99 / 96 / 100 / 100 | 99 / 100 / 100 / 100 | 0 → 0 |

After-fix reports (live evidence, replacing screenshots):
- Home: https://pagespeed.web.dev/analysis/https-flyrank-frontend-five-vercel-app/8l3n6y0ihz?form_factor=mobile
- /chat: https://pagespeed.web.dev/analysis/https-flyrank-frontend-five-vercel-app-chat/8ygit5923q?form_factor=mobile
- /work/lumiere: https://pagespeed.web.dev/analysis/https-flyrank-frontend-five-vercel-app-work-lumiere/j8xwe2p7el?form_factor=mobile

Notes on the numbers, stated honestly:
- Home performance 98 → 97 is run-to-run variance, not a regression: the
  home changes were colour-only plus one paragraph retagged as a heading.
  LCP moved 2.4s → 2.6s between runs for the same reason.
- The real, measured wins are /chat (CLS 0.124 → 0, performance 96 → 99)
  and /work/lumiere (accessibility 96 → 100).
- Home after-scores were measured at 23:15, after the FE-10 fixes but
  before the same night's crit fixes (hero reveal removal, nav change);
  those change first-paint perception, not the audited categories.

## Changes made (all live, all in this repo)

1. Case-page links used brand amber (#D97706, 3.0:1 on near-white) for
   small text — below the 4.5:1 WCAG AA bar. Switched to deep amber
   (#B45309, 5.0:1) via the existing `.eyebrow` class. Same fix applied
   to the home section numbers and the "Live projects" marquee dots,
   which WAVE flagged next. Brand amber stays for fills and large type,
   where 3:1 passes.
2. /chat CLS 0.124: the page rendered a loading skeleton, then swapped
   it for the empty state; the two have different heights, so the
   "Tool demo" block below moved after load. Removed the skeleton —
   first paint now shows the real empty state, so nothing moves.
   Layout-shift audit passes with no culprit elements.
3. Home contact headline ("Tell me what you are building.") was a
   paragraph styled as a heading — WAVE "Possible heading". Retagged
   as a real `<h3>`. No visual change.
4. No other Lighthouse failures existed: no render-blocking work worth
   chasing (est. 130 ms), no oversized images (largest 86 KB).

## WAVE — before / after

| Page | Errors before | Contrast errors before | Errors after | Contrast errors after |
| --- | --- | --- | --- | --- |
| Home | 0 | 11 | 0 | 0 |
| /chat | 0 | 0 | 0 | 0 |
| /work/lumiere | 0 | 0 | 0 | 0 |

Alerts — fixed or justified, as the brief allows:
- "Possible heading" (home contact headline) — fixed, retagged `<h3>`.
- "Redundant link" on nav "Home" and "Start a project" (all pages) —
  justified: the same destination is reached from separate navigation
  contexts (top bar vs mobile tab bar; nav vs hero call-to-action),
  not adjacent duplicates. Standard pattern, no user harm.
- "Very small text" × 5 (all pages) — justified: the five mobile
  tab-bar labels at 10 px. They supplement icons, follow the iOS
  tab-bar convention, and each tab carries its accessible name. No
  body copy is set that small.

## Keyboard-only pass (primary flow, chat included)

Tab order on home: logo → nav links → hero "Start your project" →
sections, all reachable with visible focus. On /chat: nav → example
chips → chat input, all reachable with visible focus. "Clear chat"
and "Send" are disabled while the chat is empty, so Tab correctly
skips them; Send is a form submit, so Enter sends from the keyboard.

## AI-specific accessibility (brief item 4)

- Streamed output: the chat message region carries `aria-live="polite"`,
  so a screen reader announces streamed replies politely.
- Stop button: while a reply streams, a keyboard-reachable "Stop"
  button replaces "Send"; it aborts the stream and the partial reply
  stays, retryable.

## Verdict against the brief's criteria

- Lighthouse mobile performance and accessibility 90+ on all three
  pages: yes (lowest: home performance 97, everything else 99–100).
- Zero WAVE errors on audited pages: yes (0 errors, 0 contrast
  errors on all three; alerts fixed or justified above).
- Primary flow completable by keyboard alone: yes.
- AUDIT.md shows measurable deltas: this file.

## Test evidence

Vitest + React Testing Library suite: 9/9 passing (2 files).
Production build clean. Fixes shipped in commits fdfa4b3 (case links),
faee93d7 (chat skeleton), e31e3a5 (home contrast), e2a1b14 (heading).
