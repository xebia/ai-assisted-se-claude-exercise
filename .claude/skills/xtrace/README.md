# xtrace

Records every external access Claude makes in this session and reports it.

    /xtrace                     menu
    /xtrace all                 every category, last turn
    /xtrace tools mcp hooks     chosen categories, last turn
    /xtrace tools session       whole session
    /xtrace pane [on|off]       live pane

Categories: tools, mcp, skills, hooks, agents, commands, context.

Hooks rows show which commands are configured for the event in settings.json;
plugin-shipped hooks and the per-command output are not visible to a mod.

Every tool call also fires `PreToolUse`, so with `hooks` recorded the 2000-row
buffer fills about twice as fast as the tool count suggests.

## Layout

- `hooks/register.tsx`: recorders, the command, the menu and the live pane.
  The engine follows `$` and the state atoms only within the hooks module's
  own file, so everything that touches `$` lives here.
- `hooks/args.ts`, `hooks/report.ts`, `hooks/hookmatch.ts`: pure, unit-tested.
- `hooks/xtrace.test.ts`: engine tests. A test cannot read plugin state, so
  they assert through the `/xtrace` report and the drawn pane.

Check with `claude plugin validate .` and `claude plugin test .`.
