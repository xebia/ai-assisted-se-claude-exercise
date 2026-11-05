# Exercise 2: Give Claude Your Team's Decisions

**Session**: 2 — Steering Claude\
**Duration**: 34 minutes, plus a 4-minute closing round\
**Project**: The same BookStore API.

## Goal

You learn context engineering: how to get your team's decisions into
Claude's context, so that Claude follows them without being told each
time. You see which choices Claude makes alone when a prompt is short, and
which of them belong in a prompt and which in a rule file. You also check
in a diff whether Claude followed a decision.

## Start here

- Open a terminal in the `bookstore` folder that you cloned.
- The commands in this sheet, such as `/save-changes`, came with the project.
- Training mode is on: Claude asks you questions before it helps. Stuck?
  Type *just tell me* in the chat.
- Never edit `CLAUDE.md`.
- Write notes on paper or in a text file outside the project.
- The trainer tells you when to start each next task.

## Your team's decisions

Your team agreed on these decisions in a meeting, but nobody wrote them in
the project, and the old code does not follow them yet. A 400 answer means
the request was wrong, and a 500 answer means the server failed.

1. **Test kit.** "We built a test kit: `src/test/kotlin/bookstore/testkit/TestKit.kt`.
   New handler tests use the test kit. We do not rewrite the old tests."
2. **Bad input.** "Bad input gives a 400, not a 500. New endpoints do
   this. We fix the old endpoints later, in a separate change."
3. **Small changes.** "A change touches only the files the task needs. No
   extra changes."

## Tasks

### 1. Run a short prompt and read Claude's guesses

A short prompt leaves many choices open. You run one, and you see which of
those choices Claude makes alone.

1. **Commit your work so far.** Run the two commands below, one after the
   other. Later steps remove Claude's changes from the project, and this
   commit keeps your own work safe. Do it before you paste any prompt.

   ```
   git add -A .
   git -c user.name=student -c user.email=student@example.com commit -m "start of session 2"
   ```

2. **Predict each decision.** For each of the three team decisions, write
   *yes* in your notes if you think Claude follows it without being told,
   and *no* if you think it does not.
3. **Run the prompt in a fresh session.** A fresh session means: close
   Claude with `/exit` if it is open, then run `claude`. Never use `/clear`.
   The text in square brackets is a tag. It switches training mode off for
   this one prompt, so Claude does not ask questions. Paste the prompt with
   the tag, and wait until Claude is done.

   ```
   [Exercise 2 experiment — execute directly, no leading questions.] Add a DELETE /api/reviews/{id} endpoint to the BookStore API, with tests.
   ```

4. **Ask for Claude's guesses.** In the same session, paste this message.
   Claude lists the choices it made because the prompt did not say.

   ```
   [Exercise 2 experiment — execute directly, no leading questions.] List the choices you made that my prompt did not state. One line each, five lines at most.
   ```

5. **Sort the guesses.** In your notes, write *task* next to a choice that
   matters for this endpoint only, and *team* next to a choice that every
   endpoint needs. Example for an "edit your profile" endpoint: *Which
   fields may a user change?* is *task*, and *Do we log every change?* is
   *team*.
6. **Save the result.** Run `/save-changes before`. The command saves
   Claude's changes in `session2-before.diff` and removes the changes from
   the project. Then type `/exit`.

If git says there is nothing to commit in step 1, go on to step 2. A
failing test or a messy endpoint is also a result, so you do not need to
fix it.

**Done when**: `session2-before.diff` exists, your notes hold a *yes* or
*no* per decision, and each of Claude's guesses is marked *task* or
*team*.

### 2. Write the rules

Nothing told Claude your team's decisions, so it chose alone. Now you
write them down in three files: `.claude/rules/testing.md`,
`.claude/rules/handlers.md` and `CLAUDE.local.md`. Decisions 1 and 2 go in
rule files with a `paths:` line (slide *Rule Discovery: With or Without
Paths*), and decision 3 goes in `CLAUDE.local.md`, your private version of
`CLAUDE.md`.

1. **Create the rule for decision 1.** Start `claude` and paste this block.
   Claude creates the rule file:

   ```
   [Exercise 2 experiment — execute directly, no leading questions.] Create .claude/rules/testing.md with exactly this content, nothing added or changed:

   ---
   description: How we write new handler tests
   paths:
     - "src/test/kotlin/bookstore/handler/**/*.kt"
   ---
   New handler tests use the test kit in src/test/kotlin/bookstore/testkit/TestKit.kt.
   Read that file before you write a test. Use this shape: one <Method><Resource>ApiTest class per endpoint, every test wrapped in apiTest { }.
   A new test never uses TestEnv().use or env.request(), even when the tests around it do.
   Never convert an existing test to the kit, also not in a file you edit.
   ```

2. **Create the rule for decision 2.** In your editor, create the file
   `.claude/rules/handlers.md` with this content. The second sentence is
   checkable: a reader of a diff can say "this breaks the rule".

   ```
   ---
   description: Bad input in handlers
   paths:
     - "src/main/kotlin/bookstore/handler/**/*.kt"
   ---
   New endpoints answer bad input, such as an id that is not a number, with 400.
   Do not change an existing handler function, even when it answers bad input with 500.
   ```

3. **Create `CLAUDE.local.md`.** In your editor, create the file
   `CLAUDE.local.md` in the `bookstore` folder next to `CLAUDE.md`. If it
   exists already, keep its text below your new lines. Copy this text to
   the top of the file, as line 1:

   ```
   Before you write or edit a file under src/test/kotlin/bookstore/handler/ or src/main/kotlin/bookstore/handler/, read .claude/rules/handlers.md. Before you write a test, read .claude/rules/testing.md.
   ```

4. **Write the rule for decision 3.** Write line 2, directly below line 1:
   decision 3 as a checkable rule that names the files a change may touch.
   Example for another subject: *"A bug fix may touch only the file with
   the bug and its test."*

A `paths:` rule may not load when Claude creates a new file or edits
through a script. Claude reads `CLAUDE.local.md` at every session start,
so line 1 makes sure that Claude reads both rule files.

**Done when**: the three files exist, line 1 of `CLAUDE.local.md` names
both rule files, and `git status` does not list `CLAUDE.md`.

### 3. Run the prompt with the decisions

Your three files now hold the decisions. You run the same prompt again, so
every difference to the first run comes from the files.

1. **Start a fresh session.** Run `/exit` and start `claude` again. Never
   use `/clear`: it does not reliably reload `CLAUDE.local.md`.
2. **Ask which rule files Claude will read.** Paste this message. It checks
   line 1 before the run, and the answer must name `.claude/rules/testing.md`.

   ```
   [Exercise 2 experiment — execute directly, no leading questions.] Which files in .claude/rules will you read before you write a handler test? Answer in one line and change nothing.
   ```

   If `testing.md` is missing from the answer, fix line 1 of
   `CLAUDE.local.md`. Then run `/exit` and start `claude` again, so that
   this question is not part of the run.
3. **Run the prompt.** Paste the same prompt as in task 1, with the tag.
   While Claude works, watch the chat for the files that Claude reads
   before it writes a test. Write down whether Claude reads the test kit
   file `src/test/kotlin/bookstore/testkit/TestKit.kt`.

   ```
   [Exercise 2 experiment — execute directly, no leading questions.] Add a DELETE /api/reviews/{id} endpoint to the BookStore API, with tests.
   ```

4. **Save the result.** Run `/save-changes after`. Then type `/exit`.

**Done when**: the file `session2-after.diff` exists, and you wrote down
whether Claude read the test kit file.

### 4. Compare the two runs

Did your rules change what Claude did? You get a report on each team
decision, for the first run and the second run.

1. **Start the comparison.** Start `claude` and run `/verify-exercise 2`.
   The command reads `session2-before.diff` and `session2-after.diff`. It
   first asks which decision Claude still broke in the second run. Answer
   in one line, from what you saw in the chat. *None* is a fine answer.
2. **Read the report.** Each decision is *followed*, *broken* or *not
   tested*. *Not tested* means that the prompt gave no chance to break the
   decision.
3. **Write four lines.**
   - Line 1: your three *yes* or *no* predictions from task 1, and what
     the report says for the first run.
   - Line 2: the decision that changed most between the two runs.
   - Line 3: one sentence of your rules that helped most.
   - Line 4: one guess you marked *team* in task 1, and the sentence of
     your rules that now covers the guess.

**Done when**: you wrote the four lines. Bring the four lines to the
closing round.

## Bonus (only if time remains)

**Write the long prompt.** Your rules replace sentences that you would
otherwise type in every prompt. To see how many, write the DELETE prompt
again, with one added sentence for each team decision and for each guess
you marked *task*. Run `/prompt-coach 1` and paste your prompt as your next
message. Then count the words of your prompt and of your rule files.

**Change an old test.** This part checks decision 1, which says that your
team does not rewrite the old tests. Start a fresh session and paste this
prompt:

```
[Exercise 2 experiment — execute directly, no leading questions.] In the existing review tests, make the test for listing reviews also check that the first review has rating 5.
```

Run `git diff` in your own terminal. Write down one of two answers. Either
Claude only added the rating check, or Claude also rewrote that test to
use the test kit. Then run `/save-changes probe`.

## Appendix: `/save-changes` by hand

If `/save-changes` stops, run these five commands in the `bookstore`
folder, one after the other. The first two save your changes, and the last
three remove them:

```
git add -A .
git diff --cached --output=session2-before.diff
git reset -q .
git checkout -- .
git clean -fd .
```

In the second command, replace `before` with `after` or `probe` in the
file name.

## Closing round

Claude follows a decision only when the decision is in its context. A
prompt carries the decision for one run, and a rule file carries it for
every run. The diff shows whether Claude followed it, and passing tests do not.

The trainer asks these questions to the room:

- Which decision did Claude follow in the first run without being told? Was
  your prediction right?
- Which of Claude's guesses did you mark *task*, and which *team*? Why?
- Why does line 1 of `CLAUDE.local.md` name both rule files?
