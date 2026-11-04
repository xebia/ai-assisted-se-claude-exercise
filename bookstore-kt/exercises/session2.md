# Exercise 2: Give Claude Your Team's Decisions

**Session**: 2 — Steering Claude\
**Duration**: 34 minutes, plus a 4-minute closing round\
**Project**: The same BookStore API.

## Goal

You learn context engineering: how to get your team's decisions into
Claude's context, so that Claude follows them without being told each
time. You learn what belongs in a task prompt and what in a rule file, and how
to check in a diff whether Claude followed a decision.

## Start here

- Open a terminal in the `bookstore` folder that you cloned.
- The commands in this sheet, such as `/save-changes`, came with the project.
- Training mode is on: Claude asks you questions before it helps. Stuck?
  Type *just tell me* in the chat.
- Never edit `CLAUDE.md`.
- Write notes on paper or in a text file outside the project.
- The trainer tells you when to start each next task.

## Your team's decisions

Your team agreed on these decisions in a meeting. They are not written in
the project. The old code still follows the old way.

1. **Test kit.** "We built a test kit: `src/test/kotlin/bookstore/testkit/TestKit.kt`.
   New handler tests use the test kit. We do not rewrite the old tests."
2. **Bad input.** "Bad input gives a 400, not a 500. New endpoints do
   this. We fix the old endpoints later, in a separate change."
3. **Small changes.** "A change touches only the files the task needs. No
   extra changes."

## Tasks

### 1. Check the prompt before you run it

Before the first run, you check the prompt. This task answers one
question: which decisions does Claude make by
itself when a short prompt leaves them open? Tasks 2 and 4 run the prompt
unchanged, so the two results can be compared.

1. **Read the prompt.** Do not run it yet. The text in square brackets is a
   tag. It switches training mode off for this one prompt, so Claude builds
   the endpoint and does not ask questions. Keep the tag.

   ```
   [Exercise 2 experiment — execute directly, no leading questions.] Add a DELETE /api/reviews/{id} endpoint to the BookStore API, with tests.
   ```

2. **List the open decisions.** Write down every decision that Claude must
   make because the prompt does not say it. You do not need to read the code. Example for an "edit your profile"
   endpoint: *Which fields may a user change?*
3. **Mark each decision.** Write *task* next to a decision that is about
   this endpoint only. Write *team* next to a decision that your team makes
   once for every endpoint.
4. **Write your additions.** For each *task* decision, write one sentence
   to add to the prompt, in CONTEXT-TASK-OUTCOME style. Last, write a
   *Define done* sentence: what must be true when Claude is finished.
5. **Check your list (optional).** Start `claude` and run
   `/prompt-coach 1`. The 1 is the number of this task. Paste
   your list and sentences as your next message. The coach gives one round
   of feedback. Then type `/exit` to close Claude.

**Done when**: your list has at least four decisions, each marked *task*
or *team*, and you wrote your added sentences.

### 2. Run the prompt without the decisions

In task 1 you listed what the prompt leaves open. Now you run the prompt
while Claude knows only the code, and you save the result as
`session2-before.diff`.

1. **Predict the three decisions.** For each of your team's three
   decisions, write *yes* if you think Claude follows it without being
   told, and *no* if not.
2. **Check the project is clean.** Run `./gradlew test` and `git status`.
   Go to step 4 when all tests pass and `git status` lists nothing.
3. **Finish your session 1 work.** Do this step only if step 2 found a
   problem. Start `claude`. Press Shift+Tab until the
   line under the chat box says auto mode: Claude then does not ask
   permission. Run `/catch-up 1`. The command completes the session 1
   code work and commits it. Type `/exit`. Step 6 removes work that is not
   committed, so the project must be clean first.
4. **Start a fresh session.** A fresh session means: close Claude with
   `/exit`, then start `claude` again. Never use `/clear`. Paste the
   prompt from task 1 with the tag.
5. **Run the tests.** When Claude is done, run `./gradlew test`. Write down
   whether all tests pass.
6. **Save the result.** Run `/save-changes before`. The command saves
   Claude's changes in `session2-before.diff` and removes the changes from
   the project. Then type `/exit`.

**Done when**: the file `session2-before.diff` exists, and you wrote down your predictions and the test result.

### 3. Put the decisions where Claude reads them

The first run showed what Claude decides when nobody tells it. Now you
write your team's decisions in three files: `.claude/rules/testing.md`,
`.claude/rules/handlers.md` and `CLAUDE.local.md`. Decisions 1 and 2 go in rule files with a `paths:` line
(*Rule Discovery: With or Without Paths*). Decision 3 goes in
`CLAUDE.local.md`, your private version of `CLAUDE.md`.

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

2. **Write the rule for decision 2.** In your editor, create the file
   `.claude/rules/handlers.md`. Start the file with the same three-dash block as `testing.md`, with the
   description *Bad input in handlers* and
   `"src/main/kotlin/bookstore/handler/**/*.kt"` in the `paths:` line. Below the block,
   write two sentences:
   - Sentence 1: *New endpoints answer bad input, such as an id that is
     not a number, with 400.*
   - Sentence 2: what Claude does for now with the old endpoints in the
     `src/main/kotlin/bookstore/handler/` folder. Your team fixes them later, in a separate change.

   Sentence 2 must be checkable: a reader of a diff can say "this
   breaks the rule".
3. **Write the rule for decision 3.** In your editor, create
   `CLAUDE.local.md` in the `bookstore` folder, or open it if it exists and keep its text. It sits next to `CLAUDE.md`.
   Write two lines:
   - Line 1, copy exactly: *"Before you write or edit a file under
     src/test/kotlin/bookstore/handler/ or src/main/kotlin/bookstore/handler/, read the matching file in .claude/rules/."*
   - Line 2: decision 3 as a checkable rule that names which kinds of files a change
     may touch, for example the files of the endpoint and its tests. Example for another subject: *"A bug fix may touch only the
     file with the bug and its test."*

A `paths:` rule may not load when Claude creates a new file or edits
through a script. Claude reads `CLAUDE.local.md` at every session start,
so line 1 makes sure Claude reads the rule files.

**Done when**: the three files exist, `handlers.md` has a `paths:` line and
a sentence about the old endpoints, and `git status` does not list
`CLAUDE.md`.

### 4. Run the prompt with the decisions

You run the same prompt again. The prompt is unchanged, so every difference
to the first result comes from your three files. You save the result as
`session2-after.diff`.

1. **Start a fresh session.** Run `/exit` and start `claude` again. Claude
   reads your three new files when the session starts.
2. **Paste the prompt from task 1** with the tag. While Claude works,
   watch the chat for the files that Claude reads before it writes a test.
   Write down whether Claude reads the test kit file.
3. **Run the tests.** When Claude is done, run `./gradlew test`. Write down
   whether all tests pass.
4. **Save the result.** Run `/save-changes after`. Then type `/exit`.

**Done when**: the file `session2-after.diff` exists, and you wrote down whether Claude read the test kit file and the test result.

### 5. Closing: compare the two runs

Did your rules change what Claude did? You get a report on each team
decision, for the first run (task 2) and the second run (task 4).

1. **Start the comparison.** Start `claude` and run `/verify-exercise 2`.
   The command reads your two diff files. It first asks which decision
   Claude still broke in the second run. Answer in one line, from what you
   saw in the chat. *None* is a fine answer.
2. **Read the report.** Each decision is *followed*, *broken* or *not
   tested*. *Not tested* means the prompt gave no chance to break it.
3. **Write four lines.**
   - Line 1: your three predictions, and what Claude did in the first run.
   - Line 2: the decision that changed most between the two runs.
   - Line 3: one sentence of your rules that you would write differently,
     or that helped most.
   - Line 4: one decision from your task 1 list that Claude made by itself
     in the first run, and what Claude chose.

**Done when**: you wrote the four lines. Bring the four lines to the closing round.

## Bonus (only if time remains)

**Check your rules, then try a new prompt.** Run `/context-coach 2` and
paste your `handlers.md` and line 2 of your `CLAUDE.local.md`. Improve the one thing
that the coach names. Then start a fresh session and paste:

```
[Exercise 2 experiment — execute directly, no leading questions.] Add a GET /api/authors/{id}/books endpoint to the BookStore API, with tests.
```

Run `/save-changes bonus`.

**Change an old test.** This part checks decision 1, which says that your
team does not rewrite the old tests. Start a fresh
session and paste this prompt:

```
[Exercise 2 experiment — execute directly, no leading questions.] In the existing review tests, make the test for listing reviews also check that the first review has rating 5.
```

Run `git diff` in your own terminal. Write down one of two answers. Either
Claude only added the rating check, or Claude also rewrote that test to
use the test kit. Then run `/save-changes probe`. This command saves the changes
in a file and puts the project back in its clean state.

## Appendix: `/save-changes` by hand

If `/save-changes` stops, it says why. Or run these commands in the
`bookstore` folder. The first two save your changes. The last three remove
the changes:

```
git add -A .
git diff --cached --output=session2-before.diff
git reset -q .
git checkout -- .
git clean -fd .
```

Replace `before` with `after` or `bonus` in the file name of the second command.
The last command deletes new files that git does not track. Your rule
files, `CLAUDE.local.md` and the saved diffs stay, because git ignores them.

## Closing round

Claude follows a decision only when the decision is in its context. The
diff shows whether Claude followed it. Passing tests do not.

The trainer asks these questions to the room:

- Which decision did Claude follow without being told? Was your
  prediction right?
- Which line from your task 1 list belongs in the prompt, and which
  belongs in a rule? Why?
- Why does decision 1 go in a rule file with `paths:`, and decision 3 in
  `CLAUDE.local.md`?
- Which words in your rule for decision 2 make the rule checkable?
