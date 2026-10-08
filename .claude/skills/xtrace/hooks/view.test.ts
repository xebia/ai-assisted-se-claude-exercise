import { describe, expect, test } from 'claude-code/testing'
import { applyView, COLUMNS, EXAMPLES, parseFilter, PLACEHOLDER } from './view'
import type { Row } from '../types'

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
