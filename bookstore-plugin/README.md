# bookstore-plugin

Everything from exercises 4 and 5, packaged as one Claude Code plugin. The
session 5 slide *Everything You Built, as One Plugin* shows it live; you can
run it yourself.

```
bookstore-plugin/
├── .claude-plugin/plugin.json   manifest: the name is the prefix of every skill
├── skills/commit/SKILL.md       exercise 4, task 1
├── skills/changelog/SKILL.md    exercise 4, task 2 (+ the Common Changelog spec)
├── agents/security-auditor.md   exercise 5, task 4, with both lines written
├── hooks/hooks.json             exercise 4, task 3, as a plugin hook
├── hooks/run-changelog.py       the hook script (skill name carries the prefix)
├── .mcp.json                    exercise 5, task 2, pointing at the server below
└── mcp-sqlite/server.py         copy of ../mcp-sqlite/server.py
```

## Try it

Open a terminal in your language folder (`bookstore-go`, `bookstore-kt`,
`bookstore-py` or `bookstore-ts`). `store.db` must exist: run the app once
if it does not. Then:

```
claude --plugin-dir ../bookstore-plugin
```

- `/help`, tab **Custom commands**: `/bookstore-plugin:commit` and
  `/bookstore-plugin:changelog`, next to your own `/commit` and
  `/changelog`. Plugin skills are namespaced, so nothing collides.
- `/mcp`: `sqlite-bookstore` connected. No approval prompt: plugin servers
  start when the plugin is enabled. Tool names carry the plugin:
  `mcp__plugin_bookstore-plugin_sqlite-bookstore__execute_query`.
- `/context`: `security-auditor` under custom agents.
- Make a small change, then `/bookstore-plugin:commit`: the skill commits,
  the PostToolUse hook sees the `git commit`, and Claude runs
  `/bookstore-plugin:changelog`.

`--plugin-dir` loads a plugin for one session. To share it, put it in a
marketplace and install it (*Installing and Sharing a Plugin*).

Hooks and an MCP server from this folder ran with your rights, and the
plugin skipped the approval prompt you saw in exercise 5. Audit a plugin
like any dependency.

## What is different from your own files

- `hooks.json` and `.mcp.json` use `${CLAUDE_PLUGIN_ROOT}`, so the plugin
  works from any launch folder. Both scripts run with `uv run --script`,
  the same runtime the exercise uses for the server.
- The hook asks for `/bookstore-plugin:changelog`, not `/changelog`,
  because plugin skills are namespaced.
- `/commit` has no exercise step 9 (the "your hook printed nothing" line).
- The agent body names no language paths, so it runs from any language
  folder. Its `description` is the strong version from the slide *Which
  Subagent Description Invokes Reliably?*; `tools` is `Read, Grep, Glob`.
  If you have not done exercise 5 task 4 yet, write your own first.
- `mcp-sqlite/server.py` is a copy of `../mcp-sqlite/server.py`. A plugin
  ships its own server. When the original changes, copy it again.

## Trainer notes

Demo from your own language folder with one small uncommitted change
ready, one command per click on the slide, in the order above. Five
minutes. After any edit to this folder, run
`claude plugin validate bookstore-plugin` from the repo root (`--strict`
turns warnings into errors).
