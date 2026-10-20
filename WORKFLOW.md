# WORKFLOW.md — The AI-assisted workflow drill (FE-03)

**The feature:** a profile settings form (full name, email, username, bio, email
notifications) for the capstone portfolio — built twice, independently, in this
repository.

- **Round 1** — branch `drill/round-1-vague`: one prompt, "make a settings
  form." The output was accepted exactly as generated.
- **Round 2** — branch `drill/round-2-specified`: a written spec (fields,
  validation rules, example behaviour, accessibility requirements) plus the
  instruction: write it, then write tests and run them.

## Correctness

Round 1's form cannot fail — and that is the failure. It sets `noValidate` on
the form while keeping `required` attributes on the inputs, so the browser
never runs any validation at all; the submit handler never reads the values
and fires `alert('Settings saved!')` on a completely empty form. That is the
AI mistake I caught on review: a success message with zero evidence behind
it. It would have shipped silently, because the form *looks* finished.

Round 2 moves every rule into a pure function, `validate.ts` (name 2–60
characters, email format, username 3–20 characters of lowercase letters,
numbers and underscores, bio of at most 160 characters), and the component
only renders what that function decides. Eight tests cover the rules and
their boundaries, including a whitespace-only name and a bio of exactly 160
versus 161 characters. All eight pass (`node --test`).

## Accessibility

Round 1 uses placeholders as the only field names — nothing for a screen
reader to announce, and the hint disappears while typing. Round 2 gives every
field a visible label tied with `htmlFor`, marks invalid fields with
`aria-invalid`, connects errors with `aria-describedby`, announces errors
with `role="alert"` and success with `role="status"`, and adds `autoComplete`
attributes. None of that existed in round 1, and none of it was asked for
vaguely — it appeared because the spec named it.

## Edge cases

Round 1 handles none: a username of `Ah med!` "saves", and so does a
5,000-character bio. Round 2 trims whitespace before validating, rejects the
bad username with a specific message, and shows a live character counter on
the bio.

## Review effort — the actual lesson

Round 1 took one prompt and felt instant, but reviewing it honestly meant
finding defects that could not be patched — no validation, no state, no
labels — so the component had to be rewritten from zero. Round 2 took longer
up front (writing the spec), and review shrank to running the tests and
reading the diff. End to end, the "slower" round was the faster one, and it
is the only one I would ship.
