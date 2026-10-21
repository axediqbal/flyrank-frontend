# Outreach Tracker — how this app was built with AI

A small React + TypeScript app for tracking freelance client outreach
(add leads, move them through a pipeline — new → contacted → replied →
call booked → closed — search, filter, and keep everything in the browser).

Built for the FlyRank Week 3 assignment "React app development with AI",
following the mentor session's approach (prompt → working feature → human
review). The git history of this folder shows both passes.

## The prompts used during development

1. **Concept + scaffold** — "Set up a Vite + React + TypeScript app called
   Outreach Tracker: a single-page tool to track freelance outreach leads
   (business, contact route, channel, pipeline status, date added, note),
   persisted in localStorage. Use the portfolio identity kit for styling:
   ink blue #1E3A5F, near-black text, near-white background, one amber
   accent; Space Grotesk headings, Inter body."
2. **First working pass** — "Build the whole tracker in one App component:
   seed it with three real leads (Boss Cafe, Activo Fitness, Black Rock
   Cafe), an add-lead form, a search box, and a list where each lead's
   status can be changed and the lead deleted. Save to localStorage on
   every change." → committed as *pass 1*.
3. **Review fixes (directed one by one)** — "Split App into components
   (LeadForm, LeadList, StatsBar), move types to types.ts and storage to
   lib/storage.ts with a shape check on load." / "Rows must be keyed and
   updated by a stable id, not the array index." / "The form must reject an
   empty business name and an empty contact route, with the error shown
   inline." / "Format dates like '12 Oct 2026', not the raw ISO string."
   / "Add a stats bar (total + count per status), a status filter, and an
   empty state for the list."
4. **Verification** — "Run `npm run build` (tsc + vite) and fix anything
   it reports." Both passes build clean.

## How AI assisted

AI produced the scaffold, the first complete working pass, the component
split, and the styling from the identity kit — the bulk of the typing.
Every structural decision (what the pipeline stages are, what counts as a
valid lead, what the review had to check) was specified in the prompts or
corrected in review. The pattern from the FE-03 drill held: the vague parts
of the output were where the defects were.

## Manual improvements, corrections and refactoring after review

Pass 1 was reviewed before anything else was built on it. Four concrete
corrections came out of that review (all visible in the pass-2 diff):

1. **Wrong-lead bug (correctness).** Pass 1 keyed rows by array index and
   updated/deleted by index — but the rendered list is *filtered* by the
   search box, so with a search active, changing a status or deleting
   acted on a different lead than the one on screen. Fixed by giving every
   lead a stable `id` (`crypto.randomUUID()` for new leads) and doing all
   updates by id.
2. **No validation (correctness).** Pass 1 accepted an empty business
   name, producing blank rows that then broke the search. Pass 2 validates
   in `LeadForm`: business name and contact route are required, with the
   error announced inline (`role="alert"`).
3. **Raw ISO dates (readability).** New leads showed
   `2026-10-21T01:02:03.000Z`. Pass 2 formats with `Intl.DateTimeFormat`
   ("21 Oct 2026").
4. **Unguarded storage (robustness).** Pass 1 did
   `JSON.parse(localStorage…)` inline — one corrupt value would have
   crashed the app on load. Pass 2 loads through `lib/storage.ts`, which
   type-guards every record and falls back to the seed data.

Refactoring, for the record: one 140-line component became
`App` (composition + state) + `LeadForm` / `LeadList` / `StatsBar`
components + `types.ts` + `lib/storage.ts`, with labels and aria
attributes added to every control during the split.

## Run it

```bash
npm install
npm run dev     # local dev server
npm run build   # type-check + production build (verified for both passes)
```
