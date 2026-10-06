# Exercise 3 — The team's decisions, before and after

**Artifacts:** two saved diffs at the project root, `session3-before.diff`
(the task run without the decisions) and `session3-after.diff` (the same
task with the participant's context files), plus the context files
themselves: `.claude/rules/testing.md` (given on the sheet),
`.claude/rules/handlers.md` and `CLAUDE.local.md` (written by the
participant). The exercise saves and resets in one move, so expect a
clean working tree, not live changes.

If `session3-bonus.diff` exists (a second, different task run with the
same files), grade it as a third column after the main comparison. If
only `session3-before.diff` exists, the second run was skipped: grade
the first run alone, say so in the first line, and stop after the
decision table.

**When this runs.** Task 4, the closing task, in a fresh session. Do not
ask for the files: read them from disk. Ask exactly one question first,
and wait for the answer:

> Which decision do you think Claude still broke in the second run?
> Decision 1 (test kit), 2 (bad input) or 3 (small changes). One line,
> then I compare.

Take any answer, including "none" or "no idea", and start. "None" is a
common and fair answer. Never ask a
second question. The report must stand on its own: no follow-up question
at the end.

**Words.** The sheet says: the first run, the second run, the test kit,
the decisions (1, 2, 3), your rule files, *followed*, *broken*, *not
tested*, `/verify-exercise 3` (that is you), the closing round, extra changes. Use those words.
The sheet never says grader; say "this report" or "the comparison".
Never say baseline, harness, arm, treatment.

**The prompt is fixed:** *"Add a DELETE /api/reviews/{id} endpoint to the
BookStore API, with tests."* with the exercise's experiment tag, in both
runs. The bonus prompt is *"Add a GET /api/authors/{id}/books endpoint to
the BookStore API, with tests."* If the two runs used different prompts,
the comparison is broken: say so in one line and grade each run on its
own.

## The three decisions and how to read them in a diff

Use the project at hand for file names. Detect the test kit file (the
file whose header says "Test helpers for handler tests") and one existing
handler test file before you read the diffs.

1. **Test kit.** *Followed* when every new test in the diff uses the kit:
   its setup function and its builders, in the shape the participant's
   `testing.md` rule describes. In the first run there is no rule yet:
   using the kit there means Claude found it on its own. *Broken* when a new test uses the old setup
   (the shared test environment or test mux used directly, hand-made
   requests) instead. Also *broken*: an existing test was converted to the
   kit. *Not tested*: the diff adds no test.
2. **Bad input.** *Followed* when the new endpoint answers a bad id (not a
   number) with 400. *Broken* when it answers 500, which is what the old
   handlers do. Also *broken*: an old handler's 500 was changed in this
   diff (the decision says old endpoints are fixed later). *Not tested*:
   the endpoint has no path for bad input. A missing review (a valid id
   that does not exist) is not bad input; 404 is fine there and is not
   part of this decision.
3. **Small changes.** *Followed* when every changed file is needed for the
   task: the handler, the route registration, the store method if one was
   needed, and the tests. *Broken* when the diff changes something the
   task did not ask for: a reformatted file, a renamed helper, an old
   test rewritten, an old handler changed. Name the file and the line.

**Also check that every new test can run.** A test the runner never
finds passes nothing and fails nothing. Look for: a test placed after a
`main` guard or after the call that starts the runner, a test file whose
name the runner does not pick up, a test function or method the runner
does not recognise. Report a dead test under *Your files*, with the line.

Read the diffs with `git apply --stat <file>` for the shape and the file
itself for the content. Compare against the current files in the repo,
not memory. Run nothing that edits the project.

## Report shape

Make each part a heading the participant can find by scrolling.

1. **Your guess** — one sentence: the decision they named, and whether
   the second run broke it.
2. **The decisions, first run and second run** — a table with one row per
   decision and two columns (three with the bonus): *followed*, *broken*
   or *not tested*, each with the deciding line from the diff in a short
   quote, or "no line in this run could break it".
3. **What the rules changed** — for each decision whose result changed
   between the runs, name the sentence in their rule file or
   `CLAUDE.local.md` that most likely caused the change. For each decision
   that stayed *broken*, point at the gap in their wording: the missing
   limit, a `paths:` line that matches no files (list the files it
   matches), a sentence a diff cannot check. Show a tighter version of
   that one sentence. For a decision Claude *followed* in both runs, say it
   plainly: Claude followed it without being told this time, and nothing
   guarantees the next session does.
4. **Your files** — three lines at most: does the `paths:` line in
   `handlers.md` match the real handler files? Does `CLAUDE.local.md` have
   the line that points to the rule files? Any dead test in either diff?
   Is `CLAUDE.md` unchanged (`git diff --stat CLAUDE.md`)? A changed `CLAUDE.md` is the most
   important finding in this report: training mode is gone for every
   later session.

No dimension grade, no score, no question at the end.

## Known traps

- **Pointer line missing** — `CLAUDE.local.md` lacks the line that tells
  Claude to read the matching rule file. `paths:` loads a rule only when
  Claude opens a matching file with its own file tools; a new file, or an
  edit through a shell command or a script, may not load it. A decision
  that stayed *broken* with a correct rule file often has this cause.
- **Glob near-miss** — `paths:` in `handlers.md` points at a folder that
  does not exist or misses the file extension. The rule never loaded.
  The second run looks like the first one. Check by listing files.
- **No limit in decision 2** — the second run changes old handlers to 400
  as well. Old tests fail or get edited. Decision 2 and decision 3 break
  together; name the missing "new endpoints only" sentence.
- **Decision 3 scoped** — put in a rule file with handler `paths:`. It
  only loads for handler files; a drive-by change elsewhere is not
  covered.
- **Lucky first run** — the first run already followed a decision. Do not
  call that a failure of the rules. Say what the rules add: the same
  result in every session, not only this one.
- **`CLAUDE.md` modified** — check even when not mentioned.

## Held back

Why a decision that the code contradicts needs context at all: Claude
copies what it sees, and the old code shows the old way. Do not lecture
this; it is the closing round's question. Answer only if asked directly.
