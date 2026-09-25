# Exercise 5 — An MCP Server and a Subagent

**Under review: observable state, not a prompt.** This is a Session 5
exception to this skill's usual framing, the same kind session 4 uses.
Tasks 1, 2 and 4 are mechanics and delegation, not composed prompts — there
is nothing to grade against a prompting-technique table.

**Collect the evidence yourself. Do not ask the participant to paste
anything.** In Step 0, instead of asking for a prompt, do the reads in
*Establish ground truth* below. Then ask exactly one question, in one line:
"Did Claude start `security-auditor` by itself, without you naming it?
(yes/no)". If a file or a registration is missing, that is itself a
finding — say so and grade what you can from the rest.

**The sheet's words** (use these in the report): "round one" (task 1,
without the server) and "round two" (task 3, with the server); the
description is "the trigger"; the agent "starts by itself" or "did not
start"; `tools` is "what the agent may use"; the file the participant
finished is "the starter file". Never say "Round A/B", "fire", "arm" or
"bait".

**What the participant was asked to produce:**

1. A `permissions.deny` rule `Bash(sqlite3 *)` in `.claude/settings.json`
   in the project folder (task 1).
2. A registered, approved and connected `sqlite-bookstore` MCP server
   (task 2): `.mcp.json` with the server, started with
   `uv run mcp-sqlite/server.py store.db` (or `python3` / `python` in
   place of `uv run`).
3. A `security-auditor` subagent at `.claude/agents/security-auditor.md`
   inside the project folder (task 4). The starter file ships the agent
   body and `model: haiku`. The participant replaced two `(I write this)`
   values: `description` and `tools`.
4. A security-audit report saved by the main session at
   `docs/security-audit.md` inside the project folder.

This check is language-agnostic — it names files and behaviors, never one
language's paths. Detect the project's language and paths (Go, Kotlin,
Python, or TypeScript) from the working directory at hand.

## Rubric — replaces the Session 2 technique table

| Dimension | Passes when… |
| --- | --- |
| **Deny rule** | `.claude/settings.json` in the project folder has `Bash(sqlite3 *)` under `permissions.deny`, and the session 4 `hooks` entry is still there |
| **MCP registration** | `.mcp.json` (project folder, or its parent) has `sqlite-bookstore` with `"type": "stdio"`, a command that runs `server.py` from `mcp-sqlite`, and a last argument that resolves to an existing `store.db` in the project folder |
| **MCP approval** | the server is not in `disabledMcpjsonServers` in `.claude/settings.local.json` (project folder or its parent); `enabledMcpjsonServers` lists it, or `/mcp` output the participant reports shows it connected |
| **MCP connection** | a live call works: `get_table_definitions` is in your own tool list and returns the bookstore schema. Fallback when the tools are not in this session: `claude mcp list` reports `sqlite-bookstore` as connected |
| **Subagent file** | `.claude/agents/security-auditor.md` exists in the project folder, with valid YAML frontmatter, `model: haiku`, and neither `description` nor `tools` still says `(I write this)` |
| **Least privilege** | `tools` is `Read, Grep, Glob` or a subset — never a write or shell tool, and never empty |
| **Subagent trigger quality** | the `description` names both a concrete check category (OWASP-style, not generic "security issues") and at least one trigger condition — grade the wording the way `/mcp-coach 4` does: predict one moment Claude would rightly start the agent and one it would misfire on |
| **Subagent report** | `docs/security-audit.md` exists with the structure the starter body asks for: the `**Audited by**: security-auditor` line, files reviewed, per-finding severity, and a summary table |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: predictions before
evidence, one specific expected defect per ❌. State the grade as *N of 8
dimensions sound*.

**Grading the description as a trigger** — same method as `/mcp-coach`:
from the text alone, predict one moment Claude would rightly start the
agent and one moment it would misfire or stay silent. Then say which words
cause each. A description with no code-event trigger (only "on request") is
the most common gap — it means new vulnerable code never gets an automatic
look.

## What full-marks artifacts contain

- `.mcp.json` written by `claude mcp add --scope project`: the command is
  `uv` with args `run mcp-sqlite/server.py store.db` (`run --script ...`
  is also fine), or
  `python3` / `python` with args `mcp-sqlite/server.py store.db`. The
  db argument is the last one. `store.db` exists in the project folder.
  A missing `store.db` makes every tool call return "database not found";
  that is checkable evidence, not a taste call.
- The approval answered yes: `sqlite-bookstore` in `enabledMcpjsonServers`,
  not in `disabledMcpjsonServers`. A rejected server shows in `/mcp` as
  disabled; the rescue is `claude mcp reset-project-choices` and a fresh
  session.
- A subagent description with a named check category, an explicit-ask
  trigger, and a code-event trigger. The sheet shows only the weak version
  "Reviews code for security issues." A file that holds that text, or
  still `(I write this)`, fails the trigger-quality dimension.
- `tools:` scoped to `Read, Grep, Glob` only — no `Edit`, `Write`, or
  `Bash`. The sheet says "the agent must never change code"; the
  frontmatter is what enforces that, not the prose in the agent body.
- A saved report with the `**Audited by**: security-auditor` line and a
  **Summary** table by severity, not just prose findings.

## Establish ground truth

1. Read `.claude/settings.json` in the project folder. Look for
   `permissions.deny` with `Bash(sqlite3 *)`. Presence and absence are
   both findings. Note whether the `hooks` block from session 4 survived.
2. Read the project's `.claude/agents/security-auditor.md` in full. Check
   the frontmatter keys mechanically: `name`, `description`, `tools`,
   `model`. A value that still reads `(I write this)` is an empty field.
3. Look for `.mcp.json` in the working directory and in its parent
   (participants register from the project folder, but the file can land
   at the repository root). Confirm the `sqlite-bookstore` entry's command
   runs `server.py` and that its last argument resolves to an existing
   `store.db` inside the participant's project folder. Checking that the
   file exists is allowed. Never open or query `store.db` directly — the
   project's `CLAUDE.md` forbids it.
4. Look for `.claude/settings.local.json` in the same two places. Report
   which list holds `sqlite-bookstore`, if any.
5. Check your own tool list for the `sqlite-bookstore` tools. If they are
   there, call `get_table_definitions` once. A returned schema confirms
   registration, approval, connection, and the db path together. If they
   are not there, run `claude mcp list` and read the status line. Also
   tell the participant that this session started before the server was
   registered, or before the approval.
6. Read `docs/security-audit.md` in the project folder. Check it has the
   `**Audited by**: security-auditor` line and lists the files the agent's
   own `## Process` section says to read (the project's handler and store
   directories — detect the exact paths from the language: Go's
   `internal/handler/` and `internal/store/`, Kotlin's
   `src/main/kotlin/bookstore/handler/` and `.../store/`, Python's
   `bookstore/handler/` and `bookstore/store/`, or TypeScript's
   `src/handler/` and `src/store/`) and ends with the severity summary
   table.
7. First check where a missing marker comes from. Open the agent file's
   `## Output format` section. If the `**Audited by**` line is not there,
   the participant's agent file is not the shipped starter. Say that, and
   do not blame the report. If the agent file has the line but the saved
   report has a different structure (other headings, no per-finding
   blocks), the main session rewrote the report. Grade the report
   dimension ⚠️, not ❌, and name the fix: the test prompt must say
   "exactly as it was produced".
8. Combine the marker line with the participant's yes/no answer. Marker
   present and "yes": the trigger worked. Marker missing: the main session
   probably did the check itself, so the trigger did not work, whatever
   the answer. Marker present and "no": the agent works, the trigger does
   not; the participant most likely added "use the security-auditor
   agent" to the prompt, as the sheet allows after two tries.

## Known traps

- **`store.db` missing or in another folder** — every tool call returns
  "database not found". One cause, one fix: start the app once in the
  project folder, then a fresh session. Say so plainly.
- **Server rejected at the approval prompt** — `/mcp` shows it disabled;
  `disabledMcpjsonServers` holds it. Not a wording problem: name the
  rescue command, `claude mcp reset-project-choices`, and a fresh session.
- **Deny rule missing or in the wrong file** — the rule belongs in
  `.claude/settings.json` in the project folder. A rule in
  `settings.local.json` also works; say it works and where it is.
- **Hook lost** — the deny-rule prompt asked Claude to keep everything
  else in `settings.json`. If the `hooks` block is gone, say so; session 4's
  chain no longer runs.
- **Generic description** ("Reviews code for security issues") — passed
  the file-exists check but fails the trigger-quality dimension. This is
  the exercise's own A/B slide, now graded for real.
- **Tools beyond read-only** — `Edit`, `Write` or `Bash` in the `tools:` list
  breaks the "must never change code" rule in the exercise text. Flag as
  a correctness defect, not a style note. The most likely cause: the
  participant added `Write` so the agent could save the report itself. The
  main session saves the report. The agent stays read-only.
- **`(I write this)` left in place** — `tools: (I write this)` is not a
  tool list; the agent may fail to load. An empty `tools:` line is not
  read-only either: the agent then inherits every tool of the main
  session. Say so plainly.
- **Report without the Summary table** — findings present but no severity
  count at the end; the starter body asks for it explicitly.
- **Report rewritten by the main session** — the saved file has its own
  headings and no `**Audited by**` line. The subagent may have run, but the
  file no longer proves it. The participant left "exactly as it was
  produced" out of the test prompt.
- **No report file** — the check ran but nothing was saved. The participant
  left the "save the report to" clause out of the test prompt. Ask them to
  re-run it; do not grade a report from the conversation instead.
- **Agent never started by itself** — the participant had to ask by name.
  Not a failure by itself, but it means the trigger dimension gets a ❌
  regardless of how well-written the prose sounds, because the evidence
  says it does not act as a trigger.
- **Got away with it** — a real security report despite a weak trigger,
  because the participant asked directly. Say plainly that the automatic
  start was never tested, so nothing here confirms the trigger works.

## Pass bar

- The deny rule is in place and the session 4 hook survived
- `sqlite-bookstore` registered, approved and confirmed connected with
  both tools
- The subagent file exists with both values replaced and read-only tools
- `docs/security-audit.md` exists with the structure the starter body
  specifies

*Partial* is a normal first-attempt outcome — usually the trigger-quality
dimension is the one that slips, since it is the only one that takes
judgment rather than mechanics. Show the exact clause that would fix it and
let the participant revise.

## Held back

The full-marks `description` and `tools`. The sheet shows only the weak
version and `(I write this)`, so never paste this. Name the missing
*elements* instead.

```yaml
description: >
  Audits <language> source code for OWASP Top 10 security vulnerabilities.
  Invoke this agent whenever the user asks for a security review,
  vulnerability check, or when new handlers or store functions are added.
tools: Read, Grep, Glob
```
