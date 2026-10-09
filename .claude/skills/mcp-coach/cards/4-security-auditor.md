# Task 4 — The security-auditor description

**What they're drafting:** the `description:` field of a custom subagent,
`security-auditor`, that Claude must invoke automatically — on request, and
on new handler or store code — without the participant naming it by hand
every time. They also choose `tools` themselves. `model: haiku` and the
agent body are shipped with the starter file; do not grade them.

**Where the draft lives:** `.claude/agents/security-auditor.md` in the
project folder. Read the frontmatter from there. The sheet ships a starter
file with `description: (I write this)` and `tools: (I write this)`; the
participant replaces both values. A field that still says `(I write this)`
is empty: say so in one line and wait.

**The sheet's words** (use these, never the trainer shorthand): the
description is "the trigger"; "when Claude should use it: what a user
might ask for, and which code change should start it"; `tools` is "what
the agent may use"; the test in step 3 is "test the trigger"; the agent
"starts by itself" or "did not start". Do not say "fire", "arm",
"auto-invoke" or "Round A/B".

**Slide anchors:** *How Agents Get Invoked* (the description is the
trigger) · *Which Subagent Description Invokes Reliably?* (the A/B vote) ·
*An Agent File Encodes a Task* (the frontmatter fields, the
`tools: Read, Grep, Glob` example) · *Ad Hoc Subagent vs. Agent File*
(`tools` is enforced, so least privilege is not a request).

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
  in the agent body the exercise ships) — not "security issues" in general
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

- No code-event trigger → Claude starts the agent only when you ask by
  name or say "security review". When a teammate adds vulnerable code,
  Claude stays silent. That is the moment this agent exists for.
- Generic job description ("reviews code") → Claude sometimes starts the
  agent on an unrelated review request, and sometimes does not start it on
  a real security request.
- A promise beyond the tools → the report says it fixed something, or you
  expect a diff that never comes.

## Greenlight bar

All three load-bearing elements present, and no write or shell tool in
`tools:`. A `tools: (I write this)` line or an empty `tools:` line is a
defect. The agent then fails to load, or gets every tool of the main
session.

## After the run

There is no clean-room dispatch for this task — the participant tests the
subagent themselves, in their own session, exactly as the exercise
describes. The debrief has two questions. Did the agent start on the
trigger you coached? Does the report stay inside the tool scope? `/verify-exercise 5` checks
the artifact itself, by observable state, after the fact.

## Held back

The full-marks description. The exercise ships only the weak starter, so
never reveal this, even in part:

> Audits <language> source code for OWASP Top 10 security vulnerabilities.
> Invoke this agent whenever the user asks for a security review,
> vulnerability check, or when new handlers or store functions are added.
