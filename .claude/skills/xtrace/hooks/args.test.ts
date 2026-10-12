import { describe, expect, test } from 'claude-code/testing'
import { parseArgs, withNewCategories, wordsOf, CATEGORIES } from './args'

const selectionOf = (text: string) => {
  const parsed = parseArgs(text)
  return parsed.mode === 'report' ? parsed.selection : undefined
}
const messageOf = (text: string) => {
  const parsed = parseArgs(text)
  return parsed.mode === 'error' ? parsed.message : undefined
}

describe('parseArgs', () => {
  test('empty opens the menu', () => {
    expect(parseArgs('')).toEqual({ mode: 'menu' })
    expect(parseArgs('   ')).toEqual({ mode: 'menu' })
  })
  test('all expands to every category, last turn', () => {
    expect(parseArgs('all')).toEqual({
      mode: 'report',
      selection: { categories: [...CATEGORIES], scope: 'turn' },
    })
  })
  test('named categories keep canonical order', () => {
    expect(parseArgs('hooks tools')).toEqual({
      mode: 'report',
      selection: { categories: ['tools', 'hooks'], scope: 'turn' },
    })
  })
  test('session switches scope', () => {
    expect(parseArgs('mcp session')).toEqual({
      mode: 'report',
      selection: { categories: ['mcp'], scope: 'session' },
    })
    expect(selectionOf('all session')?.scope).toBe('session')
  })
  test('is case-insensitive and tolerant of extra spaces', () => {
    expect(selectionOf('  Tools   MCP ')?.categories).toEqual(['tools', 'mcp'])
  })
  test('only session and no category is an error', () => {
    expect(parseArgs('session').mode).toBe('error')
  })
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
  test('unknown word is an error with usage', () => {
    expect(parseArgs('tools bananas').mode).toBe('error')
    expect(messageOf('tools bananas')).toContain('bananas')
    expect(messageOf('tools bananas')).toContain('/xtrace')
  })
})

describe('wordsOf', () => {
  test('spells a selection back as command words', () => {
    expect(wordsOf({ categories: ['tools', 'mcp'], scope: 'turn' })).toBe('tools mcp')
    expect(wordsOf({ categories: ['tools'], scope: 'session' })).toBe('tools session')
    expect(wordsOf({ categories: [...CATEGORIES], scope: 'turn' })).toBe('all')
  })
})

describe('withNewCategories', () => {
  test('a selection saved before model existed gets model switched on', () => {
    const old = { categories: ['tools', 'hooks', 'context'] as const, scope: 'turn' as const }
    expect(withNewCategories({ ...old, categories: [...old.categories] })).toEqual({
      categories: ['tools', 'hooks', 'context', 'model'], scope: 'turn', known: [...CATEGORIES],
    })
  })
  test('a category the person switched off stays off', () => {
    const s = { categories: ['tools'] as ('tools')[], scope: 'session' as const, known: [...CATEGORIES] }
    expect(withNewCategories(s).categories).toEqual(['tools'])
  })
  test('it is idempotent', () => {
    const once = withNewCategories({ categories: ['tools'], scope: 'turn' })
    expect(withNewCategories(once)).toEqual(once)
  })
})
