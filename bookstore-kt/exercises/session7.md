# Exercise 7: An Agent Team Builds Your Frontend

**Session**: 7 — Agentic Workflows\
**Duration**: 35 minutes, plus a 5-minute closing round\
**Project**: `web`, the frontend you specified in Exercise 6.

## Goal

In Exercise 6 you wrote a spec, a plan and a task list, and no code. In
this exercise an agent team builds the code.

The teammates in an agent team can send messages to each other, without
the lead. You use that here. One teammate reviews the work of the others.
It sends what it finds straight to the teammate that wrote the code.

You do four things:

1. Build the shared part of the frontend, in one Claude session.
2. Write one prompt that starts a team: one builder per user story and
   one reviewer. Improve that prompt with a coach.
3. Start the team and watch the teammates talk to each other.
4. Check the part of the result that the reviewer cannot check.

You will not write application code yourself.

## Start here

- **Terminal 1**, in `bookstore`: `./gradlew run`
- **Terminal 2**, in `web` (inside `bookstore`): `claude`. This is your
  **lead** session for the whole exercise.
- **Terminal 3**, in `web`, for the frontend. Open a second tab in `web`
  for `git`.
- You need the task list from Exercise 6. No task list? Task 1 gives you one.
- Training mode is off in `web`: Claude answers directly. Stuck? Type
  *just tell me*.

---

## Tasks

### 1. Build the foundation, one session

You produce the **foundation**: Phase 1 and Phase 2 of `tasks.md`. These
are the files every story needs, such as the API client, the page shell and
the stylesheet. The constitution says no story may start before the
foundation is done, so the lead builds it alone.

1. **Check your spec.** Your own spec from Exercise 6 is complete if
   `specs/001-*/tasks.md` exists and has at most three user stories. If it
   is complete, go to step 2. If not, or if you are not sure, use the
   reference spec. Paste this into the lead:

   > Copy the folder `specs-reference/001-browse-books` to
   > `specs/001-browse-books`. If `specs/` already holds another folder,
   > move that folder to `specs-old/` first. Then commit with the message
   > "spec: reference spec for exercise 7".
2. Open `specs/001-*/tasks.md` and find **Phase 1** and **Phase 2**.
3. Send the lead this prompt. Copy it as written:

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
4. When the lead reports back, start the frontend in terminal 3:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173. You should see the page shell, and no errors
   in the browser console.
5. Commit and tag, in the second tab of terminal 3. Run the three lines
   one at a time:

   ```bash
   git add -A
   git commit -m "foundation"
   git tag foundation
   ```

The prompt in step 3 fixes a shared file, such as the router, in the plan
before any code exists. A defect in the plan is fixed in the plan, not by
hand in the code. The tag marks where story work begins. The check in task 4
uses it.

**Done when**: Phase 1 and 2 are ticked in `tasks.md`, the page shell loads
on port 5173, and the foundation is committed.

### 2. Draft the team prompt

You produce one prompt that turns the lead into a team lead. This is the
core of the exercise.

The lead starts **teammates**: separate Claude Code sessions. Together
they are the **agent team**. A teammate starts with an empty context and
does not see this chat. Everything it must know is in your prompt, or in a
file your prompt names.

Your team has two kinds of teammates:

- A **builder** for each user story. It writes the code for that story.
- One **reviewer**. It writes no code. It checks each story and tells the
  builder what to fix.

A builder and the reviewer send messages to each other directly, by name.
The lead does not pass the messages on. A subagent is different: it
reports back only to the session that started it.

Each user story in `tasks.md` has an **Independent Test**. It lists the
steps from `quickstart.md` that must pass for that story. The example
prompt below uses this test.

1. **Draft**. Open `tasks.md` and find the section **Parallel Team
   Strategy** near the bottom. It says how to split the work. Your prompt
   turns that plan into instructions the lead can follow. Start from the
   worked example below. It is not complete: the coach tells you what is
   missing. Words in `<angle brackets>` are placeholders. Replace each one
   with a name from your own `tasks.md`, and remove the brackets. Do not
   run the prompt yet.

   > Read `specs/<your spec folder>/tasks.md`. Spawn an agent team. Spawn
   > one builder per user story, named after the story: `<us1-short-name>`,
   > `<us2-short-name>`. Each builder works only on the tasks tagged with
   > its story. Also spawn a teammate named `reviewer` that writes no code.
   > When a builder's Independent Test in `tasks.md` passes against the
   > running backend, the builder sends `reviewer` the list of files it
   > changed. The reviewer checks three things: no foundation file changed
   > (`git diff --stat foundation`), no backend address is in the code
   > (`grep -rn "8080\|localhost" src/ index.html`), and every error path
   > shows a fixed sentence, as principle V in `.specify/memory/constitution.md` says.
   > Report per story: files changed, and what the reviewer found.

2. **Coach and revise**. Run `/parallel-coach 2` and paste your draft as
   your next message. The coach points out gaps. It never writes the
   prompt for you. Revise until the coach says the prompt is ready.
   Disagree with the coach? Say *"run it anyway"*. It will let you, and
   tell you what to watch for.

**Done when**: the coach says your team prompt is ready, and task 1 is done.

### 3. Start the team and watch it

You start the team. In the agent panel you follow the messages between
the builders and the reviewer.

1. **Predict.** Write two predictions on paper. **Will the reviewer send
   a story back to its builder? If yes, for what? Will the lead wait for
   its teammates?** A wrong prediction is fine. Only a missing one is a
   problem.
2. Paste your prompt into the lead, in terminal 2. The coach does not run
   this one for you. A team can only start from the session you type in.
3. Look at the agent panel below the prompt input. Within a minute you
   should see one row per teammate: each builder and the reviewer, with
   the names from your prompt. Rows without your names are plain
   subagents, not a team. In that case, tell the lead: *"Use an agent
   team, not subagents."* Still no team? Agent teams are experimental.
   Tell the trainer, and do not spend more time on it.
4. **Open the reviewer.** Use the **up and down arrows** to select
   `reviewer`, then press **Enter**. You are now in its transcript. Find a
   message from a builder: the list of files it changed. Then find what
   the reviewer sends back to that builder. To leave, select the lead's
   row with the arrows. Do not press **Escape** inside a transcript: that
   interrupts the teammate.
5. **Talk to a builder.** Select one builder and press **Enter**. Type
   this message:

   > Which files do you own, and what has the reviewer told you so far?

   The message goes to this builder only. The lead does not see it. Read
   the answer, then go back to the lead's row.
6. Permission prompts from teammates appear in the **lead's** row, not in
   the teammate's transcript. If nothing moves for a while, go back to the
   lead and answer the prompt.
7. Keep `tasks.md` open in your editor: ticks appear as builders finish
   tasks. Refresh http://localhost:5173 every minute. Stories appear while
   you watch.
8. Watch the lead too. It may start editing story files itself, or fix a
   reviewer finding itself. If it does, tell it: *"Wait for your teammates
   to finish."*

**Done when**: the lead's report says the reviewer approved every story,
every story task in `tasks.md` is ticked, and both stories show in the
browser.

### 4. Check what the reviewer cannot check

The reviewer read the code, but it did not open the browser. So you check
the result as a user would. Then a command grades your prompt.

1. **Does it do what the spec says?** Open `specs/001-*/quickstart.md`
   and follow its steps in the browser. Then test the three gaps from
   Exercise 6, task 1:
   - Go to page 2 of the book list. Does it show different books?
   - Go past the last page. What does an empty page show?
   - Open a book id that does not exist, such as `#/books/9999`. What do
     you see? Is it the raw error text from the backend?
2. **Compare with the reviewer.** The lead's report lists what the
   reviewer found for each story. Look at each problem you found in step
   1. Did the reviewer report it? Write down one problem the reviewer
   missed, or write "none".
3. **Run the check**: type `/verify-exercise 7`. Paste your team prompt
   when it asks. It grades the prompt first. Then it checks the files,
   including the three checks the reviewer did. Bring its report to the
   closing round.
4. **Commit**, in the second tab of terminal 3, one line at a time:

   ```bash
   git add -A
   git commit -m "feat: bookstore-web, built by agent team"
   ```

**Done when**: you followed the quickstart, compared your findings with
the reviewer's, and `/verify-exercise 7` has run.

---

## Closing round

The trainer asks people at random. Have answers ready:

- What did the coach say was missing in your team prompt before it said
  the prompt was ready?
- Find one message that went from one teammate to another. What did it
  say? What did the builder do next? Did your prediction from task 3
  come true?
- What did you find in the browser that the reviewer did not find? Why
  could the reviewer not find it?
- In Exercise 6 you marked some answers as guesses. Find one in the running
  frontend. Does the code treat it as a fact?
- Close with **one take-away**. Which part of this exercise needed
  teammates that talk to each other? Which part would have been faster
  in a single session?

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

**Before Session 8**: think of one real team that you know well, with
one codebase. Exercise 8 is about that team. You need no laptop project.
