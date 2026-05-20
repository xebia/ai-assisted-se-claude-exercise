# Exercise 6: Connect & Extend

**Block**: 6 — MCP Servers & External Tools **Duration**: 30 minutes
**Project**: Same BookStore API.

**Goal**: Build a custom SQLite MCP server that exposes the bookstore database
to Claude, wire it up, and create a security-auditor subagent. Then compare AI
responses with and without each extension loaded.

---

## Tasks

### 1. Build the SQLite MCP Server (8 min)

The bookstore uses a SQLite database (`store.db`). Without MCP, Claude has to
guess column names. With MCP, it can query the schema and run real SQL. The
server lives at `mcp-sqlite/main.go` (sibling of `bookstore-py/`) and exposes
two tools:

- `get_table_definitions` — returns `CREATE TABLE` statements and column info
- `execute_query` — executes a read-only `SELECT` query and returns JSON rows

**Step 1** — Make sure the bookstore database exists. From the project root,
start the bookstore server once (it seeds on first run):

```bash
cd bookstore-py && python3 main.py &
# wait ~2 seconds, then stop it — we just need store.db to exist
kill %1
cd ..
```

Verify the file exists:

```bash
ls -lh bookstore-py/store.db
```

**Step 2** — Compile the MCP server to a binary:

```bash
cd mcp-sqlite && go build -o ../mcp-sqlite-server . && cd ..
```

This produces `mcp-sqlite-server` in the project root. Confirm it compiled:

```bash
./mcp-sqlite-server --help
```

You should see the `-db` flag printed. If so, the server is working.

**Step 3** — Register the server with Claude Code (project scope). Use the
absolute path so Claude Code can find the binary regardless of working
directory, and point it at the Python store:

```bash
claude mcp add \
  --transport stdio \
  --scope project \
  sqlite-bookstore \
  -- $(realpath mcp-sqlite-server) -db $(realpath bookstore-py/store.db)
```

**Step 4** — Verify the server is registered:

```bash
claude mcp list
```

You should see `sqlite-bookstore` in the list. Inside an active Claude Code
session, type `/mcp` to confirm it shows as connected and lists both tools:
`get_table_definitions` and `execute_query`.

---

### 2. Compare AI Responses: Without vs With MCP (5 min)

This is the core learning exercise — observe how access to real data changes
Claude's answers.

**Round A — without MCP** (disable it temporarily):

```bash
claude mcp remove sqlite-bookstore
```

Open a fresh Claude Code session and ask:

> "How many books are in the bookstore database? Which author has the most
> books? Write a SQL query that returns all books with their author name and
> average rating, sorted by rating descending."

Write down Claude's response. Notice:

- Does it hesitate or add caveats about not knowing the schema?
- Are the column names correct (`author_id`, `review_text`, `rating`)?
- Does it join the right tables?

**Round B — with MCP** (re-add it):

```bash
claude mcp add \
  --transport stdio \
  --scope project \
  sqlite-bookstore \
  -- $(realpath mcp-sqlite-server) -db $(realpath bookstore-py/store.db)
```

Open a **new** Claude Code session (so MCP connects on startup) and ask the
**exact same question**.

Observe the difference:

- Claude now calls `get_table_definitions` first — watch for the tool call in
  the output
- It then calls `execute_query` with a real query
- Column names are exact, joins are correct, results are real data

Ask a follow-up that would be impossible without live data:

> "Which book has the highest average rating? Show me its title, author, and the
> top 3 review texts."

Without MCP this is just a guess. With MCP it is a fact.

---

### 3. Create the Security-Auditor Subagent (5 min)

A subagent runs in its own isolated context window with its own tools and model.
You will create one that specializes in OWASP security audits. It uses a cheaper
model (Haiku) and only gets read access — it can never modify code.

**Step 1** — Create the agents directory:

```bash
mkdir -p bookstore-py/.claude/agents
```

**Step 2** — Create `bookstore-py/.claude/agents/security-auditor.md`:

```markdown
---
name: security-auditor
description: >
  Audits Python source code for OWASP Top 10 security vulnerabilities.
  Invoke this agent whenever the user asks for a security review,
  vulnerability check, or when new handlers or store functions are added.
tools: Read, Grep, Glob
model: claude-haiku-4-5-20251001
effort: xhigh
color: red
---

You are a security engineer specializing in Python web applications and the
OWASP Top 10. Your job is to find real vulnerabilities — not theoretical risks.

## Scope

Audit only the files you are given. Do not modify any file.

## Process

1. Run `Glob` with `bookstore/**/*.py` to find all source files
2. For each handler file in `bookstore/handler/`, read it fully
3. For each store file in `bookstore/store/`, read it fully
4. Check for the following vulnerabilities:

**A01 — Broken Access Control**

- Are there authorization checks on any endpoint?
- Can an unauthenticated user call DELETE or POST endpoints?

**A03 — Injection**

- Are SQL queries built with f-strings or `%` formatting instead of parameter
  binding?
- Are query parameters sanitized before use?

**A05 — Security Misconfiguration**

- Are error messages returned verbatim to HTTP clients?
- Does the server expose stack traces or internal paths?

**A07 — Identification and Authentication Failures**

- Is there any authentication middleware at all?

**A09 — Security Logging and Monitoring Failures**

- Are failed requests or suspicious inputs logged?

## Output format

Write a report with this structure:

### Security Audit Report

**Files reviewed**: list every file you read

For each finding:

**[SEVERITY] OWASP Category — Short title**

- File: `path/to/file.py`, line N
- Description: what the vulnerability is
- Evidence: paste the relevant code snippet
- Recommendation: one concrete fix

Severity levels: CRITICAL, HIGH, MEDIUM, LOW, INFO

End with a **Summary** table: | Severity | Count |
```

**Step 3** — Test by asking Claude directly (without explicitly triggering the
subagent):

> "Do a security audit of the bookstore API."

Watch the tool calls in the output. Claude will delegate to `security-auditor`
automatically because the description matches. The audit runs in a separate
context — your main conversation stays clean.

---

## Pair Discussion (5 min)

Compare notes with your partner:

1. **MCP schema awareness**: did Claude use `get_table_definitions` before every
   query, or only on first use? What does that tell you about how Claude manages
   tool calls?
2. **Subagent delegation**: did Claude delegate automatically, or did you have
   to trigger it explicitly? What would you change in the `description:` field
   to make auto-delegation more reliable?
3. **Real-world applications**: which MCP servers would save your team the most
   time? (GitHub, JIRA, your production database?) What risks would you need to
   mitigate before connecting a production database?
4. **Cost vs capability**: the security auditor uses Haiku to save cost. What
   tasks in your workflow could be delegated to a cheaper model without losing
   quality?

Choose **one take-away** to present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
