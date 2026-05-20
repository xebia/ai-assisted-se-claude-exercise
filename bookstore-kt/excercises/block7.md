# Exercise 7: Parallel Agents & Quality Gates

**Block**: 7 — Agentic Workflows & Multi-Agent Patterns **Duration**: 30 minutes
**Project**: Same BookStore API.

**Goal**: Use worktrees and background agents to build two independent bookstore
features in parallel, then integrate them with quality gates.

---

## Tasks

### 1. Decompose a feature into parallel tasks (10 min)

The bookstore needs two independent improvements:

- **Feature A**: Add a `GET /authors/{id}/books` endpoint that returns all books
  by a given author, with pagination
- **Feature B**: Add input validation to `POST /reviews` — rating must be 1–5,
  review text must be 10–500 characters, and the book must exist

Ask AI: _"Read the bookstore codebase. I want to build two features in parallel
using worktrees. Feature A: a GET /authors/{id}/books endpoint with pagination.
Feature B: input validation on POST /reviews (rating 1–5, text 10–500 chars,
book must exist). Are these safe to build in parallel — do they touch the same
files? Which files will each feature modify?"_

Review the answer — confirm the features are independent enough for parallel
work. Compare with your neighbor: did the AI identify the same file boundaries?

---

### 2. Integrate and run quality gates (10 min)

By now the background agent should be done. Check its result — it will report
the branch name and worktree path.

Merge the worktree branch into your current branch:

```bash
git merge <worktree-branch-name>
```

If there are merge conflicts, ask AI to help resolve them.

Then run the full quality gate checklist. Ask AI: _"Run these quality checks on
the bookstore and report results: (1) `./build.sh` — main and tests compile
cleanly, (2) `./test.sh` — all tests pass, (3) verify both new endpoints
exist and follow existing patterns, (4) check that no existing tests broke."_

---

## Pair Discussion (5 min)

Compare notes with your partner:

1. **Parallel execution**: did the worktree agent complete before you finished
   Feature B? Were there any merge conflicts? How would you split work
   differently next time?
2. **Quality gates**: did the automated checks catch anything you missed? What
   gates would you add for your real projects?
3. **When NOT to use agents**: looking back at today's exercise, which parts
   actually benefited from parallel agents, and which would have been simpler as
   a single session?

Choose **one take-away** to present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
