# Task 3 — The test-first prompt

**What they're drafting:** one prompt that gets the pagination helper's
`page = 0` and negative-`page` behavior tested and fixed: failing tests
written first, shown failing on today's code, then the fix, then both runs
shown. The edge cases are currently untested and broken — there is no failing
output to paste, which is exactly why the prompt must demand tests first.

**Slide anchors:** *Which Prompt is Better?* — this task is Prompt A, written
by the participant instead of read off the slide · *The Power of Examples* ·
*Providing Verification Criteria* · *Use-Case: Working with Tests*.

## Technique applicability

**Load-bearing (5):** Scope it (the pagination helper and its test file, by
name or `@file`) · Direct it (the *method*: write the failing tests first,
watch them fail, then fix) · Define done (new tests pass **and** the existing
table test still passes, via the project's test command) · Examples (point at
the existing table-driven test as the pattern for the new cases) ·
Constrain it (fix the function, don't bend the expectations to the bug; no
new dependencies).

**Optional polish:** CONTEXT one-liner (stack, no ORM) · verification
criteria beyond the test run.

**Not applicable:**

- **Error context** — nothing is failing yet; there is nothing to paste. A
  draft that waits for output to paste has the workflow backwards — that
  *is* the lesson here.
- **Role framing** — no audience to shape output for.
- **Extended thinking / plan mode / high `/effort`** — a guard clause does
  not need a reasoning budget. If the draft reaches for them, question the
  spend.

## What a strong draft contains

- The function and both edge cases named — "pagination is broken" scopes
  nothing
- Test-first as an explicit sequence: failing tests → shown failing → fix →
  both runs shown
- The existing table test named as the pattern to extend
- What the correct behavior *is* — the participant decides (clamp to page 1
  is the conventional answer), the prompt states it. A prompt that leaves
  "what should happen at page 0" to the model has delegated the requirement,
  not the typing.
- Done as a command outcome: the specific test run that must pass

## Nudge bank

- "Your prompt asks for a fix. What proves the bug existed at all?"
- "There's a table-driven test sitting right next to this function. What in
  your draft stops the model from inventing a second test style?"
- "Page 0 arrives: what does *your prompt say* should happen — and who
  decided that, you or the model?"

## Predicted defects for common gaps

- No test-first direction → fix and tests land together, tests never seen
  failing, proving nothing
- No Examples pointer → new tests in a different style than the table test
  beside them
- No expected behavior stated → the model picks a semantic (error? empty
  page? clamp?) and the participant discovers the requirement in review
- No done-condition → one edge case handled, the other forgotten

## Greenlight bar

All five load-bearing present. This prompt should end up recognizably close
to the slide's Prompt A — if it does, say so in the greenlight; that
recognition is the payoff.

## Held back

The fix itself (a lower-bound guard on `page`). If their prompt states the
expected behavior, that's them specifying a requirement — react to their
choice, don't reveal whether it matches the seeded bug's intended fix.
