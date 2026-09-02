# Exercise 7: Parallel Agents & Quality Gates

**Session**: 7 — Agentic Workflows
**Duration**: 30 minutes
**Project**: Same BookStore API.

## Goal

You'll draft a coached prompt that checks whether two features are safe to
build in parallel, launch one of them as a background worktree agent, and
build the other yourself while it runs. Then you integrate both and run
quality gates.

## A few words we'll use

- **Coach**: the `/parallel-coach` command. It grades your draft prompt and
  points out gaps. It never writes the prompt for you — that's your job.
- **Greenlight**: the coach thinks your prompt is ready to run.
- **Worktree agent**: a background agent that works on its own branch and
  directory, so it can run while you keep working in yours.
- **Verifier**: the `/verify-exercise 7` command. It checks the merged code
  against a checklist, after the fact.

**About training mode**: `CLAUDE.md` keeps this project in training mode.
Stuck or short on time? Just say *"just tell me"*. That is allowed.

## Tasks

### 1. Decompose & launch (15 min: draft 3 · coach & revise 4 · launch 2 · build Feature B 6)

The bookstore needs two independent improvements:

- **Feature A**: a `GET /authors/{id}/books` endpoint that returns all books
  by a given author, with pagination.
- **Feature B**: input validation on `POST /reviews` — rating must be 1–5,
  review text must be 10–500 characters, and the book must exist.

Draft one prompt that asks Claude whether these two features are safe to
build in parallel. Don't just ask "which files does each touch" — safe to
parallelize also means no shared state, such as a store file both handlers
would write to.

Draft → `/parallel-coach 1` → revise until you get the greenlight.

Once greenlit, ask Claude to build **Feature A** as a background worktree
agent. While it runs, build **Feature B** yourself, directly, in your own
session — a straightforward validation task doesn't need coaching.

**Done when**: the coach greenlit your safety-check prompt, a background
worktree agent is running for Feature A, and you have a working `POST
/reviews` with the three validation rules above.

### 2. Integrate & verify (15 min: check & merge 3 · quality gates 8 · debrief 4)

By now the background agent should be done. Check its result — it reports
the branch name and worktree path.

Merge the worktree branch into your current branch:

```bash
git merge <worktree-branch-name>
```

If there are merge conflicts, ask AI to help resolve them.

Then run the full quality gate checklist. Ask AI: _"Run these quality checks
on the bookstore and report results: (1) `python3 -m unittest -v` — all
tests pass, (2) `python3 -m py_compile bookstore/**/*.py` — no syntax
errors, (3) verify both new endpoints exist and follow existing patterns,
(4) check that no existing tests broke."_

Start `/verify-exercise 7`. It grades the merged diff against a checklist —
tests, the syntax check, and whether both endpoints follow the existing
handler pattern. Bring its report to the plenary harvest.

**Done when**: both features are merged into your branch, `python3 -m
unittest -v` passes, `python3 -m py_compile bookstore/**/*.py` reports no
errors, and `/verify-exercise 7` has run.

## Plenary Harvest (5 min)

Trainer popcorns the room — have answers ready: what did the coach flag in
your safety-check prompt before it greenlit it? Did the background agent
finish before you did, or after? Did `/verify-exercise 7` catch anything the
quality-gate prompt missed? Close with **one take-away**: looking back at
this exercise, which part actually benefited from parallel agents, and which
would have been simpler as a single session?
