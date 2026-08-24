# Task 2 — The orientation prompt

**What they're drafting:** one prompt that produces `docs/orientation.md` with
two sections — a package tree (one line per package on what it owns) and the
request flow from the entry point to the database and back, layer by layer,
with `file:line` per hop.

**Slide anchors:** *The CONTEXT-TASK-FORMAT Framework* · *Writing Effective
Prompts* (Scope/Direct/Define done) · *Role Framing* · *Prompt Analysis* —
this task is that slide's prompt, composed live instead of read.

## Technique applicability

**Load-bearing (6):** CONTEXT · TASK · FORMAT · Scope it · Direct it ·
Define done.

**Optional polish — mention, never count against them:** Role framing ·
`@file` reference. Both improve the result; neither decides whether the
artifact is checkable.

**Not applicable:**

- **Examples** — no pattern to point at in your first five minutes in an
  unfamiliar codebase. *Held back — see below.*
- **Constrain it** — read-only task; nothing to constrain.
- **Extended thinking / `/effort`** — this is reading, not reasoning. If the
  draft asks for it, that's a finding: it buys tokens, not quality.

## What a strong draft contains

Nudge toward missing elements from this list; never paste it as a prompt.

- The stack and the entry point handed over, not left to be searched for
- Both deliverables named, each with its output shape
- `file:line` per hop demanded explicitly
- **A method for the tree:** open at least one file per package before
  describing it, rather than inferring from the package name. Highest-value
  clause in the whole prompt and almost nobody writes it.
- **A method for the flow:** read the route registration first, then follow
  one real route end to end
- A done-condition amounting to *no claim I can't check by opening the file
  you named*

## Nudge bank

- "How would you tell a hop citation that's real from one the model made up to
  satisfy your format?"
- "Could the line about the `util` package be written without opening a single
  file in it? What in your prompt prevents that?"
- "Your prompt says what to deliver. Where does it say how to *find* it?"

## Predicted defects for common gaps

- No method for the tree → package one-liners guessed from package names
- No `file:line` demand, or no done-condition → uncited hops, or fabricated
  line numbers produced under format pressure
- No CONTEXT/entry point → wasted turns searching, or the architecture the
  model *expects* (a service layer, a repository abstraction) instead of the
  one present

## Greenlight bar

All six load-bearing techniques present. Role framing and `@file` are worth a
one-line mention if absent, not a round.

## After the run

`/verify-exercise 1` grades the sent prompt against the produced artifact,
claim by claim — that report is the debrief for this task, so keep yours to
one line and hand over to it. Don't preempt its findings.

## Held back

The exercise asks: *of the techniques listed, which buys you nothing here?*
Intended answer: **Examples** — there's no pattern to point at yet, which is
the premise of the task. **Don't volunteer it.** If asked directly, give it,
and add the hook: Examples becomes available the moment this task is finished
— the very next task can point at an existing test as its pattern.
