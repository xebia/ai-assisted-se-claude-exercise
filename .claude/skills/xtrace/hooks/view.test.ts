import { describe, expect, test } from 'claude-code/testing'
import { applyView, canNav, canPage, COLUMNS, EXAMPLES, navLabel, navTarget, parseFilter, PLACEHOLDER, pageRows, rowWindow, scrollRows, sortMark, turnTitle, viewedTurn, withSort } from './view'
import type { Row, Turn } from '../types'

const row = (over: Partial<Row>): Row => ({
  id: 'r', turnId: 't1', kind: 'tools', name: 'Read', target: 'a.go', outcome: 'ok', startedAt: 1, ...over,
})

// A turn's worth of rows, one of each shape the examples talk about.
const FIXTURE: Row[] = [
  row({ id: 'bash', name: 'Bash', target: 'go test ./...', ms: 1200 }),
  row({ id: 'read', name: 'Read', target: 'internal/store/cache.go', ms: 4 }),
  row({ id: 'grep', name: 'Grep', target: '`TODO` in src/', ms: 300, outcome: 'error' }),
  row({ id: 'mcp', kind: 'mcp', name: 'sqlite / query', target: 'select 1', ms: 150 }),
  row({ id: 'hook', kind: 'hooks', name: 'PreToolUse Bash', target: 'node pre.mjs', plugins: 'superpowers', outcome: 'blocked', ms: 20 }),
  row({ id: 'step', kind: 'model', name: 'step 0', target: 'claude-opus-5-5', ms: 3000 }),
]
const TOKENS = new Map<string, number>([['bash', 6000], ['read', 900], ['step', 310]])

const ids = (text: string) => applyView(FIXTURE, parseFilter(text), TOKENS).map(r => r.id)

describe('the examples', () => {
  test('every example parses with no errors', () => {
    for (const x of EXAMPLES) expect(parseFilter(x.text).errors).toEqual([])
  })
  test('every example matches what its meaning says', () => {
    expect(ids('outcome:!ok')).toEqual(['grep', 'hook'])
    expect(ids('kind:tools sort:-ms')).toEqual(['bash', 'grep', 'read'])
    expect(ids('tokens:>5k')).toEqual(['bash'])
    expect(ids('kind:tools,mcp name:bash')).toEqual(['bash'])
    expect(ids('ms:100..900 cache')).toEqual([])
    expect(ids('ms:1..900 cache')).toEqual(['read'])
  })
  test('the placeholder shows the first three examples', () => {
    expect(PLACEHOLDER).toBe('try: outcome:!ok · kind:tools sort:-ms · tokens:>5k')
  })
})

describe('parseFilter: text columns', () => {
  test('an empty filter keeps every row in order', () => {
    expect(ids('')).toEqual(FIXTURE.map(r => r.id))
    expect(ids('   ')).toEqual(FIXTURE.map(r => r.id))
  })
  test('name, target and plugins match by substring, ignoring case', () => {
    expect(ids('name:BASH')).toEqual(['bash', 'hook'])
    expect(ids('target:src/')).toEqual(['grep'])
    expect(ids('plugins:super')).toEqual(['hook'])
  })
  test('kind and outcome match exactly, with comma lists', () => {
    expect(ids('kind:mcp')).toEqual(['mcp'])
    expect(ids('kind:mc')).toEqual([])
    expect(ids('outcome:error,blocked')).toEqual(['grep', 'hook'])
  })
  test('! negates any text term', () => {
    expect(ids('kind:!tools')).toEqual(['mcp', 'hook', 'step'])
    expect(ids('kind:!tools,model')).toEqual(['mcp', 'hook'])
    expect(ids('name:!e')).toEqual(['bash'])               // every other name has an e
  })
  test('a bare word looks in name and target', () => {
    expect(ids('cache')).toEqual(['read'])
    expect(ids('bash')).toEqual(['bash', 'hook'])
  })
  test('every term must match', () => {
    expect(ids('kind:tools outcome:ok')).toEqual(['bash', 'read'])
  })
})

describe('parseFilter: numeric columns', () => {
  test('comparisons, equality and bare numbers', () => {
    expect(ids('ms:>1000')).toEqual(['bash', 'step'])
    expect(ids('ms:<20')).toEqual(['read'])
    expect(ids('ms:<=20')).toEqual(['read', 'hook'])
    expect(ids('ms:>=3000')).toEqual(['step'])
    expect(ids('ms:=150')).toEqual(['mcp'])
    expect(ids('ms:150')).toEqual(['mcp'])
  })
  test('inclusive ranges and k / m suffixes', () => {
    expect(ids('ms:150..300')).toEqual(['grep', 'mcp'])
    expect(ids('tokens:1k..10k')).toEqual(['bash'])
    expect(ids('ms:>0.002m')).toEqual(['step'])            // 0.002m = 2000
  })
  test('a row with no value never matches a numeric term', () => {
    expect(ids('tokens:<1k')).toEqual(['read', 'step'])   // grep, mcp, hook have no tokens
  })
})

describe('parseFilter: mistakes are reported, not applied', () => {
  test('an unknown column names the columns', () => {
    const p = parseFilter('foo:bar kind:mcp')
    expect(p.errors).toEqual([`unknown column "foo"; columns: ${COLUMNS.join(' ')}`])
    expect(applyView(FIXTURE, p, TOKENS).map(r => r.id)).toEqual(['mcp'])
  })
  test('a bad number, an empty value, a lone colon, a bad sort column', () => {
    expect(parseFilter('ms:>abc').errors).toEqual(['not a number in "ms:>abc" (try >500, <5k, 100..900)'])
    expect(parseFilter('name:').errors).toEqual(['no value for "name:"'])
    expect(parseFilter('name:!').errors).toEqual(['no value after "!" in "name:!"'])
    expect(parseFilter(':x').errors).toEqual(['no column before ":" in ":x"'])
    expect(parseFilter('sort:nope').errors).toEqual([`unknown sort column "nope"; columns: ${COLUMNS.join(' ')}`])
  })
})

describe('sorting', () => {
  test('ascending and descending by a number; rows without one go last', () => {
    expect(ids('sort:ms')).toEqual(['read', 'hook', 'mcp', 'grep', 'bash', 'step'])
    expect(ids('sort:-tokens')).toEqual(['bash', 'read', 'step', 'grep', 'mcp', 'hook'])
    expect(ids('sort:tokens')).toEqual(['step', 'read', 'bash', 'grep', 'mcp', 'hook'])
  })
  test('by text, ignoring case; ties keep recording order', () => {
    expect(ids('sort:name')).toEqual(['bash', 'grep', 'hook', 'read', 'mcp', 'step'])
    expect(ids('sort:kind')).toEqual(['hook', 'mcp', 'step', 'bash', 'read', 'grep'])
  })
  test('the last sort term wins', () => {
    expect(parseFilter('sort:ms sort:-name').sort).toEqual({ column: 'name', desc: true })
  })
})

describe('withSort', () => {
  test('a new column sorts ascending, then descending, then off', () => {
    expect(withSort('', 'ms')).toBe('sort:ms')
    expect(withSort('sort:ms', 'ms')).toBe('sort:-ms')
    expect(withSort('sort:-ms', 'ms')).toBe('')
  })
  test('another column replaces the sort term in place', () => {
    expect(withSort('kind:tools sort:-ms name:bash', 'name')).toBe('kind:tools sort:name name:bash')
  })
  test('other terms and their order are kept; a missing sort is appended', () => {
    expect(withSort('kind:tools  name:bash', 'ms')).toBe('kind:tools name:bash sort:ms')
    expect(withSort('kind:tools sort:ms name:bash', 'ms')).toBe('kind:tools sort:-ms name:bash')
    expect(withSort('kind:tools sort:-ms name:bash', 'ms')).toBe('kind:tools name:bash')
  })
  test('several or invalid sort terms collapse to one', () => {
    expect(withSort('sort:nope kind:mcp', 'ms')).toBe('sort:ms kind:mcp')
    expect(withSort('sort:name kind:mcp sort:ms', 'ms')).toBe('kind:mcp sort:-ms')
  })
  test('the result parses to the sort it shows', () => {
    expect(parseFilter(withSort('sort:tokens', 'tokens')).sort).toEqual({ column: 'tokens', desc: true })
  })
})

describe('sortMark', () => {
  test('marks only the sorted column', () => {
    expect(sortMark({ column: 'ms', desc: false }, 'ms')).toBe('▲')
    expect(sortMark({ column: 'ms', desc: true }, 'ms')).toBe('▼')
    expect(sortMark({ column: 'ms', desc: true }, 'name')).toBe('')
    expect(sortMark(undefined, 'ms')).toBe('')
  })
})

const turn = (turnId: string, text = turnId): Turn => ({ turnId, text, startedAt: 0, isComplete: true })
const T = [turn('t1', 'list files'), turn('t2', 'fix it'), turn('t3', 'run tests')]

describe('viewedTurn', () => {
  test('no pin follows the latest turn', () => {
    expect(viewedTurn(T)).toEqual({ turn: T[2], index: 2, isLive: true })
  })
  test('a pin shows its turn', () => {
    expect(viewedTurn(T, 't1')).toEqual({ turn: T[0], index: 0, isLive: false })
  })
  test('an evicted pin falls back to the oldest turn kept', () => {
    expect(viewedTurn(T, 'gone')).toEqual({ turn: T[0], index: 0, isLive: false })
  })
  test('no turns', () => {
    expect(viewedTurn([])).toEqual({ turn: undefined, index: -1, isLive: true })
    expect(viewedTurn([], 't1')).toEqual({ turn: undefined, index: -1, isLive: false })
  })
})

describe('navTarget and canNav', () => {
  test('from live: back moves, forward does not', () => {
    expect(navTarget(T, undefined, 'prev')).toBe('t2')
    expect(navTarget(T, undefined, 'first')).toBe('t1')
    expect(canNav(T, undefined, 'prev')).toBe(true)
    expect(canNav(T, undefined, 'next')).toBe(false)
    expect(canNav(T, undefined, 'latest')).toBe(false)
  })
  test('from a pin: next onto the latest turn follows live again', () => {
    expect(navTarget(T, 't1', 'next')).toBe('t2')
    expect(navTarget(T, 't2', 'next')).toBeUndefined()
    expect(navTarget(T, 't1', 'latest')).toBeUndefined()
  })
  test('at the first turn, back is a no-op', () => {
    expect(canNav(T, 't1', 'prev')).toBe(false)
    expect(canNav(T, 't1', 'first')).toBe(false)
    expect(navTarget(T, 't1', 'prev')).toBe('t1')
  })
  test('one turn or none: nothing moves', () => {
    for (const to of ['first', 'prev', 'next', 'latest'] as const) {
      expect(canNav([turn('t1')], undefined, to)).toBe(false)
      expect(canNav([], undefined, to)).toBe(false)
      expect(navTarget([], undefined, to)).toBeUndefined()
    }
  })
})

describe('navLabel', () => {
  test('live: the position alone, no prompt', () => {
    expect(navLabel(T)).toBe('turn 3/3')
  })
  test('pinned before the latest: the live hint', () => {
    expect(navLabel(T, 't1')).toBe('turn 1/3 · ● live: 3')
  })
  test('no turns', () => {
    expect(navLabel([])).toBe('no turns yet')
  })
})

describe('turnTitle', () => {
  test('a typed prompt is quoted', () => {
    expect(turnTitle('fix it')).toBe('"fix it"')
  })
  test('a leading tag names the turn, with its from when it has one', () => {
    expect(turnTitle('<agent-message from="ace7b01faae49260b"> [Subagent hand-back] The text')).toBe('[agent message from ace7b01]')
    expect(turnTitle('<task-notification> <task-id>adc08193</task-id> <status>completed</status>')).toBe('[task notification]')
  })
  test('an empty prompt says so', () => {
    expect(turnTitle('')).toBe('[no prompt]')
    expect(turnTitle('   ')).toBe('[no prompt]')
  })
  test('a prompt that only mentions a tag later is still a prompt', () => {
    expect(turnTitle('why does <Box> drop its key')).toBe('"why does <Box> drop its key"')
  })
})

describe('rowWindow', () => {
  test('by default unsorted shows the newest rows, sorted the top', () => {
    expect(rowWindow(30, 8, undefined, false)).toEqual({ from: 22, to: 30 })
    expect(rowWindow(30, 8, undefined, true)).toEqual({ from: 0, to: 8 })
  })
  test('a start is kept inside the rows', () => {
    expect(rowWindow(30, 8, 5, false)).toEqual({ from: 5, to: 13 })
    expect(rowWindow(30, 8, 99, false)).toEqual({ from: 22, to: 30 })
    expect(rowWindow(30, 8, -3, false)).toEqual({ from: 0, to: 8 })
  })
  test('rows that fit need no window', () => {
    expect(rowWindow(5, 8, undefined, false)).toEqual({ from: 0, to: 5 })
    expect(rowWindow(0, 8, undefined, true)).toEqual({ from: 0, to: 0 })
  })
})

describe('pageRows and canPage', () => {
  test('up from the newest rows goes one page back, then stops at the top', () => {
    expect(pageRows(30, 8, undefined, false, 'up')).toBe(14)
    expect(pageRows(30, 8, 14, false, 'up')).toBe(6)
    expect(pageRows(30, 8, 6, false, 'up')).toBe(0)
    expect(canPage(30, 8, 0, false, 'up')).toBe(false)
  })
  test('down back onto the default window returns undefined, so a live turn follows again', () => {
    expect(pageRows(30, 8, 14, false, 'down')).toBeUndefined()
    expect(pageRows(30, 8, 0, false, 'down')).toBe(8)
    expect(canPage(30, 8, undefined, false, 'down')).toBe(false)
  })
  test('sorted: the default is the top', () => {
    expect(canPage(30, 8, undefined, true, 'up')).toBe(false)
    expect(pageRows(30, 8, undefined, true, 'down')).toBe(8)
    expect(pageRows(30, 8, 8, true, 'up')).toBeUndefined()
  })
  test('nothing to page when the rows fit', () => {
    for (const dir of ['up', 'down'] as const) expect(canPage(5, 8, undefined, false, dir)).toBe(false)
  })
})

describe('scrollRows', () => {
  test('a wheel tick moves one row; past the top it stops', () => {
    expect(scrollRows(30, 8, undefined, false, -1)).toBe(21)
    expect(scrollRows(30, 8, 0, false, -1)).toBe(0)
  })
  test('scrolling back onto the default window follows live again', () => {
    expect(scrollRows(30, 8, 21, false, 1)).toBeUndefined()
    expect(scrollRows(30, 8, 21, false, 50)).toBeUndefined()
  })
  test('sorted: down from the top, and back up to it', () => {
    expect(scrollRows(30, 8, undefined, true, 3)).toBe(3)
    expect(scrollRows(30, 8, 3, true, -3)).toBeUndefined()
  })
  test('rows that fit do not scroll', () => {
    expect(scrollRows(5, 8, undefined, false, -1)).toBeUndefined()
  })
})
