# Task 3 — The security-auditor description

**What they're drafting:** the `description:` field of a custom subagent,
`security-auditor`, that Claude must invoke automatically — on request, and
on new handler or store code — without the participant naming it by hand
every time.

**Slide anchors:** *How Subagents Get Invoked* (the description is the
trigger) · *Which subagent description invokes reliably?* (the A/B vote) ·
*MCP Permissions and Security* (least privilege, restricted tools).

## Technique applicability

**Load-bearing (3):**

- **Names the job** — what the agent checks (OWASP-style vulnerabilities in
  this project's language), not a generic "reviews code."
- **Names the trigger** — the concrete moments Claude should reach for it:
  an explicit ask for a security review, and new or changed handler/store
  code. A description that only says what the agent does, never when, is
  the exercise's own A/B slide — weak side.
- **Matches the tool scope** — the description should not promise anything
  the `tools:` list can't deliver (e.g. "and fixes them" when tools are
  read-only). A mismatch is a defect the debrief will catch immediately.

**Not applicable:**

- **Prompt techniques from Session 2** (Scope it, Define done, and so on)
  — this is a trigger description, not a task prompt. Grading it against
  the Session 2 table teaches the wrong lesson.

## What a strong draft contains

Nudge toward missing elements from this list. Never paste it as a
description.

- A concrete category of check (OWASP Top 10, or the specific risks named
  in the exercise's worked example) — not "security issues" in general
- At least one explicit trigger phrase a user might actually say ("security
  review", "vulnerability check")
- At least one automatic trigger condition tied to a code event (new or
  changed handler/store code) — this is the harder half, and the one most
  drafts skip
- No promise beyond what `tools: Read, Grep, Glob` can do — read and
  report, not fix

## Nudge bank

- "A teammate adds a new store function next week. They never mention
  security — does your description still send Claude to this agent?"
- "Someone asks 'can you check this for vulnerabilities.' Does your
  wording contain a close-enough match?"
- "Your description promises a report. Does it also promise a fix? Check
  your `tools:` line."

## Predicted defects for common gaps

- No code-event trigger → Claude only invokes the agent when asked by
  name or with the exact phrase "security review" — silent on new
  vulnerable code the exercise's own worked example is built to catch
- Generic job description ("reviews code") → inconsistent invocation,
  sometimes firing on unrelated review requests, sometimes not firing on
  real security asks
- A promise beyond tool scope → the report claims it "fixed" something,
  or the participant expects a diff that never comes

## Greenlight bar

All three load-bearing elements present. The worked example in the
exercise doc already shows a full-marks description — coach toward its
shape without revealing it verbatim before the participant has tried.

## After the run

There is no clean-room dispatch for this task — the participant tests the
subagent themselves, in their own session, exactly as the exercise
describes. The debrief is: did it fire on the trigger you coached, and
does the report stay inside the tool scope? `/verify-exercise 5` checks
the artifact itself, by observable state, after the fact.

## Held back

None. Nothing here is withheld from the room — the worked example in the
exercise doc already shows the full description. The coaching value is in
getting participants to explain *why* it works before they paste it.
