# Exercise 8: Capstone — Your Real Project

**Session**: 8 — Bringing It All Together
**Duration**: 30 minutes
**Project**: Your own project, not BookStore. Bring one you actually work on.

## Goal

Apply this course's workflow to a task from your own codebase. The point is
not to finish a big feature. The point is to run Research → Plan →
Implement → Verify end to end, on a task small enough to actually finish in
this slot, and to leave with one reusable piece of setup (a skill, a hook,
or an MCP connection) for your team.

Pick a task you can describe in one sentence and that a single AI turn per
phase can carry: a small bug, a short doc update, one helper function. Not a
multi-file feature. A task that takes you all 30 minutes to describe is the
wrong task for this slot.

No coach and no `/verify-exercise` this time: your project is yours alone,
so there is no shared answer to grade against. Use **Done when** to check
yourself.

## Tasks

### 1. Setup (5 min: open project & write CLAUDE.md 3 · pick a task 2)

Open a real project of yours. Create a `CLAUDE.md` at its root, or update
the one it already has, with your project's own conventions — build/test
commands, layout, one or two rules you actually enforce in review.

Worked example, if you want a starting shape to copy:

```md
# CLAUDE.md

## Build & test
`npm test` runs the suite. `npm run build` must pass before any commit.

## Layout
`src/api/` — HTTP handlers. `src/db/` — queries, no business logic.
`src/domain/` — the rules. Domain code must not import from `src/api/`.

## Conventions
- New endpoints get a handler test and an integration test.
- No new dependencies without a one-line reason in the PR description.
```

Then pick your task for this exercise (see the sizing rule above).

**Done when**: `CLAUDE.md` exists (or is updated) at your project's root, and
you can say your task's goal in one sentence.

### 2. Apply the full workflow (17 min: research 3 · plan 4 · implement 6 · verify 2, plus 2 min buffer)

Run the four phases on your task:

1. **Research**: ask Claude to explain the relevant code before changing
   anything.
2. **Plan**: ask for a plan — approach, affected files, risks, how you'll
   verify it — before any code is written.
3. **Implement**: ask Claude to write the code for one plan step at a time.
   Review each diff before you approve the next step.
4. **Verify**: run the tests or checks that prove the task is done. If none
   exist yet, write one.

This is the same loop from the *Plan Mode* and *Avoiding Vibe Coding* slides
in earlier sessions — now on a codebase Claude has never seen before.

**Done when**: the change is made, your verification step passed, and you
can point to the plan step that turned out to be wrong (if any — a plan
surviving unchanged is rare, and fine too).

### 3. Optimize your setup (8 min: choose one 1 · build it 5 · document 2)

Pick **one**, not all three:

- A project-specific **skill** for a task you repeat often.
- **One** hook or MCP connection that would help your daily work.

Worked examples, if you want a starting shape to copy:

```md
<!-- .claude/skills/add-endpoint/SKILL.md -->
# add-endpoint
Use this when adding a new HTTP endpoint to this project.
Steps: 1) add the handler in src/api/, 2) add a route, 3) add a handler
test and an integration test, 4) update docs/api.md.
```

```json
// a pre-commit hook, in .claude/settings.json
{ "hooks": { "PreToolUse": [{ "matcher": "Bash", "command": "npm run lint" }] } }
```

Build it. Then write two sentences — what it does, and why your team would
want it — somewhere your team will actually read them (a README, a wiki
page, a Slack message).

**Done when**: the skill or hook/MCP config exists as a file in your
project, and you've written the two-sentence explanation for your team.

## Closing round (10 min)

Popcorn round, whole room, no pairs: 4–5 participants each share one
take-away.

Good prompts to answer, if you need one: which task took longer than you
expected, and what would you set up differently next time? Or: what did
your `CLAUDE.md` teach you about your own project that you hadn't written
down before?
