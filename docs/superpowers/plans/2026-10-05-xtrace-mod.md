# xtrace Mod Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Claude Code mod that records every external resource Claude touches (tools, MCP, skills, hooks, subagents, commands, injected context) and reports it through `/xtrace`, a multi-select menu, and a live pane.

**Architecture:** One plugin of function hooks. `hooks/register.tsx` wires engine events to a row recorder and owns the command, menu and pane. Pure modules `hooks/args.ts` (parameter parsing), `hooks/report.ts` (filter, group, format) and `hooks/hookmatch.ts` (settings hook lookup) hold everything testable without the engine. Rows live in `$.state` so a hot reload keeps them; the pane preference lives in `$.store`.

**Tech Stack:** Claude Code function hooks API (`claude-code` module, early access), TypeScript 5.4+, JSX against the global `h`, `claude plugin validate`, `claude plugin test`.

Spec: `docs/superpowers/specs/2026-10-05-xtrace-mod-design.md`. Read it first.

## Global Constraints

- Mod folder: `/Users/urs/.claude/dev-mods/210952d9-075e-4488-a925-1d856dd82369/xtrace/` (call it `$MOD` below).
- Plugin name: `xtrace`. Command: `xtrace`. Pane id: `xtrace`. Menu pane id: `xtrace-menu`.
- Category words, exact: `tools`, `mcp`, `skills`, `hooks`, `agents`, `commands`, `context`. Scope word: `session`. Pane words: `pane`, `on`, `off`. Expansion word: `all`.
- Row buffer cap: 2000. Turn list cap: 200. Target column cap: 80 characters.
- Every recorder hook must call `next(e)` and must never throw past its own try/catch.
- Module files use `import` declarations only. No `require`, no `import()`, no Node, no DOM.
- The existing `/trace` skill in `.claude/skills/trace/` is not touched.
- API reference: `/private/tmp/claude-502/bundled-skills/2.1.289/8896c129c33c506039cc494ea6fd6abd/plugin-authoring/types/claude-code.d.ts` before the mod has loaded; once loaded, `$MOD/.claude-plugin/types/claude-code/index.d.ts`. When a type name in this plan does not match, grep that file and follow the file.
- Shell commands: prefix with `source ~/.bash_profile &&` (user rule).
- Commits go to this repo. The mod lives outside the repo, so commit the plan's checkpoints by copying nothing: commit messages below only cover repo files. For mod files, run the validate and test steps as the gate instead.

---

## File map

| File | Responsibility |
| --- | --- |
| `$MOD/.claude-plugin/plugin.json` | manifest: name, version, description, types pointer |
| `$MOD/hooks/hooks.json` | names the module |
| `$MOD/types/index.d.ts` | `Row`, `Turn`, `Selection`, `Category`; the `PluginState` contract |
| `$MOD/hooks/args.ts` | `parseArgs(text): ParsedArgs` and `wordsOf(selection): string` |
| `$MOD/hooks/hookmatch.ts` | `commandsFor(settings, event, toolName): string[]` |
| `$MOD/hooks/report.ts` | `buildReport(input): string`, `targetOf(tool, args): string` |
| `$MOD/hooks/register.tsx` | event recorders, command, menu dialog, live pane |
| `$MOD/hooks/args.test.ts` | parser tests |
| `$MOD/hooks/hookmatch.test.ts` | settings lookup tests |
| `$MOD/hooks/report.test.ts` | formatter tests |
| `$MOD/hooks/xtrace.test.ts` | engine-level tests through `claude plugin test` |

---

### Task 1: Scaffold, type contract, and argument parser

**Files:**
- Create: `$MOD/.claude-plugin/plugin.json`
- Create: `$MOD/hooks/hooks.json`
- Create: `$MOD/types/index.d.ts`
- Create: `$MOD/hooks/args.ts`
- Create: `$MOD/hooks/register.tsx` (empty register, so validate passes)
- Test: `$MOD/hooks/args.test.ts`

**Interfaces:**
- Produces `Category`, `Row`, `Turn`, `Selection`, `Compaction` types and the `PluginState['xtrace']` contract.
- Produces `parseArgs(text: string): ParsedArgs` and `wordsOf(selection: Selection): string`.

- [ ] **Step 1: Write the manifest and hooks.json**

`$MOD/.claude-plugin/plugin.json`:
```json
{
  "name": "xtrace",
  "version": "0.1.0",
  "description": "Records every tool, MCP, skill, hook, subagent, command and injected-context access and reports it with /xtrace.",
  "types": "./types/index.d.ts"
}
```

`$MOD/hooks/hooks.json`:
```json
{ "modules": ["./register.tsx"] }
```

- [ ] **Step 2: Write the type contract**

`$MOD/types/index.d.ts`:
```ts
export type Category =
  | 'tools' | 'mcp' | 'skills' | 'hooks' | 'agents' | 'commands' | 'context'

export const CATEGORIES: readonly Category[]

export type Outcome =
  | 'ok' | 'error' | 'denied' | 'running'   // tools, mcp, agents, commands
  | 'context' | 'blocked' | 'none'          // hooks

export type Row = {
  id: string
  turnId: string
  agentId?: string
  parentId?: string          // the agents row this row ran under, when known
  kind: Category
  name: string
  target: string
  detail?: string
  outcome: Outcome
  startedAt: number
  ms?: number
}

export type Turn = {
  turnId: string
  text: string               // the prompt, first eight words
  startedAt: number
  isComplete: boolean
}

export type Compaction = { at: number; turnId: string }

export type Selection = {
  categories: Category[]
  scope: 'turn' | 'session'
}

export type XtraceState = {
  rows: Row[]
  turns: Turn[]
  compactions: Compaction[]
  selection: Selection
}

declare module 'claude-code' {
  interface PluginState {
    xtrace: XtraceState
  }
}
```

Note: `CATEGORIES` is declared here for typing only; its value lives in `args.ts`.

- [ ] **Step 3: Write an empty register so validate has something to read**

`$MOD/hooks/register.tsx`:
```tsx
import type { Register } from 'claude-code'

export const register: Register = on => {
  void on
}
```

- [ ] **Step 4: Run validate**

Run: `source ~/.bash_profile && claude plugin validate "$MOD"`
Expected: passes, reports no hooks yet. If the engine asks "Enable hot reloading for this session?", answer is the person's; the plan does not depend on it.

- [ ] **Step 5: Write the failing parser tests**

`$MOD/hooks/args.test.ts`:
```ts
import { describe, expect, test } from 'claude-code/testing'
import { parseArgs, wordsOf, CATEGORIES } from './args'

describe('parseArgs', () => {
  test('empty opens the menu', () => {
    expect(parseArgs('')).toEqual({ mode: 'menu' })
    expect(parseArgs('   ')).toEqual({ mode: 'menu' })
  })
  test('all expands to every category, last turn', () => {
    expect(parseArgs('all')).toEqual({
      mode: 'report',
      selection: { categories: [...CATEGORIES], scope: 'turn' },
    })
  })
  test('named categories keep canonical order', () => {
    expect(parseArgs('hooks tools')).toEqual({
      mode: 'report',
      selection: { categories: ['tools', 'hooks'], scope: 'turn' },
    })
  })
  test('session switches scope', () => {
    expect(parseArgs('mcp session')).toEqual({
      mode: 'report',
      selection: { categories: ['mcp'], scope: 'session' },
    })
    expect(parseArgs('all session').selection?.scope).toBe('session')
  })
  test('is case-insensitive and tolerant of extra spaces', () => {
    expect(parseArgs('  Tools   MCP ').selection?.categories).toEqual(['tools', 'mcp'])
  })
  test('only session and no category is an error', () => {
    expect(parseArgs('session').mode).toBe('error')
  })
  test('pane modes', () => {
    expect(parseArgs('pane')).toEqual({ mode: 'pane', pane: 'toggle' })
    expect(parseArgs('pane on')).toEqual({ mode: 'pane', pane: 'on' })
    expect(parseArgs('pane off')).toEqual({ mode: 'pane', pane: 'off' })
    expect(parseArgs('pane sideways').mode).toBe('error')
    expect(parseArgs('tools pane').mode).toBe('error')
  })
  test('unknown word is an error with usage', () => {
    const parsed = parseArgs('tools bananas')
    expect(parsed.mode).toBe('error')
    expect(parsed.message).toContain('bananas')
    expect(parsed.message).toContain('/xtrace')
  })
})

describe('wordsOf', () => {
  test('spells a selection back as command words', () => {
    expect(wordsOf({ categories: ['tools', 'mcp'], scope: 'turn' })).toBe('tools mcp')
    expect(wordsOf({ categories: ['tools'], scope: 'session' })).toBe('tools session')
    expect(wordsOf({ categories: [...CATEGORIES], scope: 'turn' })).toBe('all')
  })
})
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: FAIL, `./args` not found.

- [ ] **Step 7: Write the parser**

`$MOD/hooks/args.ts`:
```ts
import type { Category, Selection } from '../types'

export const CATEGORIES: readonly Category[] = [
  'tools', 'mcp', 'skills', 'hooks', 'agents', 'commands', 'context',
]

export const USAGE =
  'Usage: /xtrace [all | tools mcp skills hooks agents commands context] [session] | /xtrace pane [on|off]'

export type ParsedArgs =
  | { mode: 'menu' }
  | { mode: 'report'; selection: Selection }
  | { mode: 'pane'; pane: 'on' | 'off' | 'toggle' }
  | { mode: 'error'; message: string; selection?: undefined }

const isCategory = (word: string): word is Category =>
  (CATEGORIES as readonly string[]).includes(word)

export function parseArgs(text: string): ParsedArgs {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return { mode: 'menu' }

  if (words[0] === 'pane') {
    if (words.length === 1) return { mode: 'pane', pane: 'toggle' }
    if (words.length === 2 && (words[1] === 'on' || words[1] === 'off')) {
      return { mode: 'pane', pane: words[1] }
    }
    return { mode: 'error', message: `Unknown pane option "${words.slice(1).join(' ')}". ${USAGE}` }
  }

  const picked = new Set<Category>()
  let scope: Selection['scope'] = 'turn'
  for (const word of words) {
    if (word === 'all') CATEGORIES.forEach(c => picked.add(c))
    else if (word === 'session') scope = 'session'
    else if (isCategory(word)) picked.add(word)
    else return { mode: 'error', message: `Unknown word "${word}". ${USAGE}` }
  }
  if (picked.size === 0) {
    return { mode: 'error', message: `Name at least one category. ${USAGE}` }
  }
  return {
    mode: 'report',
    selection: { categories: CATEGORIES.filter(c => picked.has(c)), scope },
  }
}

export function wordsOf(selection: Selection): string {
  const isAll = CATEGORIES.every(c => selection.categories.includes(c))
  const words = isAll ? ['all'] : CATEGORIES.filter(c => selection.categories.includes(c))
  if (selection.scope === 'session') words.push('session')
  return words.join(' ')
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: all `parseArgs` and `wordsOf` tests PASS.

- [ ] **Step 9: Commit the plan checkpoint in the repo**

```bash
source ~/.bash_profile && cd /Users/urs/development/github/ai/ai-training/ai-assisted-se-claude-exercise && git add docs/superpowers/plans/2026-10-05-xtrace-mod.md && git commit -m "docs: xtrace implementation plan"
```

---

### Task 2: Settings hook lookup

**Files:**
- Create: `$MOD/hooks/hookmatch.ts`
- Test: `$MOD/hooks/hookmatch.test.ts`

**Interfaces:**
- Produces `commandsFor(settings: unknown, event: string, toolName?: string): string[]`, which returns the short names of the configured commands for a classic hook event, honouring the `matcher` regex for tool events.

- [ ] **Step 1: Write the failing tests**

`$MOD/hooks/hookmatch.test.ts`:
```ts
import { describe, expect, test } from 'claude-code/testing'
import { commandsFor, shortName } from './hookmatch'

const settings = {
  hooks: {
    PreToolUse: [
      { matcher: 'Grep|Glob', hooks: [{ type: 'command', command: '"$HOME/.claude/hooks/cbm-code-discovery-gate"' }] },
      { hooks: [{ type: 'command', command: '/Users/urs/.config/iterm2/cc-status' }] },
    ],
    Stop: [{ hooks: [{ type: 'command', command: 'uv run --script "${CLAUDE_PLUGIN_ROOT}/hooks/run-changelog.py"' }] }],
  },
}

describe('commandsFor', () => {
  test('matches the tool against the matcher regex', () => {
    expect(commandsFor(settings, 'PreToolUse', 'Grep')).toEqual(['cbm-code-discovery-gate', 'cc-status'])
    expect(commandsFor(settings, 'PreToolUse', 'Bash')).toEqual(['cc-status'])
  })
  test('an entry without matcher matches every tool', () => {
    expect(commandsFor(settings, 'PreToolUse', 'mcp__sqlite-bookstore__query')).toEqual(['cc-status'])
  })
  test('events without a tool take every entry', () => {
    expect(commandsFor(settings, 'Stop')).toEqual(['run-changelog.py'])
  })
  test('unknown event or malformed settings give an empty list', () => {
    expect(commandsFor(settings, 'Notification')).toEqual([])
    expect(commandsFor(undefined, 'Stop')).toEqual([])
    expect(commandsFor({ hooks: 'nope' }, 'Stop')).toEqual([])
  })
  test('a bad matcher regex is treated as no match', () => {
    const bad = { hooks: { PreToolUse: [{ matcher: '(', hooks: [{ type: 'command', command: 'x' }] }] } }
    expect(commandsFor(bad, 'PreToolUse', 'Grep')).toEqual([])
  })
})

describe('shortName', () => {
  test('takes the last path segment of the first non-interpreter word', () => {
    expect(shortName('"$HOME/.claude/hooks/cbm-code-discovery-gate"')).toBe('cbm-code-discovery-gate')
    expect(shortName('uv run --script "${CLAUDE_PLUGIN_ROOT}/hooks/run-changelog.py"')).toBe('run-changelog.py')
    expect(shortName('node /a/b/c.mjs --flag')).toBe('c.mjs')
    expect(shortName('')).toBe('')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: FAIL, `./hookmatch` not found.

- [ ] **Step 3: Write the lookup**

`$MOD/hooks/hookmatch.ts`:
```ts
type HookEntry = { matcher?: unknown; hooks?: unknown }
type HookCommand = { type?: unknown; command?: unknown }

const INTERPRETERS = new Set(['uv', 'run', 'node', 'bun', 'python', 'python3', 'sh', 'bash', 'zsh', 'npx'])

export function shortName(command: string): string {
  const words = command.split(/\s+/).map(w => w.replace(/^["']|["']$/g, '')).filter(Boolean)
  const word = words.find(w => !w.startsWith('-') && !INTERPRETERS.has(w)) ?? ''
  return word.split('/').pop() ?? ''
}

function matches(matcher: unknown, toolName: string | undefined): boolean {
  if (toolName === undefined) return true
  if (typeof matcher !== 'string' || matcher === '' || matcher === '*') return true
  try {
    return new RegExp(`^(?:${matcher})$`).test(toolName)
  } catch {
    return false
  }
}

export function commandsFor(settings: unknown, event: string, toolName?: string): string[] {
  const hooks = (settings as { hooks?: unknown } | undefined)?.hooks
  if (hooks === null || typeof hooks !== 'object') return []
  const entries = (hooks as Record<string, unknown>)[event]
  if (!Array.isArray(entries)) return []

  const names: string[] = []
  for (const entry of entries as HookEntry[]) {
    if (!matches(entry.matcher, toolName)) continue
    if (!Array.isArray(entry.hooks)) continue
    for (const hook of entry.hooks as HookCommand[]) {
      if (typeof hook.command === 'string') names.push(shortName(hook.command))
    }
  }
  return names
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: PASS.

---

### Task 3: Report formatter

**Files:**
- Create: `$MOD/hooks/report.ts`
- Test: `$MOD/hooks/report.test.ts`

**Interfaces:**
- Consumes `Row`, `Turn`, `Compaction`, `Selection` from `../types`.
- Produces:
  - `targetOf(tool: string, args: Record<string, unknown>): string`
  - `scopedTurns(turns: Turn[], scope: Selection['scope']): Turn[]`
  - `buildReport(input: { rows: Row[]; turns: Turn[]; compactions: Compaction[]; selection: Selection }): string`
  - `firstWords(text: string, n?: number): string`

- [ ] **Step 1: Write the failing tests**

`$MOD/hooks/report.test.ts`:
```ts
import { describe, expect, test } from 'claude-code/testing'
import { buildReport, firstWords, scopedTurns, targetOf } from './report'
import type { Row, Turn } from '../types'

const turn1: Turn = { turnId: 't1', text: 'find the n plus one', startedAt: 1000, isComplete: true }
const turn2: Turn = { turnId: 't2', text: 'fix it', startedAt: 2000, isComplete: true }

const row = (over: Partial<Row>): Row => ({
  id: 'r', turnId: 't2', kind: 'tools', name: 'Read', target: 'a.go', outcome: 'ok',
  startedAt: 2001, ms: 5, ...over,
})

describe('targetOf', () => {
  test('files, with the range when given', () => {
    expect(targetOf('Read', { file_path: '/x/a.go', offset: 18, limit: 26 })).toBe('/x/a.go 18–43')
    expect(targetOf('Edit', { file_path: '/x/a.go' })).toBe('/x/a.go')
  })
  test('patterns, commands, agents, skills', () => {
    expect(targetOf('Grep', { pattern: 'func Search', path: 'internal/' })).toBe('`func Search` in internal/')
    expect(targetOf('Glob', { pattern: '**/*.go' })).toBe('`**/*.go`')
    expect(targetOf('Bash', { command: '  go test ./...  ' })).toBe('go test ./...')
    expect(targetOf('Agent', { subagent_type: 'Explore', description: 'find handlers' })).toBe('Explore: find handlers')
    expect(targetOf('Skill', { skill: 'commit' })).toBe('commit')
  })
  test('trims long targets to 80 characters with an ellipsis', () => {
    expect(targetOf('Bash', { command: 'x'.repeat(100) })).toHaveLength(80)
    expect(targetOf('Bash', { command: 'x'.repeat(100) }).endsWith('…')).toBe(true)
  })
  test('unknown tools take the first string argument, else empty', () => {
    expect(targetOf('mcp__sqlite-bookstore__query', { sql: 'select 1', limit: 3 })).toBe('select 1')
    expect(targetOf('Weird', { n: 3 })).toBe('')
  })
})

describe('scopedTurns', () => {
  test('turn scope is the last turn, session scope is all', () => {
    expect(scopedTurns([turn1, turn2], 'turn')).toEqual([turn2])
    expect(scopedTurns([turn1, turn2], 'session')).toEqual([turn1, turn2])
    expect(scopedTurns([], 'turn')).toEqual([])
  })
})

describe('buildReport', () => {
  test('empty scope is one line', () => {
    const text = buildReport({ rows: [], turns: [turn2], compactions: [], selection: { categories: ['tools'], scope: 'turn' } })
    expect(text).toBe('xtrace: nothing recorded for the last turn.')
    const all = buildReport({ rows: [], turns: [], compactions: [], selection: { categories: ['tools'], scope: 'session' } })
    expect(all).toBe('xtrace: nothing recorded for this session.')
  })

  test('header, one table per turn, totals', () => {
    const rows = [
      row({ id: 'a', turnId: 't1', name: 'Grep', target: '`Search` in internal/', startedAt: 1001 }),
      row({ id: 'b', turnId: 't2', name: 'Read', target: 'a.go 1–20' }),
      row({ id: 'c', turnId: 't2', name: 'Edit', target: 'a.go', startedAt: 2002 }),
      row({ id: 'd', turnId: 't2', name: 'Bash', target: 'go test ./...', startedAt: 2003 }),
      row({ id: 'e', turnId: 't2', kind: 'hooks', name: 'PreToolUse Bash', target: 'cc-status', outcome: 'none', startedAt: 2004 }),
    ]
    const text = buildReport({ rows, turns: [turn1, turn2], compactions: [], selection: { categories: ['tools'], scope: 'session' } })
    expect(text).toContain('xtrace: 2 turn(s), 4 rows, categories: tools')
    expect(text).toContain('"find the n plus one"')
    expect(text).toContain('"fix it"')
    expect(text).toContain('| # | Kind | Name | Target | Outcome | ms |')
    expect(text).toContain('| 1 | tools | Grep | `Search` in internal/ | ok | 5 |')
    expect(text).not.toContain('PreToolUse')          // hooks not selected
    expect(text).toContain('tools: 4')
    expect(text).toContain('Distinct files: 1')
    expect(text).toContain('Rows before the first edit: 1')
    expect(text).toContain('Checked: go test ./...')
  })

  test('says Checked: nothing when no runner ran', () => {
    const text = buildReport({ rows: [row({})], turns: [turn2], compactions: [], selection: { categories: ['tools'], scope: 'turn' } })
    expect(text).toContain('Checked: nothing.')
    expect(text).not.toContain('before the first edit')
  })

  test('nests subagent rows under their agents row when agents is selected', () => {
    const rows = [
      row({ id: 'p', kind: 'agents', name: 'Explore', target: 'find handlers', detail: 'claude-sonnet-5-5' }),
      row({ id: 'q', agentId: 'ag1', parentId: 'p', name: 'Grep', target: '`Handler`', startedAt: 2002 }),
      row({ id: 'z', name: 'Read', target: 'b.go', startedAt: 2003 }),
    ]
    const nested = buildReport({ rows, turns: [turn2], compactions: [], selection: { categories: ['tools', 'agents'], scope: 'turn' } })
    expect(nested).toContain('| 1 | agents | Explore | find handlers | ok | 5 |')
    expect(nested).toContain('| 2 | tools |   Grep |')
    expect(nested).toContain('| 3 | tools | Read |')
    const flat = buildReport({ rows, turns: [turn2], compactions: [], selection: { categories: ['tools'], scope: 'turn' } })
    expect(flat).toContain('| 1 | tools | Grep (Explore) |')
  })

  test('names a compaction inside the scope', () => {
    const text = buildReport({ rows: [row({})], turns: [turn1, turn2], compactions: [{ at: 1500, turnId: 't1' }], selection: { categories: ['tools'], scope: 'session' } })
    expect(text).toContain('Memory starts after a compaction')
  })

  test('escapes pipes in targets', () => {
    const text = buildReport({ rows: [row({ target: 'a | b' })], turns: [turn2], compactions: [], selection: { categories: ['tools'], scope: 'turn' } })
    expect(text).toContain('a \\| b')
  })
})

describe('firstWords', () => {
  test('keeps at most eight words', () => {
    expect(firstWords('one two three four five six seven eight nine')).toBe('one two three four five six seven eight…')
    expect(firstWords('  short  prompt ')).toBe('short prompt')
    expect(firstWords('')).toBe('')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: FAIL, `./report` not found.

- [ ] **Step 3: Write the formatter**

`$MOD/hooks/report.ts`:
```ts
import type { Category, Compaction, Row, Selection, Turn } from '../types'

const TARGET_MAX = 80
const FILE_TOOLS = new Set(['Read', 'Edit', 'Write', 'NotebookEdit'])
const EDIT_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit'])
const CHECK_RUNNERS = ['go test', 'npm test', 'pnpm test', 'yarn test', 'pytest', 'gradle', './gradlew', 'mvn', 'cargo test', 'make']

const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)

export function trim(text: string, max = TARGET_MAX): string {
  const one = text.replace(/\s+/g, ' ').trim()
  return one.length <= max ? one : one.slice(0, max - 1) + '…'
}

export function firstWords(text: string, n = 8): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.length <= n ? words.join(' ') : words.slice(0, n).join(' ') + '…'
}

export function targetOf(tool: string, args: Record<string, unknown>): string {
  const path = str(args.file_path)
  if (FILE_TOOLS.has(tool) && path !== undefined) {
    const offset = typeof args.offset === 'number' ? args.offset : undefined
    const limit = typeof args.limit === 'number' ? args.limit : undefined
    if (offset !== undefined && limit !== undefined) return trim(`${path} ${offset}–${offset + limit - 1}`)
    return trim(path)
  }
  if (tool === 'Grep' || tool === 'Glob') {
    const pattern = str(args.pattern) ?? ''
    const where = str(args.path)
    return trim(where ? `\`${pattern}\` in ${where}` : `\`${pattern}\``)
  }
  if (tool === 'Bash') return trim(str(args.command) ?? '')
  if (tool === 'Agent') return trim(`${str(args.subagent_type) ?? 'general-purpose'}: ${str(args.description) ?? ''}`)
  if (tool === 'Skill') return trim(str(args.skill) ?? '')
  for (const value of Object.values(args)) {
    const s = str(value)
    if (s !== undefined) return trim(s)
  }
  return ''
}

export function scopedTurns(turns: Turn[], scope: Selection['scope']): Turn[] {
  if (scope === 'session') return turns
  return turns.length === 0 ? [] : [turns[turns.length - 1]]
}

const cell = (text: string | number | undefined): string => String(text ?? '').replace(/\|/g, '\\|')

function orderRows(rows: Row[], withAgents: boolean): { row: Row; indent: boolean }[] {
  const byParent = new Map<string, Row[]>()
  const top: Row[] = []
  for (const r of rows) {
    if (withAgents && r.parentId !== undefined && rows.some(p => p.id === r.parentId)) {
      const list = byParent.get(r.parentId) ?? []
      list.push(r)
      byParent.set(r.parentId, list)
    } else top.push(r)
  }
  const out: { row: Row; indent: boolean }[] = []
  for (const r of top) {
    out.push({ row: r, indent: false })
    for (const child of byParent.get(r.id) ?? []) out.push({ row: child, indent: true })
  }
  return out
}

function nameOf(row: Row, rows: Row[], withAgents: boolean, indent: boolean): string {
  if (indent) return `  ${row.name}`
  if (!withAgents && row.parentId !== undefined) {
    const parent = rows.find(p => p.id === row.parentId)
    if (parent) return `${row.name} (${parent.name})`
  }
  return row.name
}

export type ReportInput = { rows: Row[]; turns: Turn[]; compactions: Compaction[]; selection: Selection }

export function buildReport({ rows, turns, compactions, selection }: ReportInput): string {
  const scope = scopedTurns(turns, selection.scope)
  const turnIds = new Set(scope.map(t => t.turnId))
  const picked = new Set<Category>(selection.categories)
  const all = rows.filter(r => turnIds.has(r.turnId))
  const shown = all.filter(r => picked.has(r.kind)).sort((a, b) => a.startedAt - b.startedAt)

  if (shown.length === 0) {
    return selection.scope === 'turn'
      ? 'xtrace: nothing recorded for the last turn.'
      : 'xtrace: nothing recorded for this session.'
  }

  const lines: string[] = []
  lines.push(`xtrace: ${scope.length} turn(s), ${shown.length} rows, categories: ${selection.categories.join(', ')}`)
  const compacted = compactions.filter(c => turnIds.has(c.turnId))
  if (compacted.length > 0) {
    const at = new Date(compacted[compacted.length - 1].at).toISOString().slice(11, 19)
    lines.push(`Memory starts after a compaction at ${at}; earlier turns are not recorded.`)
  }

  const withAgents = picked.has('agents')
  let n = 0
  for (const turn of scope) {
    const ofTurn = shown.filter(r => r.turnId === turn.turnId)
    if (ofTurn.length === 0) continue
    lines.push('', `"${firstWords(turn.text)}"`, '', '| # | Kind | Name | Target | Outcome | ms |', '| --- | --- | --- | --- | --- | --- |')
    for (const { row, indent } of orderRows(ofTurn, withAgents)) {
      n += 1
      lines.push(`| ${n} | ${row.kind} | ${cell(nameOf(row, all, withAgents, indent))} | ${cell(row.target)} | ${row.outcome} | ${cell(row.ms)} |`)
    }
  }

  lines.push('')
  for (const c of selection.categories) {
    lines.push(`${c}: ${shown.filter(r => r.kind === c).length}`)
  }
  const toolRows = shown.filter(r => r.kind === 'tools')
  const files = new Set(toolRows.filter(r => FILE_TOOLS.has(r.name)).map(r => r.target.split(' ')[0]))
  lines.push(`Distinct files: ${files.size}`)
  const firstEdit = shown.findIndex(r => r.kind === 'tools' && EDIT_TOOLS.has(r.name))
  if (firstEdit >= 0) lines.push(`Rows before the first edit: ${firstEdit}`)
  const checks = toolRows.filter(r => r.name === 'Bash' && CHECK_RUNNERS.some(c => r.target.startsWith(c))).map(r => r.target)
  lines.push(checks.length > 0 ? `Checked: ${checks.join('; ')}` : 'Checked: nothing.')

  return lines.join('\n')
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: PASS. If a `toHaveLength` or `endsWith` assertion is not in this kit's `Matchers`, rewrite it as `expect(x.length).toBe(80)` and `expect(x.endsWith('…')).toBe(true)`.

---

### Task 4: Recorders for tools and mcp, with turn tracking

**Files:**
- Modify: `$MOD/hooks/register.tsx`
- Create: `$MOD/hooks/state.ts`
- Test: `$MOD/hooks/xtrace.test.ts`

**Interfaces:**
- Produces in `state.ts`: atoms `ROWS`, `TURNS`, `COMPACTIONS`, `SELECTION`; helpers `addRow($, row)`, `finishRow($, id, patch)`, `currentTurnId($)`.
- Produces in `register.tsx`: `tool.call` recorder, `turn.start` and `turn.complete` recorders.

- [ ] **Step 1: Write the state helpers**

`$MOD/hooks/state.ts`:
```ts
import { atom, read, update } from 'claude-code'
import type { EngineInterface } from 'claude-code'
import type { Compaction, Row, Selection, Turn } from '../types'
import { CATEGORIES } from './args'

export const ROW_CAP = 2000
export const TURN_CAP = 200

export const ROWS = atom({ plugin: 'xtrace', key: 'rows' } as const, [] as Row[])
export const TURNS = atom({ plugin: 'xtrace', key: 'turns' } as const, [] as Turn[])
export const COMPACTIONS = atom({ plugin: 'xtrace', key: 'compactions' } as const, [] as Compaction[])
export const SELECTION = atom(
  { plugin: 'xtrace', key: 'selection' } as const,
  { categories: [...CATEGORIES], scope: 'turn' } as Selection,
)

type $ = EngineInterface

export const addRow = ($: $, row: Row) =>
  update($, ROWS, list => [...list, row].slice(-ROW_CAP))

export const finishRow = ($: $, id: string, patch: Partial<Row>) =>
  update($, ROWS, list => list.map(r => (r.id === id ? { ...r, ...patch } : r)))

export const addTurn = ($: $, turn: Turn) =>
  update($, TURNS, list => [...list, turn].slice(-TURN_CAP))

export const completeTurn = ($: $, turnId: string) =>
  update($, TURNS, list => list.map(t => (t.turnId === turnId ? { ...t, isComplete: true } : t)))

export async function currentTurnId($: $): Promise<string> {
  const turns = await read($, TURNS)
  return turns.length === 0 ? 'before-first-turn' : turns[turns.length - 1].turnId
}

let counter = 0
export const mintId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`
```

If `EngineInterface` is not the exported name of `$`'s type, grep the types file for `export interface EngineInterface` or `export type Engine` and use that name.

- [ ] **Step 2: Write the failing engine tests for tool rows**

`$MOD/hooks/xtrace.test.ts`:
```ts
import { describe, expect, test, mock } from 'claude-code/testing'

const ROWS = { plugin: 'xtrace', key: 'rows' } as const
const TURNS = { plugin: 'xtrace', key: 'turns' } as const

describe('tool rows', () => {
  test('a Bash call becomes a tools row with outcome ok and a duration', async ($, on) => {
    mock.clock(on)
    on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: '', stderr: '', interrupted: false }, text: '' }))
    await $.turn.start({ text: 'list the files please now', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: '  ls -la  ', tool_use_id: 'u1' })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: 'u1', turnId: 't1', kind: 'tools', name: 'Bash', target: 'ls -la', outcome: 'ok' })
    expect(typeof rows[0].ms).toBe('number')
  })

  test('an errored call is a row with outcome error', async ($, on) => {
    on('tool.call', { tool: 'Read' }, () => ({ result: {}, text: 'no such file', isError: true }))
    await $.turn.start({ text: 'read it', turnId: 't1' })
    await $.tool.call({ tool: 'Read', file_path: '/nope.go', tool_use_id: 'u2' })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows[0]).toMatchObject({ name: 'Read', target: '/nope.go', outcome: 'error' })
  })

  test('a denied call is a row with outcome denied', async ($, on) => {
    on('tool.call', { tool: 'Edit' }, () => ({ deny: 'protected' }))
    await $.turn.start({ text: 'edit it', turnId: 't1' })
    await $.tool.call({ tool: 'Edit', file_path: '/x/.env', old_string: 'a', new_string: 'b', tool_use_id: 'u3' })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows[0].outcome).toBe('denied')
  })

  test('an MCP call becomes an mcp row with server and tool split', async ($, on) => {
    on('tool.call', { tool: 'mcp__sqlite-bookstore__query' }, () => ({ result: { rows: [] }, text: '' }))
    await $.turn.start({ text: 'query', turnId: 't1' })
    await $.tool.call({ tool: 'mcp__sqlite-bookstore__query', sql: 'select 1', tool_use_id: 'u4' })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows[0]).toMatchObject({ kind: 'mcp', name: 'sqlite-bookstore / query', target: 'select 1', outcome: 'ok' })
  })

  test('turns are tracked and completed', async ($, on) => {
    on('turn.complete', () => ({ text: 'done' }))
    await $.turn.start({ text: 'one two three four five six seven eight nine', turnId: 't1' })
    await $.turn.complete({ turnId: 't1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })
    const { value: turns = [] } = await $.state.get(TURNS)
    expect(turns).toEqual([{ turnId: 't1', text: 'one two three four five six seven eight…', startedAt: expect.any(Number), isComplete: true }])
  })

  test('the row buffer keeps the newest 2000', async ($, on) => {
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: '' }))
    await $.turn.start({ text: 'spam', turnId: 't1' })
    for (let i = 0; i < 2005; i++) {
      await $.tool.call({ tool: 'Bash', command: `echo ${i}`, tool_use_id: `u${i}` })
    }
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows).toHaveLength(2000)
    expect(rows[0].id).toBe('u5')
  })
})
```

If `$.turn.start` or `$.turn.complete` is not callable on the test's `$` (check `EngineNoun` for `turn`), replace those lines with `await $.prompt.submit({ text: '...' })` plus a bottom `on('turn.start')` hook, and adjust. The `turn.complete` input fields are `TurnCompleteFields & TurnCompleteUnrefused`; grep `TurnCompleteUnrefused` for the exact required fields.

- [ ] **Step 3: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: the new tests FAIL (no rows recorded).

- [ ] **Step 4: Write the recorders**

Replace `$MOD/hooks/register.tsx`:
```tsx
import type { Register } from 'claude-code'
import type { Row } from '../types'
import { addRow, addTurn, completeTurn, currentTurnId, finishRow } from './state'
import { firstWords, targetOf } from './report'

const MCP = /^mcp__([^_]+(?:_[^_]+)*)__(.+)$/

function splitMcp(tool: string): { server: string; name: string } | undefined {
  const m = MCP.exec(tool)
  return m ? { server: m[1], name: m[2] } : undefined
}

export const register: Register = on => {
  on('turn.start', async ($, e, next) => {
    try {
      await addTurn($, { turnId: e.turnId, text: firstWords(e.text), startedAt: await $.clock.now(), isComplete: false })
    } catch {}
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    try {
      if (e.agentId === undefined) await completeTurn($, e.turnId)
    } catch {}
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const tool = String(e.tool)
    const { tool: _t, tool_use_id, agentId, consent: _c, ...args } = e as Record<string, unknown> & { tool_use_id?: string; agentId?: string }
    const id = typeof tool_use_id === 'string' ? tool_use_id : `call-${Date.now()}`
    const mcp = splitMcp(tool)
    let startedAt = 0
    try {
      startedAt = await $.clock.now()
      const row: Row = {
        id,
        turnId: await currentTurnId($),
        agentId: typeof agentId === 'string' ? agentId : undefined,
        kind: mcp ? 'mcp' : tool === 'Agent' ? 'agents' : 'tools',
        name: mcp ? `${mcp.server} / ${mcp.name}` : tool === 'Agent' ? String(args.subagent_type ?? 'general-purpose') : tool,
        target: tool === 'Agent' ? String(args.description ?? '') : targetOf(tool, args),
        outcome: 'running',
        startedAt,
      }
      await addRow($, row)
    } catch {}

    const ran = await next(e)

    try {
      const ms = (await $.clock.now()) - startedAt
      const outcome: Row['outcome'] = ran.deny !== undefined ? 'denied' : ran.isError === true ? 'error' : 'ok'
      await finishRow($, id, { outcome, ms })
    } catch {}
    return ran
  })
}
```

Agent rows are created here, from the Agent tool call, because the same `tool_use_id` is what `agent.spawn` carries. Task 5 enriches them.

- [ ] **Step 5: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: PASS. If a `toMatchObject` or `expect.any` matcher is missing from this kit, check `Matchers` in the types and substitute field-by-field `toBe` checks.

- [ ] **Step 6: Validate**

Run: `source ~/.bash_profile && claude plugin validate "$MOD"`
Expected: passes; lists hooks on `turn.start`, `turn.complete`, `tool.call` and the `$.state` keys `rows`, `turns`.

---

### Task 5: Recorders for skills, commands, agents, context, hooks and compaction

**Files:**
- Modify: `$MOD/hooks/register.tsx`
- Test: `$MOD/hooks/xtrace.test.ts` (append)

**Interfaces:**
- Consumes `commandsFor` from `./hookmatch`, `mintId`, `addRow`, `finishRow` from `./state`.
- Produces rows of kinds `skills`, `commands`, `context`, `hooks`; `agents` rows gain `detail` (model) and child rows gain `parentId`; `compactions` state.

- [ ] **Step 1: Append the failing tests**

Append to `$MOD/hooks/xtrace.test.ts`:
```ts
const COMPACTIONS = { plugin: 'xtrace', key: 'compactions' } as const

describe('other rows', () => {
  test('a skill prompt becomes a skills row with the text length', async ($, on) => {
    on('skill.prompt', () => ({ text: 'expanded' }))
    await $.turn.start({ text: 'commit', turnId: 't1' })
    await $.skill.prompt({ skill: 'commit', text: 'abcdef' })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows[0]).toMatchObject({ kind: 'skills', name: 'commit', target: '6 chars', outcome: 'ok' })
  })

  test('a slash command becomes a commands row', async ($, on) => {
    on('command.run', { command: 'compact' }, () => ({ text: 'ok' }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.command.run({ command: 'compact', args: 'keep the plan' })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows.find(r => r.kind === 'commands')).toMatchObject({ name: 'compact', target: 'keep the plan', outcome: 'ok' })
  })

  test('/xtrace itself is not recorded as a command', async ($, on) => {
    on('command.run', { command: 'xtrace' }, () => ({ text: '' }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.command.run({ command: 'xtrace', args: 'tools' })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows.filter(r => r.kind === 'commands')).toHaveLength(0)
  })

  test('a classic PostToolUse becomes a hooks row listing the configured commands', async ($, on) => {
    on('classic.PostToolUse', () => ({ additionalContext: ['remember the gate'] }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.classic.PostToolUse({ tool_name: 'Grep', tool_input: {}, tool_response: {}, tool_use_id: 'u9' })
    const { value: rows = [] } = await $.state.get(ROWS)
    const hook = rows.find(r => r.kind === 'hooks')
    expect(hook).toMatchObject({ name: 'PostToolUse Grep', outcome: 'context' })
    expect(typeof hook?.target).toBe('string')
  })

  test('a classic Stop with nothing beneath is a hooks row with outcome none', async ($, on) => {
    on('classic.Stop', () => ({}))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.classic.Stop({ stop_hook_active: false })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows.find(r => r.kind === 'hooks')).toMatchObject({ name: 'Stop', outcome: 'none' })
  })

  test('a hook-context append becomes a context row', async ($, on) => {
    on('session.append', ($, e) => ({ message: e.message, uuid: e.uuid }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.session.append({
      message: { type: 'attachment', name: 'hook_context', content: [{ type: 'text', text: 'hello world' }] },
      door: 'hook-context',
      origin: { kind: 'hook', event: 'PostToolUse' },
      uuid: 'row-1',
    })
    const { value: rows = [] } = await $.state.get(ROWS)
    expect(rows.find(r => r.kind === 'context')).toMatchObject({ name: 'hook PostToolUse', target: '11 chars', outcome: 'ok' })
  })

  test('a spawn enriches the agents row and nests the child calls', async ($, on) => {
    on('tool.call', { tool: 'Agent' }, async ($, e) => {
      await $.agent.spawn({ tool_use_id: e.tool_use_id!, prompt: 'go', description: 'find handlers', subagentType: 'Explore', provider: { plugin: 'engine', tier: 'core' } })
      await $.tool.call({ tool: 'Grep', pattern: 'Handler', tool_use_id: 'child-1', agentId: 'ag1' })
      return { result: {}, text: '' }
    })
    on('agent.spawn', () => ({ model: 'claude-sonnet-5-5' }))
    on('tool.call', { tool: 'Grep' }, () => ({ result: {}, text: '' }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Agent', description: 'find handlers', prompt: 'go', subagent_type: 'Explore', tool_use_id: 'agent-call' })
    const { value: rows = [] } = await $.state.get(ROWS)
    const parent = rows.find(r => r.id === 'agent-call')
    const child = rows.find(r => r.id === 'child-1')
    expect(parent).toMatchObject({ kind: 'agents', name: 'Explore', detail: 'claude-sonnet-5-5' })
    expect(child?.parentId).toBe('agent-call')
  })

  test('a compaction is remembered with its turn', async ($, on) => {
    on('session.compact', () => ({ summary: 's' }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.session.compact({ trigger: 'manual' })
    const { value: list = [] } = await $.state.get(COMPACTIONS)
    expect(list).toEqual([{ at: expect.any(Number), turnId: 't1' }])
  })
})
```

The exact required fields of `$.session.compact`'s input, `$.session.append`'s input and `$.classic.Stop`'s input must be checked against `SessionCompactInput`, `SessionAppendInput` and the `Stop` hook input in the types file; add any required field the kit complains about.

- [ ] **Step 2: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: the new tests FAIL.

- [ ] **Step 3: Add the recorders**

In `$MOD/hooks/register.tsx`, add imports:
```tsx
import { COMPACTIONS, mintId } from './state'
import { update } from 'claude-code'
import { commandsFor } from './hookmatch'
```

Inside `register`, before the hooks, add module-level bookkeeping:
```tsx
  let settings: unknown = undefined
  const runningAgents: string[] = []                      // tool_use_ids of Agent calls in flight, newest last
  const parentOfAgent = new Map<string, string>()         // agentId -> Agent tool_use_id

  on('session.start', async ($, e, next) => {
    try { settings = await $.settings.read() } catch { settings = undefined }
    return next(e)
  })
```

Add to the `tool.call` recorder: right after `addRow`, if `tool === 'Agent'` push `id` onto `runningAgents`; after `next` resolves, remove it. Also, before `addRow`, resolve `parentId`:
```tsx
      const agent = typeof agentId === 'string' ? agentId : undefined
      let parentId: string | undefined
      if (agent !== undefined) {
        parentId = parentOfAgent.get(agent)
        if (parentId === undefined && runningAgents.length > 0) {
          parentId = runningAgents[runningAgents.length - 1]
          parentOfAgent.set(agent, parentId)
        }
      }
```
and include `parentId` in the row.

Then add the other recorders:
```tsx
  on('agent.spawn', async ($, e, next) => {
    const ran = await next(e)
    try {
      await finishRow($, e.tool_use_id, { detail: ran.model ?? e.model ?? 'inherit' })
    } catch {}
    return ran
  })

  on('skill.prompt', async ($, e, next) => {
    const ran = await next(e)
    try {
      await addRow($, {
        id: mintId('skill'), turnId: await currentTurnId($), kind: 'skills',
        name: e.skill, target: `${ran.text.length} chars`, outcome: 'ok', startedAt: await $.clock.now(),
      })
    } catch {}
    return ran
  })

  on('command.run', async ($, e, next) => {
    if (e.command === 'xtrace') return next(e)
    const id = mintId('cmd')
    let startedAt = 0
    try {
      startedAt = await $.clock.now()
      await addRow($, { id, turnId: await currentTurnId($), kind: 'commands', name: e.command, target: e.args, outcome: 'running', startedAt })
    } catch {}
    try {
      const ran = await next(e)
      await finishRow($, id, { outcome: 'ok', ms: (await $.clock.now()) - startedAt })
      return ran
    } catch (err) {
      try { await finishRow($, id, { outcome: 'error', ms: (await $.clock.now()) - startedAt }) } catch {}
      throw err
    }
  })

  on('session.append', async ($, e, next) => {
    try {
      if (e.door === 'attachment' || e.door === 'hook-context') {
        const text = e.message.content.map(b => (b.type === 'text' ? b.text : '')).join('')
        const name = e.origin.kind === 'hook' ? `hook ${e.origin.event}` : `${e.door} ${e.message.name ?? ''}`.trim()
        await addRow($, {
          id: e.uuid, turnId: await currentTurnId($), agentId: e.agentId, kind: 'context',
          name, target: `${text.length} chars`, outcome: 'ok', startedAt: await $.clock.now(),
        })
      }
    } catch {}
    return next(e)
  })

  on('session.compact', async ($, e, next) => {
    try {
      if (e.agentId === undefined) {
        const turnId = await currentTurnId($)
        await update($, COMPACTIONS, list => [...list, { at: Date.now(), turnId }].slice(-50))
      }
    } catch {}
    return next(e)
  })
```

Hooks recorder. Write one helper and register it for each classic event by literal name (validate reads literals; do not loop over a string array):
```tsx
  const recordHook = (event: string) => async ($: Parameters<Parameters<typeof on>[1]>[0], e: any, next: any) => {
    const toolName: string | undefined = typeof e.tool_name === 'string' ? e.tool_name : typeof e.tool === 'string' ? e.tool : undefined
    const id = mintId('hook')
    let startedAt = 0
    try {
      startedAt = await $.clock.now()
      await addRow($, {
        id, turnId: await currentTurnId($), kind: 'hooks',
        name: toolName ? `${event} ${toolName}` : event,
        target: commandsFor(settings, event, toolName).join(', '),
        outcome: 'running', startedAt,
      })
    } catch {}
    const ran = await next(e)
    try {
      const r = (ran ?? {}) as Record<string, unknown>
      const blocked = r.deny !== undefined || r.block !== undefined || r.preventContinuation === true || r.decision === 'block'
      const context = Array.isArray(r.additionalContext) && r.additionalContext.length > 0
      await finishRow($, id, { outcome: blocked ? 'blocked' : context ? 'context' : 'none', ms: (await $.clock.now()) - startedAt })
    } catch {}
    return ran
  }

  on('classic.PreToolUse', recordHook('PreToolUse'))
  on('classic.PostToolUse', recordHook('PostToolUse'))
  on('classic.PostToolUseFailure', recordHook('PostToolUseFailure'))
  on('classic.UserPromptSubmit', recordHook('UserPromptSubmit'))
  on('classic.Stop', recordHook('Stop'))
  on('classic.SessionStart', recordHook('SessionStart'))
  on('classic.SessionEnd', recordHook('SessionEnd'))
  on('classic.SubagentStart', recordHook('SubagentStart'))
  on('classic.SubagentStop', recordHook('SubagentStop'))
  on('classic.PreCompact', recordHook('PreCompact'))
  on('classic.PostCompact', recordHook('PostCompact'))
  on('classic.Notification', recordHook('Notification'))
  on('classic.PermissionRequest', recordHook('PermissionRequest'))
  on('classic.PermissionDenied', recordHook('PermissionDenied'))
```

Type the helper's `$` as the engine interface type found in Task 4 Step 1 instead of the `Parameters<...>` expression if that reads cleaner; the `any` on `e` and `next` is accepted here because the helper is shared across fourteen event shapes.

- [ ] **Step 4: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: PASS.

- [ ] **Step 5: Validate**

Run: `source ~/.bash_profile && claude plugin validate "$MOD"`
Expected: passes; lists every `classic.*` hook, `$.settings.read`, `$.state` keys `rows`, `turns`, `compactions`.

---

### Task 6: The `/xtrace` command with parameters

**Files:**
- Modify: `$MOD/hooks/register.tsx`
- Test: `$MOD/hooks/xtrace.test.ts` (append)

**Interfaces:**
- Consumes `parseArgs`, `buildReport`, `SELECTION`, `ROWS`, `TURNS`, `COMPACTIONS`.
- Produces a registered command `xtrace` and a `command.run` hook that answers `{ text }` for `report` and `error` modes. `menu` and `pane` modes are filled in by Tasks 7 and 8; for now they answer a placeholder text that Task 7 and 8 replace.

- [ ] **Step 1: Append the failing tests**

```ts
const SELECTION = { plugin: 'xtrace', key: 'selection' } as const

describe('/xtrace command', () => {
  test('registers at session start', async ($, on) => {
    await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
    const commands = await $.command.list()
    expect(commands.some(c => c.name === 'xtrace')).toBe(true)
  })

  test('prints a report for the chosen categories and saves the selection', async ($, on) => {
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: '' }))
    await $.turn.start({ text: 'list', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
    const out = await $.command.run({ command: 'xtrace', args: 'tools hooks' })
    expect(out.text).toContain('xtrace: 1 turn(s), 1 rows, categories: tools, hooks')
    expect(out.text).toContain('| 1 | tools | Bash | ls | ok |')
    const { value } = await $.state.get(SELECTION)
    expect(value).toEqual({ categories: ['tools', 'hooks'], scope: 'turn' })
  })

  test('an unknown word answers the usage line and records nothing', async ($) => {
    const out = await $.command.run({ command: 'xtrace', args: 'bananas' })
    expect(out.text).toContain('Unknown word "bananas"')
    expect(out.text).toContain('/xtrace')
  })

  test('empty scope answers the one-liner', async ($) => {
    const out = await $.command.run({ command: 'xtrace', args: 'all' })
    expect(out.text).toBe('xtrace: nothing recorded for the last turn.')
  })
})
```

If `$.session.start` takes different required fields in this build, grep `SessionStartInput` and adjust. If `$.command.list` is not on the test's `$`, assert instead that `$.command.run({ command: 'xtrace', args: 'all' })` resolves with a text.

- [ ] **Step 2: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: FAIL.

- [ ] **Step 3: Implement the command**

Add imports to `register.tsx`:
```tsx
import { read } from 'claude-code'
import { parseArgs } from './args'
import { buildReport } from './report'
import { ROWS, TURNS, SELECTION } from './state'
```

Extend the existing `session.start` hook:
```tsx
  on('session.start', async ($, e, next) => {
    try { settings = await $.settings.read() } catch { settings = undefined }
    try {
      await $.command.register({
        name: 'xtrace',
        description: 'Trace every tool, MCP, skill, hook, subagent, command and context access',
        argumentHint: '[all | tools mcp skills hooks agents commands context] [session] | pane [on|off]',
      })
    } catch {}
    return next(e)
  })
```

Add the command hook (place it above the generic `command.run` recorder or keep the early return there; both exist):
```tsx
  on('command.run', { command: 'xtrace' }, async ($, e) => {
    const parsed = parseArgs(e.args)
    if (parsed.mode === 'error') return { text: parsed.message }
    if (parsed.mode === 'menu') return { text: 'xtrace: menu not built yet.' }      // Task 7
    if (parsed.mode === 'pane') return { text: 'xtrace: pane not built yet.' }      // Task 8
    await update($, SELECTION, () => parsed.selection)
    const [rows, turns, compactions] = await Promise.all([read($, ROWS), read($, TURNS), read($, COMPACTIONS)])
    return { text: buildReport({ rows, turns, compactions, selection: parsed.selection }) }
  })
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: PASS.

- [ ] **Step 5: Validate and try it live**

Run: `source ~/.bash_profile && claude plugin validate "$MOD"`
Then, if hot reloading is enabled in the session, at the end of the turn type `/xtrace all` in the session and confirm a table appears. If the session shows a dim line `xtrace: <event> ... <reason>`, that is a hook failure: fix it before continuing.

---

### Task 7: The multi-select menu

**Files:**
- Modify: `$MOD/hooks/register.tsx`
- Create: `$MOD/hooks/menu.tsx`
- Test: `$MOD/hooks/xtrace.test.ts` (append)

**Interfaces:**
- Produces `MENU = 'xtrace-menu'`, `openMenu($)`, and a `ui.render` hook on `{ component: 'Pane', requestId: MENU }` drawing toggle buttons; a press on `show` closes the menu and runs `/xtrace <words>`; a press on `pane` toggles the live pane via `setPane($, 'toggle')` from Task 8 (stub it here as a no-op function that Task 8 replaces).

- [ ] **Step 1: Append the failing tests**

```ts
describe('menu', () => {
  test('/xtrace with no words opens the menu pane', async ($, on) => {
    const opened: string[] = []
    on('ui.open', ($, e, next) => { opened.push(e.id); return next(e) })
    await $.command.run({ command: 'xtrace', args: '' })
    expect(opened).toContain('xtrace-menu')
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    test(`draws one toggle per category and flips it on press (${surface})`, async ($, on) => {
      await $.state.set(SELECTION, { categories: ['tools'], scope: 'turn' })
      const ui = await $.ui.mount({
        plugin: 'xtrace', surface, component: 'Pane', requestId: 'xtrace-menu',
        props: { title: 'xtrace', isFocused: true, bodyColumns: 60 } as never,
      })
      expect(await ui.find({ type: 'Button', text: /\[x\] tools/ })).toBeDefined()
      expect(await ui.find({ type: 'Button', text: /\[ \] mcp/ })).toBeDefined()
      await $.ui.press({ plugin: 'xtrace', key: 'cat-mcp', requestId: 'xtrace-menu', surface })
      const { value } = await $.state.get(SELECTION)
      expect(value?.categories).toEqual(['tools', 'mcp'])
    })
  }

  test('show closes the menu and runs the report', async ($, on) => {
    const ran: string[] = []
    const closed: string[] = []
    on('command.run', { command: 'xtrace' }, ($, e, next) => { ran.push(e.args); return next(e) })
    on('ui.close', ($, e, next) => { closed.push(e.id); return next(e) })
    await $.state.set(SELECTION, { categories: ['tools', 'mcp'], scope: 'session' })
    const ui = await $.ui.mount({
      plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace-menu',
      props: { title: 'xtrace', isFocused: true, bodyColumns: 60 } as never,
    })
    void ui
    await $.ui.press({ plugin: 'xtrace', key: 'show', requestId: 'xtrace-menu', surface: 'terminal' })
    expect(closed).toContain('xtrace-menu')
    expect(ran).toContain('tools mcp session')
  })
})
```

The `props` object for a `Pane` must satisfy `RenderPropsOf['Pane']`; grep `Pane: {` in the types file for the full list of required props and fill them in instead of the `as never` cast when the kit rejects it.

- [ ] **Step 2: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: FAIL.

- [ ] **Step 3: Write the menu module**

`$MOD/hooks/menu.tsx`:
```tsx
import { read, update } from 'claude-code'
import type { EngineInterface, On } from 'claude-code'
import type { Category, Selection } from '../types'
import { CATEGORIES, wordsOf } from './args'
import { SELECTION } from './state'

export const MENU = 'xtrace-menu'

export const openMenu = ($: EngineInterface) =>
  $.ui.open({ id: MENU, title: 'xtrace', focus: true, closeOnEscape: true, rows: 14 })

const toggle = (s: Selection, c: Category): Selection => ({
  ...s,
  categories: s.categories.includes(c)
    ? s.categories.filter(x => x !== c)
    : CATEGORIES.filter(x => x === c || s.categories.includes(x)),
})

export function registerMenu(on: On, setPane: ($: EngineInterface, mode: 'toggle') => Promise<void>) {
  on('ui.render', { component: 'Pane', requestId: MENU }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, SELECTION)
    const isAll = CATEGORIES.every(c => s.categories.includes(c))
    const canShow = s.categories.length > 0

    return (
      <Box flexDirection="column" gap={0}>
        <Text bold>What should /xtrace show?</Text>
        {CATEGORIES.map((c, i) => (
          <Button
            key={`cat-${c}`}
            hotkey={String(i + 1)}
            plain
            label={`[${s.categories.includes(c) ? 'x' : ' '}] ${c}`}
            onPress={() => update($, SELECTION, cur => toggle(cur, c))}
          />
        ))}
        <Text> </Text>
        <Button key="all" hotkey="a" plain label={`[${isAll ? 'x' : ' '}] all`}
          onPress={() => update($, SELECTION, cur => ({ ...cur, categories: isAll ? [] : [...CATEGORIES] }))} />
        <Button key="scope" hotkey="s" plain label={`[${s.scope === 'session' ? 'x' : ' '}] whole session`}
          onPress={() => update($, SELECTION, cur => ({ ...cur, scope: cur.scope === 'session' ? 'turn' : 'session' }))} />
        <Button key="pane" hotkey="p" plain label="toggle live pane" onPress={() => setPane($, 'toggle')} />
        <Text> </Text>
        <Box gap={2}>
          <Button key="show" hotkey="0" variant="primary" label="show" dimColor={!canShow}
            onPress={async () => {
              if (!canShow) return
              const cur = await read($, SELECTION)
              await $.ui.close({ id: MENU })
              await $.command.run({ command: 'xtrace', args: wordsOf(cur) })
            }} />
          <Button key="cancel" role="dismiss" label="cancel" onPress={() => $.ui.close({ id: MENU })} />
        </Box>
      </Box>
    )
  })
}
```

`variant` and `role` are Button props named in the reference; if the laid types do not list them, drop them. The `show` button is pressed with hotkey `0`, or Enter while the focus ring is on it; the spec's `[Enter] show` is satisfied by the focus ring, and `0` is the hotkey shown in the label area.

- [ ] **Step 4: Wire it in `register.tsx`**

```tsx
import { MENU, openMenu, registerMenu } from './menu'
```
Inside `register`, replace the menu placeholder:
```tsx
    if (parsed.mode === 'menu') {
      const opened = await openMenu($)
      return { text: opened.isPlaced ? 'xtrace: pick what to show.' : `xtrace: ${opened.reason}` }
    }
```
and at the end of `register`:
```tsx
  registerMenu(on, async () => {})    // Task 8 replaces the no-op with setPane
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: PASS.

- [ ] **Step 6: Validate and try it live**

Run: `source ~/.bash_profile && claude plugin validate "$MOD"`
Then type `/xtrace` in the session: a dialog with seven ticks appears; `1` to `7` flip them, `0` prints the report, Esc closes.

---

### Task 8: The live pane and its on/off preference

**Files:**
- Modify: `$MOD/hooks/register.tsx`
- Create: `$MOD/hooks/pane.tsx`
- Test: `$MOD/hooks/xtrace.test.ts` (append)

**Interfaces:**
- Produces `PANE = 'xtrace'`, `setPane($, mode: 'on' | 'off' | 'toggle')`, `openPaneIfPreferred($)`, a `ui.render` hook on `{ component: 'Pane', requestId: PANE }`, and a `ui.close` hook that stores `false` when the person closes it.

- [ ] **Step 1: Append the failing tests**

```ts
describe('live pane', () => {
  test('pane on stores the preference and opens the pane', async ($, on) => {
    mock.store(on)
    const opened: string[] = []
    on('ui.open', ($, e, next) => { opened.push(e.id); return next(e) })
    const out = await $.command.run({ command: 'xtrace', args: 'pane on' })
    expect(out.text).toContain('on')
    expect(opened).toContain('xtrace')
    expect(await $.store.get('pane')).toBe(true)
  })

  test('pane off stores false and closes', async ($, on) => {
    mock.store(on, { pane: true })
    const closed: string[] = []
    on('ui.close', ($, e, next) => { closed.push(e.id); return next(e) })
    await $.command.run({ command: 'xtrace', args: 'pane off' })
    expect(closed).toContain('xtrace')
    expect(await $.store.get('pane')).toBe(false)
  })

  test('session start opens the pane when preferred', async ($, on) => {
    mock.store(on, { pane: true })
    const opened: string[] = []
    on('ui.open', ($, e, next) => { opened.push(e.id); return next(e) })
    await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
    expect(opened).toContain('xtrace')
  })

  test('a close by the person turns the preference off, an unload does not', async ($, on) => {
    mock.store(on, { pane: true })
    await $.ui.close({ id: 'xtrace', origin: { kind: 'person' } })
    expect(await $.store.get('pane')).toBe(false)
    await $.store.set('pane', true)
    await $.ui.close({ id: 'xtrace', origin: { kind: 'unload' } })
    expect(await $.store.get('pane')).toBe(true)
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    test(`draws counters and the current turn's rows, filtered by the selection (${surface})`, async ($, on) => {
      await $.state.set(SELECTION, { categories: ['tools'], scope: 'turn' })
      await $.state.set(TURNS, [{ turnId: 't1', text: 'list', startedAt: 1, isComplete: false }])
      await $.state.set(ROWS, [
        { id: 'a', turnId: 't1', kind: 'tools', name: 'Bash', target: 'ls', outcome: 'ok', startedAt: 2, ms: 3 },
        { id: 'b', turnId: 't1', kind: 'hooks', name: 'Stop', target: '', outcome: 'none', startedAt: 3, ms: 1 },
        { id: 'c', turnId: 't1', kind: 'tools', name: 'Read', target: 'a.go', outcome: 'running', startedAt: 4 },
      ])
      const ui = await $.ui.mount({
        plugin: 'xtrace', surface, component: 'Pane', requestId: 'xtrace',
        props: { title: 'xtrace', isFocused: false, bodyColumns: 80 } as never,
      })
      expect(await ui.find({ type: 'Text', text: /tools 2/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /hooks 1/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /Bash/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /Stop/ })).toBeUndefined()
      expect(await ui.find({ type: 'Text', text: /running/ })).toBeDefined()
    })
  }
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: FAIL.

- [ ] **Step 3: Write the pane module**

`$MOD/hooks/pane.tsx`:
```tsx
import { read } from 'claude-code'
import type { EngineInterface, On } from 'claude-code'
import { CATEGORIES } from './args'
import { ROWS, SELECTION, TURNS } from './state'
import { trim } from './report'

export const PANE = 'xtrace'
const PREF = 'pane'

async function isPreferred($: EngineInterface): Promise<boolean> {
  try { return (await $.store.get(PREF)) === true } catch { return false }
}

export async function setPane($: EngineInterface, mode: 'on' | 'off' | 'toggle'): Promise<'on' | 'off'> {
  const want = mode === 'toggle' ? !(await isPreferred($)) : mode === 'on'
  await $.store.set(PREF, want)
  if (want) {
    const opened = await $.ui.open({ id: PANE, title: 'xtrace' })
    if (!opened.isPlaced) $.ui.toast('xtrace: widen the terminal to 144 columns to see the pane')
  } else {
    await $.ui.close({ id: PANE })
  }
  return want ? 'on' : 'off'
}

export async function openPaneIfPreferred($: EngineInterface): Promise<void> {
  if (!(await isPreferred($))) return
  const opened = await $.ui.open({ id: PANE, title: 'xtrace' })
  if (!opened.isPlaced) $.ui.toast('xtrace: widen the terminal to 144 columns to see the pane')
}

export function registerPane(on: On) {
  on('ui.close', { id: PANE }, async ($, e, next) => {
    try {
      if (e.origin.kind === 'person') await $.store.set(PREF, false)
    } catch {}
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const [rows, turns, selection] = await Promise.all([read($, ROWS), read($, TURNS), read($, SELECTION)])
    const counters = CATEGORIES.map(c => `${c} ${rows.filter(r => r.kind === c).length}`).join(' · ')
    const turnId = turns.length === 0 ? undefined : turns[turns.length - 1].turnId
    const picked = new Set(selection.categories)
    const shown = rows.filter(r => r.turnId === turnId && picked.has(r.kind))
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 4)
    const width = e.props.bodyColumns ?? 80

    return (
      <Box flexDirection="column">
        <Text dimColor>{counters}</Text>
        <Text dimColor>{'─'.repeat(Math.max(1, Math.min(width, 120)))}</Text>
        {shown.length === 0 && <Text dimColor>No rows in this turn yet.</Text>}
        {shown.slice(-room).map(r => (
          <Text key={r.id} dimColor={r.outcome !== 'running'} wrap="truncate-end">
            {trim(`${r.kind.padEnd(8)} ${r.name} ${r.target} ${r.outcome}`, width)}
          </Text>
        ))}
      </Box>
    )
  })
}
```

If `Text` does not accept `key`, drop it. If `ui.close` matchers on `id` are refused by validate, hook `ui.close` without a matcher and check `e.id === PANE` inside.

- [ ] **Step 4: Wire it in `register.tsx`**

```tsx
import { PANE, openPaneIfPreferred, registerPane, setPane } from './pane'
```
Replace the pane placeholder in the command hook:
```tsx
    if (parsed.mode === 'pane') {
      const state = await setPane($, parsed.pane)
      return { text: `xtrace: live pane ${state}.` }
    }
```
In `session.start`, after registering the command: `await openPaneIfPreferred($)` inside its own try/catch.
At the end of `register`: replace `registerMenu(on, async () => {})` with
```tsx
  registerMenu(on, async $ => { await setPane($, 'toggle') })
  registerPane(on)
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test "$MOD"`
Expected: PASS.

- [ ] **Step 6: Validate, type-check, try it live**

Run: `source ~/.bash_profile && claude plugin validate "$MOD"`
Expected: passes, lists `$.store` key `pane`, `$.ui.open`, `$.ui.close`, `$.ui.toast`.

Run, once the mod has loaded at least once (so `$MOD/.claude-plugin/types/` exists): `source ~/.bash_profile && cd "$MOD" && tsc -p .`
Expected: no errors. If `tsc` is not on the PATH, `npx -y typescript@5 tsc -p .`.

If the types folder is not laid yet (hot reload was declined), build a tsconfig outside the mod folder from the header of the types file (`sed -n 1,80p` of the reference types file shows it) with `include` naming that file and `$MOD/hooks`, and run `tsc -p` on that.

Live: `/xtrace pane on` in a terminal wider than 144 columns shows the pane docked beside the transcript; run any prompt and watch rows appear; `/xtrace pane off` closes it; close it with the engine's key and restart the session to confirm it stays closed.

---

### Task 9: README for the mod and final checks

**Files:**
- Create: `$MOD/README.md`

- [ ] **Step 1: Write the README**

```markdown
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
```

- [ ] **Step 2: Run the whole gate one last time**

```bash
source ~/.bash_profile && claude plugin validate "$MOD" && claude plugin test "$MOD"
```
Expected: validate passes, every test passes.

- [ ] **Step 3: Report to the user**

Give the mod's full path and how it loads: enabled by hot reload, nothing to run; declined, it loads next session or with `claude --plugin-dir "$MOD"`.

---

## Self-review

**Spec coverage.** Categories and their events: Tasks 4 and 5. Target and outcome columns: Task 3 `targetOf`, Task 4 and 5 outcomes. Hook rows with configured commands: Tasks 2 and 5. Command grammar: Task 1 and 6. Menu: Task 7. Report shape, empty scope line, compaction line, nesting: Task 3. Live pane, preference, close by person, width toast: Task 8. Storage caps: Task 4 state helpers. Error handling: every recorder wraps bookkeeping and calls `next`. Testing list from the spec: each item maps to a test above. Files: the file map adds `state.ts`, `menu.tsx` and `pane.tsx` beyond the spec's list, a split of `register.tsx` for the reasons in the writing-plans file-structure rule.

**Known deviations.** The menu's show button is pressed by hotkey `0` or by Enter on the focus ring; the spec said `[Enter] show`. The `Select` element picks one value, so toggle buttons stand in for a multi-select. Plugin-shipped settings hooks (the bookstore plugin's `hooks.json`) are not in `$.settings.read()` and will not be named on hooks rows; the README says so.

**Type consistency.** `Row.kind` is `Category`; `addRow`/`finishRow` names match between Tasks 4, 5 and 8; `SELECTION` is used by Tasks 6, 7 and 8 with the same ref; `wordsOf` output is what Task 6's parser accepts.
