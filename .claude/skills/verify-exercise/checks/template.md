# Exercise <id> — <short title>

**Artifact:** `<path the participant produces, or "the test run" / "the diff">`

**What the participant was asked to produce.** Restate the deliverable as
they received it — the *outcome*, never the prompt. Note any list of
techniques they were pointed at.

## Technique applicability

**Load-bearing (N) — the grade is out of these:** <the techniques that decide
whether this task's output can be checked>

**Optional polish — mention but don't count against them:** <techniques that
help but are not decisive here>

**Not applicable:** for each, one line on *why* — read-only task, no pattern
to point at yet, reasoning not required. Getting this list right matters.
Marking an inapplicable technique as missing is a false finding, and false
findings cost the skill its credibility faster than anything else.

## What a full-marks prompt contains

The elements a strong prompt for this task includes, as a checklist. **Never
paste this as a prompt.** The skill names missing elements; it does not hand
over copy-paste material.

Say which element is the most valuable and least often written. That is the
sentence the participant remembers.

## Establish ground truth

How to work out the correct answer **from the code**, after grading the
prompt and before trusting the artifact. Be specific about which files to
open in what order. If it requires running something (tests, the server),
say so.

## Known traps

The specific ways this task goes wrong, each with what to look for and why
it happens. The *why* is what connects a defect to a prompting technique.
Prefer traps that are:

- **mechanically checkable** — a citation that does not resolve is better
  than a judgement about clarity, and
- **caused by a prompt gap** rather than by bad luck.

Include traps the artifact may not mention at all. Omissions are findings.

Write each trap in the register of *How you talk to the participant* in
`SKILL.md`: actor plus consequence, plain words, no idioms. The model
paraphrases these lines almost word for word into the report.

## Pass bar

Three to five concrete conditions for done. State plainly whether *partial*
is the expected first-attempt outcome. For most of these it is, and saying so
keeps the report honest instead of discouraging.

## Held back

Any question this exercise poses to the room that the skill must **not**
answer unprompted, with the intended answer recorded for when someone asks
directly. Delete this section if the exercise has no open question.
