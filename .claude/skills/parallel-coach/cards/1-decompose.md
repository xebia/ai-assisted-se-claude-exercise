# Task 1 — Decompose & launch

**What they're drafting:** one prompt that asks Claude whether Feature A
(`GET /authors/{id}/books`, paginated) and Feature B (validation on `POST
/reviews`) are safe to build in parallel.

**Slide anchors:** *Worktrees: Safe Parallel Execution* · *Checkpoint: Two
Agents, One Repo* · *Agent Modes at a Glance* (worktree row).

## Technique applicability

**Load-bearing (3):** names both features concretely · asks for file
boundaries · asks about shared state, not only shared files.

**Optional polish — mention, never count against them:** asking Claude to
propose the worktree branch names; asking for a confidence level on its
answer.

**Not applicable:**

- **Constrain it** — this is a read-only safety check, nothing to build yet.
- **Extended thinking / `/effort`** — this is a lookup task across a small
  codebase, not a reasoning-heavy one.

## What a strong draft contains

Nudge toward missing elements from this list. Never paste it as a prompt.

- Both features named with their concrete shape (endpoint, validation
  rules), not just "Feature A and Feature B"
- A request for **which files** each feature would touch
- A request that goes past file names: **does either feature need to change
  a function or a dependency that the other might also touch** — not just
  "do the files overlap"
- A request for a plain yes/no verdict on parallel safety, with the
  reasoning shown

## Nudge bank

- "Your prompt asks which files each feature touches. Could two features
  touch different files and still conflict when you try to merge them?"
- "Feature B needs to check that a book exists before saving a review. Where
  does that check happen, and does building it change anything Feature A
  might also need to change?"
- "If both features need the bookstore's dependency wiring to change, where
  would that show up — in a file neither feature's tests directly cover?"

## Predicted defects for common gaps

- No shared-state question → Claude answers based on file lists alone and
  calls the features safe, missing that both features add a new dependency
  to a shared wiring point (the server startup file, where handlers are
  constructed)
- No concrete feature description → Claude has to guess scope, and its file
  list may miss a file either feature only touches in edge cases
- No request for reasoning → a bare "yes, safe" gives nothing to check
  against later when the merge happens

## Greenlight bar

All three load-bearing checks present, in the participant's own words.

## After the run

The dispatched sub-agent's answer is the evidence for the debrief. If it
named `main.go` or a handler constructor as a shared touchpoint, that
confirms the shared-state check worked. If it only compared file lists and
said "safe," ask the participant whether they believe it, and why.

## Held back

**Don't volunteer this.** The actual collision in this codebase: Feature A
(`GET /authors/{id}/books`) most naturally goes on the author handler, and
Feature B's "book must exist" check needs the review handler to gain a
dependency on the book store. Both changes touch the same few lines in the
server wiring file, where handlers are constructed and given their
dependencies — not a runtime data race, a merge conflict. If a
participant's prompt or hypothesis surfaces this, confirm it directly. If
asked "is there a real collision here," say yes, and add the hook: this is
why "safe to parallelize" means more than "different files."
