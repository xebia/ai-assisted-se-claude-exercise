---
name: verify-exercise
description: >-
  Grade the prompt you used for a course exercise, using the real code as
  evidence. Usage: /verify-exercise <exercise number>
disable-model-invocation: true
---

# Verify exercise — grade the prompt, use the code as evidence

**The prompt is what's under review.** The artifact the participant produced is
evidence about the prompt, not the thing being graded. A weak prompt that
happened to produce a decent file still gets a weak grade — and the participant
needs to hear exactly that, because next time the luck runs out.

The learning goal of this course block is prompting skill, not working code.
Someone who ends with a flawed artifact and an accurate account of which clause
caused each flaw has learned more than someone with a clean artifact they can't
explain.

## Non-negotiables

- **Read and report. Never repair.** Don't edit their artifact, don't fix the
  code, don't rewrite their prompt for them. Show the smallest edit that would
  have changed the outcome and let them make it.
- **Grade the prompt before you open the artifact.** Otherwise you reverse-
  engineer the grade from the output, which is the failure mode this skill
  exists to avoid. Commit to predictions first, then test them.
- **Verify against the code, never from memory.** Every claim you confirm or
  reject must come from a file you opened in this session. A verification you
  guessed teaches them to trust unverified output — the exact habit the exercise
  is designed to break.
- **Name luck as luck.** When a missing technique didn't cause a defect, say so
  explicitly and say why it's still missing. This is the most valuable finding
  you can produce and the easiest one to skip.
- **Never show the model prompt.** Check files record what a full-marks prompt
  contains. Name the missing *elements*; don't paste a prompt they can copy.
- **Don't hand out held-back answers.** Some exercises pose an open question to
  the room. If the check file marks it held back, answer only if asked directly.

## Step 0 — Inputs

Exercise-specific expectations live in `checks/<id>-<slug>.md` beside this file.

1. `$ARGUMENTS` holds the exercise identifier as typed. Load the matching check
   file and read it fully. If no argument was given, list the available checks by
   title and ask which one — one short question, no preamble.
2. **Ask for the prompt they used, verbatim.** You cannot run this skill without
   it. Ask in one line and wait. Don't reconstruct it from conversation history
   even if you could: retyping their own prompt is part of the exercise.
   Exception: a check file may put something else under review — a context
   file, a configuration — and say so at the top. Then ask for *that*,
   verbatim, instead of a prompt.
3. Locate the artifact named in the check file. If it doesn't exist, say so and
   stop — don't verify a different file instead.

## Phase 1 — Grade the prompt

Do this **before reading the artifact.** Work through the techniques the
participants were taught. The check file says which are applicable to this task;
respect it — marking an inapplicable technique as "missing" is a false finding.
If the check file supplies its own rubric (later blocks grade context files
against the four dimensions rather than prompting techniques), use that rubric
in place of the table below — everything else in this phase still applies:
predictions first, one expected defect per ❌, a stated grade.

| Technique | Present when the prompt… |
| --- | --- |
| **CONTEXT** | states the stack, the domain, or where to start |
| **TASK** | names an outcome, not a topic |
| **FORMAT** | specifies the shape of the output |
| **Scope it** | names a file, package, endpoint, or flow |
| **Constrain it** | sets a boundary on what may change or be added |
| **Direct it** | prescribes a *method*, not just a goal |
| **Define done** | makes complete-vs-partial distinguishable |
| **Role framing** | shapes output for a specific reader |
| **Examples** | points at an existing pattern to follow |
| **`@file` reference** | hands over a file instead of making it search |
| **Extended thinking** | asks for reasoning where reasoning is needed |

For each: **✅ present** (and what it bought), **❌ missing** (and what you expect
that to cost), or **— n/a** (and why, per the check file).

Then commit to predictions. For each ❌, name the *specific* defect you expect to
find — "hops will be uncited", "package lines will be guessable from the package
names", "it will have described a service layer that isn't there". Vague
predictions can't be tested, which defeats the purpose.

State the grade as a count of applicable techniques, e.g. *4 of 6 present*.

## Phase 2 — Test the predictions against the code

Now open the artifact and the repo. Establish ground truth the way the check file
describes, then sort each factual claim in the artifact:

- **✅ Confirmed** — you opened the cited location and it says what they claim.
- **❌ Wrong** — the citation doesn't resolve, or contradicts the claim. Includes
  invented files, invented layers, responsibilities that don't match the code.
- **⚠️ Unverifiable** — plausibly true, nothing to check it against: no citation,
  a whole-package hand-wave, a claim about the codebase in general.

Rules that keep this honest:

- **An uncited claim is ⚠️, never ✅** — even if you know it's right. The missing
  citation *is* the finding, and it maps straight to FORMAT or Define done.
- **Line drift is not an error.** Within a few lines, count ✅ and say nothing.
  Right file but far-off line or wrong function is ❌ — usually a fabricated
  number produced to satisfy the format.
- **Check the check file's known traps explicitly**, even if the artifact never
  mentions them. Omissions are findings.
- **Sample the costly claims** when the artifact is long: entry point, layer
  boundaries, anything about where data is written.

Then reconcile each prediction into one of three buckets — this is the payload of
the whole skill:

- **Confirmed** — predicted defect, found it. The prompt gap caused it.
- **Got away with it** — predicted defect, didn't happen. Claude volunteered
  what the prompt didn't ask for. Say plainly that this is not reproducible.
- **Missed** — a defect you didn't predict. Say which technique would have
  prevented it and note that your Phase 1 grade was too generous.

## Report format

Keep the whole thing under ~25 lines. Participants have minutes.

```
## Exercise <id> — <title>

### Prompt grade: <N> of <M> applicable techniques

✅ <technique> — <what it bought you>
❌ <technique> — <what you expected it to cost>
— <technique> — n/a here: <why>

### Evidence from the code

<x> ✅ confirmed · <y> ❌ wrong · <z> ⚠️ unverifiable

**Confirmed prediction:** <defect> — "<their claim>" vs `<file:line>`
**Got away with it:** <missing technique> — no defect this run, and no reason to
expect that again
**Missed:** <defect you didn't predict> — <technique>; the grade above was
generous

### Smallest fix

Add "<one clause>" — that alone addresses <N> of the <M> findings.
```

If the prompt is genuinely strong, say so and name which clause did the work.
Don't manufacture findings to look rigorous — and don't soften a weak grade
either. *"3 of your 8 citations don't resolve"* is checkable in thirty seconds
and lands harder than any rubric.

Close by offering the retry: they add the clause, re-run their own prompt,
compare. Don't run it for them.

## Adding a new exercise

Copy `checks/TEMPLATE.md` to `checks/<id>-<slug>.md`. The dispatcher discovers
check files by listing the directory, so this file never changes.
