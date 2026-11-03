import type { Category, Row, Turn } from '../types'
import { costOf, fmtCost, fmtTokens, outcomeStyle, PANE_MARGIN } from './report'
import type { Palette } from './report'

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
  if ((column === 'kind' || column === 'outcome') && wanted.length === 0) return `no value for "${column}:${raw}"`
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

const isKindTerm = (t: string) => t.toLowerCase().startsWith('kind:')

// `/xtrace tools mcp pane`: the kinds lead the bar, replacing any kind term; `all` drops it.
export function withKinds(text: string, kinds: readonly Category[] | 'all'): string {
  const kept = text.trim().split(/\s+/).filter(t => t !== '' && !isKindTerm(t))
  return (kinds === 'all' ? kept : [`kind:${kinds.join(',')}`, ...kept]).join(' ')
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

// Position only; the turn's prompt has its own line above the header.
export function navLabel(turns: Turn[], pinnedTurnId?: string): string {
  const { turn, index, isLive } = viewedTurn(turns, pinnedTurnId)
  if (turn === undefined) return 'no turns yet'
  const live = !isLive && index < turns.length - 1 ? ` · ● live: ${turns.length}` : ''
  return `turn ${index + 1}/${turns.length}${live}`
}

// A turn the person did not type (a subagent's hand-back, a task notification)
// starts with a tag: name it by the tag, and by its `from` when it has one.
export function turnTitle(text: string): string {
  const trimmed = text.trim()
  if (trimmed === '') return '[no prompt]'
  const tag = /^<([a-z][\w-]*)([^>]*)>/i.exec(trimmed)
  if (tag === null) return `"${trimmed}"`
  const from = /\bfrom="([^"]*)"/.exec(tag[2] ?? '')?.[1]
  const name = (tag[1] ?? '').replace(/-/g, ' ')
  return from !== undefined ? `[${name} from ${from.slice(0, 7)}]` : `[${name}]`
}

// --- Which of a turn's shown rows fit the pane. A start is the first row in
// view; none is the default: unsorted the newest rows (a live turn keeps
// showing its latest), sorted the top.

export type Page = 'up' | 'down'

export function rowWindow(count: number, room: number, start: number | undefined, sorted: boolean): { from: number; to: number } {
  const last = Math.max(0, count - room)
  const from = start === undefined ? (sorted ? 0 : last) : Math.min(Math.max(0, start), last)
  return { from, to: Math.min(count, from + room) }
}

// Move the window by `by` rows (a wheel tick, a scroll key); landing on the
// default window returns undefined, so it follows the live turn again.
export function scrollRows(count: number, room: number, start: number | undefined, sorted: boolean, by: number): number | undefined {
  const last = Math.max(0, count - room)
  const next = Math.min(Math.max(0, rowWindow(count, room, start, sorted).from + by), last)
  return next === (sorted ? 0 : last) ? undefined : next
}

export const pageRows = (count: number, room: number, start: number | undefined, sorted: boolean, dir: Page): number | undefined =>
  scrollRows(count, room, start, sorted, dir === 'up' ? -room : room)

// A page key moves the engine's window by the pane's height; here it moves one row window.
export const scrollStep = (by: number, bodyRows: number): number | Page =>
  Math.abs(by) >= bodyRows ? (by < 0 ? 'up' : 'down') : by

export function canPage(count: number, room: number, start: number | undefined, sorted: boolean, dir: Page): boolean {
  const { from } = rowWindow(count, room, start, sorted)
  return dir === 'up' ? from > 0 : from < Math.max(0, count - room)
}

// --- Row details: the fields of one row, as label/value lines for the pane.

export const DETAIL_LABEL = 10   // the label column, in cells

export type DetailLine = { label: string; value: string; color?: string; bold?: boolean }

const pad = (n: number, w = 2) => String(n).padStart(w, '0')

// Local wall-clock time of an engine timestamp, to the millisecond.
export function clockTime(ms: number): string {
  const d = new Date(ms)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}

// A value cut into pieces of `room` characters, its own line breaks kept:
// each piece is one drawn line, so the detail window counts lines exactly.
export function wrapValue(text: string, room: number): string[] {
  const out: string[] = []
  for (const line of text.split('\n')) {
    if (line.length === 0) { out.push(''); continue }
    for (let i = 0; i < line.length; i += room) out.push(line.slice(i, i + room))
  }
  return out
}

// Every field the row has, in a fixed order; an empty one is left out.
export function detailFields(row: Row, tokens: string | undefined, pal: Palette): DetailLine[] {
  const out: DetailLine[] = []
  const add = (label: string, value: string | undefined, style: Omit<DetailLine, 'label' | 'value'> = { color: pal.value }) => {
    if (value !== undefined && value !== '') out.push({ label, value, ...style })
  }
  add('kind', row.kind, { color: pal.kind[row.kind], bold: true })
  add('name', row.name, { color: pal.kind[row.kind] })
  add('outcome', row.outcome, outcomeStyle(row.outcome, pal))
  add('started', clockTime(row.startedAt))
  add('duration', row.ms === undefined ? undefined : `${row.ms} ms`)
  add('tokens', tokens)
  add('chars', row.chars === undefined ? undefined : String(row.chars))
  add('agent', row.agentId)
  add('parent', row.parentId)
  if (row.kind === 'hooks') {
    add('commands', row.target)
    add('plugins', row.plugins)
  } else if (row.kind === 'model' && row.usage !== undefined) {
    const u = row.usage
    add('model', u.model)
    add('usage', `in ${fmtTokens(u.input)} · cache ${fmtTokens(u.cacheRead)} · write ${fmtTokens(u.cacheWrite)} · out ${fmtTokens(u.output)}`)
    const cost = costOf(u)
    add('cost', cost === undefined ? undefined : fmtCost(cost))
  } else {
    add('target', row.target)
  }
  if (row.kind === 'agents') add('model', row.detail)
  add('id', row.id)
  add('input', row.input)
  return out
}

// The fields as drawn lines, each at most the value room wide: a long value
// continues on lines with no label; the input starts on a line of its own.
export function detailLines(row: Row, tokens: string | undefined, pal: Palette, width: number): DetailLine[] {
  const room = Math.max(1, width - PANE_MARGIN - DETAIL_LABEL)
  return detailFields(row, tokens, pal).flatMap(f => f.label === 'input'
    ? [{ label: 'input', value: '' }, ...wrapValue(f.value, Math.max(1, room - 2)).map(v => ({ label: '', value: `  ${v}`, color: pal.value }))]
    : wrapValue(f.value, room).map((v, i) => ({ ...f, label: i === 0 ? f.label : '', value: v })))
}
