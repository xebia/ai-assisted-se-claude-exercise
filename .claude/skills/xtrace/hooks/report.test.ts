import { describe, expect, test } from 'claude-code/testing'
import { attachHookContext, costOf, counterSegments, denialCategory, fmtCost, DARK, LIGHT, msStyle, paletteFor, buildReport, firstWords, fmtDuration, fmtTokens, outcomeStyle, paneHeader, paneHeaderCells, paneLine, paneSegments, paneTotalSegments, scopedTurns, targetOf, tokenStyle, tokenTotals, tokenValues, tokensOf, turnTotal, turnTotalLines } from './report'
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
    expect(text).toContain('Rows before the first edit: 2')   // Grep and Read precede the Edit
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

describe('plugin hooks column', () => {
  const hook = row({ id: 'h', kind: 'hooks', name: 'PreToolUse Bash', target: 'cc-status', plugins: 'context-mode', outcome: 'context', ms: 177 })

  test('the report shows it, apart from Target, when hooks are picked', () => {
    const text = buildReport({ rows: [hook], turns: [turn2], compactions: [], selection: { categories: ['hooks'], scope: 'turn' } })
    expect(text).toContain('| # | Kind | Name | Target | Plugins | Outcome | ms |')
    expect(text).toContain('| 1 | hooks | PreToolUse Bash | cc-status | context-mode | context | 177 |')
  })
  test('rows without plugins leave the cell empty', () => {
    const text = buildReport({ rows: [row({})], turns: [turn2], compactions: [], selection: { categories: ['tools', 'hooks'], scope: 'turn' } })
    expect(text).toContain('| 1 | tools | Read | a.go |  | ok | 5 |')
  })
})

describe('pane lines', () => {
  test('columns start at the same place whatever the content', () => {
    const a = paneLine(row({ name: 'Read', target: 'a.go', ms: 5 }), 100, true)
    const b = paneLine(row({ kind: 'hooks', name: 'PreToolUse Bash', target: 'cc-status', plugins: 'context-mode', outcome: 'context', ms: 177 }), 100, true)
    const header = paneHeader(100, true)
    for (const line of [a, b, header]) expect(line.length).toBe(98)   // 2 columns of right margin
    expect(a.indexOf('ok')).toBe(b.lastIndexOf('context'))   // the first 'context' is inside context-mode
    expect(header.indexOf('outcome')).toBe(b.lastIndexOf('context'))
    expect(header.indexOf('plugins')).toBe(b.indexOf('context-mode'))
  })
  test('a long target is cut to fit the width', () => {
    const line = paneLine(row({ name: 'Bash', target: 'cd /Users/urs/development/' + 'x'.repeat(200), ms: 11980 }), 90, true)
    expect(line.length).toBe(88)
    expect(line).toContain('…')
    expect(line.endsWith('11980')).toBe(true)
  })
  test('without hooks picked there is no plugin column', () => {
    expect(paneHeader(80, false)).not.toContain('plugins')
  })
})

describe('hook context on the hooks row', () => {
  const pre = row({ id: 'p1', turnId: 't2', kind: 'hooks', name: 'PreToolUse Bash', target: 'cc-status', outcome: 'running' })
  const post = row({ id: 'p2', turnId: 't2', kind: 'hooks', name: 'PostToolUse Bash', target: 'cc-status', outcome: 'none' })

  test('lands on the latest row of that event in the turn', () => {
    const older = { ...pre, id: 'p0' }
    const out = attachHookContext([older, pre, post], 't2', 'PreToolUse', 636)
    expect(out?.map(r => r.chars)).toEqual([undefined, 636, undefined])
    expect(out?.[1]?.outcome).toBe('context')
  })
  test('adds up several appends', () => {
    const once = attachHookContext([pre], 't2', 'PreToolUse', 10) ?? []
    expect(attachHookContext(once, 't2', 'PreToolUse', 5)?.[0]?.chars).toBe(15)
  })
  test('no row of that event in the turn gives undefined', () => {
    expect(attachHookContext([pre], 't2', 'Stop', 5)).toBeUndefined()
    expect(attachHookContext([pre], 't1', 'PreToolUse', 5)).toBeUndefined()
  })
})

describe('tokens', () => {
  const usage = (input: number, cacheRead: number, cacheWrite: number, output: number) =>
    ({ model: 'claude-opus-5-5', input, cacheRead, cacheWrite, output })
  // step 0 (context 10,000, out 200) → Read (4,000 chars) + context (1,000 chars) → step 1 (context 12,700)
  const step0 = row({ id: 's0', kind: 'model', name: 'step 0', startedAt: 100, usage: usage(500, 9000, 500, 200) })
  const read = row({ id: 'r1', name: 'Read', startedAt: 110, chars: 4000 })
  const ctx = row({ id: 'c1', kind: 'context', name: 'hook PostToolUse', startedAt: 120, chars: 1000 })
  const step1 = row({ id: 's1', kind: 'model', name: 'step 1', startedAt: 130, usage: usage(100, 10000, 2600, 50) })
  const after = row({ id: 'r2', name: 'Bash', startedAt: 140, chars: 400 })

  test('formats counts', () => {
    expect(fmtTokens(310)).toBe('310')
    expect(fmtTokens(45100)).toBe('45.1k')
  })
  test('model rows show what the request wrote, exact', () => {
    expect(tokensOf([step0, step1]).get('s0')).toBe('+200')
    expect(tokensOf([step0, step1]).get('s1')).toBe('+50')
  })
  test('row tokens plus every request\'s output but the last add up to the growth', () => {
    // 12,700 − 10,000 = 2,700 = Read 2,000 + context 500 + step 0's output 200
    const t = tokensOf([step0, read, ctx, step1])
    expect(t.get('r1')).toBe('~2.0k')
    expect(t.get('c1')).toBe('~500')
    expect(t.get('s0')).toBe('+200')
  })
  test('rows between two requests split the measured growth by their share of text', () => {
    // growth = 12,700 − 10,000 − 200 = 2,500: Read 4/5 = 2,000, context 1/5 = 500
    const t = tokensOf([step0, read, ctx, step1, after])
    expect(t.get('r1')).toBe('~2.0k')
    expect(t.get('c1')).toBe('~500')
  })
  test('rows after the last request fall back to chars / 4', () => {
    expect(tokensOf([step0, read, ctx, step1, after]).get('r2')).toBe('~100')
  })
  test('loops are measured apart', () => {
    const sub = { ...read, id: 'r3', agentId: 'ag1' }
    expect(tokensOf([step0, sub, step1]).get('r3')).toBe('~1.0k')   // not between main steps' measure
  })
  test('totals per loop', () => {
    const [line] = tokenTotals([step0, read, step1])
    expect(line).toBe('Tokens: 2 request(s) · context +2.7k (10.0k → 12.7k) · ≈$0.04 · output 250 · cache read 19.0k · uncached 600 · cache write 3.1k')
  })
  test('the report has a Tokens column and the totals', () => {
    const text = buildReport({ rows: [step0, read, ctx, step1], turns: [turn2], compactions: [], selection: { categories: ['tools', 'model'], scope: 'turn' } })
    expect(text).toContain('| # | Kind | Name | Target | Outcome | ms | Tokens |')
    expect(text).toContain('| tools | Read | a.go | ok | 5 | ~2.0k |')
    expect(text).toContain('| model | step 1 |')
    expect(text).toContain('Total: ')
    expect(text).toContain(' · 2 request(s) · context +2.7k (10.0k → 12.7k)')
    expect(text).not.toContain('Tokens: ')                 // one turn: its total is the only one
  })
})

describe('pane colors', () => {
  const hook = row({ kind: 'hooks', name: 'PreToolUse Bash', target: 'cc-status', plugins: 'context-mode', outcome: 'context', ms: 177 })

  test('segments join to exactly the plain line, so colors never move a column', () => {
    for (const [r, tokens] of [[hook, '~159'], [row({ ms: 5 }), '~2.0k'], [row({ outcome: 'running', ms: undefined }), '']] as const) {
      expect(paneSegments(r, 100, true, tokens).map(s => s.text).join('').trimEnd()).toBe(paneLine(r, 100, true, tokens))
    }
  })
  test('kind and name share the kind color, graded by what the kind usually costs', () => {
    const segs = paneSegments(hook, 100, true, '~159')
    expect(segs[0]).toMatchObject({ text: expect.stringMatching(/^hooks/), color: DARK.kind.hooks, bold: true })
    expect(segs[2]).toMatchObject({ text: expect.stringMatching(/^PreToolUse Bash/), color: DARK.kind.hooks })
    expect(segs[2]?.bold).toBeUndefined()
    expect(paneSegments(hook, 100, true, '', LIGHT)[0]).toMatchObject({ color: LIGHT.kind.hooks })
  })
  test('outcomes', () => {
    expect(outcomeStyle('ok')).toEqual({ color: DARK.outcome })
    expect(outcomeStyle('none')).toEqual({ color: DARK.outcome })
    expect(outcomeStyle('denied')).toEqual({ color: 'error', bold: true })
    expect(outcomeStyle('running')).toEqual({ color: 'warning' })
  })
  test('token weight, model rows included', () => {
    expect(tokenStyle('~640')).toEqual({ color: DARK.tokens })
    expect(tokenStyle('~1.0k')).toEqual({ color: 'warning', bold: true })   // warning from 1k on
    expect(tokenStyle('~10.0k')).toEqual({ color: 'warning', bold: true })
    expect(tokenStyle('~12.4k')).toEqual({ color: 'error', bold: true })
    expect(tokenStyle('+1.4k')).toEqual({ color: 'warning', bold: true })   // a model row's output
  })
  test('ms: one grey step per power of ten', () => {
    expect([8, 70, 196, 9194, 25958].map(ms => msStyle(ms).color)).toEqual(DARK.ms)
    expect(msStyle(undefined)).toEqual({})
  })
  test('the theme setting picks the palette', () => {
    expect(paletteFor('light-daltonized')).toBe(LIGHT)
    expect(paletteFor('dark')).toBe(DARK)
    expect(paletteFor(undefined)).toBe(DARK)
  })
  test('counters: labels and values in their own colors', () => {
    expect(counterSegments([['tools', 95], ['mcp', 0]])).toEqual([
      { text: 'tools', color: DARK.label }, { text: ' ' }, { text: '95', color: DARK.value }, { text: ' ' },
      { text: '·', color: DARK.separator }, { text: ' ' },
      { text: 'mcp', color: DARK.label }, { text: ' ' }, { text: '0', color: DARK.value },
    ])
  })
})

describe('turn totals', () => {
  const usage = (input: number, cacheRead: number, cacheWrite: number, output: number) =>
    ({ model: 'claude-opus-5-5', input, cacheRead, cacheWrite, output })
  const step0 = row({ id: 's0', kind: 'model', name: 'step 0', startedAt: 2100, ms: 900, usage: usage(500, 9000, 500, 200) })
  const step1 = row({ id: 's1', kind: 'model', name: 'step 1', startedAt: 3500, ms: 700, usage: usage(100, 10000, 2600, 50) })
  const done: Turn = { ...turn2, startedAt: 2000, isComplete: true, completedAt: 14300 }

  test('durations', () => {
    expect(fmtDuration(640)).toBe('640ms')
    expect(fmtDuration(12300)).toBe('12.3s')
    expect(fmtDuration(125000)).toBe('2m 05s')
  })
  test('a finished turn: time from prompt to answer, then its tokens', () => {
    expect(turnTotalLines(done, [step0, step1], 99999)).toEqual([
      'Total: 12.3s · 2 request(s) · context +2.7k (10.0k → 12.7k) · ≈$0.04',
      'output 250 · cache read 19.0k · uncached 600 · cache write 3.1k',
    ])
    expect(turnTotal(done, [step0, step1], 99999)).toBe(
      'Total: 12.3s · 2 request(s) · context +2.7k (10.0k → 12.7k) · ≈$0.04 · output 250 · cache read 19.0k · uncached 600 · cache write 3.1k')
  })
  test('a running turn counts to now', () => {
    expect(turnTotal({ ...done, isComplete: false, completedAt: undefined }, [step0], 7000)).toMatch(/^Total: 5\.0s so far · 1 request\(s\)/)
  })
  test('a turn finished before completedAt existed ends at its last row', () => {
    expect(turnTotal({ ...done, completedAt: undefined }, [step0, step1], 99999)).toMatch(/^Total: 2\.2s · /)
  })
  test('no model rows still gives the time', () => {
    expect(turnTotalLines(done, [], 0)).toEqual(['Total: 12.3s · no model requests recorded'])
  })
  test('subagents get their own part', () => {
    const sub = { ...step0, id: 'a0', agentId: 'ag1' }
    const lines = turnTotalLines(done, [step0, sub], 0)
    expect(lines[2]).toMatch(/^subagents: 1 request\(s\) · context /)    // overall first
    expect(lines[2]).not.toContain('output')
    expect(lines[3]).toMatch(/^output /)                                  // the detail on its own line
    expect(lines).toHaveLength(4)
  })
  test('the report still reads the subagent part as one line', () => {
    const sub = { ...step0, id: 'a0', agentId: 'ag1' }
    expect(turnTotal(done, [step0, sub], 0)).toMatch(/subagents: 1 request\(s\) · context [^·]+· ≈\$\d+\.\d\d · output /)
  })
  test('the report puts the total under each turn; several turns also get a session line', () => {
    const t1: Turn = { ...turn1, isComplete: true, completedAt: 1500 }
    const r1 = { ...step0, id: 'x0', turnId: 't1', startedAt: 1100 }
    const text = buildReport({ rows: [r1, step0, step1], turns: [t1, done], compactions: [], selection: { categories: ['model'], scope: 'session' }, now: 0 })
    expect(text.match(/^Total: /gm)).toHaveLength(2)
    expect(text).toContain('Tokens: 3 request(s)')
  })
  test('pane footer: figures start under the name column, labels and values apart, all cut to the pane', () => {
    const first = paneTotalSegments('Total: 12.3s · 2 request(s) · context +2.7k (10.0k → 12.7k)', 100, true)
    expect(first[0]).toEqual({ text: 'Total:   ', color: DARK.value, bold: true })
    expect(first.slice(1, 4)).toEqual([{ text: '12.3s', color: DARK.value }, { text: ' ' }, { text: '·', color: DARK.separator }])
    expect(first.find(s => s.text === '+2.7k (10.0k → 12.7k)')).toEqual({ text: '+2.7k (10.0k → 12.7k)', color: DARK.value })
    expect(first.find(s => s.text === 'request(s)')).toEqual({ text: 'request(s)', color: DARK.label })
    expect(paneTotalSegments('Total: 12.3s · 2 request(s) · context +2.7k (10.0k → 12.7k)', 30, true).map(s => s.text).join('')).toHaveLength(28)
    const second = paneTotalSegments('output 250 · cache read 19.0k · uncached 600 · cache write 3.1k', 30, false)
    expect(second[0]).toEqual({ text: '         ' })
    expect(second.map(s => s.text).join('')).toHaveLength(28)
    const agents = paneTotalSegments('subagents: 1 request(s) · context +0 (48.3k → 48.3k)', 100, false)
    expect(agents[0]).toEqual({ text: 'Agents:  ', color: DARK.value, bold: true })
    expect(agents.map(s => s.text).join('')).not.toContain('subagents')
  })
})

describe('tokenValues', () => {
  const step = (id: string, startedAt: number, input: number, output: number): Row =>
    row({ id, kind: 'model', name: 'step', startedAt, usage: { model: 'm', input, cacheRead: 0, cacheWrite: 0, output } })
  test('model rows are exact: their output', () => {
    const v = tokenValues([step('s0', 1, 1000, 200)])
    expect(v.get('s0')).toEqual({ n: 200, exact: true })
  })
  test('rows with text are estimates: chars / 4, rounded up', () => {
    expect(tokenValues([row({ id: 'r1', chars: 4001 })]).get('r1')).toEqual({ n: 1001, exact: false })
  })
  test('rows between two requests share the measured growth by their text', () => {
    const v = tokenValues([step('s0', 1, 1000, 100), row({ id: 'r1', startedAt: 2, chars: 300 }), row({ id: 'r2', startedAt: 3, chars: 100 }), step('s1', 4, 1500, 50)])
    expect(v.get('r1')).toEqual({ n: 300, exact: false })    // grown 400 = 1500 - 1000 - 100, 3/4 of it
    expect(v.get('r2')).toEqual({ n: 100, exact: false })
  })
  test('tokensOf formats the same values', () => {
    const rows = [step('s0', 1, 1000, 200), row({ id: 'r1', startedAt: 2, chars: 4000 })]
    expect(tokensOf(rows).get('s0')).toBe('+200')
    expect(tokensOf(rows).get('r1')).toBe('~1.0k')
  })
})

describe('paneHeaderCells', () => {
  test('one cell per visible column, fitted like the rows', () => {
    const cells = paneHeaderCells(100, false)
    expect(cells.map(c => c.column)).toEqual(['kind', 'name', 'target', 'outcome', 'tokens', 'ms'])
    expect(cells.map(c => c.text).join(' ').trimEnd()).toBe(paneHeader(100, false))
  })
  test('plugins appears only with hooks', () => {
    expect(paneHeaderCells(100, true).map(c => c.column)).toContain('plugins')
  })
  test('a mark is appended when it fits, else takes the last place', () => {
    const name = paneHeaderCells(100, false, { name: '▲' }).find(c => c.column === 'name')
    expect(name?.text.trim()).toBe('name▲')
    const outcome = paneHeaderCells(100, false, { outcome: '▼' }).find(c => c.column === 'outcome')
    expect(outcome?.text.trim()).toBe('outcom▼')                 // the column is 7 wide
    const ms = paneHeaderCells(100, false, { ms: '▼' }).find(c => c.column === 'ms')
    expect(ms?.text.trim()).toBe('ms▼')
    expect(ms?.text.startsWith(' ')).toBe(true)                  // still right-aligned
  })
})

describe('cost', () => {
  const cents = (usd: number | undefined) => (usd === undefined ? undefined : Math.round(usd * 1e6))   // to a millionth of a dollar
  const u = (model: string, input: number, cacheRead: number, cacheWrite: number, output: number) => ({ model, input, cacheRead, cacheWrite, output })
  test('list price per token kind; cache writes at the 1-hour rate (2x input)', () => {
    // Opus 5.5: $4 in, $20 out, $0.20 cache read, $8 cache write per MTok.
    expect(cents(costOf(u('claude-opus-5-5', 1000, 100_000, 2000, 500)))).toBe(cents(0.05))
  })
  test('the model id may carry a suffix or a platform prefix; the longest known name wins', () => {
    expect(cents(costOf(u('claude-opus-5-5[1m]', 1_000_000, 0, 0, 0)))).toBe(cents(4))
    expect(cents(costOf(u('claude-opus-5', 1_000_000, 0, 0, 0)))).toBe(cents(5))
    expect(cents(costOf(u('us.anthropic.claude-sonnet-5-5', 0, 0, 0, 1_000_000)))).toBe(cents(10))
  })
  test('Haiku 5.5 costs more once the prompt is over 100K tokens', () => {
    expect(cents(costOf(u('claude-haiku-5-5', 50_000, 0, 0, 1_000_000)))).toBe(cents(0.005 + 0.5))
    expect(cents(costOf(u('claude-haiku-5-5', 150_000, 0, 0, 1_000_000)))).toBe(cents(0.075 + 2.5))
  })
  test('an unknown model has no price', () => {
    expect(costOf(u('gpt-9', 1000, 0, 0, 0))).toBeUndefined()
  })
  test('formatted to the cent, tiny amounts as under a cent', () => {
    expect(fmtCost(0.4249)).toBe('≈$0.42')
    expect(fmtCost(12.5)).toBe('≈$12.50')
    expect(fmtCost(0.004)).toBe('≈<$0.01')
  })
  test('the total puts the spend after the context', () => {
    const step = row({ id: 's0', kind: 'model', startedAt: 2001, usage: u('claude-opus-5-5', 1000, 100_000, 2000, 500) })
    const done: Turn = { ...turn2, isComplete: true, completedAt: 14300 }
    expect(turnTotalLines(done, [step], 0)[0]).toMatch(/context \+0 \(103\.0k → 103\.0k\) · ≈\$0\.05$/)
  })
  test('a loop with an unpriced model says the spend is partial', () => {
    const a = row({ id: 's0', kind: 'model', startedAt: 2001, usage: u('claude-opus-5-5', 1000, 100_000, 2000, 500) })
    const b = row({ id: 's1', kind: 'model', startedAt: 2002, usage: u('gpt-9', 1000, 100_000, 2000, 500) })
    const done: Turn = { ...turn2, isComplete: true, completedAt: 14300 }
    expect(turnTotalLines(done, [a, b], 0)[0]).toMatch(/≈\$0\.05 \+ \?$/)
  })
})

describe('denialCategory', () => {
  test('the bracketed category auto mode puts first', () => {
    expect(denialCategory('[Auto-Mode Bypass] Spawning an agent to …')).toBe('Auto-Mode Bypass')
    expect(denialCategory('  [Data Exfiltration] sends the repo')).toBe('Data Exfiltration')
  })
  test('no category: the reason, trimmed', () => {
    expect(denialCategory('Auto mode could not determine the safety of this action')).toBe('Auto mode could not determine the safety…')
    expect(denialCategory('')).toBeUndefined()
  })
})
