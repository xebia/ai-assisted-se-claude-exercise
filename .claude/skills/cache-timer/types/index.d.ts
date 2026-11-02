// ttlMs is null until a cache write in the transcript tells us 1h vs 5m.
export type CacheInfo = { lastAt: number; ttlMs: number | null }

// The last main-thread response: which model answered, and how many prompt
// tokens the next request re-sends (what a cache miss has to write again).
export type StepInfo = { model: string; contextTokens: number }

// Session figures as /cost and the status line have them.
export type Totals = { usd: number | null; ctxPct: number | null }

declare module 'claude-code' {
  interface PluginState {
    'cache-timer': {
      info: CacheInfo | null
      offsetMin: number
      step: StepInfo | null
      // prompt tokens the session's first response read from cache: the part shared
      // with other sessions (system prompt, tools), which a miss here does not rewrite
      sharedTokens: number | null
      totals: Totals
      // lastAt of the cache entry the 5-minute warning already fired for
      warnedFor: number | null
    }
  }
}
