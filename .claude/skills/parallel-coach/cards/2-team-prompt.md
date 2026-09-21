# Task 2 — Draft the team prompt

**What they're drafting:** one prompt that turns the lead into a team lead:
it reads `specs/001-*/tasks.md`, spawns one teammate per user story, and
collects the results. The foundation (Phase 1 and 2) is already built and
committed.

**Slide anchors:** *Agent Teams: Multi-Agent Coordination* · *Checkpoint:
Who Starts the Team?* · *When to Use Which Pattern* (agent team row).

## Technique applicability

**Load-bearing (5):** names the task list as the source of work · one
teammate per story, with a name · file ownership per teammate, and the
foundation files named as finished · a done condition per teammate that is
checkable (the story's Independent Test, tasks ticked) · the lead waits and
does not build stories itself.

**Optional polish — mention, never count against them:** a model choice
per teammate; asking for a per-story report shape; telling teammates to
message each other if they need something from the other story.

**Not applicable:**

- **Extended thinking / `/effort`** — the thinking happened in Exercise 6.
  This prompt distributes work; it does not solve a problem.
- **Examples** — `tasks.md` already is the example. Pointing at it counts
  under "names the task list".

## What a strong draft contains

Nudge toward missing elements from this list. Never paste it as a prompt.

- The path of `tasks.md`, and that its `[Story]` tags decide who does what
- "Spawn an agent team" or "teammates" said explicitly, with one teammate
  per user story and a name the participant can use later
- The foundation files listed by name, marked as finished — no teammate
  edits them, and a teammate that needs a change there stops and reports
- Per teammate: done means the story's Independent Test passes against the
  running backend, and its tasks are ticked in `tasks.md`
- The lead's own job spelled out: wait for all teammates, then report per
  story. Not: implement anything.

## Nudge bank

- "Your prompt says 'build the user stories in parallel'. What does the
  lead do while the teammates work?"
- "Which files may a teammate edit? Your prompt says which story it owns.
  Does `tasks.md` say which files that is?"
- "A teammate loads the constitution and the project. It does not see this
  chat. How does it know that `api.js` is finished?"
- "When does a teammate stop? Your prompt says 'implement User Story 1'.
  What would it check before it says done?"
- "You wrote 'spawn agents'. Claude may read that as subagents, which
  report back and cannot claim tasks. What word does the slide use?"

## Predicted defects for common gaps

- No "wait" instruction → the lead spawns two teammates and then starts
  User Story 1 itself, so two sessions edit the same page file
- Foundation not named as finished → a teammate adds a helper to the
  shared API client; the other teammate adds a different one; the last
  write wins and one story breaks
- No done condition → a teammate ticks its tasks after writing the code
  and never opens the browser; the story renders "Not built yet" or throws
- "Agents" instead of "agent team" or "teammates" → Claude uses subagents;
  the agent panel stays empty and there is no shared task list to watch
- Teammates not named → the participant cannot address one later ("tell
  the list teammate to…") and has to describe it instead

## Greenlight bar

All five load-bearing checks present, in the participant's own words.

## What to watch

First: the agent panel below the prompt input. Rows appear within a
minute. No rows means subagents, not a team — the participant should say
"use an agent team, not subagents". Second: the lead's own edits. Any
edit under `src/pages/` by the lead is the "wait" defect happening live.

## After the run

Evidence for the debrief: `git diff --stat foundation` in terminal 3, the
tick marks in `tasks.md`, and what the browser shows for each story. If
every changed file belongs to exactly one story, connect that to the
ownership clause. If a foundation file changed, ask which teammate did it
and what the prompt said about that file.

## Held back

**Don't volunteer this.** The file boundary is not enforced by anything.
`tasks.md` says "no story task edits `main.js`", but a teammate only obeys
that if it reads that sentence and is told it applies. The only thing that
protects the foundation is the participant's prompt. Nudge toward the
ownership clause with the questions above. If a participant asks "does the
task list stop them?", say no, and add why: teammates load the project and
the constitution, not the participant's intent.

Also held back until asked: a lead that is not told to wait will usually
start a story itself. The exercise sheet says this in task 3; the coach
lets the participant find the clause without quoting the sheet.
