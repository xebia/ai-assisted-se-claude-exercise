import type { Category, Selection } from '../types'

export const CATEGORIES: readonly Category[] = [
  'tools', 'mcp', 'skills', 'hooks', 'agents', 'commands', 'context', 'model',
]

export const USAGE =
  'Usage: /xtrace [all | tools mcp skills hooks agents commands context model] [session] | /xtrace pane [on|off]'

export type ParsedArgs =
  | { mode: 'menu' }
  | { mode: 'report'; selection: Selection }
  | { mode: 'pane'; pane: 'on' | 'off' | 'toggle' }
  | { mode: 'error'; message: string; selection?: undefined }

const isCategory = (word: string): word is Category =>
  (CATEGORIES as readonly string[]).includes(word)

export function parseArgs(text: string): ParsedArgs {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return { mode: 'menu' }

  if (words[0] === 'pane') {
    if (words.length === 1) return { mode: 'pane', pane: 'toggle' }
    if (words.length === 2 && (words[1] === 'on' || words[1] === 'off')) {
      return { mode: 'pane', pane: words[1] }
    }
    return { mode: 'error', message: `Unknown pane option "${words.slice(1).join(' ')}". ${USAGE}` }
  }

  const picked = new Set<Category>()
  let scope: Selection['scope'] = 'turn'
  for (const word of words) {
    if (word === 'all') CATEGORIES.forEach(c => picked.add(c))
    else if (word === 'session') scope = 'session'
    else if (isCategory(word)) picked.add(word)
    else return { mode: 'error', message: `Unknown word "${word}". ${USAGE}` }
  }
  if (picked.size === 0) {
    return { mode: 'error', message: `Name at least one category. ${USAGE}` }
  }
  return {
    mode: 'report',
    selection: { categories: CATEGORIES.filter(c => picked.has(c)), scope },
  }
}

export function wordsOf(selection: Selection): string {
  const isAll = CATEGORIES.every(c => selection.categories.includes(c))
  const words = isAll ? ['all'] : CATEGORIES.filter(c => selection.categories.includes(c))
  if (selection.scope === 'session') words.push('session')
  return words.join(' ')
}

// The categories before `known` was stored: a selection without it knew these.
const FIRST_CATEGORIES: readonly Category[] = ['tools', 'mcp', 'skills', 'hooks', 'agents', 'commands', 'context']

// A category added after the selection was saved starts switched on; one the
// person switched off stays off.
export function withNewCategories(s: Selection): Selection {
  const known = s.known ?? FIRST_CATEGORIES
  const added = CATEGORIES.filter(c => !known.includes(c))
  return { ...s, categories: CATEGORIES.filter(c => s.categories.includes(c) || added.includes(c)), known: [...CATEGORIES] }
}
