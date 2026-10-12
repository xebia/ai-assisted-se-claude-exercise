import type { Category, Selection } from '../types'

export const CATEGORIES: readonly Category[] = [
  'tools', 'mcp', 'skills', 'hooks', 'agents', 'commands', 'context', 'model',
]

export const USAGE =
  'Usage: /xtrace [all | tools mcp skills hooks agents commands context model] [session] | /xtrace [categories] pane [on|off]'

export type ParsedArgs =
  | { mode: 'menu' }
  | { mode: 'report'; selection: Selection }
  | { mode: 'pane'; pane: 'on' | 'off' | 'toggle'; kinds?: Category[] | 'all' }
  | { mode: 'error'; message: string; selection?: undefined }

const isCategory = (word: string): word is Category =>
  (CATEGORIES as readonly string[]).includes(word)

const error = (message: string): ParsedArgs => ({ mode: 'error', message: `${message} ${USAGE}` })

// `pane` anywhere: on, off or a toggle; categories with it open the pane filtered to them.
function parsePane(words: string[]): ParsedArgs {
  if (words.filter(w => w === 'pane').length > 1) return error('Name "pane" once.')
  let pane: 'on' | 'off' | undefined
  let all = false
  const picked = new Set<Category>()
  for (const word of words) {
    if (word === 'pane') continue
    if (word === 'on' || word === 'off') {
      if (pane !== undefined) return error(`Unknown pane option "${word}".`)
      pane = word
    } else if (word === 'all') all = true
    else if (word === 'session') return error('The pane shows one turn; "session" is for the report.')
    else if (isCategory(word)) picked.add(word)
    else return error(`Unknown word "${word}".`)
  }
  if (!all && picked.size === 0) return { mode: 'pane', pane: pane ?? 'toggle' }
  if (pane === 'off') return error('"pane off" takes no categories.')
  return { mode: 'pane', pane: 'on', kinds: all ? 'all' : CATEGORIES.filter(c => picked.has(c)) }
}

export function parseArgs(text: string): ParsedArgs {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return { mode: 'menu' }
  if (words.includes('pane')) return parsePane(words)

  const picked = new Set<Category>()
  let scope: Selection['scope'] = 'turn'
  for (const word of words) {
    if (word === 'all') CATEGORIES.forEach(c => picked.add(c))
    else if (word === 'session') scope = 'session'
    else if (isCategory(word)) picked.add(word)
    else return error(`Unknown word "${word}".`)
  }
  if (picked.size === 0) return error('Name at least one category.')
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
