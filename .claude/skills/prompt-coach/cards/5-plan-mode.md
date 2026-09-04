# Task 5 — The plan-mode prompt

**What they're drafting:** the *planning* prompt for the failing
create-review-on-nonexistent-book test (expected `404`, currently `201`).
This one is open to debate: where the existence check belongs is an
architectural choice. That is why it runs through plan mode with a directed
reasoning budget, and why the plan gets reviewed before any code is written.

**Slide anchors:** *Plan Mode: Explore Before Editing* ("a wrong assumption
in the plan gets multiplied in the code") · *Prompting & Extended Thinking*
(`/effort` = how much, prompt = what about) · *Thinking Effort in Practice*
(this is the Task B pattern: name the risks).

## Technique applicability

**Load-bearing (4):** Plan mode discipline (explore and propose only — the
prompt forbids code until the plan is approved) · Directed thinking (the
prompt names what to reason through *before* proposing — see below) ·
Scope it (the failing test and the review flow) · Define done (a reviewable
plan first; after approval, the named test run passes and the rest stays
green).

**Optional polish:** `/effort high` for the planning turn. If the draft sets
it, ask what the prompt points all that thinking *at*. Budget without
direction is exactly the slide's warning · error context (the failing output
helps; it is one paste, not the core this time).

**Not applicable:**

- **Examples** — no existing existence-check pattern in this codebase to
  point at.
- **Role framing** — optional at best. Do not count it.

## What a strong draft contains

- No-code-yet stated directly, with plan approval as an explicit gate
- The reasoning pointed at the real risks, by name. Some of: why the invalid
  insert currently *succeeds* (what the database is and is not enforcing),
  which layer should own the check and the trade-off between the candidate
  layers, what the correct status code is and why, what the change must not
  break
- A demand that the plan take a position: a recommended placement **with
  reasons and at least one alternative it rejected**. A plan that lists
  options without choosing has handed the decision back.
- Done for the whole task: test passes after implementation, no other test
  newly broken

## Nudge bank

- "Your prompt asks for a plan. What is the plan supposed to *think about*?
  Right now Claude picks its own risks."
- "Today, inserting a review for a missing book succeeds. Does your prompt
  ask *why* it succeeds? That answer decides where the fix belongs."
- "The plan arrives with three options and no recommendation. What in your
  prompt lets you call that incomplete?"
- "What stops Claude from implementing the fix in the same turn it plans
  it?"

## Predicted defects for common gaps

- Undirected thinking → a generic plan that skips the enforcement question
  and picks a layer without saying why
- No position demanded → a menu of options. The architectural decision comes
  back to you with no new information.
- No no-code gate → Claude plans and implements in one turn. The review
  moment, which is the point of the task, never happens.
- No done-condition → the test passes, and a neighboring review test breaks
  without anyone noticing

## Greenlight bar

All four load-bearing present. **This task is the exception to clean-room
dispatch:** do not launch a sub-agent. The participant runs the prompt
themselves, in plan mode, so they can review the plan and approve or reject
it. Do not tell them to type *ship it*. Say the prompt is ready, and tell
them to copy it into their notes, run `/clear`, and send it in a fresh
session in plan mode. Add this: their next job is to
*push back on at least one step of the plan* before approving. Reading a
plan is not reviewing it.

Training mode is on in their own session; nothing lifts it here. Claude may
ask one leading question before it plans. That is expected, and the sheet
tells them to answer it in one line. Never coach a way around it.

## Held back

Where the check belongs. The handler-vs-store trade-off is the discussion the
plan must make visible and the participant must judge. Never state your own
preference, in coaching or debrief. React only to the reasons their plan's
recommendation gives.
