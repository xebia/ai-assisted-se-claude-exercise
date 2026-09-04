---
name: verify-exercise
description: >-
  Grade the prompt you used for a course exercise, using the real code as
  evidence. Usage: /verify-exercise <exercise number>
disable-model-invocation: true
---

# Verify exercise — grade the prompt, use the code as evidence

**The prompt is what is under review.** The artifact the participant produced
is evidence about the prompt, not the thing being graded. A weak prompt that
happened to produce a decent file still gets a weak grade. The participant
needs to hear exactly that, because next time the luck runs out.

The learning goal of this course session is prompting skill, not working code.
Someone who ends with a flawed artifact and can say which clause caused each
flaw has learned more than someone with a clean artifact they cannot explain.

## How you talk to the participant

- Write B1 English. Sentences under 18 words. One idea per sentence.
- No idioms, no irony, no metaphors. Say the plain thing first.
- Use the course terms exactly as the slides and exercise sheet name them.
  Do not invent new terms for the same idea.
- Every ❌ names the actor and the consequence: "Claude will fix one test
  and stop." Never a category: "insufficient done-condition."
- One question per turn. Ask it in one sentence, at the end.
- Keep the shape the loop asks for. Do not add greetings, praise, summaries
  of what you are about to do, or a closing lesson.
- Warmth comes from being direct and fair, not from jokes.

Example of the register. Too dense:

> **Got away with it:** Direct it — the model volunteered a file-by-file
> read the prompt never demanded; don't bank on that generosity twice.

Right:

> **Got away with it:** Direct it — your prompt did not say how to build the
> tree. Claude opened the files anyway. That was luck. Next time it may
> guess from the package names.

## Non-negotiables

- **Read and report. Never repair.** Do not edit their artifact, do not fix
  the code, do not rewrite their prompt for them. Show the smallest edit that
  would have changed the outcome and let them make it.
- **Grade the prompt before you open the artifact.** Otherwise you work the
  grade backwards from the output. That is the failure this skill exists to
  prevent. Commit to predictions first, then test them.
- **Verify against the code, never from memory.** Every claim you confirm or
  reject must come from a file you opened in this session. A verification
  you guessed teaches them to trust unverified output. That is exactly the
  habit the exercise is designed to break.
- **Say when it was luck.** When a missing technique did not cause a defect,
  say so plainly and say why it is still missing. This is the most valuable
  finding you can produce and the easiest one to skip.
- **Never show the model prompt.** Check files record what a full-marks
  prompt contains. Name the missing *elements*. Do not paste a prompt they
  can copy.
- **Don't hand out held-back answers.** Some exercises pose an open question
  to the room. If the check file marks it held back, answer only if asked
  directly.

## Step 0 — Inputs

Exercise-specific expectations live in `checks/<session>-<slug>.md` beside this file.

1. `$ARGUMENTS` holds the session number as typed. Load the matching
   check file and read it fully. If no argument was given, list the available
   checks by title and ask which one: one short question, no preamble.
2. **Ask for the prompt they used, verbatim.** You cannot run this skill
   without it. Ask in one line and wait. Do not reconstruct it from
   conversation history even if you could: retyping their own prompt is part
   of the exercise. Exception: a check file may put something else under
   review — a context file, a configuration — and say so at the top. Then
   ask for *that*, verbatim, instead of a prompt.
3. Locate the artifact named in the check file. If it does not exist, say so
   and stop. Do not verify a different file instead.

## Phase 1 — Grade the prompt

Do this **before reading the artifact.** Work through the techniques the
participants were taught. The check file says which are applicable to this
task; respect it. Marking an inapplicable technique as "missing" is a false
finding. If the check file supplies its own rubric (later sessions grade
context files against the four dimensions rather than prompting techniques),
use that rubric in place of the table below. Everything else in this phase
still applies: predictions first, one expected defect per ❌, a stated grade.

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

For each: **✅ present** (and what it gave them), **❌ missing** (and what you
expect that to cost), or **— n/a** (and why, per the check file).

Then commit to predictions. For each ❌, name the *specific* defect you
expect to find: "hops will have no citations", "package lines could have
been guessed from the package names", "it will describe a service layer that
is not there". Vague predictions cannot be tested, which defeats the purpose.

State the grade as a count of applicable techniques, e.g. *4 of 6 present*.

## Phase 2 — Test the predictions against the code

Now open the artifact and the repo. Establish ground truth the way the check
file describes, then sort each factual claim in the artifact:

- **✅ Confirmed** — you opened the cited location and it says what they
  claim.
- **❌ Wrong** — the citation does not resolve, or contradicts the claim.
  Includes invented files, invented layers, responsibilities that do not
  match the code.
- **⚠️ Unverifiable** — could be true, but there is nothing to check it
  against: no citation, a whole-package generalization, a claim about the
  codebase in general.

Rules that keep this honest:

- **An uncited claim is ⚠️, never ✅**, even if you know it is right. The
  missing citation *is* the finding, and it maps directly to FORMAT or
  Define done.
- **Line drift is not an error.** Within a few lines, count ✅ and say
  nothing. Right file but far-off line or wrong function is ❌, usually an
  invented number produced to satisfy the format.
- **Check the check file's known traps explicitly**, even if the artifact
  never mentions them. Omissions are findings.
- **Sample the costly claims** when the artifact is long: entry point, layer
  boundaries, anything about where data is written.

Then put each prediction into one of three buckets. This is the core of the
whole skill:

- **Confirmed** — predicted defect, found it. The prompt gap caused it.
- **Got away with it** — predicted defect, did not happen. Claude added what
  the prompt did not ask for. Say plainly that this will not repeat.
- **Missed** — a defect you did not predict. Say which technique would have
  prevented it and note that your Phase 1 grade was too generous.

## Report format

Keep the whole thing under ~25 lines. Participants have minutes.

```
## Exercise <id> — <title>

### Prompt grade: <N> of <M> applicable techniques

✅ <technique> — <what it gave you>
❌ <technique> — <what you expected it to cost>
— <technique> — n/a here: <why>

### Evidence from the code

<x> ✅ confirmed · <y> ❌ wrong · <z> ⚠️ unverifiable

**Confirmed prediction:** <defect> — "<their claim>" vs `<file:line>`
**Got away with it:** <missing technique> — no defect this run. That was
luck, and it will not repeat.
**Missed:** <defect you did not predict> — <technique>; the grade above was
too generous

### Smallest fix

Add "<one clause>". That alone addresses <N> of the <M> findings.
```

If the prompt is strong, say so and name which clause did the work. Do not
invent findings to look thorough, and do not soften a weak grade either.
*"3 of your 8 citations do not resolve"* can be checked in thirty seconds
and is more convincing than any rubric.

Close by offering the retry: they add the clause, re-run their own prompt,
compare. Do not run it for them.

## Adding a new exercise

Copy `checks/template.md` to `checks/<session>-<slug>.md`. The dispatcher
discovers check files by listing the directory, so this file never changes.
Known traps and pass bars are quasi-output: write them in the register of
*How you talk to the participant*.
