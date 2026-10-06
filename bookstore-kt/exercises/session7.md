# Exercise 7: An Agent Team Builds Your Frontend

**Session**: 7 — Agentic Workflows\
**Duration**: 35 minutes, plus a 5-minute closing round\
**Project**: `web`, the frontend you specified in Exercise 6.

## Goal

In Exercise 6 you wrote a spec, a plan and a task list, and no code. In
this exercise an agent team builds the code. You do four things:

1. Build the shared part of the frontend, in one Claude session.
2. Write one prompt that gives each user story to its own teammate, and
   improve that prompt with a coach.
3. Start the team and watch it work.
4. Check the result against the constitution and your spec.

You will not write application code yourself.

## Start here

- **Terminal 1**, in `bookstore`: `./gradlew run`
- **Terminal 2**, in `web` (inside `bookstore`): `claude`. This session
  is your **lead** for the whole exercise.
- **Terminal 3**, in `web`, for `npm run dev`. Open a second tab in
  `web` for `git` and `grep`.

**Use the reference spec**, unless you are sure your own spec from
Exercise 6 is complete: `specs/001-*/tasks.md` exists, with at most three
user stories. Paste this into the lead:

> Copy the folder `specs-reference/001-browse-books` to
> `specs/001-browse-books`. If `specs/` already holds another folder,
> move that folder to `specs-old/` first. Then commit with the message
> "spec: reference spec for exercise 7".

Training mode is off in `web`: Claude answers directly. Stuck? Type
*just tell me*.

---

## Tasks

### 1. Build the foundation, one session

You produce the **foundation**: Phase 1 and Phase 2 of `tasks.md`. These
are the files every story needs, such as the API client, the page shell and
the stylesheet. The constitution says no story
may start before the foundation is done. So this part is not parallel
work. One session, the lead, does it.

1. Open `specs/001-*/tasks.md` and find **Phase 1** and **Phase 2**. If
   a story task writes a shared file, such as the router, you do not fix
   it by hand. The prompt below makes the lead fix it first: a defect in
   the plan is fixed in the plan, not in code.
2. Send the lead this prompt. Copy it as written:

   > Read `specs/001-*/tasks.md` and `.specify/memory/constitution.md`.
   > First fix the task list. If a user-story task writes a file that more
   > than one story needs (page shell, stylesheet, API client, router), or
   > two stories write the same file, move that work into Phase 2. Give
   > each story its own page file, created as a stub in Phase 2, so no
   > story edits the router. Tell me what you moved. Then implement Phase 1
   > and Phase 2, and nothing from any user story. Tick each task off in
   > `tasks.md` when it is done. When you finish, list the files you
   > created, and for each story the one file it owns.

   The run takes two to four minutes. **Do not wait. Start task 2 now.**
   Drafting a prompt changes no files, so it cannot disturb this run.
   When the lead reports back, write down its file list. Task 2 needs it.
3. When the lead reports back, start the frontend in terminal 3:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173. You should see the page shell, and no errors
   in the browser console.
4. Commit and tag, in the second tab of terminal 3. The tag marks where the foundation ends and story work
   begins. The check in task 4 uses it. Run the three lines one at a time:

   ```bash
   git add -A
   git commit -m "foundation"
   git tag foundation
   ```

**Done when**: Phase 1 and 2 are ticked in `tasks.md`, the page shell loads
on port 5173, and the foundation is committed.

### 2. Draft the team prompt

You produce one prompt that turns the lead into a team lead. This is the
core of the exercise.

The lead starts **teammates**: separate Claude Code sessions. Together
they are the **agent team**. A teammate starts with its own, empty
context. It does not see this chat.
Everything it must know is in your prompt, or in a file your prompt names.

Each user story in `tasks.md` has an **Independent Test**: the steps from
`quickstart.md` that must pass for that story. The worked example below
uses it.

1. **Draft**. Open `tasks.md` and find the section **Parallel Team
   Strategy** near the bottom: it says how to split the work. Your prompt
   turns that plan into instructions the lead can follow. Start from the
   worked example below. It is not complete:
   the coach tells you what is missing. **Words in `<angle brackets>` are
   placeholders.** Replace each one with a name from your own `tasks.md`,
   and remove the brackets. Do not run the prompt yet.

   > Read `specs/<your spec folder>/tasks.md`. Spawn an agent team with one
   > teammate per user story, named after the story: `<us1-short-name>`,
   > `<us2-short-name>`. Each teammate works only on the tasks tagged with
   > its story. Each teammate is done when its story's Independent Test in
   > `tasks.md` passes against the running backend and its tasks are ticked.
   > Report per story: files changed, and the result of its Independent Test.

2. **Coach and revise**. Run `/parallel-coach 2` and paste your draft as
   your next message. The coach points out gaps. It never writes the
   prompt for you. Revise until the coach says the prompt is ready.
   Disagree with the coach? Say *"run it anyway"*. It will let you, and
   tell you what to watch for.

**Done when**: the coach says your team prompt is ready, and task 1 is done.

### 3. Start the team and watch it

You start the team and follow its work in the agent panel.

1. **Predict.** Write two predictions on paper. **Will the lead wait for
   its teammates? Which file will a teammate touch that it should not?**
   A wrong prediction is fine. Only a missing one is a problem.
2. Paste your prompt into the lead, in terminal 2. The coach does not run
   this one for you. A team can only start from the session you type in.
3. Look at the agent panel below the prompt input. Within a minute you
   should see one row per teammate, with the names from your prompt. Rows
   without your names are plain subagents, not a team. Then tell the lead:
   *"Use an agent team, not subagents."* Still no team? Agent teams are
   experimental: tell the trainer, and do not spend your time on it.
4. Use the **up and down arrows** to select a teammate, then press
   **Enter**. You are now in its transcript. Read what it is doing. To
   leave, select the lead's row again with the arrows. Do not press
   **Escape** inside a transcript: that interrupts the teammate. You can
   type to a teammate here. Only do that when it is stuck.
5. Permission prompts from teammates appear in the **lead's** row, not in
   the teammate's transcript. If nothing moves for a while, go back to the
   lead and answer the prompt.
6. Keep `tasks.md` open in your editor: ticks appear as teammates finish
   tasks. Refresh http://localhost:5173 every minute. Stories appear while
   you watch.
7. Watch the lead too. If it starts editing story files itself, tell it:
   *"Wait for your teammates to finish."*

**Done when**: both teammates report done, every story task in `tasks.md`
is ticked, and both stories show in the browser.

### 4. Quality gates

Nobody has reviewed this code yet. You run three checks, in the order a
reviewer would find problems. Then a command repeats them.

1. **Does it do what the spec says?** Open `specs/001-*/quickstart.md`
   and follow its steps in the browser. Then test the three gaps from
   Exercise 6, task 1:
   - Go to page 2 of the book list. Does it show different books?
   - Go past the last page. What does an empty page show?
   - Open a book id that does not exist, such as `#/books/9999`. What do
     you see? Is it the raw error text from the backend?
2. **Did the team respect the file boundaries?** In the second
   tab of terminal 3:

   ```bash
   git diff --stat foundation
   ```

   Every changed file should belong to one story. A foundation file in that
   list means a teammate edited code it did not own.
3. **Does it still depend on the contract only?** The constitution,
   principle II, says the frontend may know the HTTP contract and nothing
   else. A backend address in the code breaks that rule. One grep:

   ```bash
   grep -rn "8080\|localhost" src/ index.html
   ```

   Any hit is a constitution violation.
4. **Write down what you found, then run the check**. The check is
   the `/verify-exercise 7` command. Run it and paste your team prompt when
   it asks. It grades the prompt first. Then it checks the files for the
   same three things, plus the error paths from principle V. Bring its
   report to the closing round.
5. **Commit**, one line at a time:

   ```bash
   git add -A
   git commit -m "feat: bookstore-web, built by agent team"
   ```

**Done when**: you followed the quickstart, ran the two commands, and
`/verify-exercise 7` has run.

---

## Closing round

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
web/
  index.html, styles.css, src/     built from your spec
  specs/001-*/tasks.md             every story task ticked
  git log                          "spec" → "foundation" → "feat" commits
```

Every line of application code in this project was written from a spec you
wrote. You typed none of it yourself.

**Before session 8**: think of one real team that you know well, with
one codebase. Exercise 8 is about that team. You need no laptop project.
