# xtrace: pane filtered to chosen kinds — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/xtrace tools mcp model pane` opens the live pane with its filter bar set to `kind:tools,mcp,model`.

**Architecture:** `parseArgs` learns `[categories] pane [on|off]` and returns the kinds on the `pane` result. A pure `withKinds` rewrites the filter bar's `kind:` term. The command handler writes that into `VIEW.filter` and opens the pane. The pane stops applying the stored `SELECTION`, so the filter bar is its only row filter.

**Tech Stack:** TypeScript/TSX Claude Code mod (`claude-code` engine API), tests with `claude-code/testing`.

Spec: `docs/superpowers/specs/2026-10-12-xtrace-pane-kinds-design.md`

## Global Constraints

- All paths below are relative to `.claude/skills/xtrace/`.
- Every shell command starts with `source ~/.bash_profile &&` (otherwise the wrong `git`/`claude` is on PATH).
- Run tests from `.claude/skills/xtrace/`: `source ~/.bash_profile && claude plugin test .` (whole suite, ~50 s). Baseline before this work: **192 pass, 0 fail**.
- Everything that touches `$` or an atom stays in `hooks/register.tsx`; `args.ts` and `view.ts` stay pure.
- Match surrounding style: no semicolons, single quotes, short comments only where the why is not obvious.
- Commit messages: `feat(xtrace): …` / `test(xtrace): …` / `docs(xtrace): …`, ending with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

### Task 1: `parseArgs` accepts categories with `pane`

**Files:**
- Modify: `hooks/args.ts`
- Test: `hooks/args.test.ts`

**Interfaces:**
- Produces: `ParsedArgs` pane variant becomes
  `{ mode: 'pane'; pane: 'on' | 'off' | 'toggle'; kinds?: Category[] | 'all' }`.
  `kinds` is absent for plain `pane`/`pane on`/`pane off`; present (and `pane: 'on'`) when categories or `all` were named.

- [ ] **Step 1: Write the failing tests**

In `hooks/args.test.ts`, replace the `pane modes` test with:

```ts
  test('pane modes', () => {
    expect(parseArgs('pane')).toEqual({ mode: 'pane', pane: 'toggle' })
    expect(parseArgs('pane on')).toEqual({ mode: 'pane', pane: 'on' })
    expect(parseArgs('pane off')).toEqual({ mode: 'pane', pane: 'off' })
    expect(parseArgs('pane sideways').mode).toBe('error')
  })
  test('categories with pane open it filtered to those kinds, in canonical order', () => {
    expect(parseArgs('model tools mcp pane')).toEqual({ mode: 'pane', pane: 'on', kinds: ['tools', 'mcp', 'model'] })
    expect(parseArgs('pane tools mcp')).toEqual({ mode: 'pane', pane: 'on', kinds: ['tools', 'mcp'] })
    expect(parseArgs('pane on tools')).toEqual({ mode: 'pane', pane: 'on', kinds: ['tools'] })
    expect(parseArgs('  Tools  PANE ')).toEqual({ mode: 'pane', pane: 'on', kinds: ['tools'] })
  })
  test('all with pane clears the kind filter', () => {
    expect(parseArgs('all pane')).toEqual({ mode: 'pane', pane: 'on', kinds: 'all' })
    expect(parseArgs('tools all pane')).toEqual({ mode: 'pane', pane: 'on', kinds: 'all' })
  })
  test('pane combinations that make no sense are errors with usage', () => {
    expect(messageOf('pane off tools')).toContain('pane off')
    expect(messageOf('tools session pane')).toContain('session')
    expect(messageOf('pane tools pane')).toContain('once')
    expect(parseArgs('pane on off').mode).toBe('error')
    expect(parseArgs('tools pane bananas').mode).toBe('error')
    expect(messageOf('pane off tools')).toContain('/xtrace')
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test .`
Expected: FAIL in `parseArgs > categories with pane …`, `all with pane …`, `pane combinations …`.

- [ ] **Step 3: Implement**

In `hooks/args.ts`, change `USAGE` and the pane variant of `ParsedArgs`, and route any `pane` word to a new `parsePane`:

```ts
export const USAGE =
  'Usage: /xtrace [all | tools mcp skills hooks agents commands context model] [session] | /xtrace [categories] pane [on|off]'

export type ParsedArgs =
  | { mode: 'menu' }
  | { mode: 'report'; selection: Selection }
  | { mode: 'pane'; pane: 'on' | 'off' | 'toggle'; kinds?: Category[] | 'all' }
  | { mode: 'error'; message: string; selection?: undefined }

const isCategory = (word: string): word is Category =>
  (CATEGORIES as readonly string[]).includes(word)

const error = (message: string): ParsedArgs => ({ mode: 'error', message: `${message} ${USAGE}` })

// `pane` anywhere: on, off or a toggle; categories with it open the pane filtered to them.
function parsePane(words: string[]): ParsedArgs {
  if (words.filter(w => w === 'pane').length > 1) return error('Name "pane" once.')
  let pane: 'on' | 'off' | undefined
  let all = false
  const picked = new Set<Category>()
  for (const word of words) {
    if (word === 'pane') continue
    if (word === 'on' || word === 'off') {
      if (pane !== undefined) return error(`Unknown pane option "${word}".`)
      pane = word
    } else if (word === 'all') all = true
    else if (word === 'session') return error('The pane shows one turn; "session" is for the report.')
    else if (isCategory(word)) picked.add(word)
    else return error(`Unknown word "${word}".`)
  }
  if (!all && picked.size === 0) return { mode: 'pane', pane: pane ?? 'toggle' }
  if (pane === 'off') return error('"pane off" takes no categories.')
  return { mode: 'pane', pane: 'on', kinds: all ? 'all' : CATEGORIES.filter(c => picked.has(c)) }
}

export function parseArgs(text: string): ParsedArgs {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return { mode: 'menu' }
  if (words.includes('pane')) return parsePane(words)

  const picked = new Set<Category>()
  let scope: Selection['scope'] = 'turn'
  for (const word of words) {
    if (word === 'all') CATEGORIES.forEach(c => picked.add(c))
    else if (word === 'session') scope = 'session'
    else if (isCategory(word)) picked.add(word)
    else return error(`Unknown word "${word}".`)
  }
  if (picked.size === 0) return error('Name at least one category.')
  return {
    mode: 'report',
    selection: { categories: CATEGORIES.filter(c => picked.has(c)), scope },
  }
}
```

(The existing `isCategory` declaration is kept once; `wordsOf`, `withNewCategories` unchanged.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test .`
Expected: all pass (192 − 1 replaced + 4 new = 195 pass).

- [ ] **Step 5: Commit**

```bash
source ~/.bash_profile && git add hooks/args.ts hooks/args.test.ts && git commit -m "feat(xtrace): categories with pane parse to the kinds to filter" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `withKinds` rewrites the filter's kind term

**Files:**
- Modify: `hooks/view.ts` (next to `withSort`, ~line 146)
- Test: `hooks/view.test.ts` (new `describe` after `withSort`)

**Interfaces:**
- Produces: `export function withKinds(text: string, kinds: readonly Category[] | 'all'): string`

- [ ] **Step 1: Write the failing tests**

Add `withKinds` to the import from `./view` in `hooks/view.test.ts`, then after the `withSort` describe:

```ts
describe('withKinds', () => {
  test('adds the kind term in front of the rest', () => {
    expect(withKinds('', ['tools', 'mcp'])).toBe('kind:tools,mcp')
    expect(withKinds('sort:-ms bash', ['tools', 'mcp'])).toBe('kind:tools,mcp sort:-ms bash')
  })
  test('replaces every kind term, negated or any case, keeping the other terms in order', () => {
    expect(withKinds('KIND:hooks sort:-ms kind:!mcp  name:bash', ['model'])).toBe('kind:model sort:-ms name:bash')
  })
  test('all removes the kind term', () => {
    expect(withKinds('kind:model sort:-ms', 'all')).toBe('sort:-ms')
    expect(withKinds('', 'all')).toBe('')
  })
  test('the result parses to the kinds it shows', () => {
    const parsed = parseFilter(withKinds('', ['tools', 'model']))
    expect(parsed.errors).toEqual([])
    expect(parsed.match(row({ kind: 'model' }), undefined)).toBe(true)
    expect(parsed.match(row({ kind: 'mcp' }), undefined)).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `source ~/.bash_profile && claude plugin test .`
Expected: FAIL — `withKinds` is not exported.

- [ ] **Step 3: Implement**

In `hooks/view.ts`, extend the type import and add after `withSort`:

```ts
import type { Category, Row, Turn } from '../types'
```

```ts
const isKindTerm = (t: string) => t.toLowerCase().startsWith('kind:')

// `/xtrace tools mcp pane`: the kinds lead the bar, replacing any kind term; `all` drops it.
export function withKinds(text: string, kinds: readonly Category[] | 'all'): string {
  const kept = text.trim().split(/\s+/).filter(t => t !== '' && !isKindTerm(t))
  return (kinds === 'all' ? kept : [`kind:${kinds.join(',')}`, ...kept]).join(' ')
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test .`
Expected: all pass (199).

- [ ] **Step 5: Commit**

```bash
source ~/.bash_profile && git add hooks/view.ts hooks/view.test.ts && git commit -m "feat(xtrace): withKinds rewrites the filter's kind term" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: The pane stops applying the stored selection

The pane currently drops rows whose kind is not in `SELECTION` and shows the plugins column only when `hooks` is selected. After this task the filter bar is the only row filter, and the plugins column shows when a hooks row is shown.

Probing this change against the current suite breaks exactly 7 engine tests, all because hook rows (one recorded per tool call) now appear in the pane. They are re-pointed at the new mechanism below. Pane height arithmetic: a non-empty filter adds the `N of M rows shown` line, so at `bodyRows: 20` with overflow 8 rows fit instead of 9.

**Files:**
- Modify: `hooks/register.tsx` (pane render, ~lines 491–530 and 662)
- Test: `hooks/xtrace.test.ts`

**Interfaces:**
- Consumes: nothing from Tasks 1–2. `/xtrace tools pane` only writes the bar after Task 4, so the re-pointed tests type `kind:tools` into the filter bar themselves.
- Note: the spec's engine test names `model`; Task 4 uses `mcp` instead, because the test kit records MCP rows with one `tool.call`. The behaviour is identical for every kind.

- [ ] **Step 1: Write the failing test**

In `hooks/xtrace.test.ts`, inside `describe('live pane', …)` after the surface loop, add:

```ts
  test('the stored selection no longer narrows the pane', async ($, on) => {
    answerTurns(on)
    answerUi(on)
    on('tool.call', () => ({ result: {}, text: '' }))
    await xtrace($, 'tools')                       // selection: tools only, for the report
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'mcp__sqlite-bookstore__query', sql: 'select 1', tool_use_id: 'u1' })
    const ui = await $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
    expect(await findRow(ui, /sqlite-bookstore \/ query/)).toBeDefined()
  })
```

- [ ] **Step 2: Run to verify it fails**

Run: `source ~/.bash_profile && claude plugin test .`
Expected: FAIL `live pane > the stored selection no longer narrows the pane`.

- [ ] **Step 3: Implement the pane change**

In `hooks/register.tsx` Pane render:

- Delete `const selection: Selection = await read($, SELECTION)` and `const picked = new Set(selection.categories)`.
- Replace
  ```ts
      const selected = turnRows.filter(r => picked.has(r.kind))
      const shown = applyView(selected, parsed, counts)
  ```
  with
  ```ts
      const shown = applyView(turnRows, parsed, counts)
  ```
- Replace `const withPlugins = picked.has('hooks')` with
  ```ts
      const withPlugins = shown.some(r => r.kind === 'hooks')
  ```
- In the `shown` line (~662) replace `selected` with `turnRows` in both places:
  ```tsx
          {turnRows.length > 0 && isFiltered && <Box key="shown"><Text dimColor>{`${shown.length} of ${turnRows.length} rows shown`}</Text></Box>}
  ```
- If `Selection` is no longer used anywhere in the file, drop it from the type import (TS will flag it).

- [ ] **Step 4: Re-point the 7 tests that relied on the selection**

All in `hooks/xtrace.test.ts`:

1. `live pane > draws counters and the current turn's rows, filtered by the selection` (terminal + desktop loop). Rename the title to `…, filtered by the kind term (${surface})`. Inside the in-flight `Read` handler, right after mounting, narrow the bar before looking:
   ```ts
        const ui = await $.ui.mount({ plugin: 'xtrace', surface, component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
        await ui.input({ key: 'filter', text: 'kind:tools', kind: 'change' })
   ```
   Change `await xtrace($, 'tools')                       // selection: tools only` to nothing (delete the line), and the last comment to `// hooks filtered out: counted, not listed`.

2. `pane filter and sort > typing a filter narrows the rows and shows the count`:
   ```ts
    await ui.input({ key: 'filter', text: 'kind:tools name:bash', kind: 'change' })
    expect(await findRow(ui, /Bash\s+ls\s+ok/)).toBeDefined()
    expect(await findRow(ui, /Read\s+a\.go/)).toBeUndefined()
    expect((await ui.find({ key: 'shown' }))?.text).toMatch(/^1 of \d+ rows shown$/)
   ```

3. `pane filter and sort > pressing a header sorts and writes the sort into the bar`:
   ```ts
    const ui = await twoRows($, on)
    await ui.input({ key: 'filter', text: 'kind:tools', kind: 'change' })
    await ui.press({ key: 'sort-name' })
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('kind:tools sort:name')
    expect((await ui.find({ key: 'sort-name' }))?.props.label).toBe('name▲')
    const rows = await paneRows(ui)
    expect(rows).toEqual([expect.stringMatching(/Bash/), expect.stringMatching(/Read/)])
    await ui.press({ key: 'sort-name' })
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('kind:tools sort:-name')
    await ui.press({ key: 'sort-name' })
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('kind:tools')
   ```

4. `pane height > the rows fit the pane's own rows, so it never scrolls`: after mounting add
   `await ui.input({ key: 'filter', text: 'kind:tools', kind: 'change' })`, update the comment to list the `shown` line, and expect `toHaveLength(8)`.

5. `pane height > an overflowing turn says what is hidden and pages through it`: after mounting add the same `kind:tools` input, then:
   - `'↑ 21 earlier rows'` → `'↑ 22 earlier rows'` (both in `hidden` and in the `paging` regex)
   - `'rows 22–30 of 30'` → `'rows 23–30 of 30'` (all three places)
   - after `page-up`: `'rows 13–21 of 30'` → `'rows 15–22 of 30'`; `echo 14` still defined, `echo 29` still undefined.

6. `pane height > a paged window stays with its turn: …`: after mounting add the same `kind:tools` input; expect `'rows 23–30 of 30'`.

In each of these, the now-unused `await xtrace($, 'tools')` setup line may stay (it only sets the report's selection); remove it where it no longer serves the test.

- [ ] **Step 5: Run the suite**

Run: `source ~/.bash_profile && claude plugin test .`
Expected: all pass (200). If a pane height number is off by one, recompute from `base = bodyRows - 7 - 2 - extra - total.length` in `register.tsx` and fix the expectation, not the code.

- [ ] **Step 6: Commit**

```bash
source ~/.bash_profile && git add hooks/register.tsx hooks/xtrace.test.ts && git commit -m "feat(xtrace): the pane filters by its bar only, not the stored selection" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `/xtrace … pane` writes the kind term and opens the pane; docs

**Files:**
- Modify: `hooks/register.tsx` (command handler ~line 337, `argumentHint` ~line 213, import from `./view`)
- Modify: `README.md`
- Test: `hooks/xtrace.test.ts`

**Interfaces:**
- Consumes: `parseArgs` pane result with `kinds?: Category[] | 'all'` (Task 1); `withKinds(text, kinds)` (Task 2); existing `setFilter($, filter)`, `setPane($, mode)`, `read($, VIEW)` in `register.tsx`.
- Produces: reply text `xtrace: live pane on, filter "<filter>".`

- [ ] **Step 1: Write the failing tests**

In `hooks/xtrace.test.ts`, after `describe('live pane', …)`:

```ts
describe('pane opened with categories', () => {
  const mountPane = ($: Engine) =>
    $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })

  test('categories before pane open it with the kind term in the bar', async ($, on) => {
    answerTurns(on)
    mock.store(on)
    const opened: string[] = []
    answerUi(on, opened)
    on('tool.call', () => ({ result: {}, text: '' }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
    await $.tool.call({ tool: 'mcp__sqlite-bookstore__query', sql: 'select 1', tool_use_id: 'u2' })
    expect(await xtrace($, 'mcp pane')).toBe('xtrace: live pane on, filter "kind:mcp".')
    expect(opened).toEqual(['xtrace'])
    const ui = await mountPane($)
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('kind:mcp')
    expect(await findRow(ui, /sqlite-bookstore \/ query/)).toBeDefined()
    expect(await findRow(ui, /Bash\s+ls/)).toBeUndefined()
  })

  test('the kind term is replaced, the rest of the bar kept; all clears it', async ($, on) => {
    answerTurns(on)
    mock.store(on)
    answerUi(on)
    const ui = await mountPane($)
    await ui.input({ key: 'filter', text: 'kind:hooks sort:-ms', kind: 'change' })
    expect(await xtrace($, 'tools mcp pane')).toBe('xtrace: live pane on, filter "kind:tools,mcp sort:-ms".')
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('kind:tools,mcp sort:-ms')
    expect(await xtrace($, 'all pane')).toBe('xtrace: live pane on, filter "sort:-ms".')
  })

  test('nonsense combinations answer with usage and leave the pane alone', async ($, on) => {
    mock.store(on)
    const opened: string[] = []
    answerUi(on, opened)
    expect(await xtrace($, 'tools session pane')).toContain('Usage: /xtrace')
    expect(await xtrace($, 'pane off tools')).toContain('Usage: /xtrace')
    expect(opened).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `source ~/.bash_profile && claude plugin test .`
Expected: the first two tests FAIL (reply is `xtrace: live pane on.`, bar unchanged); the third passes already.

- [ ] **Step 3: Implement**

In `hooks/register.tsx`, add `withKinds` to the existing import from `./view`. Replace the pane line of the `command.run` handler:

```ts
    if (parsed.mode === 'pane') {
      if (parsed.kinds === undefined) return { text: `xtrace: live pane ${await setPane($, parsed.pane)}.` }
      const filter = withKinds((await read($, VIEW)).filter, parsed.kinds)
      await setFilter($, filter)
      await setPane($, 'on')
      return { text: `xtrace: live pane on, filter "${filter}".` }
    }
```

Change the registered `argumentHint` to:

```ts
        argumentHint: '[all | tools mcp skills hooks agents commands context model] [session | pane] | pane [on|off]',
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `source ~/.bash_profile && claude plugin test .`
Expected: all pass (203).

- [ ] **Step 5: Update the README**

In `README.md`, the usage block becomes:

```
    /xtrace                     menu
    /xtrace all                 every category, last turn
    /xtrace tools mcp hooks     chosen categories, last turn
    /xtrace tools session       whole session
    /xtrace pane [on|off]       live pane
    /xtrace tools mcp pane      live pane, filtered to these kinds
```

In the "Live pane" section, directly before the line starting `The filter takes \`column:value\` terms`, add this paragraph:

```
Categories named with `pane` lead the filter bar as one `kind:` term,
replacing any there; `all pane` drops it. The rest of the bar stays. The
pane filters by its bar only; the categories picked for the report do not
narrow it.
```

- [ ] **Step 6: Validate and commit**

Run: `source ~/.bash_profile && claude plugin validate . && claude plugin test .`
Expected: validate OK; 203 pass, 0 fail.

```bash
source ~/.bash_profile && git add hooks/register.tsx hooks/xtrace.test.ts README.md && git commit -m "feat(xtrace): /xtrace <categories> pane opens the pane filtered to them" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Manual check (after Task 4)

In a live session (terminal ≥ 144 columns), with the mod loaded:
1. `/xtrace tools mcp model pane` → pane opens, bar reads `kind:tools,mcp,model`.
2. Type ` sort:-ms` after it, then `/xtrace hooks pane` → bar reads `kind:hooks sort:-ms`, plugins column visible.
3. `/xtrace all pane` → bar reads `sort:-ms`, every kind listed.
