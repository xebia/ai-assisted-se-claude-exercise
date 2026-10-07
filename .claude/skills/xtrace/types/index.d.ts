export type Category =
  | 'tools' | 'mcp' | 'skills' | 'hooks' | 'agents' | 'commands' | 'context' | 'model'

export type Outcome =
  | 'ok' | 'error' | 'denied' | 'running'   // tools, mcp, agents, commands
  | 'context' | 'blocked' | 'none'          // hooks

export type Row = {
  id: string
  turnId: string
  agentId?: string
  parentId?: string          // the agents row this row ran under, when known
  kind: Category
  name: string
  target: string
  plugins?: string           // hooks: enabled plugins with a hook for this event and tool
  chars?: number             // characters this row added to the conversation (tool result, hook or attachment text)
  usage?: Usage              // model: what the request cost, as the API reported it
  detail?: string
  outcome: Outcome
  startedAt: number
  ms?: number
}

export type Usage = {
  model: string
  input: number              // uncached input
  cacheRead: number
  cacheWrite: number
  output: number
}

export type Turn = {
  turnId: string
  text: string               // the prompt, first eight words
  startedAt: number
  isComplete: boolean
  completedAt?: number       // when the main loop's turn.complete arrived
}

export type Compaction = { at: number; turnId: string }

export type Selection = {
  categories: Category[]
  scope: 'turn' | 'session'
  known?: Category[]         // the categories that existed when it was saved; later ones start on
}

// The keys are spelled inline: `claude plugin validate` reads them from this literal.
declare module 'claude-code' {
  interface PluginState {
    xtrace: {
      rows: Row[]
      turns: Turn[]
      compactions: Compaction[]
      selection: Selection
    }
  }
}
