# Task 1 — The orientation prompt

**What they're drafting:** one prompt that writes `docs/orientation.md` with
two sections — a package tree (one line per package on what it owns) and the
request flow from the entry point to the database and back, layer by layer,
with `file:line` per hop. The `docs/` folder does not exist yet.

**Slide anchors:** *The CONTEXT-TASK-OUTCOME Framework* · *Writing Effective
Prompts* (Scope/Direct/Define done) · *Role Framing* · *Let's do a Prompt
Analysis* — that slide's prompt has the same shape as this task, on a
different subject. Do not tell them to copy it.

**Deliverable guard applies:** `docs/orientation.md`. See SKILL.md.

## Technique applicability

**Must (2):**

- **OUTCOME** — both sections named, `file:line` per hop asked for, and the
  result written to `docs/orientation.md`. A prompt that never names the
  file gets a report in the chat and no file. That is 🟡 at best, never ✅.
- **Define done** — a condition that means: *no claim I cannot check by
  opening the file you named*.

**Should (4):** CONTEXT (the stack and the entry point, given, not searched
for) · TASK (an outcome, not a topic) · Scope it (this project, this entry
point) · Direct it (a method: open at least one file per package before
describing it; read the route registration, then follow one real route).

**Optional polish — mention, never count:** Role framing · `@file`
reference. Both improve the result. Neither decides whether the file can be
checked.

**Not applicable:**

- **Examples** — there is no pattern to point at in your first five minutes
  in an unfamiliar codebase. *Held back — see below.*
- **Constrain it** — read-only task. There is nothing to constrain.
- **Extended thinking / `/effort`** — this is reading, not reasoning. If the
  draft asks for it, that is a finding: it costs tokens and adds no quality.

## What a strong draft contains

Nudge toward missing elements from this list. Never paste it as a prompt.

- The stack and the entry point given, not left for Claude to search for
- Both deliverables named, each with its output shape, and the file to write
- `file:line` per hop asked for explicitly
- **A method for the tree:** open at least one file per package before
  describing it. Do not guess from the package name. This is the most
  valuable clause in the whole prompt, and almost nobody writes it.
- **A method for the flow:** read the route registration first, then follow
  one real route from start to end
- A done-condition that means: *no claim I cannot check by opening the file
  you named*

## Example bank

One clause per technique, on a different project: an Order API for a web
shop, written in Java with Spring. Quote the one you are nudging, word for
word, and say it is from another project. Never turn one into a clause for
this project.

- **CONTEXT:** "This is a Spring Boot order service. Requests enter through
  `OrderController`."
- **TASK:** "Write a guide that gets a new developer from zero to their
  first change."
- **OUTCOME:** "Write the result to `docs/onboarding.md`. Create the folder
  if it is missing. For the flow, one line per step, each ending in
  `file:line`."
- **Scope it:** "Only the `order` module. Ignore `payment` and `shipping`."
- **Direct it:** "Open at least one file in every module before you
  describe it. Start at the route table and follow one real order request."
- **Define done:** "Done when every step names a file and line I can open,
  and no module line is guessed from its name."
- **Role framing:** "Write for a developer who joins the team next week."
- **`@file`:** "Start from `@src/main/java/shop/OrderApplication.java`."

## Nudge bank

- "Claude gives you a `file:line` for a hop. How do you know it is real, and
  not invented to fill your format?"
- "Could Claude write the line about the `util` package without opening any
  file in it? What in your prompt stops that?"
- "Your prompt says what to deliver. Where does it say how to *find* it?"
- "Where does the result end up? Your prompt describes a document. Does it
  say to write it?"

## Predicted defects for common gaps

- No file named → the sub-agent reports in the chat and writes nothing
- No method for the tree → Claude guesses each package's job from its name
- No `file:line` demand, or no done-condition → hops without citations, or
  invented line numbers written to satisfy your format
- No CONTEXT / entry point → Claude spends turns searching, or describes the
  architecture it *expects* (a service layer, a repository abstraction)
  instead of the one that is there

## Ready when

Both musts ✅ or 🟡. Every should still ❌ becomes a "watch for" line. Role
framing and `@file` are worth one line if absent, not a round.

## After the run

Run the deliverable guard. `/verify-exercise 2` grades the sent prompt
against the produced file, claim by claim, in the break. Keep your debrief
to one line per prediction and hand over to it.

## Held back

The sheet lists seven techniques and says one adds nothing here. The closing
round asks which. Intended answer: **Examples** — there is no pattern to
point at yet, which is the premise of the task. **Don't volunteer it.** If
asked directly, give it, and add the hook: Examples becomes available the
moment this task is finished. The very next task can point at an existing
test as its pattern.
