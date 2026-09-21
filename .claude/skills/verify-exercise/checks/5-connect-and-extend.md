# Exercise 5 — Connect & Extend

**Under review: observable state, not a prompt.** This is a Session 5
exception to this skill's usual framing, the same kind session 4 uses.
Tasks 1 and 3 are mechanics and delegation, not composed prompts — there is
nothing to grade against a prompting-technique table.

**Collect the evidence yourself. Do not ask the participant to paste
anything.** In Step 0, instead of asking for a prompt, do the four reads in
*Establish ground truth* below. Then ask exactly one question, in one line:
"Did Claude delegate to `security-auditor` without you naming it? (yes/no)".
If a file or a registration is missing, that is itself a finding — say so
and grade what you can from the rest.

**What the participant was asked to produce:**

1. A running, registered `sqlite-bookstore` MCP server.
2. A `security-auditor` subagent at
   `.claude/agents/security-auditor.md` inside the project folder. The
   exercise ships the agent body, `model` and `effort`. The participant
   wrote two frontmatter fields themselves: `description` and `tools`.
3. A security-audit report saved by the main session at
   `docs/security-audit.md` inside the project folder.

This check is language-agnostic — it names files and behaviors, never one
language's paths. Detect the project's language and paths (Go, Kotlin,
Python, or TypeScript) from the working directory at hand.

## Rubric — replaces the Session 2 technique table

| Dimension | Passes when… |
| --- | --- |
| **MCP registration** | `claude mcp list` output (or `.mcp.json`) shows `sqlite-bookstore` registered with `--transport stdio` and a `-db` argument pointing at a real, existing `store.db` path |
| **MCP connection** | a live call works: `get_table_definitions` is in your own tool list and returns the bookstore schema. Fallback when the tools are not in this session: `claude mcp list` reports `sqlite-bookstore` as connected |
| **Subagent file** | `.claude/agents/security-auditor.md` exists in the project folder, with valid YAML frontmatter and both participant fields filled in: `description` and `tools`. `model` and `effort` are shipped; note it if they were removed |
| **Least privilege** | `tools` is `Read, Grep, Glob` or a subset — never a write or shell tool, and never empty |
| **Subagent trigger quality** | the `description` names both a concrete check category (OWASP-style, not generic "security issues") and at least one trigger condition — grade the wording the way `/mcp-coach 3` does: predict one moment it would rightly fire and one it would misfire on |
| **Subagent report** | `docs/security-audit.md` exists with the structure the exercise's agent body asks for: the `**Audited by**: security-auditor` line, files reviewed, per-finding severity, and a summary table |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: predictions before
evidence, one specific expected defect per ❌. State the grade as *N of 6
dimensions sound*.

**Grading the description as a trigger** — same method as `/mcp-coach`:
from the text alone, predict one moment Claude would rightly invoke the
agent and one moment it would misfire or stay silent. Then say which words
cause each. A description with no code-event trigger (only "on request") is
the most common gap — it means new vulnerable code never gets an automatic
look.

## What full-marks artifacts contain

- `-db` present in **both** `claude mcp add` invocations (Step 3 and the
  Round B re-add) — its absence is the exercise's own known drift bug,
  fixed in this version of the doc. If a participant's registration is
  missing it, the server will report "database not found" on every query;
  that is checkable evidence, not a taste call.
- A subagent description with a named check category, an explicit-ask
  trigger, and a code-event trigger. The exercise ships only the weak
  starter "Reviews code for security issues." A file that still holds the
  starter unchanged fails the trigger-quality dimension.
- `tools:` scoped to `Read, Grep, Glob` only — no `Edit`, `Write`, or
  `Bash`. The exercise text says "it can never modify code"; the frontmatter
  is what actually enforces that, not the prose in the agent body.
- A saved report with the `**Audited by**: security-auditor` line and a
  **Summary** table by severity, not just prose findings

## Establish ground truth

1. Read the project's `.claude/agents/security-auditor.md` in full. Check
   the frontmatter keys mechanically — presence and absence are both
   findings.
2. Look for `.mcp.json` in the working directory and in its parent
   (participants register from either). Confirm the `sqlite-bookstore`
   entry's `args` include a `-db` flag with a path that resolves to an
   existing `store.db` inside the participant's project folder. Checking
   that the file exists is allowed. Never open or query `store.db` directly
   — the project's `CLAUDE.md` forbids it.
3. Check your own tool list for the `sqlite-bookstore` tools. If they are
   there, call `get_table_definitions` once. A returned schema confirms
   registration, connection, and the `-db` path together. If they are not
   there, run `claude mcp list` and read the status line. Also tell the
   participant that this session started before the server was registered.
4. Read `docs/security-audit.md` in the project folder. Check it has the
   `**Audited by**: security-auditor` line and lists the files the agent's
   own `## Process` section says to read (the project's handler and store
   directories — detect the exact paths from the language: Go's
   `internal/handler/` and `internal/store/`, Kotlin's
   `src/main/kotlin/bookstore/handler/` and `.../store/`, Python's
   `bookstore/handler/` and `bookstore/store/`, or TypeScript's
   `src/handler/` and `src/store/`) and ends with the severity summary
   table.
5. First check where a missing marker comes from. Open the agent file's
   `## Output format` section. If the `**Audited by**` line is not there,
   the participant's agent file is an old copy of the exercise text. Say
   that, and do not blame the report. If the agent file has the line but
   the saved report has a different structure (other headings, no
   per-finding blocks), the main session rewrote the report. Grade the
   report dimension ⚠️, not ❌, and name the fix: the test prompt must say
   "exactly as it was produced".
6. Combine the marker line with the participant's yes/no answer. Marker
   present and "yes": the trigger fired. Marker missing: the main session
   probably did the audit itself, so the trigger did not fire, whatever the
   answer. Marker present and "no": the agent works, the trigger does not.

## Known traps

- **Missing `-db`** — the fixed bug from this doc's own history. If it
  recurs in a participant's command, every query in Round B and task 3's
  audit will fail identically: "database not found." One flag, one root
  cause — say so plainly.
- **Generic description** ("Reviews code for security issues") — passed
  the file-exists check but fails the trigger-quality dimension. This is
  the exercise's own A/B slide, now graded for real.
- **Tools beyond read-only** — `Edit`, `Write` or `Bash` in the `tools:` list
  breaks the "must never modify code" rule in the exercise text. Flag as a
  correctness defect, not a style note. The most likely cause: the
  participant added `Write` so the agent could save the report itself. The
  main session saves the report. The agent stays read-only.
- **Empty or missing fields** — an empty `tools:` line is not read-only. The
  agent then inherits every tool of the main session. Say so plainly.
- **Starter description unchanged** — "Reviews code for security issues."
  is the weak side of the exercise's A/B slide. It names no trigger.
- **Report without the Summary table** — findings present but no severity
  count at the end; the exercise's own template asks for it explicitly.
- **Report rewritten by the main session** — the saved file has its own
  headings and no `**Audited by**` line. The subagent may have run, but the
  file no longer proves it. The participant left "exactly as it was
  produced" out of the test prompt.
- **No report file** — the audit ran but nothing was saved. The participant
  left the "save the report to" clause out of the test prompt. Ask them to
  re-run it; do not grade a report from the conversation instead.
- **Subagent never fired** — the participant had to ask by name every
  time. Not a failure by itself, but it means the trigger dimension gets a
  ❌ regardless of how well-written the prose sounds, because the evidence
  says it does not act as a trigger.
- **Got away with it** — a real security report despite a weak trigger,
  because the participant asked directly. Say plainly that automatic
  invocation was never tested, so nothing here confirms the trigger works.

## Pass bar

- `sqlite-bookstore` registered with `-db` and confirmed connected with
  both tools
- The subagent file exists with both fields filled in and read-only
  tools
- `docs/security-audit.md` exists with the structure the agent body
  specifies

*Partial* is a normal first-attempt outcome — usually the trigger-quality
dimension is the one that slips, since it is the only one that takes
judgment rather than mechanics. Show the exact clause that would fix it and
let the participant revise.

## Held back

The full-marks `description` and `tools`. The exercise ships only the weak
starter and an empty `tools:` line, so never paste this. Name the missing *elements* instead.

```yaml
description: >
  Audits <language> source code for OWASP Top 10 security vulnerabilities.
  Invoke this agent whenever the user asks for a security review,
  vulnerability check, or when new handlers or store functions are added.
tools: Read, Grep, Glob
```
