# xtrace: open the pane filtered to chosen kinds

## Goal

`/xtrace tools mcp model pane` opens the live pane with its filter bar set to
`kind:tools,mcp,model`. Today categories either print a report or (via a
hidden selection) silently narrow the pane; the pane cannot be opened
pre-filtered in one command, and the hidden selection is invisible in the pane.

Multiple kinds in the filter (`kind:model,tools`) already work: `kind` comma
lists OR (`hooks/view.ts`, `termOf`). No change needed there.

## Decisions

- The categories go into the pane's **filter bar** as a `kind:` term — visible
  and editable — not into the stored `SELECTION`.
- The pane **stops applying `SELECTION`**. The filter bar is the pane's only
  row filter. `SELECTION` remains for the report and the menu.

## Syntax (`hooks/args.ts`)

`pane` may appear anywhere among the words.

| Input                          | Result                                                      |
|--------------------------------|-------------------------------------------------------------|
| `tools mcp model pane`         | `{ mode: 'pane', pane: 'on', kinds: ['tools','mcp','model'] }` |
| `pane tools mcp`               | same as above (order free)                                  |
| `all pane`                     | `{ mode: 'pane', pane: 'on', kinds: 'all' }`                |
| `pane`, `pane on`, `pane off`  | unchanged: toggle / on / off, `kinds` absent, filter untouched |
| `tools` (no `pane`)            | unchanged: report                                           |
| `pane off tools`               | error: categories make no sense when closing the pane       |
| `tools session pane`           | error: the pane shows one turn; `session` is report-only    |
| `pane tools pane`              | error: `pane` named twice                                   |
| `pane on tools`                | same as `tools pane`                                        |

`kinds` is ordered by `CATEGORIES`, like a report selection. Errors end with
`USAGE`. `USAGE` and the command's `argumentHint` gain the
`[categories] pane` form.

## Filter rewrite (`hooks/view.ts`, pure)

`withKinds(filter: string, kinds: Category[] | 'all'): string`

- Removes every existing `kind:` term (any case of the key, negated or not).
- For a list, prepends `kind:a,b,c`; for `'all'`, adds nothing.
- Keeps all other terms (`sort:`, bare words, other columns) in order.
- Example: `sort:-ms bash` + `[tools, mcp]` → `kind:tools,mcp sort:-ms bash`.
- Example: `kind:model sort:-ms` + `'all'` → `sort:-ms`.

## Command and pane (`hooks/register.tsx`)

On `mode: 'pane'` with `kinds` present:
1. `update(VIEW, v => ({ ...v, filter: withKinds(v.filter, kinds), rowStart: undefined }))`
2. `setPane($, 'on')` (opens the pane, stores the preference).
3. Reply `xtrace: live pane on, filter "<filter>".`

Pane rendering: drop `picked` / `selected`; `applyView` runs on the turn's
rows directly. The category counters still count every kind.

Behaviour change: a person who ran `/xtrace tools` earlier now sees all kinds
in the pane until they filter.

## Docs

README usage block gains:

    /xtrace tools mcp pane      live pane, filtered to these kinds

and a sentence in "Live pane" that categories before/after `pane` write the
`kind:` term into the filter bar.

## Tests

- `args.test.ts`: every row of the syntax table.
- `view.test.ts`: `withKinds` — replace, add, remove on `'all'`, negated
  `kind:!x` replaced, other terms kept, empty filter.
- `xtrace.test.ts` (engine): after `/xtrace model pane`, the drawn pane shows
  `kind:model` in the bar and only model rows; after `/xtrace tools` then
  `/xtrace pane on`, the pane shows non-tool rows (selection no longer applies).
