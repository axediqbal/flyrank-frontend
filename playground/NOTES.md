# NOTES — hand-built vs shadcn/ui: what the library handled that I missed

Assignment: build a modal dialog, tabs, and a disclosure from scratch against
their W3C ARIA Authoring Practices patterns, then install shadcn/ui's dialog
and tabs, read the generated source, and name what it handled that I missed.

My three hand-built components live in `src/components/` and are demoed in
`src/App.tsx`. They pass the pattern checks: the modal traps Tab and returns
focus on close, the tabs use a roving tabindex with arrow/Home/End keys and
automatic activation, the disclosure is a real button with `aria-expanded`.

## What I read

shadcn/ui's generated `dialog.tsx` and `tabs.tsx` (registry copies in
`shadcn-reference/`) turn out to be thin, styled wrappers — nearly every
behaviour lives one layer down in the Radix primitives they wrap
(`radix-ui`'s dialog and tabs source, ~680 and ~310 lines). So the honest
comparison is my ~60-line Modal against a FocusScope, a DismissableLayer, a
scroll lock and a portal, all working together. Four concrete gaps:

## Gap 1 — I trap the Tab key; Radix guards focus itself

My trap listens for `keydown` Tab and wraps first↔last. That covers the
keyboard path I tested — and nothing else. If focus leaves the dialog any
other way (a click handler calling `.focus()` on a background element,
content injected into the dialog while it is open, a browser quirk), my
dialog never notices. Radix's FocusScope mounts sentinel guard nodes around
the content and watches `focusin`/`focusout`, so focus that escapes by *any*
route is pulled back. My version handles the escape I imagined; theirs
handles the category.

## Gap 2 — the page behind my modal still scrolls

My overlay is a fixed layer over a live page: scroll the mouse wheel with
the dialog open and the background moves. Radix wraps modal content in
RemoveScroll, which locks body scroll while the dialog is up. I never
thought about scroll as part of the modal contract; it is — a dialog that
lets the page drift underneath fails the "everything else is inert" promise
that `aria-modal` makes to assistive technology.

## Gap 3 — my Escape closes too much; layers dismiss in order

My keydown handler closes the dialog on any Escape, captured at the
document. Put a popover or menu *inside* my dialog and Escape would close
the whole dialog when it should only dismiss the inner layer. Radix's
DismissableLayer keeps a stack of layers and an Escape dismisses only the
topmost one. Alone, my modal passes; composed with anything, it misbehaves —
and real interfaces are always composed.

## Gap 4 — tabs: direction and panel focus

Two smaller ones from the tabs source. (a) Radix runs the tab list through
a RovingFocusGroup that understands reading direction — in an RTL context
the arrow keys flip; my handler hardcodes ArrowRight = next, which is wrong
for RTL users. It also offers an `activationMode` (manual activation) that
my always-automatic version lacks. (b) Radix gives the tab panel a
`tabIndex` of 0 only when that is useful; I set `tabIndex={0}` on every
panel unconditionally, which adds a pointless Tab stop on panels that
contain their own links and buttons.

## What held up

The pattern-level work was right: roles and `aria-labelledby` on the dialog,
focus returning to the trigger (Radix does this too), the roving tabindex,
Home/End, `aria-selected`/`aria-controls` wiring, and a native button for
the disclosure — Radix/shadcn add machinery around the same skeleton, they
don't replace it. That is the actual lesson of the assignment: the APG
patterns are the floor, and the distance between "passes the pattern" and
"production-safe" is a pile of edge cases — scroll, portals, layer stacks,
focus that moves without keys — that a library has already paid for.

*Files: hand-built components in `src/components/`; the shadcn registry
components I read are kept verbatim in `shadcn-reference/` (reference
material only — excluded from this project's TypeScript program, since they
import the host app's aliases and the Radix packages).*
