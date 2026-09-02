# Task 4 — The failing-test prompt

**What they're drafting:** one prompt that fixes the two failing HTTP status
code tests — create-book should return `201`, delete-book should return `204`
— using the real failing output they already have from the baseline run.

**Slide anchors:** *Providing Error Context* (the ★-table: verbatim, more
context = better diagnosis) · *Use-Case: Bug Fixing Workflow* (expected vs
actual, root cause not suppression) · *Prompting & Extended Thinking* (this
is the `low`-effort row).

## Technique applicability

**Load-bearing (4):** Error context — the failing test output pasted
**verbatim**, not paraphrased · Scope it (the handler file/functions) ·
Constrain it (fix the handlers; the tests are the spec and must not change) ·
Define done (the specific handler test run passes).

**Optional polish:** asking *why* REST wants 201/204. This turns a two-line
fix into something learned · a CONTEXT one-liner.

**Not applicable:**

- **Extended thinking / plan mode** — two status codes do not need a
  reasoning budget. The right choice here is *low* effort. A draft that asks
  for deep thinking gets the "Task A" question from the slides: what does
  the extra cost buy?
- **Role framing · Examples** — nothing to shape, no pattern needed.

## What a strong draft contains

- Both test failures pasted exactly as the tool printed them
- Expected vs actual stated in the participant's own words — "the test wants
  201, the handler sends 200". This proves they read the output instead of
  only copying it.
- The handler file named, and the tests declared off-limits
- Done: the named test command passes, both tests

## Nudge bank

- "You summarized the failure. What does the slide table say a summary costs
  you, compared to the exact paste?"
- "If Claude decides the *tests* are wrong, what in your prompt stops it from
  editing them until they pass?"
- "What effort level did you pick for this? What would `high` give you
  here?"

## Predicted defects for common gaps

- Paraphrased error → Claude fixes a slightly different bug that fits your
  summary
- No constraint on the tests → Claude edits the assertions to match the
  buggy handler. Green suite, bug still there.
- No scope → Claude goes through the router or response helper first, before
  it finds the handler
- No done-condition → Claude fixes one of the two codes and reports success

## Greenlight bar

All four load-bearing present. This should be the fastest coaching round of
the session. If the draft is clean on the first pass, say so and send them
on. Inventing a nudge here damages trust in the whole skill.

## Held back

Nothing. The failing tests name the expected codes. The only thing to
discover is *why* REST wants them, and that belongs to Claude's answer, not
to you.
