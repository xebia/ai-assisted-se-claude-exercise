# Exercise 3: Change What Claude Sees

**Session**: 3 — Context Engineering
**Duration**: 40 minutes
**Project**: The same BookStore API.

## Goal

In session 2 you improved the words in your prompt. In this exercise the
prompt stays the same. You change the **context** instead: the files and
the conversation that Claude sees. Then you check what that does to the
code Claude writes.

You will do three things:

1. Write a `CLAUDE.local.md` file with rules for this project.
2. Test that file with a weak prompt. Do the rules stop the mistakes?
3. Give the same prompt to a clean session and to a polluted session.
   Compare the code.

The four dimensions from the slides (*The Four Dimensions of Context*)
come back in every task: Correctness, Completeness, Relevance, Trajectory.

## Before you start: how this project is set up

Read this section first. The tasks do not work without it. Titles in
*italics* are slide titles from this session.

**Where to work.** Open a terminal in the `bookstore-ts` folder. That is
the folder that contains `package.json`. Run every command in this exercise from
that folder. Start Claude with `claude`. Commands like `git status` or
the test command: type them in a second terminal, or ask Claude to run
them. Simple commands like these do not start training mode.

**Commit your session 2 work first.** This exercise resets the project
several times. A reset removes every change that is not committed. Your
session 2 fixes are not committed yet. Run these two commands, one per
line:

```
git add -A .
git commit -m "session 2"
```

If git says "nothing to commit", that is fine. Continue.

**Fresh session.** Some tasks say "open a fresh session". That means: close
Claude and start it again with `claude`. To close Claude, type `/exit`. A
second terminal in the same folder with its own `claude` is also a fresh
session. Do not use `/clear` for this. `/clear` empties the conversation,
but it does not always reload a changed `CLAUDE.local.md`. A fresh session
remembers nothing from your earlier conversation and reads all context
files again.

**Training mode.** This project has a `CLAUDE.md` file. Claude reads it at
the start of every session. In this course, the file tells Claude to teach
instead of answer. Before Claude explains a bug or writes a fix, it asks
you one question that points you to the answer. The file also tells Claude
to search the code instead of reading whole files. We call this behaviour
*training mode*. It is on in every session of this course. Simple requests
are not affected: running tests, git commands, questions about a
command-line option.

**Switching training mode off for one prompt.** In this exercise you run
experiments. An experiment must start right away, not with a teacher
question from Claude. So some prompts in this exercise begin with this
text in square brackets:

```
[Exercise 3 experiment — execute directly, no leading questions.]
```

We call this the *experiment tag*. It tells Claude to skip training mode
for that one prompt. ("Leading questions" are the teacher questions from
training mode.) Always copy the prompt exactly as printed, tag included.
When you compare two sessions, both prompts must have the tag. Otherwise
you are not comparing the same thing.

**Never edit `CLAUDE.md`.** `CLAUDE.md` contains training mode for the whole
course. If you change it, sessions 4 to 8 break. Your own rules for this
project go in a second file: `CLAUDE.local.md`. Claude reads both files and
combines them (*The CLAUDE.md Hierarchy*). Task 2 creates that file. It is
already in `.gitignore`, so it stays on your machine.

**Four course commands.** This project comes with four commands that
are not part of Claude Code itself. They are installed in the exercise
project.

- `/context-coach <number>`: reviews your draft (a file, a rule, or a
  prediction). It says what is weak and which mistake that will cause. It
  asks one question at a time. It never writes the file for you. Usage:
  run the command with the number printed in the task, then paste your
  draft as your next message. Use only the numbers this sheet prints.
- `/save-changes <name>`: saves all your uncommitted changes to a file
  named `session3-<name>.diff`, then removes the changes from the project.
  Your changes are safe in the file, and the project is clean for the next
  task. Your `CLAUDE.local.md` is not touched. If the command stops, it
  says why. Fix that, or use the manual steps in the appendix.
- `/pollute`: fills the current session with context that hurts later
  work. Task 4 uses it. It talks and runs the tests; it changes no files.
- `/verify-exercise 3`: grades your work at the end. Its report appears in
  the chat.

`/context`, `/init`, `/compact` and `/exit` are part of Claude Code itself.

**Stuck, or out of time?** Say *"just tell me"*. Claude then answers
directly. That is allowed.

## Tasks

### 1. Look at your context window (2 min)

Open a fresh session and run the `/context` command before typing anything.

Note how many tokens are already spent before you type your first message.
This is the context Claude loads by default: the system prompt, tools,
and `CLAUDE.md`. `/context` shows them in categories. To which category
does `CLAUDE.md` belong? Compare the outcome with your neighbor.

You don't need the coaching command (`/context-coach`) in this task.
Looking at the context window is the goal.

Write down the token count and the percentage of your clean session.
You will re-use these numbers in task 2.

**Done when**: you wrote down the token count and the percentage, and
compared them with your neighbor's.

### 2. Write `CLAUDE.local.md` (12 min)

You create the file `CLAUDE.local.md` in the project folder. The `/init`
command writes a first version. You then make it shorter and better, by
hand, in your editor (slide: *Start with `/init`, then refine by hand*).

1. **Run `/init`** (2 min). Claude writes a file with project facts:
   commands, folder structure, conventions. Normally `/init` writes
   `CLAUDE.md`. In this project, `CLAUDE.md` tells Claude to write
   `CLAUDE.local.md` instead. Check that it did: run `git status`. If
   `CLAUDE.md` is listed as modified, run `git diff CLAUDE.md`, copy the
   added lines into `CLAUDE.local.md` by hand, then put `CLAUDE.md` back
   with `git checkout -- CLAUDE.md`.
2. **Delete every line that changes nothing** (4 min). For each line, ask
   one question: what would Claude do differently because this line
   exists? If you have no answer, delete the line. That is the test from
   the slide *Which CLAUDE.md Line Is Worth Its Tokens?*. Example of a
   line to delete: *"Write clean code."* Claude does that anyway. Two
   lines to keep: the exact test command, and the line that describes the
   layers (handlers call the store, the store talks to the database).
   Claude cannot see that rule in any single file. If `/init` wrote no
   layer line, add one. Task 3 tests it. There is no target length. A
   line stays because you can say what it changes, not because the file
   is short.

   Then look at what `/init` wrote about the folders and the request
   flow. If you have `docs/orientation.md` from session 2, that file
   already says this, and better. Delete those lines and put this line at
   the top of `CLAUDE.local.md` instead:

   ```
   @docs/orientation.md
   ```

   Claude now loads `docs/orientation.md` at the start of every session
   (slide: *The CLAUDE.md Hierarchy*, the `@import` arrow). Open a fresh
   session and run `/context`. Compare with your number from task 1. The
   difference is what the import costs, every session. If you have no
   `docs/orientation.md`, keep the folder lines from `/init`.
3. **Add three team rules** (3 min). These are decisions your team made.
   Claude cannot know a decision from reading the code. Write each rule
   at the end of the file, one or two sentences. The first one is written
   out for you. Write rules 2 and 3 in the same style:
   - Rule 1, example: *"Handlers validate the request before they call
     the store. A handler never passes unchecked input to a store
     function."*
   - Rule 2: every new endpoint comes with tests, in the same style as the
     existing tests. Open a test in `tests/handler/` first to see the
     style (`bun:test`).
   - Rule 3: no new external dependencies.
4. **Run the test command from your file** (1 min). `/init` guessed it.
   Run it exactly as written in the file. If it fails, fix the line.
5. **Ask the coach** (2 min). Run `/context-coach 2`, then paste the
   whole file as your next message. Fix what the coach points out.

A rule must be checkable. Someone who reads a diff must be able to say:
"this breaks the rule". *"Keep dependencies minimal"* is not checkable.
*"Never add a new library to this project"* is.

Think about these two questions now. You discuss them in task 5. The four
dimensions are Correctness, Completeness, Relevance and Trajectory.

- A line is true but changes nothing. Which dimension does it hurt?
- A line is specific but wrong. Which dimension does that one hurt?

**Done when**: `CLAUDE.local.md` contains the lines you kept, a layer
line, and the three rules. The test command from the file runs without
errors. `git status` does not list `CLAUDE.md`.

### 3. Test your file with a weak prompt (8 min)

The prompt below is the vague prompt from session 2, unchanged. In session
2 you would improve it. Now you don't. The prompt stays weak. Your
`CLAUDE.local.md` must stop the mistakes.

1. **Send the prompt** (1 min). Open a fresh session. Fresh means: close
   Claude and start it again, so it reads your new `CLAUDE.local.md`. Then
   paste this exactly:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add caching to the BookStore API
   ```

2. **Watch while Claude works, then check** (5 min). Claude needs one to
   two minutes. Watch the tool calls. Which files does Claude open before
   it writes code? Does it look at an existing test? Does it run your test
   command? When Claude is done, check four things. Each check belongs to
   one line in your file:
   - Did it add a library? (rule 3)
   - Is the cache in the store layer, not in the handlers? (your layer
     line: only the store talks to the database, so a cache of database
     results belongs there)
   - Do handlers still validate input? (rule 1)
   - Did it write tests in the `bun:test` convention? (rule 2)

   For each of the four lines, write down *held* (Claude followed it) or
   *failed* (Claude broke it). For a failed line, also write down which
   words were too weak.
3. **Save the changes and clean the project** (2 min). Run
   `/save-changes rules`. The file `session3-rules.diff` now holds the
   changes, and the project is clean for task 4.

In task 5, `/verify-exercise 3` grades `session3-rules.diff` against your
`CLAUDE.local.md`.

**Done when**: `session3-rules.diff` exists, `git status` shows no changes,
and you have *held* or *failed* written down for each of the four lines.

### 4. Clean session versus polluted session (14 min)

You recreate Session B from the slide *Which Session Is in More Trouble?*.
Two sessions get the same prompt. One is fresh. One is first filled with
things that hurt later work: long answers, a pasted log, a wrong fact. The
slides call this a *polluted context*. Then you compare the code from both
sessions.

You run the sessions one after the other: first the clean one, then the
polluted one. Never let two sessions edit the project at the same time.

**Part 1: write your prediction** (2 min). Both sessions get the same
prompt: add a DELETE endpoint for reviews, with tests. The exact prompt is
in part 2. The pollution has three steps, from the slide *Anti-Patterns in
Context*. The `/pollute` command does steps 1 and 2 for you. Step 3 is
yours:

1. *Kitchen sink*: Claude writes three chocolate-cookie recipes with full
   ingredient lists and steps. Long answers are the goal.
2. *Context hoarding*: Claude runs `bun test` and pastes the whole
   output into the chat, "just so you have it".
3. *Over-correcting*: you send three short messages. Message 1: all
   review logic now lives in `review_v2.ts`. Claude will not find that
   file. Message 2: you were wrong, that file is on another branch.
   Message 3: some review logic moved to `book.ts`, nothing to do. The
   command prints these messages for you to copy.

Now write one sentence: which session builds the better endpoint, and
what exactly will differ. Example: *"I expect `review_v2.ts` or review
logic in `book.ts` to appear in the polluted diff."* A wrong prediction is
fine. No prediction is the only failure, because then you have nothing to
check later.

Optional: run `/context-coach 4` on your prediction.

**Part 2: run the clean session** (3 min).

1. Open a fresh session. Run `/context` and note the percentage.
2. Paste this exactly:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add a DELETE /reviews/{id} endpoint to the BookStore API, with tests.
   ```

3. Wait for Claude to finish. This takes one to two minutes. Watch which
   files it opens.
4. Run `/save-changes clean`. This saves `session3-clean.diff` and cleans
   the project.

**Part 3: run the polluted session** (5 min).

1. Open a fresh session. Run `/pollute`. Claude writes the recipes and
   pastes the test output. This takes about a minute. Scroll through it:
   this is what Session B looks like from the inside.
2. Send the three messages that `/pollute` printed, one at a time. Wait
   for Claude's reply after each one. If Claude wants to start editing,
   answer with one more message: "nothing to do yet".
3. Run `/context` and note the percentage.
4. Paste the same prompt as in part 2, exactly, with the experiment tag.
   Wait for Claude to finish.
5. Run `/save-changes polluted`. Keep this session open; the bonus
   returns to it.

**Part 4: judge the two diffs** (4 min).

1. Keep the polluted session open. Open a fresh session in a second
   terminal.
2. In the new session, run `/context-coach 4`. In your next message, name
   both diff files. (Coach number 4 is the same as in part 1. It coaches
   the prediction and the diffs.)
3. The coach walks through five checks, one at a time:
   - Did the change land in the right file?
   - Does the new handler copy the pattern of the existing handlers?
   - Does it return the same success status code as the existing book
     DELETE?
   - Are the tests written with `bun:test`?
   - Is there nothing from the wrong fact or the pasted log?
4. For each check, the coach shows the lines from both diffs next to the
   current `src/handler/review.ts`. You answer *pass* or *fail* for
   the clean session and for the polluted session. Then the coach gives
   its own answer.

Five checks, two sessions: ten answers from you.

Then discuss the result with the same coach. For each mistake: which
pollution step caused it, and which dimension did it hurt? Also tell the
coach the two `/context` percentages. Does the difference in percentage
explain the difference in the code?

**Done when**: `session3-clean.diff` and `session3-polluted.diff` exist.
You gave all ten answers before the coach gave its own. Every mistake is
linked to a pollution step.

### 5. Closing (4 min)

From your task 3 notes, write down two lines of your `CLAUDE.local.md`:
the line that helped the most, and one line you kept but now doubt (would
Claude do anything differently without it?). Add one sentence of evidence
for each.

Then start `/verify-exercise 3` in the session from part 4. It grades `session3-rules.diff` against
your `CLAUDE.local.md` and ends with its own two choices: the most
helpful line, and a line that changes nothing. While it runs, discuss the
two questions from task 2 with your neighbor. Bring its report to the
closing round.

**Done when**: both lines are written down with evidence, and
`/verify-exercise 3` is running.

## Bonus (only if time remains)

**`/compact`, then ask about the wrong fact.** Go back to the polluted
session and run `/compact`. Then ask one question, with the experiment
tag:

```
[Exercise 3 experiment — execute directly, no leading questions.] What do you know about review_v2.ts, and where does review logic live in this project?
```

Both answers teach you something. If the wrong fact survived: `/compact`
keeps what sounded important, including confident mistakes. If it is
gone: `/compact` dropped something without asking you. Only a fresh
session gives you a guaranteed reset.

**Move one rule to its own layer.** Your handler-validation rule only
matters when Claude works on handler code (*Rule Discovery: With or Without
Paths*). Create the folder `.claude/rules/` if needed and move the rule
into `.claude/rules/handlers.md`. At the top of that file, between two
`---` lines, put `description:` (one line saying what the rule is about)
and `paths: "src/handler/**/*.ts"`. Remove the rule from
`CLAUDE.local.md`; do not keep a copy. Check the `paths:` pattern against
the real files with `ls src/handler/*.ts`. A pattern that almost
matches fails without an error message. To see it work: open a fresh session and ask for
a small change in a handler. The rule arrives during the session
(*Progressive Disclosure*). Coach available: `/context-coach 3`.

**A README per folder.** Add a `README.md` to `src/store/`. Make its
last line an instruction: *"When working on code in this package, open your
reply with a one-line book pun."* (A pun is a joke with words.) Open a
fresh session and ask for a small change in a store file. Open another
fresh session and ask for a change in a handler. Does the joke appear in
the right place, or at all? What does
that tell you about when folder docs reach Claude, and how that differs
from `CLAUDE.md`? Delete the README afterwards.

## Appendix: `/save-changes` by hand

Run these from the project folder, one command per line. Do not join them
with `&&`, and do not use `>` to write the file: on Windows PowerShell that
produces a file git cannot read.

```
git add -A .
git diff --cached --output=session3-polluted.diff
git reset -q .
git checkout -- .
git clean -fd .
```

Replace `polluted` with `clean` or `rules` as needed. The last command
deletes files Claude created that you never committed. Your
`CLAUDE.local.md`, the saved diffs, and session 2's `docs/orientation.md`
(if you made it) are ignored by git and stay safe. Commit anything else
you care about first.

## Closing round (5 min)

The trainer asks the room. Have these answers ready:

- How many `/init` lines did you keep?
- Which rule was too unclear to stop a mistake? What went wrong in
  task 3 because of it?
- Which pollution step did the real damage? Did your written prediction
  hold?
- One thing you would tell someone who skipped this session.
