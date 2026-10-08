import { describe, expect, test, mock } from 'claude-code/testing'
import type { Engine, TestBody } from 'claude-code/testing'

// A test cannot read plugin state ($ in a test has no `state` noun, and state
// writes do not pass through the test's hooks), so these tests read what the
// mod records the way a person does: through the /xtrace report.

type On = Parameters<TestBody>[1]

// The test kit has nothing beneath the plugins for turn.start or the clock;
// answer them as core does. Without a clock every recorder (rightly) records nothing.
const answerTurns = (on: On) => {
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  mock.clock(on)
}

const xtrace = async ($: Engine, args: string): Promise<string> => {
  const out = await $.command.run({
    command: 'xtrace', args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 },
  })
  return out.text ?? ''
}

const run = ($: Engine, command: string, args: string) =>
  $.command.run({ command, args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })

describe('tool rows', () => {
  test('a Bash call becomes a tools row with outcome ok and a duration', async ($, on) => {
    answerTurns(on)
    on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: '', stderr: '', interrupted: false }, text: '' }))
    await $.turn.start({ text: 'list the files please now', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: '  ls -la  ', tool_use_id: 'u1' })
    const text = await xtrace($, 'tools')
    expect(text).toContain('xtrace: 1 turn(s), 1 rows, categories: tools')
    expect(text).toMatch(/\| 1 \| tools \| Bash \| ls -la \| ok \| \d+ \|/)
  })

  test('an errored call is a row with outcome error', async ($, on) => {
    answerTurns(on)
    on('tool.call', { tool: 'Read' }, () => ({ result: {}, text: 'no such file', isError: true }))
    await $.turn.start({ text: 'read it', turnId: 't1' })
    await $.tool.call({ tool: 'Read', file_path: '/nope.go', tool_use_id: 'u2' })
    expect(await xtrace($, 'tools')).toContain('| tools | Read | /nope.go | error |')
  })

  test('a denied call is a row with outcome denied', async ($, on) => {
    answerTurns(on)
    on('tool.call', { tool: 'Edit' }, () => ({ deny: 'protected' }))
    await $.turn.start({ text: 'edit it', turnId: 't1' })
    await $.tool.call({ tool: 'Edit', file_path: '/x/.env', old_string: 'a', new_string: 'b', tool_use_id: 'u3' })
    expect(await xtrace($, 'tools')).toContain('| tools | Edit | /x/.env | denied |')
  })

  test('an MCP call becomes an mcp row with server and tool split', async ($, on) => {
    answerTurns(on)
    on('tool.call', { tool: 'mcp__sqlite-bookstore__query' }, () => ({ result: { rows: [] }, text: '' }))
    await $.turn.start({ text: 'query', turnId: 't1' })
    await $.tool.call({ tool: 'mcp__sqlite-bookstore__query', sql: 'select 1', tool_use_id: 'u4' })
    expect(await xtrace($, 'mcp')).toContain('| mcp | sqlite-bookstore / query | select 1 | ok |')
  })

  test('each turn gets its own table, titled by the prompt', async ($, on) => {
    answerTurns(on)
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: '' }))
    on('turn.complete', () => ({ text: 'done' }))
    await $.turn.start({ text: 'one two three four five six seven eight nine', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
    await $.turn.complete({ turnId: 't1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })
    await $.turn.start({ text: 'second', turnId: 't2' })
    await $.tool.call({ tool: 'Bash', command: 'pwd', tool_use_id: 'u2' })
    const session = await xtrace($, 'tools session')
    expect(session).toContain('"one two three four five six seven eight…"')
    expect(session).toContain('"second"')
    const last = await xtrace($, 'tools')
    expect(last).not.toContain('one two three')
    expect(last).toContain('| tools | Bash | pwd |')
  })

  test('the row buffer keeps the newest 2000 across categories', { timeoutMs: 60_000 }, async ($, on) => {
    // Each $.tool.call also raises classic.PreToolUse, so a call is two rows:
    // its tools row, then its hooks row. 1003 calls are 2006 rows, and the
    // oldest six (calls 0 to 2) are dropped.
    answerTurns(on)
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: '' }))
    await $.turn.start({ text: 'spam', turnId: 't1' })
    for (let i = 0; i < 1003; i++) {
      await $.tool.call({ tool: 'Bash', command: `echo ${i}`, tool_use_id: `u${i}` })
    }
    const text = await xtrace($, 'all')
    expect(text).toContain('2000 rows')
    expect(text).not.toContain('| echo 2 |')
    expect(text).toContain('| echo 3 |')
  })
})

describe('other rows', () => {
  test('a skill prompt becomes a skills row with the text length', async ($, on) => {
    answerTurns(on)
    on('skill.prompt', () => ({ text: 'expanded' }))
    await $.turn.start({ text: 'commit', turnId: 't1' })
    await $.skill.prompt({ skill: 'commit', text: 'abcdef' })
    expect(await xtrace($, 'skills')).toContain('| skills | commit | 8 chars | ok |')
  })

  test('a slash command becomes a commands row', async ($, on) => {
    answerTurns(on)
    on('command.run', { command: 'compact' }, () => ({ text: 'ok' }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await run($, 'compact', 'keep the plan')
    expect(await xtrace($, 'commands')).toContain('| commands | compact | keep the plan | ok |')
  })

  test('/xtrace itself is not recorded as a command', async ($, on) => {
    answerTurns(on)
    await $.turn.start({ text: 'x', turnId: 't1' })
    await xtrace($, 'tools')
    expect(await xtrace($, 'commands')).toBe('xtrace: nothing recorded for the last turn.')
  })

  test('a classic PostToolUse that adds context becomes a hooks row with outcome context', async ($, on) => {
    answerTurns(on)
    on('classic.PostToolUse', () => ({ additionalContext: ['remember the gate'] }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.classic.PostToolUse({ tool_name: 'Grep', tool_input: {}, tool_response: {}, tool_use_id: 'u9' })
    expect(await xtrace($, 'hooks')).toMatch(/\| hooks \| PostToolUse Grep \| [^|]* \| [^|]* \| context \|/)
  })

  test('a classic Stop with nothing beneath is a hooks row with outcome none', async ($, on) => {
    answerTurns(on)
    on('classic.Stop', () => ({}))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.classic.Stop({ stop_hook_active: false })
    expect(await xtrace($, 'hooks')).toMatch(/\| hooks \| Stop \| [^|]* \| [^|]* \| none \|/)
  })

  test('a hook-context append becomes a context row', async ($, on) => {
    answerTurns(on)
    await $.turn.start({ text: 'x', turnId: 't1' })
    // Only core may answer session.append (a hook that answers without next is
    // skipped), and the kit has no core here: the call rejects after the mod
    // recorded the row, which is what this test reads.
    await $.session.append({
      message: { type: 'attachment', name: 'hook_context', content: [{ type: 'text', text: 'hello world' }] },
      door: 'hook-context',
      origin: { kind: 'hook', event: 'PostToolUse' },
      uuid: 'row-1',
    }).catch(() => undefined)
    expect(await xtrace($, 'context')).toContain('| context | hook PostToolUse | 11 chars | ok |')
  })

  test('a hook-context append lands on its hooks row instead of a row of its own', async ($, on) => {
    answerTurns(on)
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.classic.Stop({ stop_hook_active: false }).catch(() => undefined)
    await $.session.append({
      message: { type: 'attachment', name: 'hook_context', content: [{ type: 'text', text: 'hello world' }] },
      door: 'hook-context',
      origin: { kind: 'hook', event: 'Stop' },
      uuid: 'row-2',
    }).catch(() => undefined)
    const text = await xtrace($, 'hooks context')
    expect(text).toMatch(/\| hooks \| Stop \| [^|]* \| [^|]* \| context \| \d* \| ~3 \|/)   // 11 chars ≈ 3 tokens; ms empty, the Stop chain rejects here
    expect(text).not.toContain('| context | hook Stop')
  })

  test('an empty append records no row', async ($, on) => {
    answerTurns(on)
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.session.append({
      message: { type: 'attachment', name: 'credential_org', content: [] },
      door: 'attachment',
      origin: { kind: 'engine' },
      uuid: 'row-3',
    }).catch(() => undefined)
    expect(await xtrace($, 'context')).toBe('xtrace: nothing recorded for the last turn.')
  })

  test('calls inside a subagent nest under its agents row', async ($, on) => {
    answerTurns(on)
    on('tool.call', { tool: 'Agent' }, async () => {
      await $.agent.spawn({ tool_use_id: 'agent-call', prompt: 'go', description: 'find handlers', subagentType: 'Explore', provider: { plugin: 'engine', tier: 'core' }, parentModel: 'claude-opus-5-5', background: false, fork: false })
      // @ts-expect-error agentId is not in the call's typed args, but the kit hands it to
      // the plugins as a subagent's call carries it, which is what this test needs.
      await $.tool.call({ tool: 'Read', file_path: 'handler.go', tool_use_id: 'child-1', agentId: 'ag1' })
      return { result: {}, text: '' }
    })
    on('agent.spawn', () => ({ model: 'claude-sonnet-5-5', agentId: 'ag1' }))
    on('tool.call', { tool: 'Read' }, () => ({ result: {}, text: '' }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Agent', description: 'find handlers', prompt: 'go', subagent_type: 'Explore', tool_use_id: 'agent-call' })
    const nested = await xtrace($, 'tools agents')
    expect(nested).toContain('| 1 | agents | Explore | find handlers | ok |')
    expect(nested).toContain('| 2 | tools |   Read |')
    expect(await xtrace($, 'tools')).toContain('| 1 | tools | Read (Explore) |')
  })

  test('a compaction is named in the report', async ($, on) => {
    answerTurns(on)
    on('session.compact', () => ({ messages: [{ role: 'user', text: 'summary', toolUses: [] }] }))
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: '' }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
    await $.session.compact({ trigger: 'manual', messages: [{ role: 'user', text: 'x', toolUses: [] }] })
    expect(await xtrace($, 'tools')).toContain('Memory starts after a compaction')
  })
})

describe('/xtrace command', () => {
  test('registers at session start', async ($, on) => {
    const names: string[] = []
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    on('settings.read', () => ({ value: {} }))
    on('command.register', ($, e) => { names.push(e.name); return { value: { command: e.name } } })
    await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
    expect(names).toContain('xtrace')
  })

  test('prints a report for the chosen categories', async ($, on) => {
    answerTurns(on)
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: '' }))
    await $.turn.start({ text: 'list', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
    const text = await xtrace($, 'tools hooks')
    expect(text).toContain('xtrace: 1 turn(s), 2 rows, categories: tools, hooks')
    expect(text).toContain('| 1 | tools | Bash | ls |  | ok |')
    expect(text).toContain('| 2 | hooks | PreToolUse Bash |')   // $.tool.call raises classic.PreToolUse
  })

  test('an unknown word answers the usage line', async ($) => {
    const text = await xtrace($, 'bananas')
    expect(text).toContain('Unknown word "bananas"')
    expect(text).toContain('/xtrace')
  })

  test('empty scope answers the one-liner', async ($) => {
    expect(await xtrace($, 'all')).toBe('xtrace: nothing recorded for the last turn.')
  })
})

// What core does beneath the plugins for the UI and session events these tests raise.
const answerUi = (on: On, opened: string[] = [], closed: string[] = []) => {
  on('ui.open', ($, e) => { opened.push(e.id); return { value: { isPlaced: true } } })
  on('ui.close', ($, e) => { closed.push(e.id); return { value: undefined } })
}
const answerSession = (on: On) => {
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('settings.read', () => ({ value: {} }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
}
const startSession = ($: Engine) => $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })

const paneProps = (bodyColumns: number) => ({
  title: 'xtrace', isFocused: true, bodyColumns, placement: 'dock' as const,
  scroll: { offset: 0, bodyRows: 20 }, view: {},
})

describe('menu', () => {
  test('/xtrace with no words opens the menu pane', async ($, on) => {
    const opened: string[] = []
    answerUi(on, opened)
    expect(await xtrace($, '')).toBe('xtrace: pick what to show.')
    expect(opened).toContain('xtrace-menu')
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    test(`opens with the current selection and flips a category on press (${surface})`, async ($, on) => {
      answerUi(on)
      await xtrace($, 'tools')                       // saves the selection { tools, turn }
      const ui = await $.ui.mount({ plugin: 'xtrace', surface, component: 'Pane', requestId: 'xtrace-menu', props: paneProps(60) })
      expect(await ui.find({ type: 'Button', text: /\[x\] tools/ })).toBeDefined()
      expect(await ui.find({ type: 'Button', text: /\[ \] mcp/ })).toBeDefined()
      await $.ui.press({ plugin: 'xtrace', key: 'cat-mcp', requestId: 'xtrace-menu', surface })
      expect(await ui.find({ type: 'Button', text: /\[x\] mcp/ })).toBeDefined()
      expect(await ui.find({ type: 'Button', text: /\[x\] tools/ })).toBeDefined()
    })
  }

  test('show closes the menu and runs the report for the ticked categories', async ($, on) => {
    const closed: string[] = []
    const ran: string[] = []
    answerUi(on, [], closed)
    on('command.run', { command: 'xtrace' }, ($, e) => { ran.push(e.args ?? ''); return { text: '' } })
    await xtrace($, 'tools mcp session')
    await $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace-menu', props: paneProps(60) })
    await $.ui.press({ plugin: 'xtrace', key: 'show', requestId: 'xtrace-menu', surface: 'terminal' })
    expect(closed).toContain('xtrace-menu')
    expect(ran).toContain('tools mcp session')
  })
})

describe('live pane', () => {
  test('pane on opens the pane and is remembered for the next session start', async ($, on) => {
    mock.store(on)
    answerSession(on)
    const opened: string[] = []
    answerUi(on, opened)
    expect(await xtrace($, 'pane on')).toBe('xtrace: live pane on.')
    expect(opened).toEqual(['xtrace'])
    await startSession($)
    expect(opened).toEqual(['xtrace', 'xtrace'])
  })

  test('pane off closes the pane and is remembered', async ($, on) => {
    mock.store(on, { pane: true })
    answerSession(on)
    const opened: string[] = []
    const closed: string[] = []
    answerUi(on, opened, closed)
    expect(await xtrace($, 'pane off')).toBe('xtrace: live pane off.')
    expect(closed).toContain('xtrace')
    await startSession($)
    expect(opened).toEqual([])
  })

  test('pane toggles', async ($, on) => {
    mock.store(on, { pane: true })
    answerUi(on)
    expect(await xtrace($, 'pane')).toBe('xtrace: live pane off.')
    expect(await xtrace($, 'pane')).toBe('xtrace: live pane on.')
  })

  // A close by the person (Esc, or the engine's close mark) cannot be raised from
  // this kit: the test's `ui` noun has no `close`. The ui.close hook that turns the
  // preference off on origin `person` is checked live instead.

  test('a pane that cannot be placed shows the width toast', async ($, on) => {
    mock.store(on)
    const toasts: string[] = []
    on('ui.open', () => ({ value: { isPlaced: false, reason: 'narrow' } }))
    on('ui.toast', ($, e) => { toasts.push(e.text); return { value: undefined } })
    await xtrace($, 'pane on')
    expect(toasts).toContain('xtrace: widen the terminal to 144 columns to see the pane')
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    test(`draws counters and the current turn's rows, filtered by the selection (${surface})`, async ($, on) => {
      answerTurns(on)
      answerUi(on)
      on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: '' }))
      on('classic.Stop', () => ({}))
      let sawRunning: unknown
      let sawStop: unknown = 'not looked'
      let sawBash: unknown
      let counters: unknown
      on('tool.call', { tool: 'Read' }, async () => {
        // Mounted while the Read is in flight, so its row is still running.
        const ui = await $.ui.mount({ plugin: 'xtrace', surface, component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
        sawRunning = await ui.find({ type: 'Text', text: /Read .*running/ })
        sawBash = await ui.find({ type: 'Text', text: /Bash\s+ls\s+ok/ })
        sawStop = await ui.find({ type: 'Text', text: /Stop/ })
        counters = await ui.find({ type: 'Text', text: /tools 2 · mcp 0 · skills 0 · hooks 3/ })
        return { result: {}, text: '' }
      })
      await xtrace($, 'tools')                       // selection: tools only
      await $.turn.start({ text: 'x', turnId: 't1' })
      await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
      await $.classic.Stop({ stop_hook_active: false })
      await $.tool.call({ tool: 'Read', file_path: 'a.go', tool_use_id: 'u2' })
      expect(counters).toBeDefined()
      expect(sawBash).toBeDefined()
      expect(sawRunning).toBeDefined()
      expect(sawStop).toBeUndefined()              // hooks not selected: counted, not listed
    })
  }
})

describe('plugin hooks', () => {
  test('an enabled plugin with a hook for the event shows in its own column', async ($, on) => {
    answerTurns(on)
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    on('command.register', ($, e) => ({ value: { command: e.name } }))
    on('settings.read', () => ({ value: { enabledPlugins: { 'context-mode@context-mode': true } } }))
    on('env.get', ($, e) => ({ value: e.name === 'HOME' ? '/home/u' : undefined }))
    on('fs.read', ($, e) => {
      if (e.path === '/home/u/.claude/plugins/installed_plugins.json') {
        return { value: JSON.stringify({ plugins: { 'context-mode@context-mode': [{ scope: 'user', installPath: '/p/cm' }] } }) }
      }
      if (e.path === '/p/cm/hooks/hooks.json') {
        return { value: JSON.stringify({ hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node pre.mjs' }] }] } }) }
      }
      throw new Error('not found')
    })
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: '' }))
    await startSession($)
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
    expect(await xtrace($, 'hooks')).toMatch(/\| hooks \| PreToolUse Bash \| [^|]* \| context-mode \|/)
  })
})

describe('denied calls', () => {
  const REASON = '[Auto-Mode Bypass] Spawning a subagent here would sidestep review'

  test('auto mode denying a call marks its row denied with the category', async ($, on) => {
    answerTurns(on)
    on('classic.PermissionDenied', () => ({}))
    // Core fires PermissionDenied while the call is in flight, then answers it as an error.
    on('tool.call', { tool: 'Agent' }, async () => {
      await $.classic.PermissionDenied({ tool_name: 'Agent', tool_input: {}, tool_use_id: 'u1', reason: REASON })
      return { result: {}, text: 'Permission for this action was denied', isError: true }
    })
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Agent', subagent_type: 'Explore', description: 'find handlers', prompt: 'p', tool_use_id: 'u1' })
    expect(await xtrace($, 'agents')).toContain('| agents | Explore | [Auto-Mode Bypass] find handlers | denied |')
  })

  test('a denial that arrives after the call finished still marks it', async ($, on) => {
    answerTurns(on)
    on('classic.PermissionDenied', () => ({}))
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: 'denied', isError: true }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u2' })
    await $.classic.PermissionDenied({ tool_name: 'Bash', tool_input: {}, tool_use_id: 'u2', reason: '[Data Exfiltration] x' })
    expect(await xtrace($, 'tools')).toContain('| tools | Bash | [Data Exfiltration] ls | denied |')
  })
})

describe('model rows', () => {
  test('a model request becomes a model row with its usage', async ($, on) => {
    answerTurns(on)
    on('turn.step', async function* ($, e) {
      return {
        turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn' as const,
        usage: { model: 'claude-opus-5-5', input_tokens: 1200, cache_read_input_tokens: 45100, cache_creation_input_tokens: 2000, output_tokens: 310 },
      }
    })
    await $.turn.start({ text: 'x', turnId: 't1' })
    const stream = $.turn.step({ turnId: 't1', index: 3, model: 'claude-opus-5-5', messageCount: 9 })
    for await (const _ of stream) { /* drain */ }
    const text = await xtrace($, 'model')
    expect(text).toContain('| model | step 3 | claude-opus-5-5 · in 1.2k · cache 45.1k · write 2.0k · out 310 | ok |')
    expect(text).toContain('| +310 |')                    // what the request wrote
    expect(text).toMatch(/Total: \S+( so far)? · 1 request\(s\) · context \+0 \(48\.3k → 48\.3k\)/)
  })

  test('a tool row carries an estimate from the text the model reads', async ($, on) => {
    answerTurns(on)
    on('tool.call', { tool: 'Bash' }, () => ({ result: {}, text: 'x'.repeat(4000) }))
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
    expect(await xtrace($, 'tools')).toMatch(/\| tools \| Bash \| ls \| ok \| \d+ \| ~1\.0k \|/)
  })
})

describe('pane filter and sort', () => {
  // Two tool rows in one turn: Read a.go, then Bash ls.
  const twoRows = async ($: Engine, on: On) => {
    answerTurns(on)
    answerUi(on)
    on('tool.call', () => ({ result: {}, text: '' }))
    await xtrace($, 'tools')
    await $.turn.start({ text: 'x', turnId: 't1' })
    await $.tool.call({ tool: 'Read', file_path: 'a.go', tool_use_id: 'u1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u2' })
    return $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
  }

  test('the empty bar shows examples', async ($, on) => {
    const ui = await twoRows($, on)
    expect((await ui.find({ key: 'filter' }))?.props.placeholder).toBe('try: outcome:!ok · kind:tools sort:-ms · tokens:>5k')
    expect((await ui.find({ key: 'filter' }))?.props.autoFocus).toBe(true)        // the cursor starts in the filter
    // The label is the mod's own, brighter than the engine's dim examples.
    expect((await ui.find({ key: 'filter' }))?.props.label).toBeUndefined()
    expect((await ui.find({ key: 'filter-label' }))?.text).toBe('filter:')
  })

  test('typing a filter narrows the rows and shows the count', async ($, on) => {
    const ui = await twoRows($, on)
    await ui.input({ key: 'filter', text: 'name:bash', kind: 'change' })
    expect(await ui.find({ type: 'Text', text: /Bash\s+ls\s+ok/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Read\s+a\.go/ })).toBeUndefined()
    expect((await ui.find({ key: 'shown' }))?.text).toBe('1 of 2 rows shown')
  })

  test('a mistake is named and the rest still filters', async ($, on) => {
    const ui = await twoRows($, on)
    await ui.input({ key: 'filter', text: 'foo:1 name:read' })
    expect((await ui.find({ key: 'filter-error' }))?.text).toContain('unknown column "foo"')
    expect(await ui.find({ type: 'Text', text: /Read\s+a\.go/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Bash\s+ls/ })).toBeUndefined()
  })

  test('pressing a header sorts and writes the sort into the bar', async ($, on) => {
    const ui = await twoRows($, on)
    await ui.press({ key: 'sort-name' })
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('sort:name')
    expect((await ui.find({ key: 'sort-name' }))?.props.label).toBe('name▲')
    // Outer row Texts only: an inner segment holds one cell, the counters line reads `tools 2 · …`.
    const rows = await ui.findAll({ type: 'Text', text: /^tools\s+(Bash|Read)\s/ })
    expect(rows.map(r => r.text)).toEqual([expect.stringMatching(/Bash/), expect.stringMatching(/Read/)])
    await ui.press({ key: 'sort-name' })
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('sort:-name')
    await ui.press({ key: 'sort-name' })
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('')
  })

  test('help shows the examples', async ($, on) => {
    const ui = await twoRows($, on)
    expect(await ui.find({ type: 'Text', text: /slowest first/ })).toBeUndefined()
    await ui.press({ key: 'help' })
    expect(await ui.find({ type: 'Text', text: /kind:tools sort:-ms\s+tool calls, slowest first/ })).toBeDefined()
  })
})

describe('pane height', () => {
  test('the rows fit the pane\'s own rows, so it never scrolls', async ($, on) => {
    answerTurns(on)
    answerUi(on)
    on('tool.call', () => ({ result: {}, text: '' }))
    await xtrace($, 'tools')
    await $.turn.start({ text: 'x', turnId: 't1' })
    for (let i = 0; i < 30; i++) await $.tool.call({ tool: 'Bash', command: `echo ${i}`, tool_use_id: `u${i}` })
    const ui = await $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
    // 20 body rows less counters, filter, rule, prompt, rule, header, rule, total, rule, nav,
    // and, as 30 rows overflow, the one paging line (earlier-rows hint and controls).
    expect(await ui.findAll({ type: 'Text', text: /^tools\s+Bash\s/ })).toHaveLength(9)
  })

  test('an overflowing turn says what is hidden and pages through it', async ($, on) => {
    answerTurns(on)
    answerUi(on)
    on('tool.call', () => ({ result: {}, text: '' }))
    await xtrace($, 'tools')
    await $.turn.start({ text: 'x', turnId: 't1' })
    for (let i = 0; i < 30; i++) await $.tool.call({ tool: 'Bash', command: `echo ${i}`, tool_use_id: `u${i}` })
    const ui = await $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
    expect((await ui.find({ key: 'hidden' }))?.text).toBe('↑ 21 earlier rows')
    expect((await ui.find({ key: 'page-label' }))?.text).toBe('rows 22–30 of 30')
    // One line: the hint at the left, the controls centred, the range and ↓ at the right.
    const line = await ui.find({ key: 'paging' })
    expect(line?.text).toMatch(/^↑ 21 earlier rows.*▲.*▼.*rows 22–30 of 30.*↓$/)
    const parts = (line?.children ?? []) as { type?: string; props?: Record<string, unknown> }[]
    expect(parts.map(p => p.props?.justifyContent)).toEqual(['flex-start', 'center', 'flex-end'])
    // The sides are equal, so the controls sit in the middle; the right side ends with the ms column.
    const widths = parts.map(p => p.props?.width as number)
    expect(widths[0]).toBe(widths[2])
    expect(widths.reduce((a, b) => a + b, 0)).toBe(98)
    expect(await ui.find({ type: 'Text', text: /echo 29/ })).toBeDefined()
    await ui.press({ key: 'page-up' })
    expect((await ui.find({ key: 'page-label' }))?.text).toBe('rows 13–21 of 30')
    expect(await ui.find({ type: 'Text', text: /echo 14/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /echo 29/ })).toBeUndefined()
    await ui.press({ key: 'page-down' })
    expect((await ui.find({ key: 'page-label' }))?.text).toBe('rows 22–30 of 30')
  })

  test('a paged window stays with its turn: a new live turn shows its newest rows', async ($, on) => {
    answerTurns(on)
    answerUi(on)
    on('tool.call', () => ({ result: {}, text: '' }))
    await xtrace($, 'tools')
    await $.turn.start({ text: 'a', turnId: 't1' })
    for (let i = 0; i < 30; i++) await $.tool.call({ tool: 'Bash', command: `echo a${i}`, tool_use_id: `a${i}` })
    const ui = await $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
    await ui.press({ key: 'page-up' })
    await $.turn.start({ text: 'b', turnId: 't2' })
    for (let i = 0; i < 30; i++) await $.tool.call({ tool: 'Bash', command: `echo b${i}`, tool_use_id: `b${i}` })
    expect((await ui.find({ key: 'page-label' }))?.text).toBe('rows 22–30 of 30')
    expect(await ui.find({ type: 'Text', text: /echo b29/ })).toBeDefined()
  })

  test('changing the filter goes back to the newest rows', async ($, on) => {
    answerTurns(on)
    answerUi(on)
    on('tool.call', () => ({ result: {}, text: '' }))
    await xtrace($, 'tools')
    await $.turn.start({ text: 'x', turnId: 't1' })
    for (let i = 0; i < 30; i++) await $.tool.call({ tool: 'Bash', command: `echo ${i}`, tool_use_id: `u${i}` })
    const ui = await $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
    await ui.press({ key: 'page-up' })
    await ui.input({ key: 'filter', text: 'echo', kind: 'change' })
    expect((await ui.find({ key: 'page-label' }))?.text).toMatch(/^rows \d+–30 of 30$/)
  })
})

describe('pane turn navigation', () => {
  // Turn t1 runs Bash ls, turn t2 runs Read a.go.
  const twoTurns = async ($: Engine, on: On) => {
    answerTurns(on)
    answerUi(on)
    on('tool.call', () => ({ result: {}, text: '' }))
    await xtrace($, 'tools')
    await $.turn.start({ text: 'list files', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u1' })
    await $.turn.start({ text: 'read it', turnId: 't2' })
    await $.tool.call({ tool: 'Read', file_path: 'a.go', tool_use_id: 'u2' })
    return $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
  }

  test('follows the latest turn and labels it', async ($, on) => {
    const ui = await twoTurns($, on)
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 2/2')
    expect((await ui.find({ key: 'prompt' }))?.text).toBe('prompt: "read it"')
    expect((await ui.find({ key: 'nav' }))?.props).toMatchObject({ justifyContent: 'center', width: 100 })   // centered under the rules
    expect(await ui.find({ type: 'Text', text: /Read\s+a\.go/ })).toBeDefined()
    expect((await ui.find({ key: 'nav-next' }))?.props.dimColor).toBe(true)
  })

  test('prev shows the earlier turn; a new turn keeps it and says live', async ($, on) => {
    const ui = await twoTurns($, on)
    await ui.press({ key: 'nav-prev' })
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 1/2 · ● live: 2')
    expect((await ui.find({ key: 'prompt' }))?.text).toBe('prompt: "list files"')
    expect(await ui.find({ type: 'Text', text: /Bash\s+ls/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Read\s+a\.go/ })).toBeUndefined()
    await $.turn.start({ text: 'run tests', turnId: 't3' })
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 1/3 · ● live: 3')
    await ui.press({ key: 'nav-latest' })
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 3/3')
  })

  test('first and next walk the turns; prev at the start does nothing', async ($, on) => {
    const ui = await twoTurns($, on)
    await ui.press({ key: 'nav-first' })
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 1/2 · ● live: 2')
    await ui.press({ key: 'nav-prev' })
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 1/2 · ● live: 2')
    await ui.press({ key: 'nav-next' })
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 2/2')
  })

  test('the filter stays while navigating', async ($, on) => {
    const ui = await twoTurns($, on)
    await ui.input({ key: 'filter', text: 'name:bash' })
    await ui.press({ key: 'nav-prev' })
    expect((await ui.find({ key: 'filter' }))?.props.value).toBe('name:bash')
    expect(await ui.find({ type: 'Text', text: /Bash\s+ls/ })).toBeDefined()
  })

  test('next and latest on the latest turn do nothing', async ($, on) => {
    const ui = await twoTurns($, on)
    await ui.press({ key: 'nav-next' })
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 2/2')
    await ui.press({ key: 'nav-latest' })
    expect((await ui.find({ key: 'nav-label' }))?.text).toBe('turn 2/2')
  })

  // Each call is two rows (tools and hooks): 1001 calls overflow the 2000-row buffer and drop t1's rows.
  const fullBuffer = async ($: Engine, on: On) => {
    answerTurns(on)
    answerUi(on)
    on('tool.call', () => ({ result: {}, text: '' }))
    await xtrace($, 'tools')
    await $.turn.start({ text: 'old turn', turnId: 't1' })
    await $.tool.call({ tool: 'Bash', command: 'ls', tool_use_id: 'u0' })
    await $.turn.start({ text: 'busy turn', turnId: 't2' })
    for (let i = 1; i <= 1001; i++) await $.tool.call({ tool: 'Read', file_path: `f${i}.go`, tool_use_id: `u${i}` })
    await $.turn.start({ text: 'fresh turn', turnId: 't3' })
    return $.ui.mount({ plugin: 'xtrace', surface: 'terminal', component: 'Pane', requestId: 'xtrace', props: paneProps(100) })
  }

  // One test for both cases: filling the buffer takes about 30 s.
  test('a full buffer: the empty latest turn is plain, an old emptied turn says it fell out', { timeoutMs: 120_000 }, async ($, on) => {
    const ui = await fullBuffer($, on)
    expect(await ui.find({ key: 'evicted' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /No rows in this turn yet/ })).toBeDefined()
    await ui.press({ key: 'nav-first' })
    expect(await ui.find({ key: 'evicted' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /No rows in this turn yet/ })).toBeUndefined()
  })
})
