# CLAUDE.md — AI collaboration guidelines for this repo

This file tells any AI assistant (Claude, ChatGPT, Gemini, or future me) how to work
in this repository. Read it before making changes.

## Context

- **Program:** FlyRank AI Internship, **Front-end AI Engineering** track, July 2026 cohort
- **Owner:** Ahmed Iqbal (axediqbal) — final-year Software Engineering student, Karachi
- **Repo rule (FlyRank):** ONE single public repo for the whole track. Never create per-task repos.
- **Cadence:** self-paced, no deadlines. Work proceeds task by task with the owner's review.
- **Language:** the owner communicates in Roman Urdu (Hinglish). Replies to him in Roman Urdu,
  never Devanagari. Docs and code comments in English.

## Working agreement

1. **Review gate:** nothing is submitted to the FlyRank portal without the owner's explicit
   confirmation. Build everything, show the evidence (repo links, live links, docs), then wait.
2. **Honest AI-assisted work:** AI help is allowed and must be credited. Portal submission notes
   use: `Prepared with AI assistance (Claude AI).` Never present AI work as solely his own.
3. **Conventional commits:** `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` … one logical change
   per commit, present tense, no vague messages.
4. **UI work — discuss & lock first:** no design build starts without locked art direction
   (one mood, one accent + neutrals, one type pairing, one layout motif).
5. **Build bar:** production-grade. No placeholders, no TODOs, no lorem ipsum in user-facing
   content. Typed code, error handling on everything that can fail, no hardcoded secrets.
6. **Verify, don't claim:** never say something works — give the exact test list instead.
7. **Token discipline:** tight explanations, no filler, end updates not process narration.

## Repo layout

- `app/` — Next.js App Router pages (capstone site)
- `components/` — reusable UI components
- `docs/week-NN/` — track assignment records and decisions
- `public/` — static assets

## Environment

- Node.js 20+, `npm install`, `npm run dev` → http://localhost:3000
- Vercel: GitHub integration connected; project import happens when first frontend code lands.
- Push method from restricted networks: GitHub API (Contents API / Git Data API), never SSH.
