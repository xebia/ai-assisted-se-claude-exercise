# Exercise 7: An Agent Team Builds Your Frontend

**Session**: 7 — Agentic Workflows\
**Duration**: 35 minutes, plus a 5-minute closing round\
**Project**: `web`, the frontend you specified in Exercise 6.

## Goal

You learn to manage several agents at once. You let an agent team build
your frontend, and you use worktrees so that agents can work in the same
repository in parallel. You write no application code.

## Start here

- **Terminal 1**, in `web` (inside `bookstore`). You start Claude there in
  the setup.
- **Terminal 2**, in `bookstore`: `go run .`
- **Terminal 3**, in `web`. You start the frontend there in the setup.
- Training mode is off in `web`: Claude answers directly. Stuck? Type
  *just tell me*.

## Setup

These steps prepare the project. The tasks start after them.

1. **Turn on agent teams.** Agent teams are experimental, and off by
   default. Open `.claude/settings.json` in `web`, and add this line
   after the first `{`:

   ```
   "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" },
   ```

   Save the file. Then start `claude` in terminal 1.
2. **Check your spec.** You can use your own spec from Exercise 6 if
   `specs/001-*/tasks.md` exists and has at most three user stories. Then
   go to step 3. If not, or if you are not sure, paste this into Claude:

   ```
   Copy the folder `specs-reference/001-browse-books` to `specs/001-browse-books`. If `specs/` already holds another folder, move that folder to `specs-old/` first. Then commit with the message "spec: reference spec for exercise 7".
   ```
3. **Build the foundation.** The foundation is Phase 1 and Phase 2 of
   `tasks.md`: the files every story needs. Paste this prompt as written:

   ```prompt
   Read `specs/001-*/tasks.md` and `.specify/memory/constitution.md`.

   First fix the task list. If a user-story task writes a file that more than one story needs (page shell, stylesheet, API client, router), or two stories write the same file, move that work into Phase 2. Give each story its own page file, created as a stub in Phase 2, so no story edits the router. Tell me what you moved.

   Then implement Phase 1 and Phase 2, and nothing from any user story. Tick each task off in `tasks.md` when it is done.

   Then commit everything with the message "foundation" and add the git tag `foundation`.

   When you finish, list the files you created, and for each story the one file it owns.
   ```

   The run takes one to three minutes. While you wait, read the
   introduction of task 1. Then write down the file list from Claude's
   report. Task 1 needs it.
4. **Start the frontend** in terminal 3:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173. You should see a page with a header and no
   books yet, and no errors in the browser console.

Why the foundation comes first: in the tasks, several agents work at the
same time, and two agents must never edit the same file. So Claude builds
the shared files now, such as the file that calls the BookStore API, and
the main page with the header.

**Done when**: Phase 1 and 2 are ticked in `tasks.md`, the page with the
header loads on port 5173, and Claude reports the commit and the tag `foundation`.

---

## Tasks

### 1. Draft the team prompt

You produce one prompt that makes your Claude session the **lead** of an
agent team. This is the core of the exercise. A teammate does not see
this chat: everything it must know is in your prompt, or in a file your
prompt names.

Your team has one **builder** per user story, and one **reviewer** that
writes no code. The reviewer checks each story and tells the builder
directly what to fix. It also checks two **house rules**: rules your team
agreed on that are not in the spec. Only the reviewer gets them, so it
will likely find something to send back.

<figure class="xb-figure">
<svg viewBox="0 0 640 280" role="img" aria-labelledby="team-title" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:inherit">
<title id="team-title">The agent team: the lead, your Claude session in terminal 1, starts two builders and one reviewer. Each teammate is a row in the agent panel of terminal 1. The builders work at the same time, each on its own files. Each builder sends its file list to the reviewer, and the reviewer sends findings back.</title>
<defs>
<marker id="team-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#621563"/></marker>
<marker id="team-arrow-grey" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#78787d"/></marker>
</defs>
<rect x="240" y="8" width="160" height="46" rx="8" fill="#831b84"/>
<text x="320" y="28" text-anchor="middle" font-size="15" font-weight="600" fill="#fff">Lead</text>
<text x="320" y="45" text-anchor="middle" font-size="11.5" fill="#fff">Claude in terminal 1</text>
<line x1="320" y1="54" x2="320" y2="92" stroke="#78787d" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#team-arrow-grey)"/>
<text x="330" y="78" font-size="11.5" fill="#78787d">starts the team</text>
<rect x="14" y="94" width="612" height="178" rx="10" fill="#f5f5f5" stroke="#c8c8cd" stroke-dasharray="6 4"/>
<text x="28" y="114" font-size="11.5" fill="#78787d">Agent team: the teammates, each a row in the agent panel of terminal 1</text>
<rect x="40" y="126" width="210" height="50" rx="8" fill="#fff" stroke="#831b84" stroke-width="1.5"/>
<text x="145" y="147" text-anchor="middle" font-size="14" font-weight="600" fill="#150027">Builder, story 1</text>
<text x="145" y="164" text-anchor="middle" font-size="11.5" fill="#78787d">edits only its own files</text>
<text x="145" y="194" text-anchor="middle" font-size="11.5" font-style="italic" fill="#621563">work at the same time</text>
<rect x="40" y="206" width="210" height="50" rx="8" fill="#fff" stroke="#831b84" stroke-width="1.5"/>
<text x="145" y="227" text-anchor="middle" font-size="14" font-weight="600" fill="#150027">Builder, story 2</text>
<text x="145" y="244" text-anchor="middle" font-size="11.5" fill="#78787d">edits only its own files</text>
<rect x="430" y="161" width="170" height="60" rx="8" fill="#fff" stroke="#831b84" stroke-width="1.5"/>
<text x="515" y="187" text-anchor="middle" font-size="14" font-weight="600" fill="#150027">Reviewer</text>
<text x="515" y="204" text-anchor="middle" font-size="11.5" fill="#78787d">writes no code</text>
<line x1="254" y1="153" x2="426" y2="181" stroke="#621563" stroke-width="1.5" marker-start="url(#team-arrow)" marker-end="url(#team-arrow)"/>
<line x1="254" y1="229" x2="426" y2="201" stroke="#621563" stroke-width="1.5" marker-start="url(#team-arrow)" marker-end="url(#team-arrow)"/>
<text x="340" y="187" text-anchor="middle" font-size="11.5" fill="#621563">file list →</text>
<text x="340" y="203" text-anchor="middle" font-size="11.5" fill="#621563">← findings</text>
</svg>
<figcaption>The team your prompt describes. It all runs in terminal 1. The builders work at the same time. The reviewer and a builder send messages to each other directly, without the lead.</figcaption>
</figure>

1. **Draft.** Start from the example below, and fill in each
   `<placeholder>`. You name every teammate yourself: give each **builder**
   a short name after its user story in `tasks.md`, such as `book-list`,
   and give the **reviewer** a name. Teammates use these names to send each other
   messages, and you use them in task 3. The example is not complete: the
   coach tells you what is missing. Do not run the prompt yet.

   ```prompt
   Read `specs/<your spec folder>/tasks.md`. Spawn an agent team with these teammates.

   A builder named `<name of builder 1>` for user story `<story 1>`. A builder named `<name of builder 2>` for user story `<story 2>`. Each builder works only on the tasks tagged with its story.

   A reviewer named `<name of reviewer>` that writes no code. When a builder's Independent Test in `tasks.md` passes against the running backend, the builder sends the reviewer the list of files it changed.

   The reviewer first checks our two house rules. One: every page sets its own browser tab title, such as "Book list · BookStore". Two: everything you can click is a real link or button, so it works with the keyboard.

   Then it checks three more things: no foundation file changed (`git diff --stat foundation`), no backend address is in the code (`grep -rn "8080\|localhost" src/ index.html`), and every error path shows a fixed sentence, as principle V in `.specify/memory/constitution.md` says.

   Report per story: files changed, and what the reviewer found.
   ```

   The section **Parallel Team Strategy** in `tasks.md` says how to split
   the work.
2. **Coach and revise.** In terminal 1, in the Claude session from the
   setup, run `/parallel-coach 1`. Then paste your draft as your next
   message. The coach names what is missing. It never writes the
   prompt for you. Revise until the coach says the prompt is ready.
   Disagree with the coach? Say *"run it anyway"*.

**Done when**: the coach says your team prompt is ready, and the setup is
done.

### 2. Start the team and watch it

You start the team. Then you only watch.

1. Paste your prompt into Claude, in terminal 1. The coach does not run
   it for you.
2. Look at the agent panel below the prompt input. Within a minute it
   shows one row per teammate, with the names from your prompt. Rows
   without your names are subagents, not a team. In that case, tell the
   lead: *"Use an agent team, not subagents."* Still no team? Agent teams
   are experimental. Check the line from step 1 of the setup. Is it
   there? Then tell the trainer and go on with task 4.
3. Watch. Ticks appear in `tasks.md` as builders finish tasks. Stories
   appear at http://localhost:5173 when you refresh. To read what one
   teammate does, select its row with the **up and down arrows** and press
   **Enter**. To leave, select the lead's row again. Do not press
   **Escape** in a transcript: that interrupts the teammate.

You type something only in these two cases:

- A permission prompt from a teammate appears in the **lead's** row.
  Answer it there.
- The lead edits story files itself, or fixes a finding of the reviewer
  itself. Tell it: *"Wait for your teammates to finish."*

**Done when**: the lead's report says the reviewer approved every story,
every story task in `tasks.md` is ticked, and both stories show in the
browser.

### 3. Follow one finding, then check it yourself

You follow one finding from the reviewer to the builder that fixed it.
Then you check the result in the browser, which the reviewer did not open.

1. **Bring back the reviewer.** The rows of teammates that do no work
   disappear from the panel. The teammates are not stopped, and each
   still knows what it did. Tell the lead:

   ```
   Ask `<name of reviewer>` to list every finding it sent, and to which builder.
   ```

   The reviewer's row comes back. Select it and press **Enter**.
2. **Read and ask.** Scroll up in the reviewer's transcript. Find a
   builder's list of files, and what the reviewer sent back to that
   builder. Then ask the reviewer a question yourself. Type:

   ```
   Which builder fixed what you sent back? How did you check the fix?
   ```

   This message goes to the reviewer only. The lead does not see it. Then
   select the lead's row again. Did the reviewer approve every story the
   first time? Then ask it how it checked the house rules.
3. **Check the house rules in the browser.** Open each page. Does the
   title in the browser tab change per page? Then click once in the page
   and press **Tab** a few times. You should reach every link and button,
   and see which one is selected.
4. **Check against the spec.** Follow the steps in
   `specs/001-*/quickstart.md`. Then test the three gaps from Exercise 6:
   - Go to page 2 of the book list. Does it show different books?
   - Go past the last page. What does an empty page show?
   - Open a book id that does not exist, such as `#/books/9999`. Do you
     see a fixed sentence, or raw error text from the backend?
5. **Run the check.** Type `/verify-exercise 7` and paste your team prompt
   when it asks. It grades the prompt, then it checks the files. Bring its
   report to the closing round.
6. **Commit.** Tell the lead:

   ```
   Commit everything with the message "feat: bookstore-web, built by agent team".
   ```

**Done when**: you checked the house rules and the quickstart in the
browser, `/verify-exercise 7` has run, and the lead has committed.

### 4. Three designs, three worktrees

Three subagents give the frontend a new look, each a different one, at
the same time. Each works in its own **worktree**: its own branch and
folder, so it cannot edit the files of the others.

1. Send this prompt in terminal 1. Replace the three styles with your own
   ideas if you like:

   ```prompt
   Start three subagents, not teammates, each in its own worktree.

   Each one gives the frontend in `web` a new look: one "retro terminal", one "cosy bookshop", one "brutalist".

   They may change the stylesheet and the HTML markup only. They must not change the API client or what any page does.

   Each one commits its work on its own branch. When all three are done, list the three branch names.
   ```

2. **Look at each design.** For each branch, tell Claude:

   ```
   Check out `<branch>` in detached mode.
   ```

   Detached means you look at that branch without switching your own
   branch. Then refresh http://localhost:5173.
3. **Merge your favourite.** Tell Claude:

   ```
   Switch back to the branch you started on, and merge `<favourite>`.
   ```

4. **Merge a second one.** Tell Claude:

   ```
   Now also merge `<second branch>`. If there is a conflict, do not solve it. Show me the files with a conflict.
   ```

   Read Claude's report. Then tell it: *"Abort that merge."* No
   conflict? Then the two designs changed different files. Tell the
   trainer.

**Done when**: you have seen all three designs, your favourite is
merged, and you have seen what the second merge does.

---

## Closing round

The trainer asks people at random. Have answers ready:

- What did the coach say was missing in your team prompt?
- What did the reviewer send back? What did the builder change? Did it
  hold up in the browser?
- In Exercise 6 you marked some answers as guesses. Find one in the running
  frontend. Does the code treat it as a fact?
- Task 2 used an agent team. Task 4 used subagents in worktrees. Why the
  difference?

---

**Before Session 8**: think of one real team that you know well, with
one codebase. Exercise 8 is about that team. You need no laptop project.
