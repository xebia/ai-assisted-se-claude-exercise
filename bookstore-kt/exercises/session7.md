# Exercise 7: An Agent Team Builds Your Frontend

**Session**: 7, Agentic Workflows
**Duration**: 35 minutes
**Project**: `bookstore-web`, the frontend you specified in Exercise 6.

## Goal

In Exercise 6 you produced a spec, a plan and a task list, and no code. In
this exercise an agent team builds it. You build the shared foundation in
one session. Then you write a prompt that hands the user stories to a team,
one teammate per story, and improve it with the coach. While the team works,
you watch it. Then you check the result against the constitution and the
spec.

You will not write application code yourself.

## A few words we'll use

- **Foundation**: Phase 1 and Phase 2 of `tasks.md`. The files every story
  needs: the API client, the page shell, the stylesheet, error rendering.
  The constitution says stories may not start before it is done.
- **Lead**: the Claude Code session you type in. It starts teammates, hands
  out tasks and collects results (*Agent Teams: Multi-Agent Coordination*).
- **Teammate**: a separate Claude Code session started by the lead. It has
  its own context window and its own task. You can open its transcript and
  talk to it directly.
- **Agent team**: the lead plus its teammates, sharing one task list.
- **Independent Test**: the lines in `tasks.md`, one per user story, that
  say which quickstart steps must pass for that story.
- **Coach**: the `/parallel-coach` command. It reads your draft prompt and
  points out gaps. It never writes the prompt for you. That is your job.
  When it says the prompt is ready, you run it.
- **Check**: the `/verify-exercise 7` command. It grades your team prompt,
  then checks what the team built against the constitution and your spec.

## Before you start

**No training mode here.** `bookstore-web` has no `CLAUDE.md`. Claude
answers directly in this project, the same as in Exercise 6.

**Agent teams are experimental.** They are off unless a flag is set. This
project sets the flag in `bookstore-web/.claude/settings.json`. You checked
that during preparation. If no team forms in task 3, tell the trainer. Do
not spend your time on it.

**Do you have a spec?** Exercise 7 needs the `specs/001-*/` folder you
committed at the end of Exercise 6. Check:

```bash
cd ../bookstore-web && ls specs/
```

No folder, or an unfinished one? Use the reference spec instead. It was
written for this exercise and follows the same format:

```bash
cp -r specs-reference/001-browse-books specs/
git add specs/ && git commit -m "spec: reference spec for exercise 7"
```

You need three terminals, the same as in Exercise 6.

**Terminal 1, your backend**, from the `bookstore-kt` project directory:

```bash
./gradlew run
```

**Terminal 2, Claude Code, started from `bookstore-web`:**

```bash
cd ../bookstore-web && claude
```

**Terminal 3, a plain shell**, for `npm run dev`, `curl` and `git`.

Keep a browser tab ready for http://localhost:5173. It shows an empty page
until task 1 is done.

---

## Tasks

### 1. Build the foundation, one session (6 min)

The constitution says shared code is built before any story starts. That
part is not parallel work. One session does it.

1. Open `specs/001-*/tasks.md` and find **Phase 1** and **Phase 2**. Write
   down, in terminal 3 or on paper, the files those phases create. Keep the
   list. Task 2 needs it.
2. Send the lead this prompt. Copy it as written:

   > Implement Phase 1 and Phase 2 of `specs/001-*/tasks.md`, and nothing
   > from any user story. Follow `.specify/memory/constitution.md`. Tick each
   > task off in `tasks.md` when it is done. When you finish, list the files
   > you created.

   It runs for two to four minutes. **Do not wait. Start task 2 now.**
   Drafting a prompt does not touch the files, so it cannot collide with
   this run.
3. When the lead reports back, in terminal 3:

   ```bash
   cd ../bookstore-web && npm run dev
   ```

   Open http://localhost:5173. You should see the page shell, and no errors
   in the browser console.
4. Commit and tag, so the check can see where the foundation ends and story
   work begins:

   ```bash
   git add -A && git commit -m "foundation" && git tag foundation
   ```

**Done when**: Phase 1 and 2 are ticked in `tasks.md`, the page shell loads
on port 5173, and the foundation is committed.

### 2. Draft the team prompt (9 min)

This is the core of the exercise. You write one prompt that turns the lead
into a team lead. `tasks.md` already contains the staffing plan. Find
**Parallel Team Strategy** near the bottom. Your prompt has to turn that
plan into instructions a lead can follow.

A teammate starts with its own, empty context. It does not see this chat.
Everything it must know is in your prompt, or in a file your prompt names.

A worked example from another project. Copy the shape, not the content.
It is not complete: the coach will tell you what is missing.

> Read `specs/002-*/tasks.md`. Spawn an agent team with one teammate per
> user story, named after the story: `us1-search`, `us2-export`. Each
> teammate claims only the tasks tagged with its story. Each teammate is
> done when its story's Independent Test in `tasks.md` passes against the
> running backend and its tasks are ticked. Report per story: files changed,
> and the result of its Independent Test.

1. **Draft** (4 min). Write your own version for your `tasks.md`. Do not
   run it yet.
2. **Coach and revise** (5 min). Run `/parallel-coach 2` and paste your
   draft. Revise until the coach says the prompt is ready.

Disagree with the coach? Say *"run it anyway"*. It will let you, and tell
you what to watch for.

> **The loop, in short: Draft → `/parallel-coach 2` → revise → ready.**

**Done when**: the coach says your team prompt is ready, and task 1 is done.

### 3. Start the team and watch it (10 min)

Before you paste, write one line on paper: **will the lead wait for its
teammates, and which file do you expect a teammate to touch that it should
not?** A wrong prediction is fine. A missing one is the only failure.

1. Paste your prompt into the lead, in terminal 2. The coach does not run
   this one for you. A team can only start from the session you type in.
2. Press **Ctrl+T**. That is the shared task list. Within a minute you
   should see tasks claimed by named teammates. An empty list after a
   minute means Claude used plain subagents. Say: *"Use an agent team, not
   subagents."* The agent panel below the prompt input shows subagents
   too, so the panel alone does not tell you.
3. Use the **up and down arrows** to select a teammate, then **Enter**. You
   are now in its transcript. Read what it is doing. To leave, select the
   lead's row again with the arrows. Do not press **Escape** inside a
   transcript: that interrupts the teammate. You can type to it here. Do
   not, unless it is stuck.
4. Permission prompts from teammates appear in the **lead's** row, not in
   the teammate's transcript. If nothing moves for a while, go back to the
   lead and answer the prompt.
5. Refresh http://localhost:5173 every minute. Stories appear while you
   watch.

Watch the lead too. If it starts editing story files itself, tell it:
*"Wait for your teammates to finish."*

**Done when**: both teammates report done, every story task in `tasks.md`
is ticked, and both stories show in the browser.

### 4. Quality gates (10 min)

Nobody has reviewed this code. Three checks, in the order a reviewer would
find problems.

1. **Does it do what the spec says?** (4 min) Open `specs/001-*/quickstart.md`
   and walk its steps in the browser. Then the three gaps from Exercise 6,
   task 1:
   - Reach page 2 of the book list. Does it show different books?
   - Go past the last page. What does an empty page show?
   - Open a book id that does not exist, such as `#/books/9999`. What do
     you see? Is it the raw error text from the backend?
2. **Did the team respect the file boundaries?** (1 min) In terminal 3:

   ```bash
   git diff --stat foundation
   ```

   Every changed file should belong to one story. A foundation file in that
   list means a teammate edited code it did not own.
3. **Is it still contract-only?** (1 min) One grep:

   ```bash
   grep -rn "8080\|localhost" src/ index.html
   ```

   Any hit is a constitution violation, principle II.
4. **Write down what you found.** Then run `/verify-exercise 7` (3 min)
   and paste your team prompt when it asks. It grades the prompt first,
   then checks the files for the same three things, plus the error paths
   from principle V. Bring its report to the closing round.
5. Commit (1 min):

   ```bash
   git add -A && git commit -m "feat: bookstore-web, built by agent team"
   ```

**Done when**: you walked the quickstart, ran the two commands, and
`/verify-exercise 7` has run.

---

## Closing round (5 min)

The trainer asks people at random. Have answers ready:

- What did the coach flag in your team prompt before it said the prompt was
  ready?
- Did the lead wait, or did it start building a story itself? Did your
  prediction from task 3 come true?
- Did a teammate touch a file it did not own? Which one, and why?
- In Exercise 6 you marked some answers as guesses. Find one in the running
  frontend. Does the code treat it as a fact?
- Close with **one take-away**: which part of this exercise needed a team,
  and which part would have been faster in a single session?

---

## What you should have

```
bookstore-web/
  index.html, styles.css, src/     built from your spec
  specs/001-*/tasks.md             every story task ticked
  git log                          "spec" → "foundation" → "feat" commits
```

Every line of application code in this project was written from a spec you
wrote, by a session you never typed in.
