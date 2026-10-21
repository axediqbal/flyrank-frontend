# Accessible Components Playground

Week 4 · FE-05 — three interactive components built from scratch in React +
TypeScript against their W3C ARIA Authoring Practices patterns, with no
component libraries:

- **Modal dialog** (`src/components/Modal.tsx`) — focus trap, Escape to
  close, focus returns to the trigger, `role="dialog"` + `aria-modal`.
- **Tabs** (`src/components/Tabs.tsx`) — roving tabindex, arrow keys with
  wrap-around, Home/End, automatic activation.
- **Disclosure** (`src/components/Disclosure.tsx`) — native button with
  `aria-expanded` / `aria-controls`.

Run it: `npm install && npm run dev` — then put the mouse away and use the
keyboard alone; each section of the demo page states its own test.

`NOTES.md` is the second half of the assignment: what shadcn/ui's dialog and
tabs (and the Radix primitives under them) handled that the hand-built
versions missed — scroll locking, focus guards, layered dismissal, and
direction-aware tab navigation. The registry files read for that comparison
are kept in `shadcn-reference/`.
