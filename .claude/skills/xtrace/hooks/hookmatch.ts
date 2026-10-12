type HookEntry = { matcher?: unknown; hooks?: unknown }
type HookCommand = { type?: unknown; command?: unknown }

const INTERPRETERS = new Set(['uv', 'run', 'node', 'bun', 'python', 'python3', 'sh', 'bash', 'zsh', 'npx'])

export function shortName(command: string): string {
  const words = command.split(/\s+/).map(w => w.replace(/^["']|["']$/g, '')).filter(Boolean)
  const word = words.find(w => !w.startsWith('-') && !INTERPRETERS.has(w)) ?? ''
  return word.split('/').pop() ?? ''
}

function matches(matcher: unknown, toolName: string | undefined): boolean {
  if (toolName === undefined) return true
  if (typeof matcher !== 'string' || matcher === '' || matcher === '*') return true
  try {
    return new RegExp(`^(?:${matcher})$`).test(toolName)
  } catch {
    return false
  }
}

export function commandsFor(settings: unknown, event: string, toolName?: string): string[] {
  const hooks = (settings as { hooks?: unknown } | undefined)?.hooks
  if (hooks === null || typeof hooks !== 'object') return []
  const entries = (hooks as Record<string, unknown>)[event]
  if (!Array.isArray(entries)) return []

  const names: string[] = []
  for (const entry of entries as HookEntry[]) {
    if (!matches(entry.matcher, toolName)) continue
    if (!Array.isArray(entry.hooks)) continue
    for (const hook of entry.hooks as HookCommand[]) {
      if (typeof hook.command === 'string') names.push(shortName(hook.command))
    }
  }
  return names
}

// A plugin's hooks/hooks.json, which has the same `hooks` shape as settings.
export type PluginHooks = { name: string; config: unknown }

type Install = { scope?: unknown; projectPath?: unknown; installPath?: unknown }

// The enabled plugins (settings.enabledPlugins) and where each is installed
// (installed_plugins.json). A plugin installed for several projects takes the
// install for `cwd`, else the user-scope one, else the first.
export function enabledInstalls(settings: unknown, installed: unknown, cwd?: string): { name: string; installPath: string }[] {
  const enabled = (settings as { enabledPlugins?: unknown } | undefined)?.enabledPlugins
  const plugins = (installed as { plugins?: unknown } | undefined)?.plugins
  if (enabled === null || typeof enabled !== 'object' || plugins === null || typeof plugins !== 'object') return []

  const out: { name: string; installPath: string }[] = []
  for (const [id, on] of Object.entries(enabled as Record<string, unknown>)) {
    if (on !== true) continue
    const installs = (plugins as Record<string, unknown>)[id]
    if (!Array.isArray(installs)) continue
    const list = installs as Install[]
    const pick = list.find(i => cwd !== undefined && i.projectPath === cwd) ?? list.find(i => i.scope === 'user') ?? list[0]
    if (typeof pick?.installPath === 'string') out.push({ name: id.split('@')[0] ?? id, installPath: pick.installPath })
  }
  return out
}

// The plugins with a command hook for this event and tool.
export function pluginsFor(plugins: PluginHooks[], event: string, toolName?: string): string[] {
  return plugins.filter(p => commandsFor(p.config, event, toolName).length > 0).map(p => p.name)
}
