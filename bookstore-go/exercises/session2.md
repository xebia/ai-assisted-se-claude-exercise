# Exercise 2: Write Better Prompts

**Session**: 2 — Bug Fixing & Effective Prompting
**Duration**: 35 minutes, plus a 5-minute closing round
**Project**: The same BookStore API. Some of its tests fail on purpose.

## Goal

You write three prompts with the techniques from the slides. A coach
checks each prompt before it runs. Then you compare the result with what
the coach predicted.

The goal is a better prompt, not a fixed bug. If a bug stays unfixed but
you can name what was missing from your prompt, you have learned more than
someone who got lucky.

## Before you start

Titles in *italics* are slide titles from this session.

**Where to work.** Open a terminal in the `bookstore-go` folder, the one
that contains `go.mod`. Start Claude with `claude`. Keep this one session
for tasks 1 and 2. Task 3 tells you when to restart it. After that restart
you do not need the coach any more.

**Your notes.** Keep an empty text file open next to Claude, outside the
`bookstore-go` folder. Tasks 1 and 3 ask you to copy text into it.

**Training mode.** The project's `CLAUDE.md` tells Claude to teach instead
of answer. Before it explains or fixes a bug, it asks you one question.
Never edit `CLAUDE.md`. Sessions 3 to 8 depend on it.

**The loop.** Tasks 1 and 2 use all five steps. Task 3 stops after Revise.
`/prompt-coach` is a course command. It is installed in the exercise
project, not in Claude Code.

1. **Draft.** Write your whole prompt. Do not run it yet.
2. **Coach.** Run `/prompt-coach <task number>`, then paste your draft as
   your next message. The coach checks it and asks one question.
3. **Revise.** Improve the prompt until the coach says it is ready. That
   takes at most two rounds. Out of time? Go to the next step anyway.
4. **Ship.** Type *ship it*. The coach sends your prompt, word for word,
   to a sub-agent: a second Claude session that knows only the words in
   your prompt. Its report comes back into your chat.
5. **Debrief.** Read the report with the coach. Did its predictions come
   true?

> **The loop, in short: Draft → Coach → Revise → Ship → Debrief.**

Type *ship it*, *run it anyway* and *just tell me* as plain words, without
the quotes. *Run it anyway* ships your prompt when you disagree with the
coach. *Just tell me* makes the coach show you what is missing, with
examples. Both are allowed.

The coach puts an experiment prefix, like in session 1, in front of every
prompt it ships. That line switches training mode off for the sub-agent.
It does not change your words.

## Tasks

### 1. A prompt that writes `docs/orientation.md` (11 min)

You produce the file `docs/orientation.md`, next to `go.mod`. The `docs/`
folder does not exist yet.

Write one prompt that produces a short guide for a new developer, in two
parts:

1. **Package tree**: one line per package, saying what that package is
   responsible for.
2. **Request flow**: the path of one request, from `main.go` to the
   database and back. One line per step, each with a `file:line`
   reference, written like `internal/handler/book.go:42`.

Steps:

1. **Draft your prompt** (4 min). Use these techniques:
   CONTEXT-TASK-OUTCOME, role framing, Scope it, Direct it, Define done,
   `@file`, and examples. One of the seven adds nothing here; the closing
   round asks which one. **Your prompt must say: write the result to
   `docs/orientation.md`, and create the folder.** Without that line, the
   sub-agent only reports in the chat.
2. **Coach and revise** (3 min). Run `/prompt-coach 1` and paste your
   draft. Revise until the coach says the prompt is ready.
3. **Save your prompt, then ship** (4 min). Copy your final prompt into
   your notes. Then type *ship it*. Read task 2 while the sub-agent works.
   When the report is back, open `docs/orientation.md` and check two
   `file:line` references. Do they point at the line they name?

The prompt on the slide *Let's do a Prompt Analysis* has the same four
parts: the technology, where to start, what to deliver, and proof for
every statement.

After this exercise, run `/verify-exercise 2` in any Claude session. It asks for the prompt from your notes and checks the
file against it, one line at a time.

**Done when**: `docs/orientation.md` exists, and every step in the request
flow has a `file:line` reference.

### 2. A prompt that asks for failing tests first (9 min)

You produce two new test cases in `internal/util/pagination_test.go` and a
fix in `internal/util/pagination.go`.

`Paginate()` breaks when `page` is `0` or negative. No test covers those
cases yet. Decide first: what *should* happen when `page` is `0`? Page 1
again, or an error: both are fine. Write your choice into your prompt.
You decide this, not Claude. Session 6 builds on your choice.

Steps:

1. **Draft your prompt** (3 min). Techniques you need here: Scope it,
   Direct it (say "tests first" in those words), Examples, Constrain it,
   Define done. For Examples, point at the existing test function
   `TestPaginate` in `internal/util/pagination_test.go`. Your new cases
   belong in that same style. Ask for both test runs in the report:
   before the fix and after.
2. **Coach and revise** (2 min). Run `/prompt-coach 2` and paste your
   draft.
3. **Ship and test** (4 min). Type *ship it*. Then run
   `go test ./internal/util/...` yourself. The sub-agent reports only
   what your prompt asked for.

The better prompt on the slide *Which Prompt is More Effective?* named
the function, said no mocks, and asked for a failing test before the fix.

**Twenty minutes after the start, the trainer calls task 3. Move to task 3
then, even if this task is not finished.**

**Done when**: the report shows the new tests failing *before* the fix
and passing *after*, and `go test ./internal/util/...` passes.

### 3. A prompt for plan mode (11 min)

You fix `TestCreateReviewNonexistentBook` in
`internal/handler/review_test.go`. It expects `404` but gets `201`. The
review flow runs from `internal/handler/review.go` to
`internal/store/review.go`, and the fix can go in more than one place.
That makes it a job for plan mode: Claude proposes a plan, you approve it,
then it writes code (*Plan Mode: Explore Before Editing*).

Two things are different here. You do not type *ship it*: you run the
prompt yourself, in a fresh session that has not seen the coach's advice.
And training mode is on there, so Claude may ask one question before it
plans. Answer it in one line. Do not put the experiment prefix in this
prompt.

Steps:

1. **Copy the error** (1 min). Run `go test ./internal/handler/...`. Copy
   the output of `TestCreateReviewNonexistentBook` into your notes,
   exactly as printed.
2. **Draft your planning prompt** (3 min). Techniques you need here:
   error context (the paste from step 1), plan mode, directed thinking,
   Scope it, Define done. Directed thinking means: write in the prompt
   what the plan must think about (*Prompting & Extended Thinking*). Ask
   for one recommendation with reasons, not a list of options.
3. **Coach and revise** (2 min). Run `/prompt-coach 3` and paste your
   draft. When the coach says it is ready, copy the prompt into your
   notes.
4. **Run it in plan mode** (3 min). Close Claude and start it again with
   `claude`. The coach is gone now; you do not need it again. Press
   Shift+Tab until the screen says plan mode. Paste your prompt and read
   the plan.
5. **Question one step, then approve** (2 min). Pick one step. Ask Claude
   why that step, and what breaks if it is wrong. Write the step and the
   answer in your notes. When Claude asks whether to go ahead, choose the
   *Yes* answer that accepts the edits automatically. Claude leaves plan
   mode and writes the code. Run `go test ./internal/handler/...`.

**Done when**: your notes hold the plan step you questioned and Claude's
answer, and `TestCreateReviewNonexistentBook` passes.

### 4. Closing: make the tests pass, then commit (4 min)

Sessions 3 to 8 build on this code, so every test should pass at the end.

1. **Fix the two book tests** (2 min). `TestCreateBookReturns201` and
   `TestDeleteBookReturns204` still fail. The prompt below is written for
   you. Run `go test ./internal/handler/...`, paste the output of those
   two tests at the marked place, and send the whole text to Claude. The
   first line is an experiment prefix, like in session 1.

   ```
   [Exercise 2 experiment — execute directly, no leading questions.]
   Two tests in internal/handler/book_test.go fail. The bug is in internal/handler/book.go. Fix the handlers. Do not change any test file. This is the exact test output:

   <paste the output of the two failing tests here>

   Done when `go test ./internal/handler/...` passes. Show me that test run.
   ```

   Read the prompt once more. The paste is error context (*Providing
   Error Context*). The file name is Scope it. "Do not change any test
   file" is Constrain it. The last line is Define done.
2. **Check the validation test** (1 min). If `TestCreateReviewValidation`
   fails too, send this:

   ```
   [Exercise 2 experiment — execute directly, no leading questions.]
   Add input validation to CreateReview in internal/handler/review.go: rating must be 1-5, reviewText must be between 10 and 500 characters
   ```
3. **Catch up and commit** (1 min). Whatever state you are in: press
   Shift+Tab until the screen says auto mode, then run `/catch-up 2`. It
   fixes the tests that still fail, in the project's own style, and
   commits. Leave it running while the trainer starts session 3. If its
   report says it took a decision for you, write that decision down.

**Done when**: `/catch-up 2` is running, and your notes name every failing
test and the technique your prompt was missing.

## Bonus (only if time remains)

**The same review, with and without a role.** Send these two prompts, with
`/clear` before each one. Does the role change what Claude finds (*Role
Framing*)?

```
[Exercise 2 experiment — execute directly, no leading questions.]
Review internal/store/book.go.
```

```
[Exercise 2 experiment — execute directly, no leading questions.]
Review internal/store/book.go as a database performance specialist. Focus on the number of queries.
```

## Closing round (5 min)

The trainer asks the group. Have these answers ready:

- Task 1 listed seven techniques. Which one added nothing there, and why?
- Which single sentence in one of your prompts helped the most?
- Which missing technique cost you something? Did the coach predict it?
- Where did you disagree with the coach, and were you right?
