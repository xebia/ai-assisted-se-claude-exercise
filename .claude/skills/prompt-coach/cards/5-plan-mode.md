# Task 5 — The plan-mode prompt

**What they're drafting:** the *planning* prompt for the failing
create-review-on-nonexistent-book test (expected `404`, currently `201`).
This one is genuinely debatable — where the existence check belongs is an
architectural choice — which is why it runs through plan mode with a directed
reasoning budget, and why the plan gets reviewed before any code is written.

**Slide anchors:** *Plan Mode: Think Before Coding* ("a bad line in a plan
becomes 100+ bad lines of code") · *Prompting & Extended Thinking* (`/effort`
= how much, prompt = what about) · *Thinking Effort in Practice* (this is the
Task B pattern: hint the threats).

## Technique applicability

**Load-bearing (4):** Plan mode discipline (explore and propose only — the
prompt forbids code until the plan is approved) · Directed thinking (the
prompt names what to reason through *before* proposing — see below) ·
Scope it (the failing test and the review flow) · Define done (a reviewable
plan first; after approval, the named test run passes and the rest stays
green).

**Optional polish:** `/effort high` for the planning turn — if the draft
sets it, ask what the prompt aims all that thinking *at*; budget without
direction is the slide's exact warning · error context (the failing output
helps; it's one paste, not the crux this time).

**Not applicable:**

- **Examples** — no existing existence-check pattern in this codebase to
  point at.
- **Role framing** — optional at best; don't count it.

## What a strong draft contains

- No-code-yet stated outright, and plan approval as an explicit gate
- The reasoning directed at the real threats, by name — some of: why the
  invalid insert currently *succeeds* (what the database is and isn't
  enforcing), which layer should own the check and the trade-off between the
  candidate layers, what the correct status code is and why, what the change
  must not break
- A demand that the plan take a position: a recommended placement **with
  rationale and at least one alternative it rejected** — a plan that lists
  options without choosing has delegated the decision back
- Done for the whole task: test passes after implementation, no other test
  newly broken

## Nudge bank

- "Your prompt asks for a plan. What is the plan supposed to *think about*?
  Right now the model picks its own threats."
- "The insert of an orphaned review succeeds today. Does your prompt ask
  *why* it succeeds? That answer decides where the fix belongs."
- "When the plan arrives with three options and no recommendation, what in
  your prompt lets you call that incomplete?"
- "What stops the model from implementing the fix in the same turn it plans
  it?"

## Predicted defects for common gaps

- Undirected thinking → a generic plan that skips the enforcement question
  and picks a layer without justifying it
- No position demanded → an options menu, pushing the architectural decision
  back to the participant with no new information
- No no-code gate → plan and implementation in one turn; the review moment —
  the point of the task — never happens
- No done-condition → the test passes while a neighboring review test breaks
  unnoticed

## Greenlight bar

All four load-bearing present. Remind them in the greenlight: their next job
is to *push back on at least one step of the plan* before approving — reading
a plan isn't reviewing it.

## Held back

Where the check belongs. The handler-vs-store trade-off is the discussion the
plan must surface and the pair must judge — never state your own preference,
in coaching or debrief. React only to the rationale their plan's
recommendation gives.
