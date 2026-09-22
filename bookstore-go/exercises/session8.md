# Exercise 8: Your Own Project, and Your Roadmap

**Session**: 8, Bringing It All Together
**Duration**: 35 minutes, plus a 5-minute closing round
**Project**: Your own project, not BookStore. Bring one that builds and
has tests. No project with you? BookStore is the fallback, see below.

## Goal

You apply the workflow of this course to one small task in your own
codebase: research, plan, implement, verify. Then you write a five-line
roadmap for your team. Line five is the first thing you do back at work.

The point is not to finish a big feature. Pick a task you can describe in
one sentence. Pick one that fits in twenty minutes: a small bug, a short
doc update, one helper function. A task that takes you the whole slot to
describe is the wrong task for this slot.

## Before you start

Titles in *italics* are slide titles from this session, unless a session
number follows them.

**Where to work.** Open a terminal in the root folder of your own project.
That is the folder that holds its build file or `.git` folder. Start
Claude with `claude`. Keep this one session for the whole exercise.

**Save your work first.** Claude edits real files in this exercise. Run
`git status`. If it shows changes, commit them or run `git stash` before
task 1.

**No project with you?** Use BookStore. Open a terminal in the
`bookstore-go` folder, the one that contains `go.mod`. Your task for task
2 is then: the book search loads the author of every book with a separate
query. Change `Search()` in `internal/store/book.go` so that one search
runs one query. In task 1, update `CLAUDE.local.md`, the file you wrote in
session 3. Never edit the course `CLAUDE.md`. Training mode is on in
BookStore, so Claude may ask you one question before it acts. Answer it in
one line, or say *just tell me*.

**No training mode here.** Your own project has no course `CLAUDE.md`, so
Claude answers directly. You do not need *just tell me* in this exercise.

**No coach and no check.** Your project is yours alone, so there is no
shared answer to grade against. Use the **Done when** line of each task to
check yourself.

**Your notes.** Keep a text file open next to Claude, outside your project.
Tasks 2 and 3 ask you to write in it.

## Tasks

### 1. Write `CLAUDE.md` and pick a task (5 min)

You produce the file `CLAUDE.md` in the root folder of your project. If
the file already exists, you update it.

1. **Write the file** (3 min). Put in your project's own facts: the build
   and test commands, the folder layout, and one or two rules you repeat
   in code review. Copy the example below and replace every line.
2. **Pick your task** (2 min). Say its goal in one sentence. Use the sizing
   rule from the Goal section above.

Worked example, if you want a starting shape to copy:

```md
# CLAUDE.md

## Build & test
`npm test` runs the suite. `npm run build` must pass before any commit.

## Layout
`src/api/` holds the HTTP handlers. `src/db/` holds the queries, no business logic.
`src/domain/` holds the rules. Domain code must not import from `src/api/`.

## Conventions
- New endpoints get a handler test and an integration test.
- No new dependencies without a one-line reason in the PR description.
```

This file is a guide: Claude reads it before its first move
(*Everything You Built Is a Harness*).

**Done when**: `CLAUDE.md` exists in the root folder of your project, and
you can say your task's goal in one sentence.

### 2. Apply the full workflow (25 min)

You produce one finished change in your project, with a passing check.

Run the four phases on your task, one phase at a time:

1. **Research** (4 min). Ask Claude to explain the code your task touches.
   Do not let it change anything yet. Read the answer and correct one
   thing if it is wrong.
2. **Plan** (6 min). Write one line in your notes first: which file will
   the plan change first? Then press Shift+Tab until the screen says plan
   mode (Alt+M on some Windows terminals). Ask for a plan: the approach,
   the files it will touch, the risks, and how you will verify the
   result. Read the plan. Question one step before you approve it.
3. **Implement** (10 min). Ask Claude to carry out one plan step at a
   time. Read each diff before you approve the next step.
4. **Verify** (5 min). Run the tests or checks that prove the task is
   done. If no test covers it yet, ask for one first and watch it fail,
   then pass.

This is the same loop as in Session 6 (*The Research → Plan → Implement
Method*, Session 6), with verification as its own step. This time it runs
on your own code.

**The trainer calls task 3 at minute 30. Move to task 3 then, even if this
task is not finished.**

**Done when**: the change is made, your verification step passed, and you
can name the plan step that was wrong, if any.

### 3. Your five-line roadmap (5 min)

You produce five lines in your notes. Each line answers one question about
your team's harness. A harness is everything around the model. Guides
steer the agent before it acts, sensors observe after it acts
(*Everything You Built Is a Harness*).

Write these five lines, in this order:

1. **Guide**: one file, skill or spec your team needs before the agent starts.
2. **Sensor**: one hook, gate or review step that catches a failure after it acts.
3. **Share**: how the guide and the sensor reach every teammate
   (*Beyond This Course: Sensors, Packaging, Proof*).
4. **Metric**: one number you will measure, and never felt speed
   (*What Decides Which Number You Get*).
5. **First step**: the first thing you do back at work. It must fit in
   one morning.

Worked example, if you want a starting shape to copy:

```
1. Guide: an AGENTS.md in the payments repo, with the build command, the folder layout and the two rules we always repeat in review.
2. Sensor: a PostToolUse hook that runs the linter after every edit.
3. Share: a plugin in our team marketplace, installed at project scope.
4. Metric: rework, counted as PRs that need a second round of changes, compared over one quarter.
5. First step: write AGENTS.md for one repo and make CLAUDE.md import it, before lunch on my first day back.
```

The slide *A Real Roadmap: One Team's Harness Plan* shows the same five
questions, answered by a whole team. Yours is smaller. That is the point.

**Done when**: your notes hold five lines, and line five fits in one
morning.

## Closing round (5 min)

Popcorn round, whole room, no pairs. The trainer asks 4 to 5 people to
read line five of their roadmap aloud.

Have these answers ready as well:

- Which task took longer than you expected, and what would you set up
  differently next time?
- What did writing `CLAUDE.md` teach you about your own project that you
  had not written down before?
