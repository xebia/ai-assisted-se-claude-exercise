import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import type { Category, Compaction, Row, Selection, Turn, View } from '../types'
import { CATEGORIES, parseArgs, withNewCategories, wordsOf } from './args'
import { attachHookContext, buildReport, counterSegments, denialCategory, firstWords, paletteFor, paneHeaderCells, paneSegments, paneTotalSegments, turnTotalLines, targetOf, tokensOf, tokenValues, usageText } from './report'
import { commandsFor, enabledInstalls, pluginsFor } from './hookmatch'
import type { PluginHooks } from './hookmatch'
import { applyView, canNav, canPage, EXAMPLES, navLabel, navTarget, parseFilter, pageRows, PLACEHOLDER, rowWindow, scrollRows, sortMark, turnTitle, viewedTurn, withSort } from './view'
import type { Column, Nav, Page } from './view'

// The engine follows `$` and the state atoms only within this file, never across
// an import, so every helper that takes `$` and every atom is declared here.

const ROW_CAP = 2000
const TURN_CAP = 200

const ROWS = atom({ plugin: 'xtrace', key: 'rows' } as const, [] as Row[])
const TURNS = atom({ plugin: 'xtrace', key: 'turns' } as const, [] as Turn[])
const COMPACTIONS = atom({ plugin: 'xtrace', key: 'compactions' } as const, [] as Compaction[])
const SELECTION = atom(
  { plugin: 'xtrace', key: 'selection' } as const,
  { categories: [...CATEGORIES], scope: 'turn', known: [...CATEGORIES] } as Selection,
)

const VIEW = atom({ plugin: 'xtrace', key: 'view' } as const, { filter: '', help: false } as View)

let counter = 0
const mintId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`

const MCP = /^mcp__([^_]+(?:_[^_]+)*)__(.+)$/

function splitMcp(tool: string): { server: string; name: string } | undefined {
  const m = MCP.exec(tool)
  return m && m[1] !== undefined && m[2] !== undefined ? { server: m[1], name: m[2] } : undefined
}

function addRow($: EngineInterface, row: Row) {
  return update($, ROWS, list => [...list, row].slice(-ROW_CAP))
}

function finishRow($: EngineInterface, id: string, patch: Partial<Row>) {
  return update($, ROWS, list => list.map(r => (r.id === id ? { ...r, ...patch } : r)))
}

function finishRowWith($: EngineInterface, id: string, patch: (row: Row) => Partial<Row>) {
  return update($, ROWS, list => list.map(r => (r.id === id ? { ...r, ...patch(r) } : r)))
}

function addTurn($: EngineInterface, turn: Turn) {
  return update($, TURNS, list => [...list, turn].slice(-TURN_CAP))
}

// The engine's clock for display only: a report or a drawing never fails for want of it.
async function nowOrUndefined($: EngineInterface): Promise<number | undefined> {
  try { return await $.clock.now() } catch { return undefined }
}

function completeTurn($: EngineInterface, turnId: string, completedAt: number) {
  return update($, TURNS, list => list.map(t => (t.turnId === turnId ? { ...t, isComplete: true, completedAt } : t)))
}

async function currentTurnId($: EngineInterface): Promise<string> {
  const turns = await read($, TURNS)
  return turns.at(-1)?.turnId ?? 'before-first-turn'
}

// Merged settings, read in session.start (which a hot reload fires again).
let settings: unknown = undefined

// The enabled plugins' hooks.json files, read in session.start after settings.
let pluginHooks: PluginHooks[] = []

async function loadPluginHooks($: EngineInterface, cwd: string | undefined): Promise<PluginHooks[]> {
  const home = await $.env.get('HOME')
  const configDir = (await $.env.get('CLAUDE_CONFIG_DIR')) ?? (home !== undefined ? `${home}/.claude` : undefined)
  if (configDir === undefined) return []
  const installed = JSON.parse(await $.fs.read(`${configDir}/plugins/installed_plugins.json`))
  const out: PluginHooks[] = []
  for (const p of enabledInstalls(settings, installed, cwd)) {
    try { out.push({ name: p.name, config: JSON.parse(await $.fs.read(`${p.installPath}/hooks/hooks.json`)) }) } catch {}
  }
  return out
}

// One helper for every classic event; each registration names its event literally.
async function recordHook(event: string, $: EngineInterface, e: any, next: (e: any) => Promise<any>) {
  const toolName: string | undefined = typeof e.tool_name === 'string' ? e.tool_name : typeof e.tool === 'string' ? e.tool : undefined
  const id = mintId('hook')
  let startedAt = 0
  try {
    startedAt = await $.clock.now()
    await addRow($, {
      id, turnId: await currentTurnId($), kind: 'hooks',
      name: toolName ? `${event} ${toolName}` : event,
      target: commandsFor(settings, event, toolName).join(', '),
      plugins: pluginsFor(pluginHooks, event, toolName).join(', '),
      outcome: 'running', startedAt,
    })
  } catch {}
  const ran = await next(e)
  try {
    const r = (ran ?? {}) as Record<string, unknown>
    const blocked = r.deny !== undefined || r.block !== undefined || r.preventContinuation === true || r.decision === 'block'
    const context = Array.isArray(r.additionalContext) && r.additionalContext.length > 0
    const ms = (await $.clock.now()) - startedAt
    // Context appended while the hook ran has already marked the row; keep it.
    await update($, ROWS, list => list.map(row => row.id !== id ? row : {
      ...row, ms,
      outcome: blocked ? 'blocked' : context || (row.chars ?? 0) > 0 ? 'context' : 'none',
    }))
  } catch {}
  return ran
}

// The menu dialog and the live pane.

const MENU = 'xtrace-menu'
const PANE = 'xtrace'
const PANE_PREF = 'pane'
const NARROW = 'xtrace: widen the terminal to 144 columns to see the pane'

function toggleCategory(s: Selection, c: Category): Selection {
  return {
    ...s,
    categories: s.categories.includes(c)
      ? s.categories.filter(x => x !== c)
      : CATEGORIES.filter(x => x === c || s.categories.includes(x)),
  }
}

async function isPanePreferred($: EngineInterface): Promise<boolean> {
  try { return (await $.store.get(PANE_PREF)) === true } catch { return false }
}

async function openPane($: EngineInterface): Promise<void> {
  const opened = await $.ui.open({ id: PANE, title: 'xtrace' })
  if (!opened.isPlaced) $.ui.toast(NARROW)
}

async function setPane($: EngineInterface, mode: 'on' | 'off' | 'toggle'): Promise<'on' | 'off'> {
  const want = mode === 'toggle' ? !(await isPanePreferred($)) : mode === 'on'
  await $.store.set(PANE_PREF, want)
  if (want) await openPane($)
  else await $.ui.close({ id: PANE })
  return want ? 'on' : 'off'
}

async function setFilter($: EngineInterface, filter: string): Promise<void> {
  try { await update($, VIEW, v => ({ ...v, filter, rowStart: undefined })) } catch {}
}

async function sortBy($: EngineInterface, column: Column): Promise<void> {
  try { await update($, VIEW, v => ({ ...v, filter: withSort(v.filter, column), rowStart: undefined })) } catch {}
}

// Read the turns at press time, so a press at an end (or a fast double press) is a no-op.
async function navigate($: EngineInterface, to: Nav): Promise<void> {
  try {
    const turns = await read($, TURNS)
    const { pinnedTurnId } = await read($, VIEW)
    if (!canNav(turns, pinnedTurnId, to)) return
    await update($, VIEW, v => ({ ...v, pinnedTurnId: navTarget(turns, v.pinnedTurnId, to), rowStart: undefined }))
  } catch {}
}

// The row window as last drawn: a scroll or a page press moves it by what was on screen.
let drawnWindow = { count: 0, room: 1, sorted: false }

async function moveRows($: EngineInterface, by: number | Page): Promise<void> {
  const { count, room, sorted } = drawnWindow
  try {
    await update($, VIEW, v => ({
      ...v, rowStart: typeof by === 'number' ? scrollRows(count, room, v.rowStart, sorted, by) : pageRows(count, room, v.rowStart, sorted, by),
    }))
  } catch {}
}

const PAGE: { dir: Page; hotkey: string; label: string }[] = [
  { dir: 'up', hotkey: 'u', label: '▲' },
  { dir: 'down', hotkey: 'd', label: '▼' },
]

const NAV: { to: Nav; hotkey: string; label: string }[] = [
  { to: 'first', hotkey: 'f', label: '⏮' },
  { to: 'prev', hotkey: 'p', label: '◀' },
  { to: 'next', hotkey: 'n', label: '▶' },
  { to: 'latest', hotkey: 'l', label: '⏭' },
]

export const register: Register = on => {
  const runningAgents: string[] = []                      // tool_use_ids of Agent calls in flight, newest last
  const parentOfAgent = new Map<string, string>()         // agentId -> Agent tool_use_id
  const deniedCalls = new Set<string>()                   // tool_use_ids auto mode denied: their error result reads as denied

  on('session.start', async ($, e, next) => {
    try { settings = await $.settings.read() } catch { settings = undefined }
    try { await update($, SELECTION, withNewCategories) } catch {}
    try { pluginHooks = await loadPluginHooks($, e.cwd) } catch { pluginHooks = [] }
    try {
      await $.command.register({
        name: 'xtrace',
        description: 'Trace every tool, MCP, skill, hook, subagent, command and context access',
        argumentHint: '[all | tools mcp skills hooks agents commands context model] [session] | pane [on|off]',
      })
    } catch {}
    try {
      if (await isPanePreferred($)) await openPane($)
    } catch {}
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    try {
      await addTurn($, { turnId: e.turnId, text: firstWords(e.text), startedAt: await $.clock.now(), isComplete: false })
    } catch {}
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    try {
      if (e.agentId === undefined) await completeTurn($, e.turnId, await $.clock.now())
    } catch {}
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const tool = String(e.tool)
    const { tool: _t, tool_use_id, agentId, consent: _c, ...args } = e as Record<string, unknown> & { tool_use_id?: string; agentId?: string }
    const id = typeof tool_use_id === 'string' ? tool_use_id : mintId('call')
    const mcp = splitMcp(tool)
    let startedAt = 0
    try {
      startedAt = await $.clock.now()
      const agent = typeof agentId === 'string' ? agentId : undefined
      let parentId: string | undefined
      if (agent !== undefined) {
        parentId = parentOfAgent.get(agent)
        if (parentId === undefined) {
          parentId = runningAgents.at(-1)
          if (parentId !== undefined) parentOfAgent.set(agent, parentId)
        }
      }
      const row: Row = {
        id,
        turnId: await currentTurnId($),
        agentId: agent,
        parentId,
        kind: mcp ? 'mcp' : tool === 'Agent' ? 'agents' : 'tools',
        name: mcp ? `${mcp.server} / ${mcp.name}` : tool === 'Agent' ? String(args.subagent_type ?? 'general-purpose') : tool,
        target: tool === 'Agent' ? String(args.description ?? '') : targetOf(tool, args),
        outcome: 'running',
        startedAt,
      }
      await addRow($, row)
      if (tool === 'Agent') runningAgents.push(id)
    } catch {}

    try {
      const ran = await next(e)
      try {
        const ms = (await $.clock.now()) - startedAt
        const outcome: Row['outcome'] = ran.deny !== undefined || deniedCalls.has(id) ? 'denied' : ran.isError === true ? 'error' : 'ok'
        // What the model reads back: the result text, the deny text, and any reminders riding along.
        const read = typeof ran.text === 'string' ? ran.text : typeof ran.deny === 'string' ? ran.deny : ''
        const chars = read.length + (ran.context ?? []).reduce((n: number, c: string) => n + c.length, 0)
        await finishRow($, id, { outcome, ms, chars })
      } catch {}
      return ran
    } finally {
      const at = runningAgents.indexOf(id)
      if (at >= 0) runningAgents.splice(at, 1)
    }
  })

  on('agent.spawn', async ($, e, next) => {
    const ran = await next(e)
    try {
      await finishRow($, e.tool_use_id, { detail: ran.model ?? e.model ?? 'inherit' })
      if (ran.agentId !== undefined) parentOfAgent.set(ran.agentId, e.tool_use_id)
    } catch {}
    return ran
  })

  // One row per model request, with the usage the API reported for it.
  on('turn.step', async function* ($, e, next) {
    const id = mintId('step')
    let startedAt = 0
    try {
      startedAt = await $.clock.now()
      const agent = typeof e.agentId === 'string' ? e.agentId : undefined
      await addRow($, {
        id, turnId: await currentTurnId($), agentId: agent,
        parentId: agent !== undefined ? parentOfAgent.get(agent) ?? runningAgents.at(-1) : undefined,
        kind: 'model', name: `step ${e.index}`, target: e.model, outcome: 'running', startedAt,
      })
    } catch {}
    const r = yield* next(e)
    try {
      const u = r.usage
      const usage = u ? { model: u.model, input: u.input_tokens, cacheRead: u.cache_read_input_tokens, cacheWrite: u.cache_creation_input_tokens, output: u.output_tokens } : undefined
      await finishRow($, id, {
        outcome: usage ? 'ok' : 'error', ms: (await $.clock.now()) - startedAt,
        usage, target: usage ? usageText(usage) : e.model,
      })
    } catch {}
    return r
  })

  on('skill.prompt', async ($, e, next) => {
    const ran = await next(e)
    try {
      await addRow($, {
        id: mintId('skill'), turnId: await currentTurnId($), kind: 'skills',
        name: e.skill, target: `${ran.text.length} chars`, chars: ran.text.length, outcome: 'ok', startedAt: await $.clock.now(),
      })
    } catch {}
    return ran
  })

  on('command.run', { command: 'xtrace' }, async ($, e) => {
    const parsed = parseArgs(e.args)
    if (parsed.mode === 'error') return { text: parsed.message }
    if (parsed.mode === 'menu') {
      const opened = await $.ui.open({ id: MENU, title: 'xtrace', focus: true, closeOnEscape: true, rows: 14 })
      return { text: opened.isPlaced ? 'xtrace: pick what to show.' : `xtrace: ${opened.reason}` }
    }
    if (parsed.mode === 'pane') return { text: `xtrace: live pane ${await setPane($, parsed.pane)}.` }
    await update($, SELECTION, () => ({ ...parsed.selection, known: [...CATEGORIES] }))
    const [rows, turns, compactions] = await Promise.all([read($, ROWS), read($, TURNS), read($, COMPACTIONS)])
    return { text: buildReport({ rows, turns, compactions, selection: parsed.selection, now: await nowOrUndefined($) }) }
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
      try { await finishRow($, id, { outcome: 'ok', ms: (await $.clock.now()) - startedAt }) } catch {}
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
        if (text.length === 0) return next(e)                // an empty append says nothing
        const turnId = await currentTurnId($)
        if (e.origin.kind === 'hook') {
          // A hook's context belongs on its hooks row; a row of its own only when there is none.
          const event = e.origin.event
          let merged = false
          await update($, ROWS, list => {
            const attached = attachHookContext(list, turnId, event, text.length)
            merged = attached !== undefined
            return attached ?? list
          })
          if (merged) return next(e)
        }
        const name = e.origin.kind === 'hook' ? `hook ${e.origin.event}` : `${e.door} ${e.message.name ?? ''}`.trim()
        await addRow($, {
          id: e.uuid, turnId, agentId: e.agentId, kind: 'context',
          name, target: `${text.length} chars`, chars: text.length, outcome: 'ok', startedAt: await $.clock.now(),
        })
      }
    } catch {}
    return next(e)
  })

  on('session.compact', async ($, e, next) => {
    const ran = await next(e)
    try {
      // Only a main-conversation compaction that happened (not a skip or a precompute).
      if (e.agentId === undefined && ran.skip === undefined && e.trigger !== 'precompute') {
        const turnId = await currentTurnId($)
        const at = await $.clock.now()
        await update($, COMPACTIONS, list => [...list, { at, turnId }].slice(-50))
      }
    } catch {}
    return ran
  })

  on('classic.PreToolUse', ($, e, next) => recordHook('PreToolUse', $, e, next))
  on('classic.PostToolUse', ($, e, next) => recordHook('PostToolUse', $, e, next))
  on('classic.PostToolUseFailure', ($, e, next) => recordHook('PostToolUseFailure', $, e, next))
  on('classic.UserPromptSubmit', ($, e, next) => recordHook('UserPromptSubmit', $, e, next))
  on('classic.Stop', ($, e, next) => recordHook('Stop', $, e, next))
  on('classic.SessionStart', ($, e, next) => recordHook('SessionStart', $, e, next))
  on('classic.SessionEnd', ($, e, next) => recordHook('SessionEnd', $, e, next))
  on('classic.SubagentStart', ($, e, next) => recordHook('SubagentStart', $, e, next))
  on('classic.SubagentStop', ($, e, next) => recordHook('SubagentStop', $, e, next))
  on('classic.PreCompact', ($, e, next) => recordHook('PreCompact', $, e, next))
  on('classic.PostCompact', ($, e, next) => recordHook('PostCompact', $, e, next))
  on('classic.Notification', ($, e, next) => recordHook('Notification', $, e, next))
  on('classic.PermissionRequest', ($, e, next) => recordHook('PermissionRequest', $, e, next))
  // Auto mode answers a call it denies as an ordinary error result; this event says
  // which call it was and why. Before or after the call finished, its row reads denied.
  on('classic.PermissionDenied', async ($, e, next) => {
    try {
      const id = typeof e.tool_use_id === 'string' ? e.tool_use_id : undefined
      if (id !== undefined && !deniedCalls.has(id)) {
        deniedCalls.add(id)
        const why = typeof e.reason === 'string' ? denialCategory(e.reason) : undefined
        await finishRowWith($, id, row => ({ outcome: row.outcome === 'running' ? row.outcome : 'denied', target: why !== undefined ? `[${why}] ${row.target}` : row.target }))
      }
    } catch {}
    return recordHook('PermissionDenied', $, e, next)
  })
  // The pane is drawn to fit, so the engine never scrolls it: a wheel tick or a
  // scroll key moves the row window instead, and the window stays undrawn.
  on('ui.scroll', { requestId: PANE }, async ($, e) => {
    if (drawnWindow.count > drawnWindow.room) await moveRows($, e.by)
    return {}
  })

  on('ui.close', async ($, e, next) => {
    try {
      // The person closed the pane with the engine's own key: remember it as off.
      if (e.id === PANE && e.origin.kind === 'person') await $.store.set(PANE_PREF, false)
    } catch {}
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: MENU }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, SELECTION)
    const isAll = CATEGORIES.every(c => s.categories.includes(c))
    const canShow = s.categories.length > 0

    return (
      <Box flexDirection="column">
        <Text bold>What should /xtrace show?</Text>
        {CATEGORIES.map((c, i) => (
          <Button
            key={`cat-${c}`}
            hotkey={String(i + 1)}
            plain
            label={`[${s.categories.includes(c) ? 'x' : ' '}] ${c}`}
            onPress={() => update($, SELECTION, cur => toggleCategory(cur, c))}
          />
        ))}
        <Text> </Text>
        <Button key="all" hotkey="a" plain label={`[${isAll ? 'x' : ' '}] all`}
          onPress={() => update($, SELECTION, cur => ({ ...cur, categories: isAll ? [] : [...CATEGORIES] }))} />
        <Button key="scope" hotkey="s" plain label={`[${s.scope === 'session' ? 'x' : ' '}] whole session`}
          onPress={() => update($, SELECTION, cur => ({ ...cur, scope: cur.scope === 'session' ? 'turn' : 'session' }))} />
        <Button key="pane" hotkey="p" plain label="toggle live pane"
          onPress={async () => { await setPane($, 'toggle') }} />
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

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Input } = $.ui.resolve(e)
    const rows: Row[] = await read($, ROWS)
    const turns: Turn[] = await read($, TURNS)
    const selection: Selection = await read($, SELECTION)
    const view: View = await read($, VIEW)
    const pal = paletteFor((await $.config.list().catch(() => [])).find(row => row.key === 'theme')?.value)
    const counters = counterSegments(CATEGORIES.map(c => [c, rows.filter(r => r.kind === c).length]), pal)
    const { turn } = viewedTurn(turns, view.pinnedTurnId)
    const turnId = turn?.turnId
    const picked = new Set(selection.categories)
    const turnRows = rows.filter(r => r.turnId === turnId)
    // An old turn with no rows left: the 2000-row buffer dropped them.
    const isEvicted = turn !== undefined && turn.turnId !== turns.at(-1)?.turnId && turnRows.length === 0 && rows.length >= ROW_CAP
    const tokens = tokensOf(turnRows)
    const counts = new Map([...tokenValues(turnRows)].map(([id, v]) => [id, v.n]))
    const parsed = parseFilter(view.filter)
    const selected = turnRows.filter(r => picked.has(r.kind))
    const shown = applyView(selected, parsed, counts)
    const isFiltered = view.filter.trim() !== ''
    const now = await nowOrUndefined($)
    const total = turn !== undefined && now !== undefined ? turnTotalLines(turn, rows, now) : undefined
    const extra = (view.help ? EXAMPLES.length : 0) + (parsed.errors.length > 0 ? 1 : 0) + (isFiltered ? 1 : 0)
    const agentsAt = total?.findIndex(line => line.startsWith('subagents:')) ?? -1
    // The pane's own rows, not the terminal's: content taller than the pane scrolls,
    // and a scrolled pane draws the filter's cursor on the wrong row.
    const bodyRows = e.props.scroll.bodyRows > 0 ? e.props.scroll.bodyRows : (e.viewport?.rows ?? 24)
    // Counters, filter bar, rule, [prompt, rule,] header, the rows, rule, the total's lines, rule, nav.
    const base = Math.max(1, bodyRows - 7 - (turn !== undefined ? 2 : 0) - extra - (total?.length ?? 0) - (agentsAt > 0 ? 1 : 0))
    const width = e.props.bodyColumns > 0 ? e.props.bodyColumns : 80
    const ruleWidth = Math.max(1, Math.min(width, 120))
    const rule = '─'.repeat(ruleWidth)
    const withPlugins = picked.has('hooks')
    const marks = parsed.sort !== undefined ? { [parsed.sort.column]: sortMark(parsed.sort, parsed.sort.column) } : {}
    const header = paneHeaderCells(width, withPlugins, marks)
    // Unsorted, the newest rows that fit; sorted, the first ones in order.
    // A turn that overflows gives one line to the paging line: the earlier-rows hint and its controls.
    const overflows = shown.length > base
    const room = overflows ? Math.max(1, base - 1) : base
    const sorted = parsed.sort !== undefined
    const win = rowWindow(shown.length, room, view.rowStart, sorted)
    const visible = shown.slice(win.from, win.to)
    drawnWindow = { count: shown.length, room, sorted }

    return (
      <Box flexDirection="column">
        <Text wrap="truncate-end">
          {counters.map((s, i) => <Text key={`count-${i}`} color={s.color}>{s.text}</Text>)}
        </Text>
        <Box flexDirection="row" gap={2}>
          {/* Our own label: the engine draws an Input's label as dim as its placeholder. */}
          <Box flexDirection="row" gap={1}>
            <Box key="filter-label"><Text color={pal.value}>filter:</Text></Box>
            <Input key="filter" autoFocus placeholder={PLACEHOLDER} value={view.filter} submitLabel="keep"
              onInput={value => setFilter($, value)} onSubmit={value => setFilter($, value)} />
          </Box>
          <Button key="help" hotkey="h" plain label="?"
            onPress={async () => { try { await update($, VIEW, v => ({ ...v, help: !v.help })) } catch {} }} />
        </Box>
        {parsed.errors.length > 0 && <Box key="filter-error"><Text dimColor wrap="truncate-end">{parsed.errors.join(' · ')}</Text></Box>}
        {view.help && EXAMPLES.map(x => (
          <Text key={`example-${x.text}`} dimColor wrap="truncate-end">{`  ${x.text.padEnd(28)} ${x.meaning}`}</Text>
        ))}
        <Text dimColor>{rule}</Text>
        {turn !== undefined && (
          <Box key="prompt">
            <Text wrap="truncate-end">
              <Text color={pal.label}>prompt: </Text>
              <Text color={pal.value}>{turnTitle(turn.text)}</Text>
            </Text>
          </Box>
        )}
        {turn !== undefined && <Text dimColor>{rule}</Text>}
        {isEvicted && <Box key="evicted"><Text dimColor>rows for this turn fell out of the 2000-row buffer</Text></Box>}
        {!isEvicted && selected.length === 0 && <Text dimColor>No rows in this turn yet.</Text>}
        {selected.length > 0 && (
          <Box flexDirection="row">
            {header.flatMap((c, i) => {
              const label = c.text.trim()
              const pad = ' '.repeat(c.text.length - label.length)
              const isLast = i === header.length - 1
              return [
                ...(i > 0 ? [<Text key={`hgap-${i}`}> </Text>] : []),
                ...(isLast && pad !== '' ? [<Text key={`hpad-${i}`}>{pad}</Text>] : []),
                <Button key={`sort-${c.column}`} plain dimColor label={label} onPress={() => sortBy($, c.column as Column)} />,
                ...(!isLast && pad !== '' ? [<Text key={`hpad-${i}`}>{pad}</Text>] : []),
              ]
            })}
          </Box>
        )}
        {overflows && (
          <Box key="paging" flexDirection="row" gap={2}>
            {win.from > 0 && <Box key="hidden"><Text dimColor>{`↑ ${win.from} ${sorted ? 'rows above' : 'earlier rows'}`}</Text></Box>}
            <Box flexDirection="row" gap={1}>
              {PAGE.map(b => (
                <Button key={`page-${b.dir}`} hotkey={b.hotkey} plain label={b.label}
                  dimColor={!canPage(shown.length, room, view.rowStart, sorted, b.dir)} onPress={() => moveRows($, b.dir)} />
              ))}
            </Box>
            <Box key="page-label"><Text dimColor>{`rows ${win.from + 1}–${win.to} of ${shown.length}`}</Text></Box>
          </Box>
        )}
        {visible.map(r => (
          <Text key={r.id} wrap="truncate-end">
            {paneSegments(r, width, withPlugins, tokens.get(r.id), pal).map((s, i) => (
              <Text key={`${r.id}-${i}`} color={s.color} bold={s.bold}>{s.text}</Text>
            ))}
          </Text>
        ))}
        {selected.length > 0 && total !== undefined && <Text dimColor>{rule}</Text>}
        {selected.length > 0 && total !== undefined && (
          <Box flexDirection="column">
            {total.flatMap((line, n) => [
              // A short rule sets the subagents' block apart from the main loop's.
              ...(n === agentsAt && n > 0 ? [<Text key="agents-rule" dimColor>{'╌'.repeat(Math.min(24, ruleWidth))}</Text>] : []),
              <Text key={`total-${n}`} wrap="truncate-end">
                {paneTotalSegments(line, width, n === 0, pal).map((s, i) => (
                  <Text key={`total-${n}-${i}`} color={s.color} bold={s.bold}>{s.text}</Text>
                ))}
              </Text>,
            ])}
          </Box>
        )}
        {selected.length > 0 && isFiltered && <Box key="shown"><Text dimColor>{`${shown.length} of ${selected.length} rows shown`}</Text></Box>}
        {selected.length > 0 && total !== undefined && <Text dimColor>{rule}</Text>}
        {turns.length > 0 && (
          <Box key="nav" flexDirection="row" gap={1} width={ruleWidth} justifyContent="center">
            {NAV.map(b => {
              const can = canNav(turns, view.pinnedTurnId, b.to)
              return <Button key={`nav-${b.to}`} hotkey={b.hotkey} plain label={b.label} dimColor={!can}
                onPress={() => navigate($, b.to)} />
            })}
            <Box key="nav-label"><Text dimColor wrap="truncate-end">{navLabel(turns, view.pinnedTurnId)}</Text></Box>
          </Box>
        )}
      </Box>
    )
  })
}
