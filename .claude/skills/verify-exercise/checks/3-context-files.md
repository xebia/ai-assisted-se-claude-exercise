# Exercise 3 — Context files vs. the weak-prompt run

**Artifact:** `CLAUDE.local.md` and one saved diff at the project root
(the exercise saves and resets in one move, so expect a clean working
tree, not live changes). **Which diff:** if `session3-rules.diff` exists,
grade that one — it is the bonus caching run, and caching tests all four
lines. Otherwise grade `session3-clean.diff`, the DELETE-endpoint run
from task 2. Say in the first line of the report which diff you graded
and why. Only if the participant did the back-at-work scoped-rule item:
the path-scoped rule file under `.claude/rules/`.

**When this runs.** During task 2, right after the clean session, in a
fresh session in the participant's second terminal, while they run the
polluted session. Nobody is watching. So: **do not ask for the context
file** — read `CLAUDE.local.md` from disk; it is exactly what Claude saw.
Ask exactly one question first, and wait for the answer:

> Which of your four lines (the layer line, rule 1, rule 2, rule 3) do you
> think Claude broke in the clean session? One line, then I grade.

Take any answer, including "no idea", and start. Never ask a second
question. The report is read in task 3, from the terminal scrollback, so
it must stand on its own: no "as we discussed", no follow-up question at
the end. In the bonus the participant may run you a second time on the
caching diff; then grade that one the same way and say which lines it
tests that the DELETE run did not.

**Words.** The participant's sheet says: the weak prompt (not "bait"),
the saved diff (not "banked"), the line that helped the most (not "MVP"),
a line not worth its tokens (not "freeloader"), the grader (that is you),
the closing round (not "harvest"). Use those words in the report. Trainer
words below are for you.

**Under review: the context files, not a prompt.** This is the Session 3
exception to this skill's usual framing. The prompt is fixed and
deliberately plain — *"Add a DELETE /reviews/{id} endpoint to the
BookStore API, with tests."* in task 2, *"Add caching to the BookStore
API"* in the bonus — plus the exercise's experiment tag. Its weakness is
the experimental control: whatever discipline shows up in the diff came
from the participant's context files, or from luck. If the diff shows
the participant improved the prompt's wording, note it as a broken
control and grade what you can.

**Three states per line.** A DELETE endpoint tempts Claude to skip
validation or to write tests in its own style; it rarely tempts a new
library or logic in the wrong layer. So for each of the four lines say
*held* (the diff shows Claude following it where it mattered), *failed*
(the diff shows a violation), or *not tested* (nothing in this run could
have violated it). *Not tested* is an honest result, not a pass. Never
upgrade it to *held*.

**What the participant was asked to produce.** A pruned `/init` output in
`CLAUDE.local.md` where every line passes the freeloader test, a layer
line, and three decisions in their own words (validation before store ·
tests per endpoint in the project's test convention · no new
dependencies). `@import` is theory only in this course: never a plus,
never a finding. The path-scoped rule file is a back-at-work item: grade
it when present, mark the Scoping dimension — n/a when absent, and never
count its absence against them.

## Rubric — replaces the Session 2 technique table

| Dimension | The context files pass when… |
| --- | --- |
| **Correctness** | every command, path, and convention the files claim is true of this repo — commands run, files exist, the described patterns actually appear in the code. A `file:line` reference that no longer points at what it names is wrong |
| **Completeness** | the layer line and all three required decisions are present and *checkable* — a violation could be seen, not argued about |
| **Relevance** | every line passes the freeloader test — nothing Claude could learn from the code, no restated language defaults, no file inventory |
| **Scoping** | *(back-at-work — n/a if not attempted)* the rule file's `paths:` glob matches the intended layer's real files and nothing else, and the rule was moved, not copied |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: predictions before
evidence, one specific expected defect per ❌. State the grade as *N of 4
dimensions sound*.

## What full-marks context files contain

- A verified test command (verified = you can run it now and it works)
- The layering rule using this repo's real package/module names
- Three prohibitions specific enough that the bait diff can show a
  violation
- No line that fails the freeloader test. There is no line-count target:
  the sheet says a line stays because they can say what it changes. The
  scoped rule, if present, carries only layer-local guidance
- `CLAUDE.md` itself untouched — `git status` / `git diff CLAUDE.md` is the
  cheapest check in this file. **Highest-value, least-often-checked:** a
  modified `CLAUDE.md` silently damages every later session.

## Establish ground truth

1. Run the test command `CLAUDE.local.md` claims, exactly as written. If it
   fails, that is a Correctness finding regardless of anything else. If
   the failure is in tests the bait diff never touched, say that the
   starting point was not clean (`/catch-up 2` was skipped) and grade on.
2. If a rule file exists, list the files its glob matches against the
   actual tree (every handler file? anything outside the layer?).
3. Only then read the diff (`git apply --stat` for the shape, the file
   itself for the content — the changes are no longer in the working
   tree). For the DELETE run: does the handler validate the id before it
   calls the store (rule 1)? Do new tests exist, in the project's
   convention (rule 2; compare against one existing test file, not
   memory)? Was anything added to the dependency manifest (rule 3;
   usually *not tested*)? Does the handler call a store function for the
   delete, or run its own query (layer line)? For the caching run: where
   did the cache land, store layer or spread across handlers? Was a
   library added? Do new tests follow the convention? Is cache
   invalidation wired to update/delete? Is handler validation still
   intact? No diff file at all? The save step was skipped. Say so.
   Without a diff only Correctness and Relevance can be graded.

## Known traps

- **Dependency added** — the manifest diff shows a cache/TTL library.
  The no-dependencies rule was missing, soft ("keep dependencies minimal"),
  or in a scoped file that did not load for store code.
- **Tests exist but ignore the convention** — the test rule named testing
  but not *this repo's* pattern. A generic rule gets you generic tests.
- **Cache in the wrong layer** — the layering rule was absent, or
  descriptive ("handlers call stores") instead of a rule.
- **Glob near-miss** *(scoped rule)* — a typo or wrong depth in the `paths:`
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
- `CLAUDE.md` unmodified
- DELETE run: handler validates before the store call · store function
  does the delete · new tests follow the existing test pattern · no new
  dependency (usually *not tested*)
- Caching run: no new external dependency · cache in the store layer
  with invalidation on update/delete · new tests follow the existing
  test pattern · handler validation intact

Partial is the expected first-attempt outcome. Usually one rule is worded
too softly to catch a violation. Say which wording, show the diff line it
failed to prevent, and show the tighter wording: the exercise is over when
they read this, and the wording is what they take home.

## Report shape for task 3

The sheet tells the participant to find three things in your report.
Make each one a heading they can find by scrolling:

1. **Your four lines: held, failed or not tested** — one line each for
   the layer line and rules 1, 2, 3, with the diff line that decides it,
   or "nothing in this run could break it". Then one sentence on their
   guess: "You guessed rule 3. The diff shows …" — right, wrong, or not
   testable by this run, say which.
2. **The line that helped the most** — the single `CLAUDE.local.md` line
   that did the most in the bait run. Point at the concrete behavior in
   the diff it prevented or forced (the dependency *not* added, the test
   that copies the project's convention, the cache in the store layer). A
   line whose rule was never tested by the diff cannot win, however well
   written. A line that was *not tested* cannot win either; say so if
   their guess named it.
3. **A line not worth its tokens** — one line where the answer to *"what
   would Claude do differently because this line exists?"* is nothing.
   Point at what Claude would have done anyway, or already knew from the
   code. If every line earns its tokens, say so. A clean sheet is a
   finding too.

End with the four-dimension grade and the pass bar. No question at the
end; nobody is there to answer it.

## Held back

The closing round poses to the room: *a line that is true but useless hurts
which dimension? A line that is specific but wrong?* Intended: **Relevance** for
the freeloader, **Correctness** for the wrong line. The wrong one is worse
because it does damage while looking trustworthy. Answer only if asked
directly.
