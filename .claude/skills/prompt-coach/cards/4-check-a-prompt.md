# Card 4 — Check a given prompt (exercise 2, task 1)

**What they bring:** not a draft prompt. They bring a list of decisions
that this given prompt leaves to Claude, each marked *task* or *team*,
plus the two or three sentences they would add for the *task* lines:

> Add a DELETE /api/reviews/{id} endpoint to the BookStore API, with tests.

They do not run their version. In task 2 they run the given prompt as it
is, so the before-and-after comparison of exercise 2 stays fair. Your
job is a sharper list and sharper sentences, in one round.

**Slide anchors:** *The CONTEXT-TASK-OUTCOME Framework* (the four verbs:
Scope it, Constrain it, Direct it, Define done) · *Green Tests. What Could
Still Be Wrong?* · *Where Does the Problem Live?* (prompt or window).

**Not dispatched.** There is nothing to ship. Never say *ship it* for
this card, and never run their sentences.

## What a complete list contains

Use this to grade. Never paste it, and never name an item they missed.
Point at the kind of question instead (see *Nudge bank*).

*Task* decisions, about this endpoint only:

- Who may delete a review. The project has no users or logins.
- What happens when the review does not exist: 404, or success anyway.
- What a successful delete returns: an empty answer, or a body.
- Delete the row, or only mark it as deleted.
- Which test cases prove it works: success, missing review, bad id.

*Team* decisions, the same for every endpoint:

- How new tests are written (decision 1, test kit).
- What bad input returns (decision 2, 400).
- Which files a change may touch (decision 3, small changes).
- Possible extras: the shape of an error body, naming of handlers.

**Held back:** the existing book delete endpoint answers a bad id with
500 and gives no 404 for a missing book (it answers 204 either way). Claude
often copies it. Do not tell them. It shows in their task 2 diff, and
`/verify-exercise 2` names it.

## Grading

**Must (2):**

- **Open decisions** — at least four, and at least two of them *task*
  decisions. A list that only repeats the three team decisions has not
  looked at the prompt itself: ❌.
- **Define done** — the added sentences end with something a person can
  check after the run: named test cases, status codes, a test command
  that must pass. "It should work well" is ❌.

**Should (2):**

- **Sorted right** — each line marked *task* or *team* in a way you can
  defend. A team decision marked *task* is 🟡, not ❌: name it in one
  clause.
- **Scope it / Constrain it** — the sentences name the endpoint's limits
  (which files, no other endpoints changed).

**Not needed here:** role framing, examples, plan mode, `/effort`. If
their sentences add a role, say in one clause that it changes the tone,
not what Claude decides.

## The first line

Replace *"Ready to ship"* with *"List checked: complete"* or *"List
checked: one gap"*. Then the grade, under ~10 lines, in the SKILL's
checklist shape.

## Example bank

On another task: an "edit your profile" endpoint in a web shop. Quote one,
word for word, and say it is from another task.

- **Open decision, task:** "Which fields may a user change: name, email,
  password?"
- **Open decision, team:** "How do we name request fields: camelCase or
  snake_case?"
- **Define done:** "Done when the tests cover a valid change, an unknown
  field and an empty name, and `mvn test` passes."
- **Constrain it:** "Change only the profile handler and its test."

## Nudge bank

- "A reviewer opens the pull request. What is the first question they ask
  about *this* endpoint that your list does not answer?"
- "The review with that id is not there. What does your prompt say should
  happen?"
- "When Claude says it is done, what do you check? Is that in your
  sentences?"
- "Is this line about this endpoint, or would your team decide it once for
  every endpoint?"

## Predicted defects for common gaps

- No line about a missing review → Claude picks a status code itself.
  You find out which one in the diff.
- No line about who may delete → Claude invents an owner check, or lets
  anyone delete. Both are guesses.
- No *Define done* sentence → Claude writes one happy-path test and says
  it is done.
- Team decisions only → the list misses everything this prompt alone
  should say.

## Ready when

Both musts ✅ or 🟡. Then say: "Your list is complete enough. Keep it in
your notes: the closing compares it with what Claude chose. Type `/exit`
and go on with the predictions." Add one "Watch for" line per remaining
gap, phrased as a prediction for the task 2 run.

## Escape hatch

On *just tell me*: give the kinds of decisions they missed (who may
delete, missing review, success answer, delete type, test cases), as
questions, not answers. Never say what the team or the project decided.
