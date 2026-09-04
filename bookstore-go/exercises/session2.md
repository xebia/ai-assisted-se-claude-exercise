# Exercise 2: Write Better Prompts

**Session**: 2 — Bug Fixing & Effective Prompting
**Duration**: 30 minutes, plus a 5-minute closing round
**Project**: The same BookStore API. Some of its tests fail on purpose.

## Goal

In session 1 you talked to Claude and watched how it worked. In this
exercise you write the prompt first, before you run anything. Then you
check what your words did.

You will do three things:

1. Write one prompt per task, with the techniques from the slides.
2. Let a coach grade each prompt before it runs.
3. Send the prompt to a fresh Claude session and compare the result with
   what the coach predicted.

The bugs are there to practise on. A passing test only proves that your
prompt worked. A bug that stays unfixed is fine, as long as you can name
the words your prompt was missing. That teaches you more than a passing
test you cannot explain.

## Before you start: how this exercise works

Read this section first. The tasks do not work without it. Titles in
*italics* are slide titles from this session.

**Where to work.** Open a terminal in the `bookstore-go` folder. That is
the folder that contains `go.mod`. Run every command from that folder.
Start Claude with `claude`. You keep one session for tasks 1 to 4. Task 5
and the bonus tell you when to start a fresh one.

**Your notes.** Open an empty text file next to Claude, or a new tab in
your editor. Several tasks ask you to write something down. Task 4 needs
the exact test output that you copy there in task 1, so paper does not
work for this.

**Training mode.** This project has a `CLAUDE.md` file. Claude reads it at
the start of every session. In this course, the file tells Claude to teach
instead of answer. Before Claude explains a bug or writes a fix, it asks
you one question that points you to the answer. The file also tells Claude
to search the code instead of reading whole files. We call this behaviour
*training mode*. It is on in every session of this course. Simple requests
are not affected: running tests, git commands, questions about a
command-line option.

**Never edit `CLAUDE.md`.** That file holds training mode for the whole
course. If you change it, sessions 3 to 8 no longer work as designed.

**The loop.** Tasks 2, 3 and 4 use all five steps below. Task 5 stops after
Revise: you run that prompt yourself instead of shipping it.

1. **Draft.** Write your whole prompt. Do not run it yet.
2. **Coach.** Run `/prompt-coach <task number>`. The coach asks for your
   draft. Send your whole draft as your next message. If the task asks you
   to tell the coach something as well, put it in that same message.
3. **Revise.** Improve the prompt until the coach says it is ready.
4. **Ship.** Type *ship it*. The coach then sends your prompt to a
   sub-agent, word for word.
5. **Debrief.** Go through the report together with the coach. Which
   mistakes did it predict? Did they happen?

> **The loop, in short: Draft → Coach → Revise → Ship → Debrief.**
> Come back here if you forget a step.

Type *ship it*, *run it anyway* and *just tell me* as plain words. Do not
type the quotes or the italics.

**What a sub-agent is.** A sub-agent is a second Claude session that runs
your prompt. It has not seen your chat. It knows only the words in your
prompt. Its report comes back into your own chat when it is done. Task 5
is the exception: you run that prompt yourself.

**The coach adds one line.** When it ships your prompt, the coach puts one
fixed line in front of it. That line switches training mode off for that
run, so the sub-agent starts work immediately. Your own words are not
changed. This only happens for prompts the coach ships. In task 5 you run
the prompt yourself, so training mode stays on there.

**If you disagree with the coach.** Say *run it anyway*. The coach ships
your prompt and names the mistake it expects. Sometimes you are right.

**Two course commands.** These two commands are not part of Claude Code.
They are installed in the exercise project.

- `/prompt-coach <number>`: scores your draft prompt against this
  session's techniques. It says what is missing, and which mistake that
  will cause. It asks one question at a
  time. It never writes the prompt for you. Usage: run the command with
  the number printed in the task, then paste your draft as your next
  message. Use only the numbers this sheet prints.
- `/verify-exercise 2`: scores the prompt from task 2 against the file it
  produced, and says what was missing. It asks you for that prompt first.
  Paste it into the chat. Give your own words only, without the line the
  coach added. Your own words are the last complete version you gave the
  coach. Copy that text into your notes before you ship it. The report
  appears in the chat.

**Stuck, or out of time?** Say *just tell me*. Claude then answers
directly. That is allowed.

## Tasks

### 1. Run the tests and list the failures (2 min)

You produce a written list of failing tests. You need it in tasks 4 and 5.

1. **Run the tests** (1 min). Run `go test ./...`. Write down the name of
   every test that fails. Also copy the failing test output into your notes.
   Task 4 needs that exact text.
2. **Check your list** (1 min). These three tests should fail:
   `TestCreateBookReturns201`, `TestDeleteBookReturns204` and
   `TestCreateReviewNonexistentBook`. The bug in task 3 of this sheet has
   no test yet, so it cannot fail here. You write that test yourself.

One more test may fail: `TestCreateReviewValidation`. That means the
validation task from session 1 is still open. Fix it now. Send this to
Claude:

```
Add input validation to CreateReview in internal/handler/review.go: rating must be 1-5, reviewText must be between 10 and 500 characters
```

Training mode is on, so Claude may ask you one question first. Answer it,
then let it write the fix. This costs about two extra minutes. The
exercise then runs two minutes longer; that is fine.

You do not use the coach in this task. You are only reading what is there,
not designing a prompt.

**Done when**: you have a written list of failing tests, and
`TestCreateReviewValidation` is not on it.

### 2. A prompt that writes `docs/orientation.md` (9 min)

You produce the file `docs/orientation.md`, in the `bookstore-go` folder
next to `go.mod`. The `docs/` folder does not exist yet. Your prompt must
let Claude create it.

Imagine you are new to this codebase. Write one prompt that produces a
short guide for a new developer, with two parts:

1. **Package tree**: one line per package in this project, saying what
   that package is responsible for.
2. **Request flow**: the path of one request, from `main.go` to the
   database and back. One line per step, each with a `file:line`
   reference, written like `internal/handler/book.go:42`.

Steps:

1. **Draft your prompt** (3 min). Use these techniques:
   CONTEXT-TASK-OUTCOME, role framing, Scope it, Direct it, Define done,
   `@file`, and examples. One of those seven adds nothing here. Decide
   which one it is, and why.
2. **Coach and revise** (3 min). Run `/prompt-coach 2`. Paste your draft
   and your answer about the useless technique in one message. Revise
   until the coach says the prompt is ready.
3. **Save your prompt, then ship** (3 min). Copy your final prompt into
   your notes first: `/verify-exercise 2` asks for it later, word for
   word. Then type *ship it*. When the report comes back, open
   `docs/orientation.md`. Check the `file:line` references: does each one
   point at the line it claims?

The slide *Let's do a Prompt Analysis* showed a prompt built the same way.
It named the technology, said where to start, listed what to deliver, and
asked for evidence for every claim. Your prompt needs those same four
parts, for this project.

Run `/verify-exercise 2` now if you have time, or in the next break. It
compares your prompt with the file, one claim at a time.

**Done when**: `docs/orientation.md` exists, every step in the request flow
has a `file:line` reference, and you told the coach which technique adds
nothing here.

### 3. A prompt that asks for failing tests first (6 min)

You produce two new test cases in `internal/util/pagination_test.go`, plus
a fix in `internal/util/pagination.go`.

`Paginate()` in that file breaks when `page` is `0` or negative. No test
covers those two cases yet. Write one prompt that asks for the failing
tests first, then the fix, then proof of both.

Decide one thing before you write. What *should* happen when `page` is
`0`? There is no single right answer here. Pick one, write it into your
prompt, and be ready to say why. It is your requirement to set, not
Claude's to guess.

Steps:

1. **Draft your prompt** (2 min). Techniques you need here: Scope it,
   Direct it (say "tests first" in those words), Examples, Constrain it,
   Define done. For Examples, point at the table test that already exists
   in `internal/util/pagination_test.go`: the function `TestPaginate`. Your
   new cases belong in that same style.
2. **Coach and revise** (2 min). Run `/prompt-coach 3` and paste your
   draft.
3. **Ship and test** (2 min). Type *ship it*. Then run
   `go test ./internal/util/...` yourself. The sub-agent reports only what
   your prompt asked for. If you want to see both test runs, your prompt
   must ask for both.

The slide *Which Prompt is More Effective?* compared two prompts for a
pagination bug. The better one named the function, said no mocks, and
asked for a failing test before the fix. Your prompt needs those same
three parts.

**Done when**: the report shows the new tests failing *before* the fix and
passing *after*, and `go test ./internal/util/...` passes on your machine.

### 4. A prompt that uses the exact error output (5 min)

You fix two handlers in `internal/handler/book.go`.

`TestCreateBookReturns201` and `TestDeleteBookReturns204` are on your list
from task 1. Write one prompt that fixes both.

Steps:

1. **Draft your prompt** (2 min). Techniques you need here: error context,
   Scope it, Constrain it, Define done (*Providing Error Context*). Copy
   the two failing tests' output from your notes, exactly as the terminal
   printed it. You do not need the rest of the test run. Do not describe it in your own words. The exact text keeps
   the error messages and codes that Claude can search for. The tests are
   your constraint. Correct means the tests pass, so your prompt must
   forbid changing the tests.
2. **Write down an effort level** (1 min). Which `/effort` level fits this
   task, and why (*Prompting & Extended Thinking*)? Write the level and
   your reason in your notes. You do not run `/effort` in this task. The sub-agent is a
   separate session and does not copy your setting. Making the decision is
   the point here, not running the command.
3. **Coach, revise and ship** (2 min). Run `/prompt-coach 4`, paste your
   draft, then type *ship it*. Run `go test ./internal/handler/...`
   afterwards.

**Done when**: both tests pass in `go test ./internal/handler/...`, and
you wrote down an effort level with one reason.

### 5. A prompt for plan mode (7 min)

You fix `TestCreateReviewNonexistentBook`. It expects `404` but gets `201`.

There is more than one reasonable place for this fix. That makes it a job
for plan mode. You run this prompt yourself, in your own session. The coach
does not ship it, because you have to read the plan and answer it.

Three things are different in this task. First: do not type *ship it*.
When the coach says your prompt is ready, copy your prompt into your notes
and stop answering it. Second: you run the prompt in a fresh session. Run
`/clear`, so the coach and its advice are gone and only your prompt
decides what happens. Third: training mode stays on there, because no
sub-agent is involved. Claude may ask you one question before it plans.
Answer it in one line. The plan comes after that.

Steps:

1. **Draft your planning prompt** (2 min). Techniques you need here: plan
   mode, directed thinking, Scope it, Define done. Plan mode means: no code
   until you approve it (*Plan Mode: Explore Before Editing*). Directed
   thinking means: write in the prompt what the plan must think about
   (*Prompting & Extended Thinking*). Ask for one recommendation with
   reasons. If the plan lists options and picks none, your prompt let
   Claude avoid the decision.
2. **Coach and revise** (2 min). Run `/prompt-coach 5` and paste your
   draft. Stop when the coach says the prompt is ready. Copy your final
   prompt into your notes.
3. **Run it in plan mode** (2 min). Run `/clear`. Press Shift+Tab to
   switch to plan mode. Paste your prompt from your notes and read the
   plan.
4. **Question one step, then approve** (1 min). Pick one step of the plan.
   Ask Claude why that step, and what breaks if the step is wrong. Write
   the step and the answer in your notes. When Claude asks whether to go
   ahead, choose the answer that starts the work. It leaves plan mode and
   writes the code. Then run `go test ./internal/handler/...`.

**Done when**: your notes hold the plan step you questioned and Claude's
answer, and `TestCreateReviewNonexistentBook` passes.

### 6. Closing (1 min)

Run `go test ./...`. All tests should pass now. Sessions 3 to 8 build on
this code, so a failing test costs you time in a later session.

Still a failing test? Write in your notes which test it is, and which
technique your prompt for it was missing.

**Done when**: all tests pass, or you wrote down the failing test and the
missing technique.

## Bonus (only if time remains)

**Describe the error instead of pasting it.** Run `/clear`. That empties
the context, so Claude starts from nothing. Send your task 4 prompt from
your notes again, with one change. Describe the two
failures in your own words instead of pasting the output. Compare the two
runs. What did the exact text give you (*Providing Error Context*)?

**The same review, with and without a role.** Review the book store file
(`internal/store/book.go`) twice. Run `/clear` before each one. The first
prompt names only the file. The second adds a role: *"as a database performance
specialist. Focus on the number of queries."* Compare the two answers.
Does the role change what Claude finds (*Role Framing*)?

## Closing round (5 min)

The trainer asks the group. Have these answers ready:

- Which single sentence in one of your prompts helped the most?
- Which missing technique cost you something? Did the coach predict it?
- Where did you disagree with the coach, and were you right?
- One thing you would tell someone who skipped this session.
