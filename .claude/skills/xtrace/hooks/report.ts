import type { Category, Compaction, Row, Selection, Turn, Usage } from '../types'

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

// --- Tokens -----------------------------------------------------------------

export function fmtTokens(n: number): string {
  return n < 1000 ? String(Math.round(n)) : `${(n / 1000).toFixed(1)}k`
}

// Everything the request was answered over: uncached, read from cache, written to it.
export const contextOf = (u: Usage): number => u.input + u.cacheRead + u.cacheWrite

export function usageText(u: Usage): string {
  return `${u.model} · in ${fmtTokens(u.input)} · cache ${fmtTokens(u.cacheRead)} · write ${fmtTokens(u.cacheWrite)} · out ${fmtTokens(u.output)}`
}

// What each row added to the context. Model rows: their request's output,
// exact. Other rows with text: about chars / 4, then corrected per loop: the
// growth between two requests (next context − this context − this output)
// is split over the rows recorded between them by their share of the text.
export type TokenValue = { n: number; exact: boolean }

export function tokenValues(rows: Row[]): Map<string, TokenValue> {
  const out = new Map<string, TokenValue>()
  const groups = new Map<string, Row[]>()
  for (const r of rows) {
    if (r.kind === 'model' && r.usage !== undefined) out.set(r.id, { n: r.usage.output, exact: true })   // what it wrote; stays in the context
    else if (r.chars !== undefined && r.chars > 0) out.set(r.id, { n: Math.ceil(r.chars / 4), exact: false })
    const key = `${r.turnId}|${r.agentId ?? ''}`
    groups.set(key, [...(groups.get(key) ?? []), r])
  }
  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => a.startedAt - b.startedAt)
    const steps = sorted.filter(r => r.kind === 'model' && r.usage !== undefined)
    for (let i = 0; i + 1 < steps.length; i++) {
      const a = steps[i]
      const b = steps[i + 1]
      if (a?.usage === undefined || b?.usage === undefined) continue
      const grown = contextOf(b.usage) - contextOf(a.usage) - a.usage.output
      const between = sorted.filter(r => r.kind !== 'model' && r.startedAt > a.startedAt && r.startedAt < b.startedAt && (r.chars ?? 0) > 0)
      const chars = between.reduce((sum, r) => sum + (r.chars ?? 0), 0)
      if (grown <= 0 || chars === 0) continue
      for (const r of between) out.set(r.id, { n: (grown * (r.chars ?? 0)) / chars, exact: false })
    }
  }
  return out
}

// The same values as the pane and the report print them: `+310`, `~1.0k`.
export function tokensOf(rows: Row[]): Map<string, string> {
  return new Map([...tokenValues(rows)].map(([id, v]) => [id, `${v.exact ? '+' : '~'}${fmtTokens(v.n)}`]))
}

// One line per loop for the report: requests, context growth, output, cache split.
type LoopTotals = { requests: number; from: number; to: number; output: number; cacheRead: number; input: number; cacheWrite: number }

// The main loop's (sub false) or the subagents' (sub true) model requests, summed.
function loopTotals(rows: Row[], sub: boolean): LoopTotals | undefined {
  const loop = rows
    .filter(r => r.kind === 'model' && r.usage !== undefined && (r.agentId !== undefined) === sub)
    .sort((a, b) => a.startedAt - b.startedAt)
  const first = loop[0]?.usage
  const last = loop.at(-1)?.usage
  if (first === undefined || last === undefined) return undefined
  const sum = (f: (u: Usage) => number) => loop.reduce((n, r) => n + (r.usage ? f(r.usage) : 0), 0)
  return {
    requests: loop.length, from: contextOf(first), to: contextOf(last),
    output: sum(u => u.output), cacheRead: sum(u => u.cacheRead), input: sum(u => u.input), cacheWrite: sum(u => u.cacheWrite),
  }
}

const growthText = (t: LoopTotals) =>
  `${t.requests} request(s) · context +${fmtTokens(t.to - t.from)} (${fmtTokens(t.from)} → ${fmtTokens(t.to)})`
const splitText = (t: LoopTotals) =>
  `output ${fmtTokens(t.output)} · cache read ${fmtTokens(t.cacheRead)} · uncached ${fmtTokens(t.input)} · cache write ${fmtTokens(t.cacheWrite)}`

function loopSummary(rows: Row[], sub: boolean): string | undefined {
  const t = loopTotals(rows, sub)
  return t === undefined ? undefined : `${growthText(t)} · ${splitText(t)}`
}

// One line per loop for the report: requests, context growth, output, cache split.
export function tokenTotals(rows: Row[]): string[] {
  const lines: string[] = []
  const main = loopSummary(rows, false)
  const sub = loopSummary(rows, true)
  if (main !== undefined) lines.push(`Tokens: ${main}`)
  if (sub !== undefined) lines.push(`Subagent tokens: ${sub}`)
  return lines
}

export function fmtDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
}

// One prompt's total, in lines short enough for a half-screen pane:
//   Total: <wall time> · <requests> · context <first> → <last> (+growth)
//   output … · cache read … · uncached … · cache write …
//   subagents: …                          (when subagents ran)
// Wall time runs from the prompt to the answer, or to now while it runs.
export function turnTotalLines(turn: Turn, rows: Row[], now: number): string[] {
  const own = rows.filter(r => r.turnId === turn.turnId)
  const lastEnd = Math.max(turn.startedAt, ...own.map(r => r.startedAt + (r.ms ?? 0)))
  const end = turn.completedAt ?? (turn.isComplete ? lastEnd : now)
  const time = `${fmtDuration(end - turn.startedAt)}${turn.isComplete ? '' : ' so far'}`
  const main = loopTotals(own, false)
  const sub = loopTotals(own, true)
  const lines = [`Total: ${time} · ${main ? growthText(main) : 'no model requests recorded'}`]
  if (main) lines.push(splitText(main))
  if (sub) lines.push(`subagents: ${growthText(sub)} · ${splitText(sub)}`)
  return lines
}

// The same on one line, for the report.
export function turnTotal(turn: Turn, rows: Row[], now: number): string {
  return turnTotalLines(turn, rows, now).join(' · ')
}

// Puts a hook's appended context on the latest hooks row of that event in the
// turn (named `Event` or `Event Tool`). Undefined when there is no such row.
export function attachHookContext(rows: Row[], turnId: string, event: string, chars: number): Row[] | undefined {
  let at = -1
  rows.forEach((r, i) => {
    if (r.kind === 'hooks' && r.turnId === turnId && (r.name === event || r.name.startsWith(`${event} `))) at = i
  })
  if (at < 0) return undefined
  return rows.map((r, i) => (i === at ? { ...r, chars: (r.chars ?? 0) + chars, outcome: 'context' as const } : r))
}

export function scopedTurns(turns: Turn[], scope: Selection['scope']): Turn[] {
  if (scope === 'session') return turns
  return turns.slice(-1)
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

export type ReportInput = { rows: Row[]; turns: Turn[]; compactions: Compaction[]; selection: Selection; now?: number }

export function buildReport({ rows, turns, compactions, selection, now = Date.now() }: ReportInput): string {
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
  const compacted = compactions.filter(c => turnIds.has(c.turnId)).at(-1)
  if (compacted !== undefined) {
    const at = new Date(compacted.at).toISOString().slice(11, 19)
    lines.push(`Memory starts after a compaction at ${at}; earlier turns are not recorded.`)
  }

  const withAgents = picked.has('agents')
  const withPlugins = picked.has('hooks')
  const tokens = tokensOf(all)
  let n = 0
  for (const turn of scope) {
    const ofTurn = shown.filter(r => r.turnId === turn.turnId)
    if (ofTurn.length === 0) continue
    lines.push('', `"${firstWords(turn.text)}"`, '')
    lines.push(withPlugins
      ? '| # | Kind | Name | Target | Plugins | Outcome | ms | Tokens |'
      : '| # | Kind | Name | Target | Outcome | ms | Tokens |')
    lines.push(withPlugins ? '| --- | --- | --- | --- | --- | --- | --- | --- |' : '| --- | --- | --- | --- | --- | --- | --- |')
    for (const { row, indent } of orderRows(ofTurn, withAgents)) {
      n += 1
      const plugins = withPlugins ? ` ${cell(row.plugins)} |` : ''
      lines.push(`| ${n} | ${row.kind} | ${cell(nameOf(row, all, withAgents, indent))} | ${cell(row.target)} |${plugins} ${row.outcome} | ${cell(row.ms)} | ${cell(tokens.get(row.id))} |`)
    }
    lines.push('', turnTotal(turn, all, now))
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
  if (scope.length > 1) lines.push(...tokenTotals(all))   // a single turn already has its total under the table
  const checks = toolRows.filter(r => r.name === 'Bash' && CHECK_RUNNERS.some(c => r.target.startsWith(c))).map(r => r.target)
  lines.push(checks.length > 0 ? `Checked: ${checks.join('; ')}` : 'Checked: nothing.')

  return lines.join('\n')
}

// The live pane: fixed-width columns so rows line up; Target takes the room
// the others leave. Kind, Name, Target, [Plugins,] Outcome, ms.
const PANE_HEADER = ['kind', 'name', 'target', 'plugins', 'outcome', 'tokens', 'ms']

function paneWidths(width: number, withPlugins: boolean): number[] {
  const widths = withPlugins ? [8, 20, 0, 14, 7, 7, 6] : [8, 20, 0, 7, 7, 6]   // 7 fits context, blocked, running
  const used = widths.reduce((a, b) => a + b, 0) + widths.length - 1
  widths[2] = Math.max(8, width - used)
  return widths
}

// Columns kept free at the pane's right edge, so right-aligned ms does not touch the border.
const PANE_MARGIN = 2

// Each cell fitted to its column: cut with an ellipsis, padded; ms right-aligned.
function fitCells(cells: string[], paneWidth: number, withPlugins: boolean): string[] {
  const widths = paneWidths(Math.max(1, paneWidth - PANE_MARGIN), withPlugins)
  const last = cells.length - 1
  return cells.map((c, i) => {
    const w = widths[i] ?? 0
    return i === last ? trim(c, w).padStart(w) : trim(c, w).padEnd(w)
  })
}

function paneCells(cells: string[], paneWidth: number, withPlugins: boolean): string {
  return fitCells(cells, paneWidth, withPlugins).join(' ').slice(0, Math.max(1, paneWidth - PANE_MARGIN)).trimEnd()
}

export function paneHeader(width: number, withPlugins: boolean): string {
  return paneCells(withPlugins ? PANE_HEADER : PANE_HEADER.filter(h => h !== 'plugins'), width, withPlugins)
}

// The header's cells for the pane's sort buttons, fitted like the rows. A
// sorted column ends in its mark; where the label fills the column the mark
// takes its last place, so it is never cut off.
export function paneHeaderCells(width: number, withPlugins: boolean, marks: Partial<Record<string, string>> = {}): { column: string; text: string }[] {
  const labels = withPlugins ? PANE_HEADER : PANE_HEADER.filter(h => h !== 'plugins')
  const widths = paneWidths(Math.max(1, width - PANE_MARGIN), withPlugins)
  const marked = labels.map((label, i) => {
    const mark = marks[label] ?? ''
    const w = widths[i] ?? 0
    return mark === '' || label.length + mark.length <= w ? label + mark : label.slice(0, Math.max(0, w - mark.length)) + mark
  })
  const fitted = fitCells(marked, width, withPlugins)
  return labels.map((column, i) => ({ column, text: fitted[i] ?? '' }))
}

export function paneLine(row: Row, width: number, withPlugins: boolean, tokens = ''): string {
  const ms = row.ms === undefined ? '' : String(row.ms)
  const cells = withPlugins
    ? [row.kind, row.name, row.target, row.plugins ?? '', row.outcome, tokens, ms]
    : [row.kind, row.name, row.target, row.outcome, tokens, ms]
  return paneCells(cells, width, withPlugins)
}

// --- Pane colors. Kind and name share one blue, strongest for the kinds that
// usually cost the most tokens (model, then tools, context, hooks); everything
// else is a grey step, so only token weight and failures carry warning colors.
// Greys are hex, so there is one palette for dark themes and one for light.

export type Segment = { text: string; color?: string; bold?: boolean; underline?: boolean }

export type Palette = {
  kind: Record<Row['kind'], string>
  label: string; value: string; separator: string
  target: string; plugins: string; outcome: string; tokens: string
  ms: [string, string, string, string, string]   // under 10, 100, 1k, 10k, and above
}

// Hex colors: exact in a truecolor terminal. Where Claude Code falls back to
// 16 colors (no COLORTERM=truecolor) the blues collapse into white and cyan.
const ramp = (model: string, tools: string, context: string, hooks: string): Palette['kind'] =>
  ({ model, tools, mcp: tools, skills: tools, agents: tools, commands: tools, context, hooks })

export const DARK: Palette = {
  kind: ramp('#a3b2ff', '#8391d6', '#6872a6', '#5a628e'),
  label: '#8a8a8a', value: '#b2b2b2', separator: '#585858',
  target: '#767676', plugins: '#626262', outcome: '#6c6c6c', tokens: '#b2b2b2',
  ms: ['#4e4e4e', '#626262', '#767676', '#949494', '#bcbcbc'],
}

export const LIGHT: Palette = {
  kind: ramp('#3a4fd6', '#5a68b8', '#7d86b8', '#a3a8c6'),
  label: '#767676', value: '#4e4e4e', separator: '#b2b2b2',
  target: '#767676', plugins: '#9e9e9e', outcome: '#8a8a8a', tokens: '#4e4e4e',
  ms: ['#c6c6c6', '#a8a8a8', '#8a8a8a', '#6c6c6c', '#4e4e4e'],
}

// The `theme` setting's value: `light`, `light-daltonized`, `light-ansi` are light.
export const paletteFor = (theme: unknown): Palette => (typeof theme === 'string' && theme.startsWith('light') ? LIGHT : DARK)

export function outcomeStyle(outcome: Row['outcome'], pal: Palette = DARK): Omit<Segment, 'text'> {
  if (outcome === 'error' || outcome === 'denied' || outcome === 'blocked') return { color: 'error', bold: true }
  if (outcome === 'running') return { color: 'warning' }
  return { color: pal.outcome }
}

// `~2.0k`, `640`, `48.3k` back to a number.
function tokenCount(text: string): number {
  const m = /^[~+]?([\d.]+)(k?)$/.exec(text.trim())
  return m ? Number(m[1]) * (m[2] === 'k' ? 1000 : 1) : 0
}

// Under 1k a quiet grey; from 1k warning, over 10k error. Model rows too:
// their number is what the request wrote.
export function tokenStyle(text: string, pal: Palette = DARK): Omit<Segment, 'text'> {
  const n = tokenCount(text)
  if (n > 10000) return { color: 'error', bold: true }
  if (n >= 1000) return { color: 'warning', bold: true }
  return { color: pal.tokens }
}

// One grey step per power of ten, stronger the longer it took.
export function msStyle(ms: number | undefined, pal: Palette = DARK): Omit<Segment, 'text'> {
  if (ms === undefined) return {}
  const step = ms < 10 ? 0 : ms < 100 ? 1 : ms < 1000 ? 2 : ms < 10000 ? 3 : 4
  return { color: pal.ms[step] }
}

// The header: grey labels, underlined so each column's start is visible; the
// padding stays plain.
export function paneHeaderSegments(width: number, withPlugins: boolean, pal: Palette = DARK): Segment[] {
  const labels = withPlugins ? PANE_HEADER : PANE_HEADER.filter(h => h !== 'plugins')
  const fitted = fitCells(labels, width, withPlugins)
  const last = fitted.length - 1
  return fitted.flatMap((cell, i) => {
    const label = cell.trim()
    const pad = ' '.repeat(cell.length - label.length)
    const parts: Segment[] = i === last
      ? [{ text: pad }, { text: label, color: pal.label, underline: true }]
      : [{ text: label, color: pal.label, underline: true }, { text: pad }]
    return [...(i > 0 ? [{ text: ' ' }] : []), ...parts.filter(p => p.text !== '')]
  })
}

export function paneSegments(row: Row, width: number, withPlugins: boolean, tokens = '', pal: Palette = DARK): Segment[] {
  const ms = row.ms === undefined ? '' : String(row.ms)
  const cells: [string, Omit<Segment, 'text'>][] = [
    [row.kind, { color: pal.kind[row.kind], bold: true }],
    [row.name, { color: pal.kind[row.kind] }],
    [row.target, { color: pal.target }],
    ...(withPlugins ? [[row.plugins ?? '', { color: pal.plugins }] as [string, Omit<Segment, 'text'>]] : []),
    [row.outcome, outcomeStyle(row.outcome, pal)],
    [tokens, tokenStyle(tokens, pal)],
    [ms, msStyle(row.ms, pal)],
  ]
  const fitted = fitCells(cells.map(c => c[0]), width, withPlugins)
  return fitted.flatMap((text, i) => [...(i > 0 ? [{ text: ' ' }] : []), { text, ...cells[i]?.[1] }])
}

// Words with a digit (and the arrow between two counts) are values, `·` a
// separator, the rest labels. Neighbours of one kind merge into one segment.
export function labelValueSegments(text: string, pal: Palette = DARK): Segment[] {
  const out: Segment[] = []
  for (const [i, word] of text.split(' ').entries()) {
    const color = word === '·' ? pal.separator : /\d|^→$/.test(word) ? pal.value : pal.label
    const prev = out.at(-1)
    if (prev !== undefined && prev.color === color) prev.text += ` ${word}`
    else out.push(...(i > 0 ? [{ text: ' ' }] : []), { text: word, color })
  }
  return out.filter(s => s.text !== '')
}

// The counters line above the table, in the footer's label and value colors.
export function counterSegments(counts: [string, number][], pal: Palette = DARK): Segment[] {
  return labelValueSegments(counts.map(([c, n]) => `${c} ${n}`).join(' · '), pal)
}

// Where the name column starts: the kind column and the space after it.
const NAME_COLUMN = paneWidths(80, false)[0]! + 1

// One line of the pane's footer, fitted to the pane. Its figures start under
// the name column: the first line puts `Total:` in front of them, the others
// are indented to the same place.
export function paneTotalSegments(line: string, width: number, isFirst: boolean, pal: Palette = DARK): Segment[] {
  const room = Math.max(1, width - PANE_MARGIN - NAME_COLUMN)
  const lead: Segment = isFirst && line.startsWith('Total:')
    ? { text: 'Total:'.padEnd(NAME_COLUMN), color: pal.value, bold: true }
    : { text: ' '.repeat(NAME_COLUMN) }
  const rest = isFirst && line.startsWith('Total:') ? line.slice('Total:'.length).trim() : line
  return [lead, ...labelValueSegments(trim(rest, room), pal)]
}
