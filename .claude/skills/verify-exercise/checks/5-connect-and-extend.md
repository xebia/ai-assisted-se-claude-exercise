# Exercise 5 — Connect & Extend

**Under review: observable state, not a prompt.** This is a Session 5
exception to this skill's usual framing, the same kind session 4 uses.
Tasks 1 and 3 are mechanics and delegation, not composed prompts — there is
nothing to grade against a prompting-technique table. In Step 0, instead of
a prompt, ask for: the exact output of `claude mcp list`, and (if they have
it) the transcript excerpt where `/mcp` reported `sqlite-bookstore`
connected. For task 3, ask for the final `description:` field they shipped
and the transcript excerpt where Claude decided to delegate (or was asked
to explicitly). If any of these is missing, that is itself a finding — say
so and grade what you can from the files.

**What the participant was asked to produce:**

1. A running, registered `sqlite-bookstore` MCP server, confirmed connected
   with `/mcp`.
2. A `security-auditor` subagent at
   `.claude/agents/security-auditor.md` inside the project folder, invoked
   either automatically or explicitly, that produced a security-audit
   report.

This check is language-agnostic — it names files and behaviors, never one
language's paths. Detect the project's language and paths (Go, Kotlin,
Python, or TypeScript) from the working directory at hand.

## Rubric — replaces the Session 2 technique table

| Dimension | Passes when… |
| --- | --- |
| **MCP registration** | `claude mcp list` output (or `.mcp.json`) shows `sqlite-bookstore` registered with `--transport stdio` and a `-db` argument pointing at a real, existing `store.db` path |
| **MCP connection** | the participant's pasted `/mcp` output (or a tool-call in their transcript) shows `sqlite-bookstore` connected with both `get_table_definitions` and `execute_query` listed |
| **Subagent file** | `.claude/agents/security-auditor.md` exists in the project folder, with valid YAML frontmatter: `name`, `description`, `tools: Read, Grep, Glob` (or a subset — never a write or shell tool), `model` |
| **Subagent trigger quality** | the `description` names both a concrete check category (OWASP-style, not generic "security issues") and at least one trigger condition — grade the wording the way `/mcp-coach 3` does: predict one moment it would rightly fire and one it would misfire on |
| **Subagent report** | a security-audit report exists (pasted or in the transcript) with the structure the exercise's example asks for: files reviewed, per-finding severity, and a summary table |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: predictions before
evidence, one specific expected defect per ❌. State the grade as *N of 5
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
  trigger, and a code-event trigger — the exercise's own worked example is
  full marks; participants who paste it unmodified still pass, but note
  they skipped writing their own trigger clause.
- `tools:` scoped to `Read, Grep, Glob` only — no `Edit`, `Write`, or
  `Bash`. The exercise text says "it can never modify code"; the frontmatter
  is what actually enforces that, not the prose in the agent body.
- A report with a **Summary** table by severity, not just prose findings

## Establish ground truth

1. Read the project's `.claude/agents/security-auditor.md` in full. Check
   the frontmatter keys mechanically — presence and absence are both
   findings.
2. If `.mcp.json` exists at the repo root, read it and confirm the
   `sqlite-bookstore` entry's `args` include a `-db` flag with a path that
   resolves to an existing `store.db` inside the participant's project
   folder.
3. Read the pasted `claude mcp list` / `/mcp` output. A connected status
   with both tool names is confirmable; an error line is a finding, not a
   pass.
4. Read the pasted security-audit report. Check it lists the files the
   agent's own `## Process` section says to read (the project's handler and
   store directories — detect the exact paths from the language: Go's
   `internal/handler/` and `internal/store/`, Kotlin's
   `src/main/kotlin/bookstore/handler/` and `.../store/`, Python's
   `bookstore/handler/` and `bookstore/store/`, or TypeScript's
   `src/handler/` and `src/store/`) and ends with the severity summary
   table.

## Known traps

- **Missing `-db`** — the fixed bug from this doc's own history. If it
  recurs in a participant's command, every query in Round B and task 3's
  audit will fail identically: "database not found." One flag, one root
  cause — say so plainly.
- **Generic description** ("Reviews code for security issues") — passed
  the file-exists check but fails the trigger-quality dimension. This is
  the exercise's own A/B slide, now graded for real.
- **Tools beyond read-only** — `Edit` or `Bash` in the `tools:` list breaks
  the "can never modify code" claim in the exercise text. Flag as a
  correctness defect, not a style note.
- **Report without the Summary table** — findings present but no severity
  count at the end; the exercise's own template asks for it explicitly.
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
- The subagent file exists with correct frontmatter and read-only tools
- A security-audit report exists with the structure the exercise example
  specifies

*Partial* is a normal first-attempt outcome — usually the trigger-quality
dimension is the one that slips, since it is the only one that takes
judgment rather than mechanics. Show the exact clause that would fix it and
let the participant revise.

## Held back

None — task 3's worked example already ships the full description in the
exercise doc itself. There is no open question to withhold here.
