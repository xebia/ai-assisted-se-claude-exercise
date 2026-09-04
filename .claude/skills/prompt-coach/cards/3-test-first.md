# Task 3 — The test-first prompt

**What they're drafting:** one prompt that gets the pagination helper's
`page = 0` and negative-`page` behavior tested and fixed: failing tests
written first, shown failing on today's code, then the fix, then both runs
shown. The edge cases are currently untested and broken. There is no failing
output to paste. That is exactly why the prompt must demand tests first.

**Slide anchors:** *Which Prompt is More Effective?* — the stronger prompt on
that slide has the same three parts this task needs, on a different bug ·
*The Power of Examples* · *Providing Verification Criteria for the Outcome* ·
*Working with Tests*.

## Technique applicability

**Load-bearing (5):** Scope it (the pagination helper and its test file, by
name or `@file`) · Direct it (the *method*: write the failing tests first,
watch them fail, then fix) · Define done (new tests pass **and** the existing
table test still passes, via the project's test command) · Examples (point at
the existing table-driven test as the pattern for the new cases) ·
Constrain it (fix the function, do not change the expectations to match the
bug; no new dependencies).

**Optional polish:** CONTEXT one-liner (stack, no ORM) · verification
criteria beyond the test run.

**Not applicable:**

- **Error context** — nothing is failing yet, so there is nothing to paste.
  A draft that waits for output to paste has the workflow backwards. That
  *is* the lesson here.
- **Role framing** — no audience to shape output for.
- **Extended thinking / plan mode / high `/effort`** — a guard clause does
  not need a reasoning budget. If the draft asks for them, question the
  cost.

## What a strong draft contains

- The function and both edge cases named. "Pagination is broken" scopes
  nothing.
- Test-first as an explicit sequence: failing tests → shown failing → fix →
  both runs shown
- The existing table test named as the pattern to extend
- What the correct behavior *is*. The participant decides (clamp to page 1
  is the usual answer), and the prompt states it. A prompt that leaves
  "what should happen at page 0" to Claude has delegated the requirement,
  not just the typing.
- Done as a command outcome: the specific test run that must pass

## Nudge bank

- "Your prompt asks for a fix. What in your prompt proves the bug existed
  before the fix?"
- "There is a table-driven test next to this function. What in your draft
  stops Claude from writing the new tests in a different style?"
- "Page 0 comes in. What does *your prompt* say should happen? Who decided
  that: you or Claude?"

## Predicted defects for common gaps

- No test-first direction → Claude writes fix and tests together. The tests
  are never seen failing, so they prove nothing.
- No Examples pointer → Claude writes the new tests in a different style
  than the table test next to them
- No expected behavior stated → Claude picks a meaning (error? empty page?
  clamp?). You discover the requirement in review.
- No done-condition → Claude handles one edge case and forgets the other

## Greenlight bar

All five load-bearing present. This prompt should end up as strong as the
stronger prompt on the slide. If it does, say so when you tell them it is
ready.

## Held back

The fix itself (a lower-bound guard on `page`). If their prompt states the
expected behavior, they are specifying a requirement. React to their choice.
Do not reveal whether it matches the seeded bug's intended fix.
