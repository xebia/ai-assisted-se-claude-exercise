# Task 2 — Draft the team prompt

**What they're drafting:** one prompt that turns the lead into a team lead:
it reads `specs/001-*/tasks.md`, spawns one builder per user story and one
`reviewer`, and collects the results. The builders and the reviewer send
messages to each other directly. The foundation (Phase 1 and 2) is already
built and committed.

**Slide anchors:** *Same Task, Two Shapes* (the subagents versus agent team
diagram, with the reviewer loop at the end) · *Who Starts the Team?*
(checkpoint) · *Pick Your Pattern* (agent team row).

**The sheet's worked example** shows three things on purpose: the task
list as source of work, a team with named builders and a reviewer, and
the reviewer's three checks with the builder sending its file list to the
reviewer. Three things are missing on purpose: file ownership, the
closed review loop (findings go back to the builder, and a story is done
only after the reviewer approves it), and the lead waiting. Do not point
at the example as incomplete until they ask why the coach wants more than
it shows. Then say that the example is a shape, not a full prompt.

## Technique applicability

**Load-bearing (5):**

- names the task list as the source of work
- an agent team with one named builder per story and a teammate named
  `reviewer` that writes no code
- file ownership per builder, and the foundation files named as finished
- a closed review loop: the reviewer sends its findings to the builder by
  name, the builder fixes them and sends the reviewer a new file list, and
  a story is done only when its Independent Test passes and the reviewer
  approves it
- the lead waits: it does not build stories and does not fix findings

**Optional polish — mention, never count against them:** a model choice
per teammate (a smaller model for the reviewer); a maximum number of
review rounds; a report shape per story; builders telling each other when
they need something from the other story.

**Not applicable:**

- **Extended thinking / `/effort`** — the thinking happened in Exercise 6.
  This prompt distributes work; it does not solve a problem.
- **Examples** — `tasks.md` already is the example. Pointing at it counts
  under "names the task list".

## What a strong draft contains

Nudge toward missing elements from this list. Never paste it as a prompt.

- The path of `tasks.md`, and that its `[Story]` tags decide who does what
- "Spawn an agent team" or "teammates" said explicitly, with one builder
  per user story and a `reviewer`, each with a name the participant can use
- The foundation files listed by name, marked as finished. No builder
  edits them. A builder that needs a change there stops and reports.
- The loop, in both directions: builder to reviewer when the Independent
  Test passes, reviewer back to that same builder with findings, builder
  back to reviewer after the fix
- Done per story: the Independent Test passes against the running backend,
  its tasks are ticked in `tasks.md`, and the reviewer approved it
- The lead's own job spelled out: wait for all teammates, do not fix
  findings, then report per story

## Nudge bank

- "Your reviewer finds a problem in the list page. Who does it tell?"
- "When is a story done? Your prompt says when the builder sends its
  files. What if the reviewer finds a problem after that?"
- "Your prompt says 'build the user stories in parallel'. What does the
  lead do while the teammates work?"
- "Which files may a builder edit? Your prompt says which story it owns.
  Does `tasks.md` say which files that is?"
- "A teammate starts with an empty context. It does not see this chat. How
  does it know that `api.js` is finished?"
- "You wrote 'spawn agents'. Claude may read that as subagents. A subagent
  reports to the session that started it. What word does the slide use?"

## Predicted defects for common gaps

- Loop not closed (no "send findings to the builder") → the reviewer
  reports to the lead. The lead fixes the finding itself, or the finding
  stays in a report nobody acts on. The builder never hears of it.
- No "done only after approval" → the builder reports done when its
  Independent Test passes. The reviewer's finding arrives after the
  builder stopped, and the lead calls the story finished.
- No "wait" instruction → the lead spawns the teammates and then starts
  User Story 1 itself, so two sessions edit the same page file
- Foundation not named as finished → a builder adds a helper to the
  shared API client. The other builder adds a different one. The second
  save overwrites the first, and one story breaks. The reviewer sees it in
  `git diff --stat foundation` only if the prompt asks for that check.
- "Agents" instead of "agent team" or "teammates" → Claude uses subagents.
  No rows with the teammates' names appear in the agent panel, and there
  is no reviewer to open or message.
- Teammates not named → the builders cannot address the reviewer, and the
  participant cannot open "the list builder" in task 3

## Ready bar

All five load-bearing checks present, in the participant's own words.

## What to watch

First: the agent panel below the prompt input. A real team shows one row
per teammate, carrying the names from the prompt, within a minute (with
agent teams on, a subagent Claude names launches as a teammate). Rows
without those names are plain subagents; the participant should say "use
an agent team, not subagents". Do not send anyone to Ctrl+T: on current
models the session has no Task tools, so that task list stays empty even
for a real team. Progress shows as ticks in `tasks.md`. Second: the
reviewer's transcript. A message from a builder with a file list, and a
reply to that builder, is the loop working. Third: the lead's own edits.
Any edit to a story file (under `src/pages/` in the reference spec) by the
lead is the "wait" defect happening live.

## After the run

Evidence for the debrief: the reviewer's transcript, `git diff --stat
foundation` in terminal 3, the tick marks in `tasks.md`, and what the
browser shows for each story. Ask which finding went from the reviewer to
a builder, and what the builder changed after it. If every changed file
belongs to exactly one story, connect that to the ownership clause. If a
foundation file changed, ask whether the reviewer reported it and to
whom. Ask for their written prediction from task 3 and compare it with
what happened.

## Held back

**Don't volunteer this.** The file boundary is not enforced by anything.
`tasks.md` says "no story task edits `main.js`", but a builder only obeys
that if it reads that sentence and is told it applies. The prompt protects
the foundation, and the reviewer catches what the prompt did not prevent.
Nudge toward the ownership clause with the questions above. If a
participant asks "does the task list stop them?", say no, and add why:
teammates load the project settings, not the participant's intent, and
not the constitution unless the prompt names it.

Also held back until asked: a lead that is not told to wait will usually
start a story itself, or fix a reviewer finding itself. The exercise sheet
gives the remedy in task 3, after the team has started; the coach lets the
participant find the clause before that without quoting the sheet.
