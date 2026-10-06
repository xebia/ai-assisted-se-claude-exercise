# Exercise 3: Give Claude Your Team's Decisions

**Session**: 3 — Context Engineering\
**Duration**: 45 minutes, plus a 5-minute closing round\
**Project**: The same BookStore API.

## Goal

Your team made three decisions that the code does not show. In this
exercise you:

1. Run a task, and save what Claude builds.
2. Write the decisions where Claude reads them.
3. Run the same task again, and compare the two results.

## Start here

- Open a terminal in the `bookstore` folder that you cloned.
- Training mode is on: Claude asks you questions before it helps. Stuck?
  Type *just tell me* in the chat.
- Never edit `CLAUDE.md`.
- Write your notes on paper or in a text file outside the project.
- The trainer tells you when to start each next task.

## Your team's decisions

Your team agreed on these three decisions in a meeting. They are not in
the repo, so Claude cannot read them.

1. **Test kit.** "We built a test kit: `internal/handler/testkit_test.go`.
   New handler tests use it. We do not rewrite the old tests."
2. **Bad input.** "Bad input gives a 400, not a 500. New endpoints do
   this. We fix the old endpoints later, in a separate change."
3. **Small changes.** "A change touches only the files the task needs. No
   extra changes."

The old tests and the old handlers still show the old way.

## Tasks

### 1. Run the task without the decisions

This task produces `session3-before.diff`: a file with every change Claude
makes when it knows only the code.

1. **Get a clean start.** Run `go test ./...` and `git status`. A test
   fails, or `git status` lists changes? Start `claude`. Press Shift+Tab
   until the line under the chat box says auto mode: Claude then does not
   ask permission. Run `/catch-up 2`. It finishes the session 2 code work
   and commits it. Step 5 removes work that is not committed. Both clean?
   Go to step 2.
2. **Predict.** Before you run anything, write *yes* or *no* for each
   decision: will Claude follow it without being told? A wrong prediction
   is fine.
3. **Start a fresh session.** Type `/exit` if Claude is open, then start
   `claude`. A fresh session always means this: close Claude and start it
   again, never `/clear`. Paste this line, with the brackets. The tag at
   the start switches training mode off for this one prompt, so Claude
   builds instead of asking questions:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add a DELETE /api/reviews/{id} endpoint to the BookStore API, with tests.
   ```

4. **Run the tests.** When Claude is done, run `go test ./...`. Write down
   whether all tests pass.
5. **Save the result.** Run `/save-changes before`. It saves Claude's
   changes in `session3-before.diff` and removes them from the project.
   Then type `/exit`.

**Done when**: your three predictions are written down, and
`session3-before.diff` exists.

### 2. Put the decisions where Claude reads them

This task produces `.claude/rules/testing.md`, `.claude/rules/handlers.md`
and `CLAUDE.local.md`. Decisions 1 and 2 go in rule files with
`paths:`. Decision 3 goes in `CLAUDE.local.md`
(*Rule Discovery: With or Without Paths*).

1. **Decision 1.** Start `claude` and paste this block. Claude creates the
   rule file:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Create .claude/rules/testing.md with exactly this content, nothing added or changed:

   ---
   description: How we write new handler tests
   paths:
     - "internal/handler/*_test.go"
   ---
   New handler tests use the test kit in internal/handler/testkit_test.go.
   Read that file before you write a test. Use this shape: one Test<Method><Resource>API function per endpoint, one t.Run per case.
   A new test never calls newTestMux or httptest.NewRequest directly, even when the tests around it do.
   Never convert an existing test to the kit, also not in a file you edit.
   ```

2. **Decision 2.** In your editor, create `.claude/rules/handlers.md`. Copy
   the shape of `testing.md`, with `"internal/handler/**/*.go"` in `paths:`.
   Write two sentences. First: *New endpoints answer bad input, such as an
   id that is not a number, with 400.* Second: what happens to the old
   endpoints for now. They are in the `internal/handler/` folder. A rule is checkable when a reader of a diff can say "this breaks
   the rule".
3. **Decision 3.** In your editor, create `CLAUDE.local.md` in the
   `bookstore` folder, or add to it if it exists. Write two lines. First, copy this line exactly:
   *"Before you write or edit a file under internal/handler/, read the
   matching file in .claude/rules/."* Second, decision 3 as a checkable
   rule: name what a change may touch. An example about another
subject: *"A bug fix may touch only the file with the bug and its test."*

Why the first line: a `paths:` rule loads when Claude opens a matching
file. A new file, or an edit through a script, may not load it. Claude reads `CLAUDE.local.md` at the start
of every session.

**Done when**: the three files exist, `handlers.md` has a `paths:` line and
says what happens to the old endpoints, and `git status` does not list
`CLAUDE.md`.

### 3. Run the same task with the decisions

This task produces `session3-after.diff`.

1. **Start a fresh session.** Type `/exit` and start `claude` again. Claude
   now reads your new files at the start.
2. **Paste the prompt from task 1 again**, tag included. In the chat, watch
   which files Claude reads before it writes a test. Write down whether it
   reads the test kit.
3. **Run the tests.** When Claude is done, run `go test ./...`. Write down
   whether all tests pass.
4. **Save the result.** Run `/save-changes after`. Then type `/exit`.

**Done when**: `session3-after.diff` exists.

### 4. Closing: compare the two runs

This task gives you a report on each decision, with the lines that decided
it.

1. **Run the comparison.** Start `claude` and run `/verify-exercise 3`. It
   compares your two diffs with the three decisions. First it asks which
   decision Claude still broke in the second run. Answer in one line, from
   what you saw in the chat. *None* is a fine answer.
2. **Read the report.** Each decision is *followed*, *broken* or *not
   tested*. *Not tested* means the task gave Claude no chance to break it.
3. **Write down three lines.** Line 1: your predictions, next to what the
   first run did. Line 2: the decision that changed most between the two
   runs. Line 3: one sentence from your rules that you would write
   differently, or the one that helped most.

**Done when**: three lines are written down. Bring them to the closing
round.

## Bonus (only if time remains)

**Check your rules, then try a new task.** Run `/context-coach 2`. As your
next message, paste your `handlers.md` and your decision 3 line. Improve the one thing it
names. Then start a fresh session and paste:

```
[Exercise 3 experiment — execute directly, no leading questions.] Add a GET /api/authors/{id}/books endpoint to the BookStore API, with tests.
```

Run `/save-changes bonus`, then `/verify-exercise 3` in a fresh session.

**Change an old test.** Start a fresh session and paste:

```
[Exercise 3 experiment — execute directly, no leading questions.] In the existing review tests, make the test for listing reviews also check that the first review has rating 5.
```

Run `git diff`. Did Claude change only that test, or did it convert it to
the kit? Then run `/save-changes probe` to remove the changes.

## Back at work: try this on your own project

Pick one review comment that you write often. Write it as a rule with a
`paths:` line. In a real team, `.claude/rules/` is committed, so every
teammate gets the same rules. In this course, git ignores it.

## Appendix: `/save-changes` by hand

If the command stops, it says why. Or run these from the project folder,
one per line. The first two save your changes. The last three remove them:

```
git add -A .
git diff --cached --output=session3-before.diff
git reset -q .
git checkout -- .
git clean -fd .
```

Replace `before` with `after`, `bonus` or `probe`. The last command deletes
new files that git does not track yet. Your rule files, `CLAUDE.local.md`
and the saved diffs stay: `git clean` skips files that git ignores.

## Closing round

The trainer asks the room. Have these answers ready:

- Which decision did Claude follow without being told? Was your
  prediction right?
- Why does decision 1 go in a rule file with `paths:`, and decision 3 in
  `CLAUDE.local.md`? Why does `CLAUDE.local.md` also point to the rules?
- Which words in your rule for decision 2 make it checkable?
- One thing you would tell someone who skipped this session.
