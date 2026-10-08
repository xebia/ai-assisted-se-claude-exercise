import type { Row, Turn } from '../types'

// The live pane's view: the filter bar's language and sorting (this task),
// which turn is shown (the navigation helpers below). Pure, no `$`.

export type Column = 'kind' | 'name' | 'target' | 'plugins' | 'outcome' | 'tokens' | 'ms'
export const COLUMNS: readonly Column[] = ['kind', 'name', 'target', 'plugins', 'outcome', 'tokens', 'ms']
export type Sort = { column: Column; desc: boolean }
export type Match = (row: Row, tokens: number | undefined) => boolean
export type ParsedFilter = { match: Match; sort?: Sort; errors: string[] }

// One table for the placeholder, the cheat sheet and the tests, so the help
// cannot drift from the parser.
export const EXAMPLES: readonly { text: string; meaning: string }[] = [
  { text: 'outcome:!ok', meaning: 'everything that did not succeed' },
  { text: 'kind:tools sort:-ms', meaning: 'tool calls, slowest first' },
  { text: 'tokens:>5k', meaning: 'rows that added more than 5k tokens' },
  { text: 'kind:tools,mcp name:bash', meaning: 'tool and MCP calls named like bash' },
  { text: 'ms:100..900 cache', meaning: '100 to 900 ms, "cache" in name or target' },
]

export const PLACEHOLDER = `try: ${EXAMPLES.slice(0, 3).map(x => x.text).join(' · ')}`

const COLUMN_LIST = `columns: ${COLUMNS.join(' ')}`
const isColumn = (s: string): s is Column => (COLUMNS as readonly string[]).includes(s)
const isNumeric = (c: Column): c is 'ms' | 'tokens' => c === 'ms' || c === 'tokens'

function cellText(row: Row, column: Column): string {
  switch (column) {
    case 'kind': return row.kind
    case 'name': return row.name
    case 'target': return row.target
    case 'plugins': return row.plugins ?? ''
    case 'outcome': return row.outcome
    default: return ''
  }
}

const cellNumber = (row: Row, column: 'ms' | 'tokens', tokens: number | undefined): number | undefined =>
  column === 'ms' ? row.ms : tokens

// `500`, `5k`, `1.5m`.
function parseNumber(s: string): number | undefined {
  const m = /^(\d+(?:\.\d+)?)([km]?)$/i.exec(s)
  if (m === null) return undefined
  const unit = (m[2] ?? '').toLowerCase()
  return Number(m[1]) * (unit === 'k' ? 1e3 : unit === 'm' ? 1e6 : 1)
}

// `>500`, `<=50`, `=3`, `3`, `100..900` (inclusive).
function numericTest(value: string): ((n: number) => boolean) | undefined {
  const range = /^(.+)\.\.(.+)$/.exec(value)
  if (range !== null) {
    const lo = parseNumber(range[1] ?? '')
    const hi = parseNumber(range[2] ?? '')
    return lo === undefined || hi === undefined ? undefined : n => n >= lo && n <= hi
  }
  const m = /^(>=|<=|>|<|=)?(.*)$/.exec(value)
  const x = parseNumber(m?.[2] ?? '')
  if (x === undefined) return undefined
  switch (m?.[1]) {
    case '>': return n => n > x
    case '<': return n => n < x
    case '>=': return n => n >= x
    case '<=': return n => n <= x
    default: return n => n === x
  }
}

// One `column:value` term as a match, or the words saying why it is not one.
function termOf(column: Column, raw: string): Match | string {
  if (raw === '') return `no value for "${column}:"`
  if (isNumeric(column)) {
    const test = numericTest(raw)
    if (test === undefined) return `not a number in "${column}:${raw}" (try >500, <5k, 100..900)`
    return (row, tokens) => {
      const n = cellNumber(row, column, tokens)
      return n !== undefined && test(n)
    }
  }
  const negate = raw.startsWith('!')
  const value = (negate ? raw.slice(1) : raw).toLowerCase()
  if (value === '') return `no value after "!" in "${column}:${raw}"`
  // kind and outcome are short closed sets: exact, a comma list ORs. The rest: substring.
  const wanted = value.split(',').filter(Boolean)
  const hit = column === 'kind' || column === 'outcome'
    ? (row: Row) => wanted.includes(cellText(row, column).toLowerCase())
    : (row: Row) => cellText(row, column).toLowerCase().includes(value)
  return negate ? row => !hit(row) : row => hit(row)
}

export function parseFilter(text: string): ParsedFilter {
  const matches: Match[] = []
  const errors: string[] = []
  let sort: Sort | undefined
  for (const term of text.trim().split(/\s+/).filter(Boolean)) {
    const colon = term.indexOf(':')
    if (colon < 0) {
      const word = term.toLowerCase()
      matches.push(row => row.name.toLowerCase().includes(word) || row.target.toLowerCase().includes(word))
      continue
    }
    const key = term.slice(0, colon).toLowerCase()
    const value = term.slice(colon + 1)
    if (key === 'sort') {
      const desc = value.startsWith('-')
      const column = (desc ? value.slice(1) : value).toLowerCase()
      if (isColumn(column)) sort = { column, desc }
      else errors.push(`unknown sort column "${column}"; ${COLUMN_LIST}`)
      continue
    }
    if (key === '') { errors.push(`no column before ":" in "${term}"`); continue }
    if (!isColumn(key)) { errors.push(`unknown column "${key}"; ${COLUMN_LIST}`); continue }
    const m = termOf(key, value)
    if (typeof m === 'string') errors.push(m)
    else matches.push(m)
  }
  return { match: (row, tokens) => matches.every(m => m(row, tokens)), sort, errors }
}

function compare(a: Row, b: Row, sort: Sort, tokens: Map<string, number>): number {
  if (isNumeric(sort.column)) {
    const x = cellNumber(a, sort.column, tokens.get(a.id))
    const y = cellNumber(b, sort.column, tokens.get(b.id))
    if (x === undefined || y === undefined) return x === y ? 0 : x === undefined ? 1 : -1   // no value: last, either way
    return sort.desc ? y - x : x - y
  }
  const x = cellText(a, sort.column).toLowerCase()
  const y = cellText(b, sort.column).toLowerCase()
  const c = x < y ? -1 : x > y ? 1 : 0
  return sort.desc ? -c : c
}

// Filter, then sort; Array.prototype.sort is stable, so ties keep recording order.
export function applyView(rows: Row[], parsed: ParsedFilter, tokens: Map<string, number>): Row[] {
  const kept = rows.filter(r => parsed.match(r, tokens.get(r.id)))
  const sort = parsed.sort
  return sort === undefined ? kept : [...kept].sort((a, b) => compare(a, b, sort, tokens))
}

const isSortTerm = (t: string) => t.toLowerCase().startsWith('sort:')

// A header click: that column ascending, then descending, then unsorted. The
// sort term is rewritten where the last one stood, so the bar reads as typed.
export function withSort(text: string, column: Column): string {
  const terms = text.trim().split(/\s+/).filter(Boolean)
  const at = terms.findLastIndex(isSortTerm)
  const current = at >= 0 ? parseFilter(terms[at] ?? '').sort : undefined
  const next = current?.column !== column ? `sort:${column}` : current.desc ? undefined : `sort:-${column}`
  const kept = terms.filter(t => !isSortTerm(t))
  if (next !== undefined) {
    const place = at >= 0 ? terms.slice(0, at).filter(t => !isSortTerm(t)).length : kept.length
    kept.splice(place, 0, next)
  }
  return kept.join(' ')
}

export const sortMark = (sort: Sort | undefined, column: Column): string =>
  sort?.column !== column ? '' : sort.desc ? '▼' : '▲'

// --- Which turn the pane shows. A pin is a turnId, not an index: TURNS is
// capped, so indexes shift as old turns drop. No pin follows the latest turn.

export type Nav = 'first' | 'prev' | 'next' | 'latest'

export function viewedTurn(turns: Turn[], pinnedTurnId?: string): { turn?: Turn; index: number; isLive: boolean } {
  const isLive = pinnedTurnId === undefined
  if (turns.length === 0) return { turn: undefined, index: -1, isLive }
  if (isLive) return { turn: turns.at(-1), index: turns.length - 1, isLive }
  const at = turns.findIndex(t => t.turnId === pinnedTurnId)
  const index = at >= 0 ? at : 0             // evicted: the oldest turn kept
  return { turn: turns[index], index, isLive }
}

function navIndex(turns: Turn[], pinnedTurnId: string | undefined, to: Nav): number {
  const { index } = viewedTurn(turns, pinnedTurnId)
  const last = turns.length - 1
  switch (to) {
    case 'first': return 0
    case 'prev': return Math.max(0, index - 1)
    case 'next': return Math.min(last, index + 1)
    default: return last
  }
}

export function canNav(turns: Turn[], pinnedTurnId: string | undefined, to: Nav): boolean {
  return turns.length > 1 && navIndex(turns, pinnedTurnId, to) !== viewedTurn(turns, pinnedTurnId).index
}

// The pin after moving; onto the latest turn means following live again.
export function navTarget(turns: Turn[], pinnedTurnId: string | undefined, to: Nav): string | undefined {
  if (turns.length === 0) return undefined
  const i = navIndex(turns, pinnedTurnId, to)
  return i >= turns.length - 1 ? undefined : turns[i]?.turnId
}

export function navLabel(turns: Turn[], pinnedTurnId?: string): string {
  const { turn, index, isLive } = viewedTurn(turns, pinnedTurnId)
  if (turn === undefined) return 'no turns yet'
  const live = !isLive && index < turns.length - 1 ? ` · ● live: ${turns.length}` : ''
  return `turn ${index + 1}/${turns.length} · "${turn.text}"${live}`
}
