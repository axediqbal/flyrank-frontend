# Outreach Tracker (React + AI — FlyRank Week 3)

A small React + TypeScript app for tracking freelance client outreach:
add leads, move them through a pipeline (new → contacted → replied →
call booked → closed), search and filter, with everything persisted in
the browser's localStorage.

Built with AI as the development assistant in two passes — an AI-generated
first pass, then a manual review pass with corrections and refactoring.
The full story (prompts used, how AI assisted, what was fixed by hand)
is in [DEVELOPMENT.md](./DEVELOPMENT.md).

```bash
npm install
npm run dev
npm run build   # verified clean for both passes
```
