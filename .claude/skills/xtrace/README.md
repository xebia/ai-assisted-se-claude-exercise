# xtrace

Records every external access Claude makes in this session and reports it.

    /xtrace                     menu
    /xtrace all                 every category, last turn
    /xtrace tools mcp hooks     chosen categories, last turn
    /xtrace tools session       whole session
    /xtrace pane [on|off]       live pane

Categories: tools, mcp, skills, hooks, agents, commands, context, model.

Hooks rows show which commands are configured for the event in settings.json;
plugin-shipped hooks and the per-command output are not visible to a mod.

Every tool call also fires `PreToolUse`, so with `hooks` recorded the 2000-row
buffer fills about twice as fast as the tool count suggests.

A call auto mode denies reads `denied`, its target led by the category
auto mode gave (`[Auto-Mode Bypass] …`).

## Live pane

One turn at a time: its `prompt:` line, its rows, and its totals (time,
requests, context growth and the spend at API list price, `≈` because
cache writes are priced at the 1-hour rate; subagents get their own
`Agents:` block). A turn Claude Code started from a message rather than
a prompt is named by it, e.g. `[agent message from ace7b01]`.

Click a control, or take the pane's keys with ctrl+x tab (Esc gives them
back). The cursor starts in the filter; Tab moves on to the buttons.

    f p n l      first, previous, next, latest turn
    u d          page up, down through a turn's rows
    wheel        scroll through a turn's rows
    h            filter examples

On an older turn the pane stays there and shows `● live: N`; `l` follows
the latest again. When a turn has more rows than fit, `↑ N earlier rows`
says so; paging or scrolling back to the bottom follows the live turn.

The filter takes `column:value` terms; every term must match:

    outcome:!ok                 everything that did not succeed
    kind:tools sort:-ms         tool calls, slowest first
    tokens:>5k                  rows that added more than 5k tokens
    kind:tools,mcp name:bash    tool and MCP calls named like bash
    ms:100..900 cache           100 to 900 ms, "cache" in name or target

Columns: kind name target plugins outcome tokens ms. `kind` and `outcome`
match exactly (comma lists OR), the other text columns by substring, `!`
negates. `ms` and `tokens` take `>`, `<`, `>=`, `<=`, `=`, `a..b` and `k`/`m`.
A bare word looks in name and target. `sort:col` / `sort:-col` sorts;
clicking a header cycles it and writes the `sort:` term for you. A term that
does not parse is named under the bar and left out; the rest still filters.

## Layout

- `hooks/register.tsx`: recorders, the command, the menu and the live pane.
  The engine follows `$` and the state atoms only within the hooks module's
  own file, so everything that touches `$` lives here.
- `hooks/args.ts`, `hooks/report.ts`, `hooks/hookmatch.ts`: pure, unit-tested.
- `hooks/view.ts`: the pane's filter language, sorting, turn navigation and
  row window; pure, unit-tested.
- `hooks/xtrace.test.ts`: engine tests. A test cannot read plugin state, so
  they assert through the `/xtrace` report and the drawn pane.

Check with `claude plugin validate .` and `claude plugin test .`.
