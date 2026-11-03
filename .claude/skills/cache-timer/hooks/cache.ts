import type { CacheInfo, StepInfo, Totals } from '../types'

export type { CacheInfo, StepInfo, Totals }

export const TTL_1H = 60 * 60 * 1000
export const TTL_5M = 5 * 60 * 1000

type Usage = {
  cache_creation?: {
    ephemeral_1h_input_tokens?: number
    ephemeral_5m_input_tokens?: number
  } | null
}

// Last main-thread response time, and the TTL of the most recent cache write.
export function parseTranscript(text: string): CacheInfo | null {
  let lastAt: number | null = null
  let ttlMs: number | null = null

  for (const line of text.split('\n')) {
    if (!line.includes('"assistant"')) continue
    let row: { type?: string; timestamp?: string; isSidechain?: boolean; message?: { usage?: Usage } }
    try {
      row = JSON.parse(line)
    } catch {
      continue // tail may start mid-line
    }
    if (row.type !== 'assistant' || row.isSidechain || !row.message?.usage || !row.timestamp) continue

    const at = Date.parse(row.timestamp)
    if (!Number.isNaN(at)) lastAt = at

    const cc = row.message.usage.cache_creation
    const h1 = cc?.ephemeral_1h_input_tokens ?? 0
    const m5 = cc?.ephemeral_5m_input_tokens ?? 0
    if (h1 > 0) ttlMs = TTL_1H
    else if (m5 > 0) ttlMs = TTL_5M
  }

  return lastAt === null ? null : { lastAt, ttlMs }
}

// Keep the later response time and prefer the transcript's TTL: the live clock in
// turn.step runs ahead of transcript timestamps and has no TTL of its own.
export function mergeInfo(prev: CacheInfo | null, found: CacheInfo): CacheInfo {
  if (!prev) return found
  return { lastAt: Math.max(prev.lastAt, found.lastAt), ttlMs: found.ttlMs ?? prev.ttlMs }
}

// "+0200" -> 120
export function parseOffset(z: string): number {
  const m = /^([+-])(\d{2})(\d{2})$/.exec(z.trim())
  if (!m) return 0
  const minutes = Number(m[2]) * 60 + Number(m[3])
  return m[1] === '-' ? -minutes : minutes
}

function clock(ms: number, offsetMin: number): string {
  const d = new Date(ms + offsetMin * 60_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export type Tone = 'idle' | 'normal' | 'urgent'

// Dark grey for the first 45 minutes, normal after, red in the last 5 minutes and once expired.
export function tone(info: CacheInfo | null, now: number): Tone {
  if (!info || info.ttlMs === null) return 'idle'
  const left = info.lastAt + info.ttlMs - now
  if (left <= 5 * 60_000) return 'urgent'
  if (now - info.lastAt >= 45 * 60_000) return 'normal'
  return 'idle'
}

function cacheText(info: CacheInfo | null, now: number, offsetMin: number): string {
  if (!info) return 'cache: no data yet (waiting for first response)'
  if (info.ttlMs === null) return `cache: last response ${clock(info.lastAt, offsetMin)} · TTL known after this turn`
  const expiresAt = info.lastAt + info.ttlMs
  const at = clock(expiresAt, offsetMin)
  const left = expiresAt - now
  if (left <= 0) return `cache expired ${at}`

  const ttl = info.ttlMs === TTL_1H ? '1h' : '5m'
  const remaining = left < 60_000 ? `${Math.ceil(left / 1000)}s` : `${Math.ceil(left / 60_000)}m`
  return `cache ${at} · ${remaining} left (${ttl})`
}

// A 10-cell bar, one cell per 10%: 62 -> "▰▰▰▰▰▰▱▱▱▱"
export function blocks(pct: number, cells = 10): string {
  const filled = Math.max(0, Math.min(cells, Math.round((pct / 100) * cells)))
  return '▰'.repeat(filled) + '▱'.repeat(cells - filled)
}

// 850 -> "850", 18_400 -> "18k", 200_000 -> "200k", 1_000_000 -> "1M", 1_250_000 -> "1.3M"
export function tokenCount(n: number): string {
  if (n < 1000) return String(Math.round(n))
  if (n < 999_500) return `${Math.round(n / 1000)}k`
  return `${Number((n / 1_000_000).toFixed(1))}M`
}

export type Extras = { step?: StepInfo | null; sharedTokens?: number | null; totals?: Totals | null }

// The band's two halves: the cache countdown (left) and the session figures (right).
export function formatSides(
  info: CacheInfo | null, now: number, offsetMin: number, extras: Extras = {},
): { left: string; right: string } {
  return { left: cacheText(info, now, offsetMin), right: statsText(info, extras) }
}

export function formatStatus(info: CacheInfo | null, now: number, offsetMin: number, extras: Extras = {}): string {
  const { left, right } = formatSides(info, now, offsetMin, extras)
  return right ? `${left} · ${right}` : left
}

function statsText(info: CacheInfo | null, extras: Extras): string {
  const parts: string[] = []
  const pct = extras.totals?.ctxPct
  if (pct != null) {
    const used = extras.totals?.ctxTokens
    const size = extras.totals?.ctxWindow
    const tokens = used != null && size ? ` ${tokenCount(used)}/${tokenCount(size)}` : ''
    parts.push(`ctx ${blocks(pct)} ${Math.round(pct)}%${tokens}`)
  }
  // session cost, then the miss cost in brackets: "$4.12 (miss ≈ $0.38)"
  const total = extras.totals?.usd
  const miss = extras.step && info ? missCostUsd(extras.step, info.ttlMs, extras.sharedTokens ?? 0) : null
  const missText = miss !== null ? `(miss ≈ ${usd(miss)})` : null
  const cost = [total != null ? usd(total) : null, missText].filter(Boolean).join(' ')
  if (cost) parts.push(cost)
  return parts.join(' · ')
}

// --- cost ---------------------------------------------------------------

// Base input price in $ per million tokens, first match wins (more specific ids first).
// Source: claude-api skill model table, cached 2026-10-06. Fast mode (2x) is not detected.
const INPUT_PRICE: [string, number][] = [
  ['fable-5', 10],
  ['mythos-5', 10],
  ['opus-5-5', 4],
  ['opus-5', 5],
  ['opus-4-8', 5],
  ['opus-4-7', 5],
  ['opus-4-6', 5],
  ['opus-4-5', 5],
  ['sonnet-5', 2], // 5 and 5.5
  ['sonnet-4', 3],
  ['haiku-5-5', 0.1],
  ['haiku-4-5', 1],
]

export function inputPrice(model: string, contextTokens = 0): number | null {
  const id = model.toLowerCase()
  const hit = INPUT_PRICE.find(([key]) => id.includes(key))
  if (!hit) return null
  // Haiku 5.5 charges more for prompts over 100K tokens.
  if (hit[0] === 'haiku-5-5' && contextTokens > 100_000) return 0.5
  return hit[1]
}

// What re-writing this session's part of the prompt costs after it expired.
// The shared prefix (system prompt, tools, CLAUDE.md) is left out: other sessions
// keep it cached. Cache writes are 1.25x the input price for the 5m TTL and 2x for 1h.
export function missCostUsd(step: StepInfo, ttlMs: number | null, sharedTokens = 0): number | null {
  const own = step.contextTokens - sharedTokens
  if (ttlMs === null || own <= 0) return null
  const price = inputPrice(step.model, step.contextTokens)
  if (price === null) return null
  const factor = ttlMs === TTL_1H ? 2 : 1.25
  return (own * price * factor) / 1_000_000
}

// Cache read of the session's first main-thread response: the shared prefix.
export function parseSharedTokens(text: string): number | null {
  for (const line of text.split('\n')) {
    if (!line.includes('"assistant"')) continue
    let row: { type?: string; isSidechain?: boolean; message?: { usage?: UsageLike } }
    try {
      row = JSON.parse(line)
    } catch {
      continue
    }
    if (row.type !== 'assistant' || row.isSidechain || !row.message?.usage) continue
    return row.message.usage.cache_read_input_tokens ?? 0
  }
  return null
}

export function usd(n: number): string {
  if (n > 0 && n < 0.01) return '<$0.01'
  return n >= 100 ? `$${Math.round(n)}` : `$${n.toFixed(2)}`
}

type UsageLike = {
  input_tokens?: number
  output_tokens?: number
  cache_read_input_tokens?: number
  cache_creation_input_tokens?: number
}

// Prompt tokens the next request re-sends: input + cache read + cache write + output.
export function stepFromUsage(model: string, u: UsageLike): StepInfo {
  const contextTokens =
    (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.output_tokens ?? 0)
  return { model, contextTokens }
}

// The last main-thread response's model and size, for a resumed session.
export function parseLastStep(text: string): StepInfo | null {
  let found: StepInfo | null = null
  for (const line of text.split('\n')) {
    if (!line.includes('"assistant"')) continue
    let row: { type?: string; isSidechain?: boolean; message?: { model?: string; usage?: UsageLike } }
    try {
      row = JSON.parse(line)
    } catch {
      continue
    }
    if (row.type !== 'assistant' || row.isSidechain || !row.message?.usage || !row.message.model) continue
    found = stepFromUsage(row.message.model, row.message.usage)
  }
  return found
}

// --- warning ------------------------------------------------------------

export const WARN_MS = 5 * 60_000

// Warn once per cache entry, in its last 5 minutes. Only for the 1h TTL:
// a 5m entry is always inside its last 5 minutes.
export function shouldWarn(info: CacheInfo | null, now: number, warnedFor: number | null): boolean {
  if (!info || info.ttlMs !== TTL_1H || warnedFor === info.lastAt) return false
  const left = info.lastAt + info.ttlMs - now
  return left > 0 && left <= WARN_MS
}
