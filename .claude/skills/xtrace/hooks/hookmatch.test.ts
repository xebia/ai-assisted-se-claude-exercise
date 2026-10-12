import { describe, expect, test } from 'claude-code/testing'
import { commandsFor, enabledInstalls, pluginsFor, shortName } from './hookmatch'

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

describe('enabledInstalls', () => {
  const installed = {
    plugins: {
      'context-mode@context-mode': [{ scope: 'user', installPath: '/p/context-mode' }],
      'evals@dokimos': [
        { scope: 'project', projectPath: '/a', installPath: '/p/evals-a' },
        { scope: 'project', projectPath: '/b', installPath: '/p/evals-b' },
      ],
      'off@x': [{ scope: 'user', installPath: '/p/off' }],
    },
  }
  const settings = { enabledPlugins: { 'context-mode@context-mode': true, 'evals@dokimos': true, 'off@x': false, 'gone@x': true } }

  test('keeps enabled, installed plugins, named without the marketplace', () => {
    expect(enabledInstalls(settings, installed, '/b')).toEqual([
      { name: 'context-mode', installPath: '/p/context-mode' },
      { name: 'evals', installPath: '/p/evals-b' },
    ])
  })
  test('without a matching project it takes the first install', () => {
    expect(enabledInstalls(settings, installed, '/elsewhere')[1]).toEqual({ name: 'evals', installPath: '/p/evals-a' })
  })
  test('malformed input gives an empty list', () => {
    expect(enabledInstalls(undefined, installed)).toEqual([])
    expect(enabledInstalls(settings, { plugins: 'nope' })).toEqual([])
  })
})

describe('pluginsFor', () => {
  const plugins = [
    { name: 'context-mode', config: { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node pre.mjs' }] }] } } },
    { name: 'superpowers', config: { hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'start.sh' }] }] } } },
  ]
  test('names the plugins with a hook for the event and tool', () => {
    expect(pluginsFor(plugins, 'PreToolUse', 'Bash')).toEqual(['context-mode'])
    expect(pluginsFor(plugins, 'PreToolUse', 'Read')).toEqual([])
    expect(pluginsFor(plugins, 'SessionStart')).toEqual(['superpowers'])
  })
})
