# Task 3 — The plan-mode prompt

**What they're drafting:** the *planning* prompt for the failing
create-review-on-nonexistent-book test (expected `404`, currently `201`).
This one is open to debate: where the existence check belongs is an
architectural choice. That is why it runs through plan mode with directed
thinking, and why the plan gets reviewed before any code is written. The
sheet has them copy the failing test output first, so error context is
available this time.

**Slide anchors:** *Plan Mode: Explore Before Editing* ("a wrong assumption
in the plan gets multiplied in the code") · *Prompting & Extended Thinking*
(`/effort` = how much, prompt = what about) · *Thinking Effort in Practice*
(this is the Task B pattern: name the risks) · *Providing Error Context*.

**Not dispatched.** See *Ready when*.

## Technique applicability

**Must (2):**

- **Plan mode gate** — the prompt says: explore and propose only, no code
  until the plan is approved.
- **Directed thinking** — the prompt names what the plan must reason
  through *before* proposing (see below), and demands one recommendation
  with reasons. A plan that lists options and picks none has handed the
  decision back.

**Should (3):** Error context (the failing output pasted word for word;
one paste, not the core this time) · Scope it (the failing test and the
review flow) · Define done (after approval, the named test run passes and
the rest stays green).

**Optional polish:** `/effort high` for the planning turn. If the draft
sets it, ask what the prompt points all that thinking *at*. Budget without
direction is exactly the slide's warning.

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
  reasons and at least one alternative it rejected**
- Done for the whole task: test passes after implementation, no other test
  newly broken

## Example bank

One clause per technique, on a different project: an Order API for a web
shop where cancelling an already-shipped order returns `200` instead of
`409`. Quote the one you are nudging, word for word, and say it is from
another project. Never turn one into a clause for this project.

- **Plan mode gate:** "Do not write or edit any code. Propose a plan and
  wait for my approval."
- **Directed thinking:** "Before you propose, work out: why does the cancel
  currently succeed, which layer should refuse it and what each choice
  costs, and which status code is correct. Recommend one place, with
  reasons, and name one alternative you rejected."
- **Error context:** "This is the failing test output: <paste>."
- **Scope it:** "Only the cancel flow: `OrderController.cancel` down to
  `OrderRepository`."
- **Define done:** "After I approve: `mvn test -Dtest=OrderControllerTest`
  passes and no other test is newly red."

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
- Error described instead of pasted → the plan fixes a slightly different
  bug that fits the summary

## Ready when

Both musts ✅ or 🟡. One coaching round only: this task sits at the end of
the box. **This task is the exception to clean-room dispatch:** do not
launch a sub-agent. The participant runs the prompt themselves, in plan
mode, so they can review the plan and approve or reject it. Do not tell
them to type *ship it*. Say the prompt is ready, and tell them to copy it
into their notes, close Claude, start it again, and send the prompt in
plan mode. Add this: their next job is to *push back on at least one step
of the plan* before approving. Reading a plan is not reviewing it.

Training mode is on in their own session; nothing lifts it here. Claude may
ask one leading question before it plans. That is expected, and the sheet
tells them to answer it in one line. Never coach a way around it.

## Held back

Where the check belongs. The handler-vs-store trade-off is the discussion the
plan must make visible and the participant must judge. Never state your own
preference, in coaching or debrief. React only to the reasons their plan's
recommendation gives.
