# Exercise 2 — Context files vs. the bait run

**Artifact:** `CLAUDE.local.md`, the working-tree changes produced by the
bait run, and — only if the participant did the bonus scoped-rule task —
the path-scoped rule file under `.claude/rules/`.

**Under review: the context files, not a prompt.** This is the Block 3
exception to this skill's usual framing. The bait prompt is fixed and
deliberately vague — *"Add caching to the BookStore API"*, plus the
exercise's experiment prefix — and its weakness is the experimental control:
whatever discipline shows up in the diff was supplied by the participant's
context files, or by luck. Ask for the context files verbatim in Step 0
instead of a prompt; if the participant improved the bait prompt's wording,
note it as a broken control and grade what you can.

**What the participant was asked to produce.** A pruned `/init` output in
`CLAUDE.local.md` where every line passes the freeloader test, encoding
three decisions in their own words (validation before store · tests per
endpoint in the project's test convention · no new dependencies). The
path-scoped rule file is a bonus task: grade it when present, mark the
Scoping dimension — n/a when absent, and never count its absence against
them.

## Rubric — replaces the Block 2 technique table

| Dimension | The context files pass when… |
| --- | --- |
| **Correctness** | every command, path, and convention the files claim is true of this repo — commands run, files exist, the described patterns actually appear in the code |
| **Completeness** | all three required decisions are present and *checkable* — a violation would be catchable, not arguable |
| **Size** | every line passes the freeloader test — nothing Claude could infer from the code, no restated language defaults, no file inventory |
| **Scoping** | *(bonus — n/a if not attempted)* the rule file's `paths:` glob matches the intended layer's real files and nothing else, and the rule was moved, not copied |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: predictions before
evidence, one specific expected defect per ❌. State the grade as *N of 4
dimensions sound*.

## What full-marks context files contain

- Verified build/test commands (verified = you can run them now and they work)
- The layering rule using this repo's real package/module names
- Three prohibitions specific enough that the bait diff can convict them
- Under ~15 lines in `CLAUDE.local.md`; the scoped rule carries only
  layer-local guidance
- `CLAUDE.md` itself untouched — `git status` / `git diff CLAUDE.md` is the
  cheapest check in this file. **Highest-value, least-often-checked:** a
  modified `CLAUDE.md` silently degrades every later block.

## Establish ground truth

1. Run the test command `CLAUDE.local.md` claims, exactly as written. It
   failing is a Correctness finding regardless of anything else.
2. If a rule file exists, list the files its glob matches against the
   actual tree (every handler file? anything outside the layer?).
3. Only then open the bait diff: where did the cache land (store layer or
   smeared across handlers?), was anything added to the dependency manifest,
   do new tests exist and do they follow the project's convention (compare
   against one existing test file, not memory), is cache invalidation wired
   to update/delete, is handler validation still intact?

## Known traps

- **Dependency pulled in** — manifest diff shows a cache/TTL library →
  no-dependencies rule missing, soft ("keep dependencies minimal"), or
  buried in a scoped file that didn't load for store code
- **Tests exist but ignore the convention** — the test rule named testing
  but not *this repo's* pattern; generic rules buy generic tests
- **Cache in the wrong layer** — layering rule absent or descriptive
  ("handlers call stores") rather than prescriptive
- **Glob near-miss** *(bonus)* — a typo'd or wrong-depth `paths:` pattern; the rule
  never loaded anywhere and everything downstream is unaffected. Check the
  glob even if the diff looks fine — a correct diff under a dead rule is
  luck, not scoping.
- **`CLAUDE.md` modified** — `/init` rewrote it and it was never restored;
  training mode is gone. Check even when not mentioned; omissions are
  findings.
- **Got away with it** — the model stayed in-project-style with no rule
  demanding it. Say plainly this is not reproducible; the next session
  re-rolls the dice.

## Pass bar

- Test command runs as written
- No new external dependency in the bait diff
- Cache in the store layer with invalidation on update/delete
- New tests present, following the project's existing test pattern
- `CLAUDE.md` unmodified

Partial is the expected first-attempt outcome — usually one rule worded too
softly to convict. Say which wording, show the diff line it failed to
prevent, and let them tighten it themselves.

## Held back

Task 2 poses to the room: *a line that's true but useless hurts which
dimension? A line that's specific but wrong?* Intended: **Size** for the
freeloader, **Correctness** for the wrong line — the wrong one is worse
because it compounds while looking authoritative. Answer only if asked
directly.
