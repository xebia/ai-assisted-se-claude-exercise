# cache-timer

A Claude Code mod that shows one line above the prompt:

```
cache 14:31 · 60m left (1h)       ctx ▰▱▱▱▱▱▱▱▱▱ 9% 18k/200k · $0.20 (miss ≈ $0.19)
```

- **Left**: when the prompt cache of this session expires, and how long is
  left. The TTL (1h or 5m) comes from the last cache write in the transcript.
  The line is grey for the first 45 minutes, yellow after, and red in the last
  5 minutes. A toast warns once, 5 minutes before a 1h cache expires.
- **Right**: how full the context window is (as a bar, a percent, and
  tokens used out of the window's size), what the session has cost so far
  (as `/cost` shows it), and in brackets what a cache miss would cost.

## The miss cost

The miss cost is what it costs to write this session's part of the prompt to
the cache again after it expired: its tokens × the model's input price × 2
(1h TTL) or × 1.25 (5m TTL). The shared part (system prompt, tools,
CLAUDE.md) is left out, because other sessions keep it cached. The mod
measures that part as what the session's first response read from cache.

Limits:

- Prices are a fixed table in `hooks/cache.ts` (list prices, from the
  Claude API model table of 2026-10-06). Update it when prices change.
- Fast mode (2× price) is not detected.
- If all your sessions are idle for over an hour, the shared part expires
  too, and a real miss costs more than shown.

## Use it

Nothing to set up. Claude Code loads a mod from the project's
`.claude/skills/<name>` folder by itself, so the line shows in every session
started in this project. The engine writes the API types into
`.claude-plugin/types/` when it loads the mod; that folder is not committed.

## Check it

```bash
claude plugin validate .claude/skills/cache-timer
```

```bash
claude plugin test .claude/skills/cache-timer
```
