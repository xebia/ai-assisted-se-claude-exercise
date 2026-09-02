# Task 2 — The orientation prompt

**What they're drafting:** one prompt that produces `docs/orientation.md` with
two sections — a package tree (one line per package on what it owns) and the
request flow from the entry point to the database and back, layer by layer,
with `file:line` per hop.

**Slide anchors:** *The CONTEXT-TASK-FORMAT Framework* · *Writing Effective
Prompts* (Scope/Direct/Define done) · *Role Framing* · *Prompt Analysis* —
this task is that slide's prompt, written live instead of read.

## Technique applicability

**Load-bearing (6):** CONTEXT · TASK · FORMAT · Scope it · Direct it ·
Define done.

**Optional polish — mention, never count against them:** Role framing ·
`@file` reference. Both improve the result. Neither decides whether the
artifact can be checked.

**Not applicable:**

- **Examples** — there is no pattern to point at in your first five minutes
  in an unfamiliar codebase. *Held back — see below.*
- **Constrain it** — read-only task. There is nothing to constrain.
- **Extended thinking / `/effort`** — this is reading, not reasoning. If the
  draft asks for it, that is a finding: it costs tokens and adds no quality.

## What a strong draft contains

Nudge toward missing elements from this list. Never paste it as a prompt.

- The stack and the entry point given, not left for Claude to search for
- Both deliverables named, each with its output shape
- `file:line` per hop asked for explicitly
- **A method for the tree:** open at least one file per package before
  describing it. Do not guess from the package name. This is the most
  valuable clause in the whole prompt, and almost nobody writes it.
- **A method for the flow:** read the route registration first, then follow
  one real route from start to end
- A done-condition that means: *no claim I cannot check by opening the file
  you named*

## Nudge bank

- "Claude gives you a `file:line` for a hop. How do you know it is real, and
  not invented to fill your format?"
- "Could Claude write the line about the `util` package without opening any
  file in it? What in your prompt stops that?"
- "Your prompt says what to deliver. Where does it say how to *find* it?"

## Predicted defects for common gaps

- No method for the tree → Claude guesses each package's job from its name
- No `file:line` demand, or no done-condition → hops without citations, or
  invented line numbers written to satisfy your format
- No CONTEXT / entry point → Claude spends turns searching, or describes the
  architecture it *expects* (a service layer, a repository abstraction)
  instead of the one that is there

## Greenlight bar

All six load-bearing techniques present. Role framing and `@file` are worth
one line if absent, not a round.

## After the run

`/verify-exercise 1` grades the sent prompt against the produced artifact,
claim by claim. That report is the debrief for this task. Keep yours to one
line and hand over to it. Do not repeat its findings before it runs.

## Held back

The exercise asks: *of the techniques listed, which one adds nothing here?*
Intended answer: **Examples** — there is no pattern to point at yet, which is
the premise of the task. **Don't volunteer it.** If asked directly, give it,
and add the hook: Examples becomes available the moment this task is
finished. The very next task can point at an existing test as its pattern.
