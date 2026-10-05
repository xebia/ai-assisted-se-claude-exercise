# xtrace mod — design

Date: 2026-10-05
Status: approved design, not yet implemented

## Purpose

`/trace` is a prompt-only skill (`.claude/skills/trace/SKILL.md`). Claude
reconstructs the trail of its last turn from memory. The `xtrace` mod does the
same job from ground truth: it is a Claude Code plugin of function hooks (a
"mod", see https://www.claudemod.com/) that records every external resource
Claude touches, as the engine fires the event, and reports it on demand as a
table, a live pane, or both.

The existing `/trace` skill stays untouched. The mod owns `/xtrace`.

## Categories

Each recorded row belongs to exactly one category. The category words are the
command's parameters.

| Category | Engine event | What a row holds |
| --- | --- | --- |
| `tools` | `tool.call`, tool name not starting with `mcp__` | tool, target, outcome, duration ms |
| `mcp` | `tool.call`, tool name `mcp__<server>__<tool>` | server, tool, server source (`project`, `plugin`, …), outcome, duration ms |
| `skills` | `skill.prompt` | skill name, prompt length in characters |
| `hooks` | `classic.*` (PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionStart, SubagentStart, SubagentStop, PreCompact, Notification, PermissionRequest, and the rest) | event name, matched tool when present, configured commands for that event and matcher, outcome |
| `agents` | `agent.spawn` | agent type, model, number of tool calls recorded inside its loop |
| `commands` | `command.run` | command name, arguments as typed |
| `context` | `session.append` with door `attachment` or `hook-context` | door, attachment kind or hook event, size in characters |

Not a category, but recorded: `turn.start` (turn id and the prompt's first
eight words), `turn.complete` (reason), `session.compact` (so the report can
say where its memory begins).

### Target column

- Read, Edit, Write, NotebookEdit: the path, plus the line range when given.
- Grep, Glob: the pattern and the path.
- Bash: the command, trimmed to 80 characters.
- Agent: the agent type and the description.
- Skill: the skill name.
- MCP tools: the first string-valued argument, trimmed to 80 characters.
- Everything else: the first string-valued argument, or empty.

### Outcome column

For `tools`, `mcp`, `agents` and `commands`: `ok`, `error` (the tool reported
`isError`), `denied` (a hook or the person refused), `running` (not finished
yet; only in the pane).

For `hooks`: `context` (a settings hook added context), `blocked` (a settings
hook blocked or denied), `none` (the event fired and nothing changed).

For `skills` and `context`: always `ok`.

### Hooks rows and what they can and cannot say

The hook chain is: managed settings hooks, then hooks modules (this mod), then
the person's other settings hooks. The mod therefore sees every classic event
fire, and after `next(e)` it sees the folded outcome (context added, a block,
a decision), but it does not see which configured command produced it.

To make the row useful anyway, the mod reads the merged settings once per
session (`$.settings.read()`) and lists the commands configured for the event
and, for tool events, the matcher that matches the tool. The row then reads,
for example:

```
hooks | PreToolUse Grep | cbm-code-discovery-gate, cc-status | context added
```

A classic event with no configured command still produces a row, with an empty
command list, because the event did fire. The `hooks` category is noisy by
design; the person chooses whether to show it.

## Command

```
/xtrace                          opens the multi-select menu
/xtrace all                      every category, last turn
/xtrace tools mcp hooks          chosen categories, last turn
/xtrace tools session            chosen categories, whole session
/xtrace all session              every category, whole session
/xtrace pane                     toggles the live pane
/xtrace pane on | off            opens or closes the live pane
```

Parsing rules:

- Words are separated by whitespace, case-insensitive, order-free.
- `all` expands to every category. Category words may be combined with it; the
  result is still every category.
- `session` sets the scope to every recorded turn since the session started.
  Without it the scope is the last completed turn, or the running turn if the
  command is typed while a turn runs.
- `pane`, `pane on`, `pane off` are a separate mode: no report is printed.
- Any unknown word makes the whole command fail with a one-line usage message.
  Nothing is printed and nothing changes.
- The chosen category set is saved in session state as the "current
  selection". It is what the menu opens with next time and what the pane
  filters on.

## Menu

Typed with no parameters, `/xtrace` opens a dialog pane (`focus`,
`closeOnEscape`, `rows` sized to content). It holds:

- One toggle button per category, hotkeys `1` to `7`, drawn `[x] tools` or
  `[ ] tools`. A press flips the tick.
- `[a] all` ticks every category; pressed again it clears every category.
- `[s] session` toggles the scope between last turn and whole session.
- `[p] live pane` toggles the pane on or off (see Live pane).
- `[Enter] show` prints the report for the ticked categories and closes the
  menu. With nothing ticked the button is dim and does nothing.
- Esc closes the menu without printing.

The menu opens with the current selection ticked. The selection persists for
the session. The dialog holds toasts while open, so it is closed on `show`
and on Esc and never left open.

`show` prints the report by running the command through the engine
(`$.command.run` with the words the ticks spell out), so the printed row is the
same `CommandOutput` row a typed command produces.

## Report

Markdown text, printed as the command's output row. Shape follows the `/trace`
skill so course participants recognise it, minus the closing question.

1. **Header.** `xtrace: <n> turn(s), <m> rows, categories: tools, mcp`. When
   a compaction happened inside the scope, a second line: `Memory starts after
   a compaction at <time>; earlier turns are not recorded.`
2. **The trail.** One table per turn, oldest first. Above each table, the
   person's prompt in at most eight words, in quotes.

   | # | Kind | Name | Target | Outcome | ms |
   | --- | --- | --- | --- | --- | --- |

   `Kind` is the category. Rows recorded inside a subagent's loop are nested:
   they follow the `agents` row that spawned them, with `Name` indented by two
   spaces, and only when `agents` is among the chosen categories; otherwise
   they appear flat with the agent type in parentheses after the name.
3. **Totals.** One line per category chosen, with the count. Then the number of
   distinct files read or edited (from `tools` rows). Then the number of rows
   before the first Edit, Write or NotebookEdit, when there was one. Then one
   line with the commands that checked the work: Bash rows whose command
   starts with a known test or build runner (`go test`, `npm test`, `pytest`,
   `gradle`, `mvn`, `cargo test`, `make`), or `Checked: nothing.`

When the scope holds no rows, the whole report is one line:
`xtrace: nothing recorded for the last turn.` or `... for this session.`

## Live pane

- `/xtrace pane on` opens the pane with id `xtrace` and title `xtrace`.
  `/xtrace pane off` closes it. `/xtrace pane` toggles. The menu's `[p]` does
  the same.
- The on/off choice is saved in the cross-session store under key `pane`.
  When on, `session.start` opens the pane. A pane the mod opens by itself is
  only drawn from 144 terminal columns; below that the engine keeps it
  undrawn. The mod then shows one toast: `xtrace: widen the terminal to 144
  columns to see the pane`.
- When the person closes the pane with the engine's own key, the `ui.close`
  event arrives with origin `person` and the mod saves the preference as off.
  A close with origin `unload` changes nothing.
- The pane draws, top to bottom: one line of counters for the whole session
  (`tools 12 · mcp 3 · skills 1 · hooks 40 · agents 0 · commands 2 · context
  1`), a thin rule, then the rows of the running or last turn, oldest at the
  top and newest at the bottom, as many as fit. Each row is one line:
  `kind name target outcome`, with `running` for an unfinished call drawn
  bright and finished rows dim.
- The pane honours the current selection; a category not ticked is left out
  of the list but still counted in the counters line.
- The pane reads the row list from session state, so every recorded row
  redraws it; no timer is needed.

## Storage

- Rows: session state `{ plugin: 'xtrace', key: 'rows' }`, an array capped at
  2000 entries; the oldest are dropped. Survives a hot reload. Nothing crosses
  sessions.
- Selection and scope: session state `{ plugin: 'xtrace', key: 'selection' }`.
- Pane preference: cross-session store, key `pane`, `true` or `false`.
- Configured hook commands: read once in `session.start`, kept in the module's
  own variable, re-read on reload.

A row:

```ts
type Row = {
  id: string            // tool_use_id, or a minted id for non-tool rows
  turnId: string
  agentId?: string      // the loop the row ran in; absent on main
  kind: 'tools' | 'mcp' | 'skills' | 'hooks' | 'agents' | 'commands' | 'context'
  name: string          // tool, skill, event, agent type, command, door
  target: string
  detail?: string       // mcp server source, hook commands, agent model, …
  outcome: 'ok' | 'error' | 'denied' | 'running' | 'none' | 'context' | 'blocked'
  startedAt: number     // ms since epoch
  ms?: number           // duration, once finished
}
```

## Error handling

- Every recorder wraps its bookkeeping in try/catch and always calls
  `next(e)`. A failure in the mod must never change what the engine does.
- A tool call that fails is a row with outcome `error`, never a missing row.
- A row whose loop no agent list names (a compaction fork, a workflow agent)
  is kept with `detail: 'engine'`.
- A pane tree that fails to validate is the engine's problem to replace; the
  mod keeps the tree small and typed to avoid it.
- A `$.settings.read()` failure leaves the hook command list empty; rows are
  still recorded.

## Testing

`hooks/xtrace.test.ts`, run by `claude plugin test <mod folder>`:

- A Bash `tool.call` becomes a `tools` row with the trimmed command, outcome
  `ok`, and a duration.
- A `tool.call` with `isError` becomes a row with outcome `error`.
- A `mcp__sqlite-bookstore__query` call becomes an `mcp` row with server and
  tool split and the source carried into `detail`.
- A `classic.PreToolUse` for Grep becomes a `hooks` row listing the configured
  commands for the Grep matcher.
- A `skill.prompt` becomes a `skills` row with the text length.
- An `agent.spawn` followed by a `tool.call` carrying its `agentId` nests the
  child under the parent in the report and counts it on the parent row.
- A `session.append` with door `attachment` becomes a `context` row.
- Argument parsing: empty, `all`, one word, several words, `session`, `all
  session`, `pane`, `pane on`, `pane off`, and an unknown word.
- The row buffer drops the oldest beyond 2000.
- `/xtrace pane off` after `on` stores `false`; a `ui.close` with origin
  `person` stores `false`; origin `unload` leaves the store alone.
- The report for an empty scope is the single line.

Also: `claude plugin validate <mod folder>` passes, and `tsc -p <mod folder>`
passes once the engine has laid the types.

## Files

```
~/.claude/dev-mods/210952d9-075e-4488-a925-1d856dd82369/xtrace/
  .claude-plugin/plugin.json    name, version, description, types pointer
  hooks/hooks.json              { "modules": ["./register.tsx"] }
  hooks/register.tsx            recorders, command, menu, pane, wiring
  hooks/report.ts               pure: filter, group, nest, format markdown
  hooks/args.ts                 pure: parse parameters into { categories, scope, pane }
  hooks/xtrace.test.ts
  types/index.d.ts              Row, Selection, and the PluginState contract
```

`register.tsx` holds only wiring: it maps events to rows and hands rows to the
pure modules. Everything that can be unit-tested without the engine lives in
`report.ts` and `args.ts`.

## Out of scope

- Writing rows to disk or exporting them.
- Changing or replacing the `/trace` skill.
- Showing per-hook-command results (the engine does not expose them to a mod).
- Recording model requests (`turn.step`), permission decisions (`tool.check`)
  or timing of the model itself. These are cheap to add later as categories.
