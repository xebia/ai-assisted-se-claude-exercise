# bookstore-plugin

Everything from exercises 3 and 4, packaged as one Claude Code plugin. The
session 4 slide *Everything You Built, as One Plugin* shows it live; you can
run it yourself.

```
bookstore-plugin/
├── .claude-plugin/plugin.json   manifest: the name is the prefix of every skill
├── skills/commit/SKILL.md       exercise 3, task 1
├── skills/changelog/SKILL.md    exercise 3, task 2 (+ the Common Changelog spec)
├── agents/security-auditor.md   exercise 4, task 4, with both lines written
├── hooks/hooks.json             two hooks, as plugin hooks
├── hooks/guard-secrets.py       exercise 3, task 3: the secret guard
├── hooks/gate-changelog.py      the session 3 slide "Done Means Done": the changelog gate
├── .mcp.json                    exercise 4, task 2, pointing at the server below
└── mcp-sqlite/server.py         copy of mcp-sqlite/server.py in the project
```

## Try it

Open a terminal in the `bookstore` folder, the one that contains this
folder. `store.db` must exist: run the app once if it does not. Then:

```
claude --plugin-dir bookstore-plugin
```

- `/help`, tab **Custom commands**: `/bookstore-plugin:commit` and
  `/bookstore-plugin:changelog`, next to your own `/commit` and
  `/changelog`. Plugin skills are namespaced, so nothing collides.
- `/mcp`: `sqlite-bookstore` connected. No approval prompt: plugin servers
  start when the plugin is enabled. Tool names carry the plugin:
  `mcp__plugin_bookstore-plugin_sqlite-bookstore__execute_query`.
- `/context`: `security-auditor` under custom agents.
- Paste a prompt with the key from `.env` in it: the guard blocks it, and
  the terminal shows the reason. The prompt never reached the model.
- Make a small change, then `/bookstore-plugin:commit`: the skill commits
  and Claude says it is done. The Stop hook checks `CHANGELOG.md`, finds
  the new commit missing, and sends Claude back with the commit named.
  Claude reaches for `/bookstore-plugin:changelog` by its description,
  updates the changelog, and the gate lets it finish.

`--plugin-dir` loads a plugin for one session. To share it, put it in a
marketplace and install it (*Your Own Marketplace: a Git Repo*).

Hooks and an MCP server from this folder ran with your rights, and the
plugin skipped the approval prompt you saw in exercise 4. Audit a plugin
like any dependency.

## What is different from your own files

- `hooks.json` and `.mcp.json` use `${CLAUDE_PLUGIN_ROOT}`, so the plugin
  works from any launch folder. All scripts run with `uv run --script`,
  the same runtime the exercise uses for the server.
- The gate is not in the exercise. It is the slide example that replaced
  the old "hook asks Claude to run the skill" chain: a hook cannot start
  a skill, but a Stop hook can refuse "done" until the outcome exists.
  The script exits at once when `stop_hook_active` is true, so a check
  that cannot pass does not keep Claude working forever. Commits that
  touch only `CHANGELOG.md` or dotfiles never block.
- The agent body names no language paths, so it runs from any language
  folder. Its `description` is the strong version from the slide *Which
  Subagent Description Invokes Reliably?*; `tools` is `Read, Grep, Glob`.
  If you have not done exercise 4 task 4 yet, write your own first.
- `mcp-sqlite/server.py` is a copy of the project's `mcp-sqlite/server.py`. A plugin
  ships its own server. When the original changes, copy it again.

## Trainer notes

Demo from a built package (`just package <lang>`, then `dist/bookstore-<lang>`,
or a clone of the language branch) with one small uncommitted change ready,
one command per click on the slide, in the order above. Five minutes. The
gate demo needs at least one tag in the clone (`git tag v0.1.0` on an
older commit) so "commits since the last tag" is a short list. After any
edit to this folder, run `claude plugin validate bookstore-plugin` from
the folder that contains it (`--strict` turns warnings into errors).
