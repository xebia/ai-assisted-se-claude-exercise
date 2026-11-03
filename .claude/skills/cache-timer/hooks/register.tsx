import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import {
  formatSides, mergeInfo, missCostUsd, parseLastStep, parseOffset, parseSharedTokens, parseTranscript,
  shouldWarn, stepFromUsage, tone, usd,
} from './cache'
import type { Tone } from './cache'

const TICK_MS = 10_000

const COLORS: Record<Tone, string> = {
  idle: 'gray',
  normal: 'warning', // theme yellow
  urgent: 'red',
}

// Held by the engine for the session: survives hot reloads, and every write redraws the band.
const info = atom({ plugin: 'cache-timer', key: 'info' } as const, null)
const offsetMin = atom({ plugin: 'cache-timer', key: 'offsetMin' } as const, 0)
const step = atom({ plugin: 'cache-timer', key: 'step' } as const, null)
const sharedTokens = atom({ plugin: 'cache-timer', key: 'sharedTokens' } as const, null)
const totals = atom({ plugin: 'cache-timer', key: 'totals' } as const, { usd: null, ctxPct: null })
const warnedFor = atom({ plugin: 'cache-timer', key: 'warnedFor' } as const, null)

async function syncFromTranscript($: EngineInterface) {
  const [id, root] = await Promise.all([$.session.id(), $.session.root()])
  const slug = root.replace(/[^a-zA-Z0-9]/g, '-')
  const { exitCode, stdout } = await $.process.run([
    'sh', '-c',
    'tail -n 400 "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/projects/$1/$2.jsonl"',
    'sh', slug, id,
  ])
  if (exitCode !== 0) return
  const found = parseTranscript(stdout)
  if (found) await update($, info, prev => mergeInfo(prev, found))
  // a resumed session has no live turn.step yet: take model and size from the transcript
  const last = parseLastStep(stdout)
  if (last) await update($, step, prev => prev ?? last)
  // the shared prefix is what the session's very first response read from cache
  if ((await read($, sharedTokens)) === null) {
    const head = await $.process.run([
      'sh', '-c',
      'head -n 200 "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/projects/$1/$2.jsonl"',
      'sh', slug, id,
    ])
    const shared = head.exitCode === 0 ? parseSharedTokens(head.stdout) : null
    if (shared !== null) await update($, sharedTokens, prev => prev ?? shared)
  }
}

// Session cost and context fill, as /cost and the status line have them.
async function syncTotals($: EngineInterface) {
  const u = await $.session.usage()
  const next = {
    usd: u.cost?.usd ?? null,
    ctxPct: u.context.percent ?? null,
    ctxTokens: u.context.tokens ?? null,
    ctxWindow: u.context.window ?? null,
  }
  await update($, totals, prev =>
    prev.usd === next.usd && prev.ctxPct === next.ctxPct &&
    prev.ctxTokens === next.ctxTokens && prev.ctxWindow === next.ctxWindow ? prev : next)
}

// One toast per cache entry, 5 minutes before a 1h cache expires.
async function maybeWarn($: EngineInterface) {
  const [cache, now, warned, last, shared] = await Promise.all([
    read($, info), $.clock.now(), read($, warnedFor), read($, step), read($, sharedTokens),
  ])
  if (!cache || !shouldWarn(cache, now, warned)) return
  await update($, warnedFor, () => cache.lastAt)
  const miss = last ? missCostUsd(last, cache.ttlMs, shared ?? 0) : null
  $.ui.toast(`Prompt cache expires in 5 min${miss !== null ? ` (a miss costs ≈ ${usd(miss)})` : ''}`)
}

async function tick($: EngineInterface) {
  await syncTotals($).catch(() => {})
  await maybeWarn($).catch(() => {})
  // time passes without a write, so the countdown still needs an explicit redraw
  $.ui.invalidate('ui.render')
}

async function start($: EngineInterface) {
  const tz = await $.process.run(['date', '+%z']).catch(() => null)
  if (tz?.exitCode === 0) await update($, offsetMin, () => parseOffset(tz.stdout))
  await syncFromTranscript($).catch(() => {})
  await syncTotals($).catch(() => {})
  $.clock.every(TICK_MS, () => tick($))
}

export const register: Register = on => {
  let started = false

  on('session.start', async ($, e, next) => {
    const result = await next(e)
    if (!started) {
      started = true
      await start($)
    }
    return result
  })

  // Every main-thread model response refreshes the cache TTL and tells us the prompt size.
  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    if (e.agentId === undefined && result.usage) {
      const now = await $.clock.now()
      await update($, info, prev => ({ lastAt: now, ttlMs: prev?.ttlMs ?? null }))
      await update($, step, () => stepFromUsage(result.usage!.model, result.usage!))
      const read0 = result.usage.cache_read_input_tokens
      await update($, sharedTokens, prev => prev ?? read0)
    }
    return result
  })

  // After a turn the transcript is written: pick up the exact TTL (1h vs 5m) and the new cost.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      await syncFromTranscript($).catch(() => {})
      await syncTotals($).catch(() => {})
    }
    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const cache = await read($, info)
    if (e.props.hasSurvey) return next(e)

    const [now, offset, last, shared, sums] = await Promise.all([
      $.clock.now(), read($, offsetMin), read($, step), read($, sharedTokens), read($, totals),
    ])
    const { Box, Text } = $.ui.resolve(e)

    const { left, right } = formatSides(cache, now, offset, { step: last, sharedTokens: shared, totals: sums })
    const color = COLORS[tone(cache, now)]

    return (
      <Box justifyContent="space-between">
        <Text color={color}>{left}</Text>
        <Text color={color}>{right}</Text>
      </Box>
    )
  })
}
