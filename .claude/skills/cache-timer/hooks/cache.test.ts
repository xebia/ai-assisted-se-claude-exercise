import { expect, test } from 'claude-code/testing'

import {
  formatSides, formatStatus, inputPrice, mergeInfo, missCostUsd, parseLastStep, parseOffset, parseSharedTokens, parseTranscript,
  blocks, shouldWarn, stepFromUsage, tokenCount, tone, TTL_1H, TTL_5M, usd,
} from './cache'

const row = (ts: string, h1: number, m5: number, extra: object = {}) =>
  JSON.stringify({
    type: 'assistant',
    timestamp: ts,
    message: { usage: { cache_creation: { ephemeral_1h_input_tokens: h1, ephemeral_5m_input_tokens: m5 } } },
    ...extra,
  })

test('takes the last main-thread response and the latest cache write TTL', () => {
  const text = [
    'partial line from tail',
    row('2026-10-07T12:00:00.000Z', 0, 50),
    row('2026-10-07T12:30:00.000Z', 2000, 0),
    row('2026-10-07T12:41:38.583Z', 0, 0),
    row('2026-10-07T12:50:00.000Z', 0, 10, { isSidechain: true }),
  ].join('\n')

  expect(parseTranscript(text)).toEqual({ lastAt: Date.parse('2026-10-07T12:41:38.583Z'), ttlMs: TTL_1H })
})

test('TTL unknown when no cache write is seen, null when no response', () => {
  expect(parseTranscript(row('2026-10-07T12:00:00Z', 0, 0))?.ttlMs).toBe(null)
  expect(parseTranscript(row('2026-10-07T12:00:00Z', 0, 5))?.ttlMs).toBe(TTL_5M)
  expect(parseTranscript('{"type":"user"}')).toBe(null)
})

test('formats local expiry time and time left', () => {
  const lastAt = Date.parse('2026-10-07T12:41:00Z')
  const info = { lastAt, ttlMs: TTL_1H }
  const offset = parseOffset('+0200')

  expect(formatStatus(info, lastAt + 2 * 60_000, offset)).toBe('cache 15:41 · 58m left (1h)')
  expect(formatStatus(info, lastAt + TTL_1H - 30_000, offset)).toBe('cache 15:41 · 30s left (1h)')
  expect(formatStatus(info, lastAt + TTL_1H + 1, offset)).toBe('cache expired 15:41')
  expect(parseOffset('-0530')).toBe(-330)
})

test('colour tone: grey for 45 min, normal after, red in the last 5 min', () => {
  const lastAt = Date.parse('2026-10-07T12:00:00Z')
  const info = { lastAt, ttlMs: TTL_1H }
  const min = 60_000

  expect(tone(info, lastAt + 10 * min)).toBe('idle')
  expect(tone(info, lastAt + 44 * min)).toBe('idle')
  expect(tone(info, lastAt + 45 * min)).toBe('normal')
  expect(tone(info, lastAt + 54 * min)).toBe('normal')
  expect(tone(info, lastAt + 55 * min)).toBe('urgent')
  expect(tone(info, lastAt + 61 * min)).toBe('urgent')
})

test('transcript TTL wins over a live 5m default with a later clock', () => {
  const live = { lastAt: 2_000, ttlMs: TTL_5M }
  const found = { lastAt: 1_000, ttlMs: TTL_1H }
  expect(mergeInfo(live, found)).toEqual({ lastAt: 2_000, ttlMs: TTL_1H })
  expect(mergeInfo(null, found)).toEqual(found)
  expect(mergeInfo(found, { lastAt: 3_000, ttlMs: null })).toEqual({ lastAt: 3_000, ttlMs: TTL_1H })
})

test('says so when there is no data or no TTL yet', () => {
  const lastAt = Date.parse('2026-10-07T12:41:00Z')
  const offset = parseOffset('+0200')
  expect(formatStatus(null, lastAt, offset)).toBe('cache: no data yet (waiting for first response)')
  expect(formatStatus({ lastAt, ttlMs: null }, lastAt, offset)).toBe('cache: last response 14:41 · TTL known after this turn')
  expect(tone(null, lastAt)).toBe('idle')
  expect(tone({ lastAt, ttlMs: null }, lastAt + 59 * 60_000)).toBe('idle')
})

test('input price by model id, most specific first', () => {
  expect(inputPrice('claude-opus-5-5')).toBe(4)
  expect(inputPrice('claude-opus-5')).toBe(5)
  expect(inputPrice('claude-fable-5-1[1m]')).toBe(10)
  expect(inputPrice('us.anthropic.claude-sonnet-5-5')).toBe(2)
  expect(inputPrice('claude-sonnet-4-6')).toBe(3)
  expect(inputPrice('claude-haiku-5-5', 50_000)).toBe(0.1)
  expect(inputPrice('claude-haiku-5-5', 150_000)).toBe(0.5)
  expect(inputPrice('gpt-9')).toBe(null)
})

test('miss cost: context tokens at the cache-write rate of the TTL', () => {
  const step = { model: 'claude-opus-5-5', contextTokens: 100_000 }
  expect(Math.round(missCostUsd(step, TTL_1H)! * 100) / 100).toBe(0.8) // 100K x $4 x 2
  expect(Math.round(missCostUsd(step, TTL_5M)! * 100) / 100).toBe(0.5) // 100K x $4 x 1.25
  expect(missCostUsd(step, null)).toBe(null)
  expect(missCostUsd({ model: 'unknown', contextTokens: 100_000 }, TTL_1H)).toBe(null)
})

test('step size sums all prompt tokens plus output', () => {
  const u = { input_tokens: 10, cache_read_input_tokens: 90_000, cache_creation_input_tokens: 5_000, output_tokens: 990 }
  expect(stepFromUsage('m', u)).toEqual({ model: 'm', contextTokens: 96_000 })
})

test('last step from the transcript skips sidechains', () => {
  const r = (model: string, n: number, side = false) =>
    JSON.stringify({ type: 'assistant', isSidechain: side, message: { model, usage: { input_tokens: n } } })
  const text = ['cut', r('claude-opus-5-5', 1000), r('claude-haiku-5-5', 50, true)].join('\n')
  expect(parseLastStep(text)).toEqual({ model: 'claude-opus-5-5', contextTokens: 1000 })
  expect(parseLastStep('{"type":"user"}')).toBe(null)
})

test('usd formatting', () => {
  expect(usd(0)).toBe('$0.00')
  expect(usd(0.004)).toBe('<$0.01')
  expect(usd(4.123)).toBe('$4.12')
  expect(usd(123.4)).toBe('$123')
})

test('full line: cache, miss cost, context fill, session cost', () => {
  const lastAt = Date.parse('2026-10-07T12:41:00Z')
  const info = { lastAt, ttlMs: TTL_1H }
  const step = { model: 'claude-opus-5-5', contextTokens: 47_500 }
  const totals = { usd: 4.12, ctxPct: 61.6 }
  expect(formatStatus(info, lastAt + 2 * 60_000, parseOffset('+0200'), { step, totals })).toBe(
    'cache 15:41 · 58m left (1h) · ctx ▰▰▰▰▰▰▱▱▱▱ 62% · $4.12 (miss ≈ $0.38)',
  )
  expect(formatStatus(info, lastAt + TTL_1H + 1, parseOffset('+0200'), { step, totals: { usd: null, ctxPct: null } })).toBe(
    'cache expired 15:41 · (miss ≈ $0.38)',
  )
})

test('5-minute warning fires once per cache entry, only for the 1h TTL', () => {
  const lastAt = 1_000_000
  const info = { lastAt, ttlMs: TTL_1H }
  const min = 60_000
  expect(shouldWarn(info, lastAt + 50 * min, null)).toBe(false)
  expect(shouldWarn(info, lastAt + 56 * min, null)).toBe(true)
  expect(shouldWarn(info, lastAt + 56 * min, lastAt)).toBe(false)
  expect(shouldWarn(info, lastAt + 61 * min, null)).toBe(false)
  expect(shouldWarn({ lastAt, ttlMs: TTL_5M }, lastAt + 1 * min, null)).toBe(false)
})

test('context bar: one block per 10%, clamped', () => {
  expect(blocks(0)).toBe('▱▱▱▱▱▱▱▱▱▱')
  expect(blocks(62)).toBe('▰▰▰▰▰▰▱▱▱▱')
  expect(blocks(100)).toBe('▰▰▰▰▰▰▰▰▰▰')
  expect(blocks(130)).toBe('▰▰▰▰▰▰▰▰▰▰')
})

test('miss cost leaves out the shared prefix (numbers from a real first response)', () => {
  // read 63,538 (shared system prompt + tools), wrote 23,375 at 1h, input 2, output 105; session cost $0.20
  const step = stepFromUsage('claude-opus-5-5', {
    input_tokens: 2, cache_read_input_tokens: 63_538, cache_creation_input_tokens: 23_375, output_tokens: 105,
  })
  expect(usd(missCostUsd(step, TTL_1H)!)).toBe('$0.70') // whole prompt: the old, misleading figure
  expect(usd(missCostUsd(step, TTL_1H, 63_538)!)).toBe('$0.19') // this session's part only
  expect(missCostUsd(step, TTL_1H, 90_000)).toBe(null) // nothing of its own yet
  const lastAt = Date.parse('2026-10-07T12:41:00Z')
  expect(
    formatStatus({ lastAt, ttlMs: TTL_1H }, lastAt, 0, { step, sharedTokens: 63_538, totals: { usd: 0.2, ctxPct: 8.7 } }),
  ).toBe('cache 13:41 · 60m left (1h) · ctx ▰▱▱▱▱▱▱▱▱▱ 9% · $0.20 (miss ≈ $0.19)')
})

test('shared prefix is the first main-thread response cache read', () => {
  const r = (read: number, side = false) =>
    JSON.stringify({ type: 'assistant', isSidechain: side, message: { usage: { cache_read_input_tokens: read } } })
  expect(parseSharedTokens(['{"type":"user"}', r(5, true), r(63_538), r(90_000)].join('\n'))).toBe(63_538)
  expect(parseSharedTokens('{"type":"user"}')).toBe(null)
})

test('two sides: countdown left, session figures right', () => {
  const lastAt = Date.parse('2026-10-07T12:41:00Z')
  const step = { model: 'claude-opus-5-5', contextTokens: 87_020 }
  const sides = formatSides({ lastAt, ttlMs: TTL_1H }, lastAt, 0, {
    step, sharedTokens: 63_538, totals: { usd: 0.2, ctxPct: 8.7 },
  })
  expect(sides).toEqual({ left: 'cache 13:41 · 60m left (1h)', right: 'ctx ▰▱▱▱▱▱▱▱▱▱ 9% · $0.20 (miss ≈ $0.19)' })
  expect(formatSides(null, lastAt, 0).right).toBe('')
})

test('context tokens follow the bar when known', () => {
  expect(tokenCount(850)).toBe('850')
  expect(tokenCount(18_400)).toBe('18k')
  expect(tokenCount(200_000)).toBe('200k')
  expect(tokenCount(999_700)).toBe('1M')
  expect(tokenCount(1_250_000)).toBe('1.3M')
  const sides = formatSides(null, 0, 0, { totals: { usd: 0.2, ctxPct: 9.2, ctxTokens: 18_400, ctxWindow: 200_000 } })
  expect(sides.right).toBe('ctx ▰▱▱▱▱▱▱▱▱▱ 9% 18k/200k · $0.20')
})
