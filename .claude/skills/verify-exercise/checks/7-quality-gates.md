# Exercise 7 — Quality gates on the merged diff

**Artifact:** the merged working tree — both the author-books endpoint and
the review validation should exist on the participant's current branch
after their `git merge`.

**What the participant was asked to produce.** Two features, built through
different paths (Feature A as a background worktree agent, Feature B by
hand), merged into one branch, then checked against a fixed quality-gate
prompt: the test suite passes, the project's static-check command is clean,
both endpoints exist and follow existing patterns, no existing test broke.
The exact commands are in the exercise sheet for this language — use those,
not a Go-specific one.

**Under review: the merged code and the quality-gate prompt's report, not a
drafting prompt.** Task 2 has no coach — it is graded after the fact,
against what actually landed in the repo.

## Rubric — replaces the Session 2/3 technique tables

| Check | Passes when… |
| --- | --- |
| **Tests** | the project's test command passes, including any new tests for both features |
| **Static check** | the project's compile/lint/type-check command (see the exercise sheet) reports no issues |
| **Feature A present** | `GET /authors/{id}/books` exists, paginates using the same convention as an existing list endpoint, and returns only that author's books |
| **Feature B present** | `POST /reviews` rejects rating outside 1–5, review text outside 10–500 characters, and a nonexistent book — with the right HTTP status for each |
| **No regressions** | no test that passed before the merge fails after it |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: run the commands yourself
before marking a check, don't take the participant's quality-gate report on
trust.

## Establish ground truth

1. Run the test command and the static-check command yourself. Don't reuse
   the participant's own report — that report is what you are checking.
2. Open the new author-books handler and compare its pagination logic
   against an existing paginated list endpoint in the same layer. Same
   query-param names, same response shape?
3. Open the new review validation and check all three rules fire, with a
   request that violates each one at a time.
4. Confirm the review handler's "book must exist" check calls into the book
   store rather than duplicating a query — this is the shared dependency
   Task 1's safety check should have surfaced.

## Known traps

- **Merge collision in the server wiring file** (where handlers are
  constructed and given their dependencies). Both features likely add a new
  dependency to a different handler's constructor, in the same few lines of
  that file. Check whether the merge left both dependencies wired
  correctly, or whether one silently overwrote the other — this is
  mechanically checkable: read the constructor calls and confirm both new
  arguments are present.
- **Pagination drift.** Feature A is easy to build with its own ad-hoc
  limit/offset handling instead of reusing the project's existing
  pagination helper. That is a pattern-match failure even if the endpoint
  works.
- **Validation order.** A common mistake: checking the book exists *after*
  validating rating and text, so a request with bad rating and a
  nonexistent book reports the wrong error first. Check the order against
  what the exercise asked for — book existence is a separate rule.
- **Silent scope creep.** The background agent may have added extra
  behavior (extra query params, extra fields) beyond what Task 1's prompt
  asked for. Note it as a finding either way: unrequested behavior nobody
  reviewed is still unreviewed behavior.

## Pass bar

- Test command and static-check command both clean
- Both endpoints present and matching existing patterns
- No regressions
- Partial is a fine first-attempt outcome on pattern-matching — call it out
  by name rather than rounding up to a pass.

## Held back

None. This exercise has no open question posed to the room — Task 1's
`/parallel-coach` card carries the one held-back fact for this session.
