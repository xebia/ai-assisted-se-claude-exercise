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
come back in every task.

## Before you start: how this project is set up

Read this section first. The tasks do not work without it. Titles in
*italics* are slide titles from this session.

**Where to work.** Open a terminal in the `bookstore-kt` folder. That is
the folder that contains `pom.xml`. Run every command in this exercise from
that folder. Start Claude with `claude`.

**Fresh session.** Some tasks say "open a fresh session". That means: run
`/clear` in Claude, or close Claude and start it again. A fresh session
remembers nothing from your earlier conversation.

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

**Three course commands.** This project comes with three commands that
are not part of Claude Code itself. They are installed in the exercise
project.

- `/context-coach <number>`: reviews your draft (a file, a rule, or a
  plan). It says what is weak and which mistake that will cause. It asks
  one question at a time. It never writes the file for you. Usage: run
  the command with the number printed in the task, then paste your draft
  as your next message. Use only the numbers this sheet prints.
- `/bank-diff <name>`: saves all your uncommitted changes to a file named
  `session3-<name>.diff`, then removes the changes from the project. Your
  changes are safe in the file, and the project is clean for the next
  task. Your `CLAUDE.local.md` is not touched. If the command stops, it
  says why. Fix that, or use the manual steps in the appendix.
- `/verify-exercise 3`: grades your work at the end. Its report appears in
  the chat.

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
You will re-use these numbers in task 4.

**Done when**: you wrote down the token count and the percentage, and
compared them with your neighbor's.

### 2. Write `CLAUDE.local.md` (12 min)

You create the file `CLAUDE.local.md` in the project folder. The `/init`
command writes a first version. You then make it shorter and better
(*Start with `/init`, then refine by hand*).

1. **Run `/init`** (2 min). Claude writes a file with project facts:
   commands, folder structure, conventions. Normally `/init` writes
   `CLAUDE.md`. In this project, `CLAUDE.md` tells Claude to write
   `CLAUDE.local.md` instead. Check that it did: run `git status`. If
   `CLAUDE.md` is listed as modified, run `git diff CLAUDE.md`, copy the
   added lines into `CLAUDE.local.md` by hand, then put `CLAUDE.md` back
   with `git checkout -- CLAUDE.md`.
2. **Delete every line that changes nothing** (3 min). For each line, ask:
   what would Claude do differently because this line exists? If you have
   no answer, delete the line (*Which CLAUDE.md Line Is Worth Its
   Tokens?*). Example of a line to delete: *"Write clean code."* Claude
   does that anyway. Two lines to keep: the exact test command, and the
   line that describes the layers (handlers call the store, the store
   talks to the database). If `/init` wrote no layer line, add one. Task
   3 tests it. Expect to delete most lines. Under 15 lines of text, rules
   included, is a good result.
3. **Add three team rules** (4 min). These are decisions your team made.
   Claude cannot know a decision from reading the code. Write each rule
   at the end of the file, one or two sentences. The first one is written
   out for you. Write rules 2 and 3 in the same style:
   - Rule 1, example: *"Handlers validate the request before they call
     the store. A handler never passes unchecked input to a store
     function."*
   - Rule 2: every new endpoint comes with tests, in the same style as the
     existing tests. Open a test in `src/test/kotlin/bookstore/handler/` first to see the
     style (the custom `@Test` runner).
   - Rule 3: no new external dependencies beyond sqlite-jdbc.
4. **Run the test command from your file** (1 min). `/init` guessed it.
   Run it exactly as written in the file. If it fails, fix the line.
5. **Ask the coach** (2 min). Run `/context-coach 2`, then paste the
   whole file as your next message. Fix what the coach points out.

A rule must be checkable. Someone who reads a diff must be able to say:
"this breaks the rule". *"Keep dependencies minimal"* is not checkable.
*"Never add a new library to this project"* is.

Think about this question now; you discuss it in task 5. A line is true
but changes nothing. Which of the four dimensions does it hurt? Another
line is specific but wrong. Which dimension does that one hurt?

**Done when**: `CLAUDE.local.md` contains the lines you kept, a layer
line, and the three rules. The test command from the file runs without
errors. `git status`
does not list `CLAUDE.md`.

### 3. Test your file with a weak prompt (8 min)

The prompt below is the vague prompt from session 2, unchanged. In session
2 you would improve it. Now you don't. The prompt stays weak. Your
`CLAUDE.local.md` must stop the mistakes.

1. **Send the prompt** (1 min). Open a fresh session and paste this
   exactly:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add caching to the BookStore API
   ```

2. **Work while Claude works** (5 min). Don't wait for Claude. Write
   your prediction for task 4 first (task 4 says what to predict). When
   Claude is done, check four things. Each check belongs to one line in
   your file:
   - Did it add a library? (rule 3)
   - Is the cache in the store layer, not in the handlers? (your layer
     line)
   - Do handlers still validate input? (rule 1)
   - Did it write tests using the custom `@Test` runner? (rule 2)

   For each of the four lines, write down *held* (Claude followed it) or
   *failed* (Claude broke it). For a failed line, also write down which
   words were too weak.
3. **Save the changes and clean the project** (2 min). Run
   `/bank-diff bait`. The file `session3-bait.diff` now holds the changes,
   and the project is clean for task 4. ("bait" is only the file name.)

In task 5, `/verify-exercise 3` grades `session3-bait.diff` against your
`CLAUDE.local.md`.

**Done when**: `session3-bait.diff` exists, `git status` shows no changes,
and you have *held* or *failed* written down for each of the four lines.

### 4. Clean session versus polluted session (14 min)

You recreate Session B from the slide *Which Session Is in More Trouble?*.
Two sessions get the same prompt. One is fresh. One is first filled with
things that hurt later work: long answers, pasted logs, a wrong fact. The
slides call this a *polluted context*. Then you compare the code from both
sessions.

**Step 1: write your plan** (3 min). A plan is four lines: three pollution
steps and one prediction. You may copy this plan:

1. *Kitchen sink*: ask for three chocolate-cookie recipes with full
   ingredient lists and steps. Long answers are the goal.
2. *Context hoarding*: paste 100 or more lines of `./mvnw test` (or `./gradlew test`)
   output and say: "just so you have it, do nothing with it".
3. *Over-correcting*, in three messages. Message 1: all review logic now
   lives in `ReviewHandlerV2.kt`. Claude will not find that file. Message 2:
   you were wrong, that file is on another branch. Message 3: some review
   logic moved to `BookHandler.kt`, nothing to do.

Prediction, one sentence: which session builds the better endpoint, and
what exactly will differ. Example: *"I expect `ReviewHandlerV2.kt` or review
logic in `BookHandler.kt` to appear in the polluted diff."* A wrong prediction is
fine. No prediction is the only failure, because then you have nothing to
check later.

Optional: run `/context-coach 4` on your plan.

**Step 2: run both sessions** (7 min).

1. **Clean session first.** Open a fresh session. Run `/context` and note
   the percentage. Then paste this exactly:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add a DELETE /reviews/{id} endpoint to the BookStore API, with tests.
   ```

   This takes a few minutes. Don't wait for it. Go to the next step.
2. **Pollute the second session while the first one works.** Open a
   second terminal in the same folder and start `claude`. Run your three
   pollution steps there. These steps only talk. They change no files, so
   the two sessions do not conflict. This session is in training mode, so
   Claude may ask you a question. Answer it shortly; that is also
   context. If Claude wants to start editing after the wrong fact, say:
   "nothing to do yet".
3. **Save the clean result.** When the clean session is done, run
   `/bank-diff clean` in that session. This saves `session3-clean.diff`
   and cleans the project.
4. **Run the polluted session.** In the polluted session, run `/context`
   and note the percentage. Paste the same prompt, exactly, with the
   experiment tag. When it is done, run `/bank-diff polluted`. Keep this
   session open; the bonus returns to it.

**Step 3: judge the two diffs** (4 min). Run `/context-coach 4` and name
both diff files in your message. The coach checks five things, one at a
time: the right file changed · the existing handler pattern copied · the
correct success status code (the same one the existing book DELETE
returns) · tests in the custom `@Test` runner convention · nothing from the wrong fact or the
pasted log. For each check, the coach shows the lines from both diffs, together
with the current `src/main/kotlin/bookstore/handler/ReviewHandler.kt`. You answer *pass* or
*fail* for each session first. Then the coach gives its own answer. Five
checks, two sessions: ten answers from you.

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

Then start `/verify-exercise 3`. It grades `session3-bait.diff` against
your `CLAUDE.local.md` and ends with its own two choices: the most
helpful line, and a line that changes nothing. While it runs, discuss the
question from task 2 with your neighbor. Bring its report to the closing
round.

**Done when**: both lines are written down with evidence, and
`/verify-exercise 3` is running.

## Bonus (only if time remains)

**`/compact`, then ask about the wrong fact.** Go back to the polluted
session and run `/compact`. Then ask one question, with the experiment
tag:

```
[Exercise 3 experiment — execute directly, no leading questions.] What do you know about ReviewHandlerV2.kt, and where does review logic live in this project?
```

Both answers teach you something. If the wrong fact survived: `/compact`
keeps what sounded important, including confident mistakes. If it is
gone: `/compact` dropped something without asking you. Only `/clear` gives
you a guaranteed reset.

**Move one rule to its own layer.** Your handler-validation rule only
matters when Claude works on handler code (*Rule Discovery: With or Without
Paths*). Create the folder `.claude/rules/` if needed and move the rule
into `.claude/rules/handlers.md`. At the top of that file, between two
`---` lines, put `description:` (one line saying what the rule is about)
and `paths: "src/main/kotlin/bookstore/handler/**/*.kt"`. Remove the rule from
`CLAUDE.local.md`; do not keep a copy. Check the `paths:` pattern against
the real files with `ls src/main/kotlin/bookstore/handler/*.kt`. A pattern that almost
matches fails without an error message. To see it work: open a fresh session and ask for
a small change in a handler. The rule arrives during the session
(*Progressive Disclosure*). Coach available: `/context-coach 3`.

**A README per folder.** Add a `README.md` to `src/main/kotlin/bookstore/store/`. Make its
last line an instruction: *"When working on code in this package, open your
reply with a one-line book pun."* (A pun is a joke with words.) Open a
fresh session and ask for a small change in a store file. Open another
fresh session and ask for a change in a handler. Does the joke appear in
the right place, or at all? What does
that tell you about when folder docs reach Claude, and how that differs
from `CLAUDE.md`? Delete the README afterwards.

## Appendix: `/bank-diff` by hand

Run these from the project folder, one command per line (PowerShell 5.1
cannot join commands with `&&`):

```
git add -A .
git diff --cached > session3-polluted.diff   # or session3-clean.diff / session3-bait.diff
git reset -q .
git checkout -- .
git clean -fd .
```

The last command deletes files Claude created that you never committed.
Your `CLAUDE.local.md`, the saved diffs, and session 2's
`docs/orientation.md` (if you made it) are ignored by git and stay safe. Commit anything
else you care about first.

## Closing round (5 min)

The trainer asks the room. Have these answers ready:

- How many `/init` lines did you keep?
- Which rule was too unclear to stop a mistake? What went wrong in
  task 3 because of it?
- Which pollution step did the real damage? Did your written prediction
  hold?
- One thing you would tell someone who skipped this session.
