# Exercise 3 — Context files vs. the weak-prompt run

**Artifact:** `CLAUDE.local.md`, the banked bait diff (`session3-bait.diff`
at the project root — the exercise banks and resets in one move, so expect
a clean working tree, not live changes), and — only if the participant did
the bonus scoped-rule task — the path-scoped rule file under
`.claude/rules/`.

**This check runs in-session, at the end of the exercise.** Participants
arrive with their own MVP/freeloader nominations already written down in
the wrap. The report is read during or right after the closing round.
Grade the same way regardless of when it runs.

**Words.** The participant's sheet says: the weak prompt (not "bait"),
the saved diff (not "banked"), the line that helped the most (not "MVP"),
a line not worth its tokens (not "freeloader"), the closing round (not
"harvest"). Use those words in the report. Trainer words below are for you.

**Under review: the context files, not a prompt.** This is the Session 3
exception to this skill's usual framing. The bait prompt is fixed and
deliberately vague — *"Add caching to the BookStore API"*, plus the
exercise's experiment prefix. Its weakness is the experimental control:
whatever discipline shows up in the diff came from the participant's
context files, or from luck. Ask for the context files verbatim in Step 0
instead of a prompt. If the participant improved the bait prompt's wording,
note it as a broken control and grade what you can.

**What the participant was asked to produce.** A pruned `/init` output in
`CLAUDE.local.md` where every line passes the freeloader test, encoding
three decisions in their own words (validation before store · tests per
endpoint in the project's test convention · no new dependencies). The
path-scoped rule file is a bonus task: grade it when present, mark the
Scoping dimension — n/a when absent, and never count its absence against
them.

## Rubric — replaces the Session 2 technique table

| Dimension | The context files pass when… |
| --- | --- |
| **Correctness** | every command, path, and convention the files claim is true of this repo — commands run, files exist, the described patterns actually appear in the code |
| **Completeness** | all three required decisions are present and *checkable* — a violation could be seen, not argued about |
| **Relevance** | every line passes the freeloader test — nothing Claude could learn from the code, no restated language defaults, no file inventory |
| **Scoping** | *(bonus — n/a if not attempted)* the rule file's `paths:` glob matches the intended layer's real files and nothing else, and the rule was moved, not copied |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: predictions before
evidence, one specific expected defect per ❌. State the grade as *N of 4
dimensions sound*.

## What full-marks context files contain

- Verified build/test commands (verified = you can run them now and they
  work)
- The layering rule using this repo's real package/module names
- Three prohibitions specific enough that the bait diff can show a
  violation
- Under ~15 lines in `CLAUDE.local.md`; the scoped rule carries only
  layer-local guidance
- `CLAUDE.md` itself untouched — `git status` / `git diff CLAUDE.md` is the
  cheapest check in this file. **Highest-value, least-often-checked:** a
  modified `CLAUDE.md` silently damages every later session.

## Establish ground truth

1. Run the test command `CLAUDE.local.md` claims, exactly as written. If it
   fails, that is a Correctness finding regardless of anything else.
2. If a rule file exists, list the files its glob matches against the
   actual tree (every handler file? anything outside the layer?).
3. Only then read `session3-bait.diff` (`git apply --stat` for the shape,
   the file itself for the content — the changes are no longer in the
   working tree). Where did the cache land: store layer, or spread across
   handlers? Was anything added to the dependency manifest? Do new tests
   exist, and do they follow the project's convention (compare against one
   existing test file, not memory)? Is cache invalidation wired to
   update/delete? Is handler validation still intact? No
   `session3-bait.diff`? The bank step was skipped. Say so. Without the diff
   only Correctness and Relevance can be graded.

## Known traps

- **Dependency added** — the manifest diff shows a cache/TTL library.
  The no-dependencies rule was missing, soft ("keep dependencies minimal"),
  or in a scoped file that did not load for store code.
- **Tests exist but ignore the convention** — the test rule named testing
  but not *this repo's* pattern. A generic rule gets you generic tests.
- **Cache in the wrong layer** — the layering rule was absent, or
  descriptive ("handlers call stores") instead of a rule.
- **Glob near-miss** *(bonus)* — a typo or wrong depth in the `paths:`
  pattern. The rule never loaded anywhere, and nothing downstream changed.
  Check the glob even if the diff looks fine. A correct diff under a dead
  rule is luck, not scoping.
- **`CLAUDE.md` modified** — `/init` rewrote it and it was never restored.
  Training mode is gone. Check even when not mentioned; omissions are
  findings.
- **Got away with it** — Claude stayed in the project's style with no rule
  demanding it. Say plainly this will not repeat. The next session rolls
  the dice again.

## Pass bar

- Test command runs as written
- No new external dependency in the bait diff
- Cache in the store layer with invalidation on update/delete
- New tests present, following the project's existing test pattern
- `CLAUDE.md` unmodified

Partial is the expected first-attempt outcome. Usually one rule is worded
too softly to catch a violation. Say which wording, show the diff line it
failed to prevent, and let them tighten it themselves.

## Close with a nomination — and arbitrate theirs

End every report, pass or fail, with exactly two nominations, each backed
by one line of diff-level evidence:

- **MVP** — the single `CLAUDE.local.md` line that did the most in the bait
  run. Point at the concrete behavior in the diff it prevented or forced
  (the dependency *not* added, the test that copies the project's
  convention, the cache in the store layer). A line whose rule was never
  tested by the diff cannot be MVP, however well written.
- **Suspected freeloader** — one line where the answer to *"what would
  Claude do differently because this line exists?"* is nothing. Point at
  what Claude would have done anyway, or already knew from the code. If
  every line earns its tokens, say so. A clean sheet is a finding too.

The participant wrote their own nominations in the session's wrap. Ask for
them, then arbitrate: say where you agree, and where you differ show the
diff line that decides it. Their overrule stands. Record it without
arguing further. Being proven wrong by your own experiment, or defending a
line with a reason, are both the exercise working.

## Held back

Task 2 poses to the room: *a line that is true but useless hurts which
dimension? A line that is specific but wrong?* Intended: **Relevance** for the
freeloader, **Correctness** for the wrong line. The wrong one is worse
because it does damage while looking trustworthy. Answer only if asked
directly.
