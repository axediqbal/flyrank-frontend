# Failure & edge states — inventory (FE-08)

Primary flow: the `/chat` project-qualification conversation (the
capstone's central AI interaction). Every case below was inventoried,
handled deliberately, and then **tested by sabotage** — the checklist at
the bottom is the order the FE-08 mentor notes prescribe, run against
the local production build on 2026-10-22 and re-verified on the live
deployment.

## The inventory

| # | Case | Handling | Where |
|---|---|---|---|
| 1 | Network failure before send | The fetch rejects; the turn gains a "Connection problem" error card; the visitor's message stays in the transcript; **Retry this message** resends exactly that message | `Chat.tsx` (fetch catch) |
| 2 | API error mid-stream | Partial text is kept; a `stream-error` event (or a dead stream) attaches a "The reply dropped midway" card with retry. Partial content is never discarded or silently replaced | route protocol + `Chat.tsx` |
| 3 | Rate limit (429) | The route answers 429 before streaming; the client renders a "Rate limit hit" card (message kept, retry offered) instead of an empty bubble | route `POST` + `Chat.tsx` |
| 4 | Empty input | Send is disabled on empty/whitespace input; Enter on an empty box does nothing | `Chat.tsx` form |
| 5 | First-run empty state | A designed empty state, not a blank box: what the assistant does, three click-to-fill example prompts, the score_lead tool demo, and the failure-state demos | `Chat.tsx` empty state |
| 6 | No results / tool cannot run | The score_lead schema failure renders an `output-error` card naming the missing field, with a one-click recovery (score the sample lead). Nothing is guessed to fill the gap | `score-lead.ts` + route + `Chat.tsx` |
| 7 | Slow response | Thinking indicator (three dots) until the first token; tool execution shows its own "Scoring…" state; first-load shows a layout-matched skeleton (`chat/loading.tsx` + in-component skeleton) so nothing jumps when content lands | `Chat.tsx`, `chat/loading.tsx` |
| 8 | Route/page render failure | `src/app/error.tsx` boundary: plain-words explanation + a **Try again** reset; the site never white-screens | `app/error.tsx` |
| 9 | Malformed stored conversation | localStorage parsing is guarded; corrupt data falls back to the empty state instead of throwing | `Chat.tsx` `loadStored` |
| 10 | User stops a stream | Stop aborts; the partial reply stays, no error card (stopping is a choice, not a failure), input re-enables | `Chat.tsx` (FE-06) |
| 11 | Retry double-click | Retry and all send paths no-op while a turn is streaming; the retry button disables during the retried turn | `Chat.tsx` `retry` guard |

Mobile Safari specifics: the input is 16px (no focus zoom), the chat
column uses the fixed bottom tab bar's safe-area spacing from the root
layout, and auto-scroll only pins while the reader is already at the
bottom (rubber-band scrolling never fights it).

## Sabotage checklist — run 2026-10-22

| Drill | Method | Result |
|---|---|---|
| Kill before send | Fetch rejected (server down / offline path) | Network error card + retry renders; message preserved ✅ |
| Kill mid-stream | `sabotage: 'drop'` — route streams ~40% of a reply, then emits `stream-error` and closes | Partial text kept, "dropped midway" card, retry resends only the failed message ✅ |
| Return a 429 | `sabotage: 'rate-limit'` — route answers HTTP 429 | Rate-limit card renders; no empty bubble, no console error ✅ |
| Malformed tool input | score_lead called with an empty business name (the "Score a broken lead" demo) | `output-error` card with the schema's exact complaint + recovery action ✅ |
| Empty first run | Fresh browser profile / cleared storage | Designed empty state with examples, tool demo, failure demos ✅ |
| Happy path | Normal turns, tool success, stop mid-stream | Streams clean; no console errors observed ✅ |

The two drills are also wired into the live page (the empty state's
"Test the failure states" buttons) so a reviewer can re-run them without
DevTools.
