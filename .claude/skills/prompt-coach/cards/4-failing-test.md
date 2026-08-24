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

**Optional polish:** asking *why* REST wants 201/204 — turns a two-line fix
into something learned · a CONTEXT one-liner.

**Not applicable:**

- **Extended thinking / plan mode** — two status codes do not need a
  reasoning budget. The right call here is *low* effort; a draft invoking
  deep thinking gets the "Task A" question from the slides: what does the
  spend buy?
- **Role framing · Examples** — nothing to shape, no pattern needed.

## What a strong draft contains

- Both test failures pasted exactly as the tool printed them
- Expected vs actual stated in the participant's own words — "the test wants
  201, the handler sends 200" — proving they read the output rather than
  couriered it
- The handler file named, the tests declared off-limits
- Done: the named test command passes, both tests

## Nudge bank

- "You summarized the failure. What does the slide table say the summary
  costs you compared to the verbatim paste?"
- "If the model decides the *tests* are wrong, what in your prompt stops it
  from editing them to green?"
- "What effort level did you pick for this — and what would `high` buy you
  here?"

## Predicted defects for common gaps

- Paraphrased error → a plausible fix for a slightly different bug
- No constraint on the tests → assertions edited to match the buggy handler:
  green suite, bug intact
- No scope → a detour through the router or response helper before finding
  the handler
- No done-condition → one of the two codes fixed, victory declared

## Greenlight bar

All four load-bearing present. This should be the fastest coaching round of
the session — if the draft is clean on the first pass, say so and send them
straight on; manufacturing a nudge here undermines the whole skill.

## Held back

Nothing — the failing tests name the expected codes. The only discoverable
is *why* REST wants them, and that belongs to the model's answer, not to you.
