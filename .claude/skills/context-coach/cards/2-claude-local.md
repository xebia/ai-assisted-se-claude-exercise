# Task 2 — Write `CLAUDE.local.md`

**What they're refining:** the file `/init` generated, pruned line by line and
extended with human-only decisions, saved as `CLAUDE.local.md`. The
training-mode `CLAUDE.md` stays untouched.

**Slide anchors:** *`/init` — Bootstrap Your CLAUDE.md* · *Start with `/init`,
then refine by hand* · *What Goes in CLAUDE.md* · *Which CLAUDE.md Line Is Worth
Its Tokens?* · *Writing Effective CLAUDE.md* · *The CLAUDE.md Hierarchy*.

## Concept applicability

**Load-bearing (5):**

- **Earns its tokens** — every surviving line passes the freeloader test.
- **Include/exclude split** — nothing Claude could learn by reading the code
  for thirty seconds; nothing that restates language defaults.
- **Checkable prohibitions** — the three required decisions (validation
  before store · tests per endpoint in the project's own test convention ·
  no new dependencies) are present, in the participant's words. Each one can
  be broken and the break can be seen. Not a wish.
- **Correctness** — every command and path the file claims is true of this
  repo. A build command that does not run is worse than no line at all.
- **Placement** — content is in `CLAUDE.local.md`; `CLAUDE.md` restored if
  `/init` rewrote it. If they edited `CLAUDE.md`, that is the most expensive
  finding of all: training mode governs the rest of the course.

**Optional polish — mention, never count against them:** a *What NOT To Do*
section · `@import` for anything long · a Gotchas heading.

**Not applicable:**

- **Path scoping** — that is the bonus scoped-rule task. A fully scoped
  file here is too early.
- **Trajectory** — a fresh file has no conversation to steer yet.

## What a strong file contains

Nudge toward missing elements from this list. Never paste it as content.

- Build and test commands **verified by running them**, not as `/init`
  guessed them
- The layering rule with the real package/module names of this repo
- The three decisions as specific prohibitions. "Never add a dependency
  without asking" is better than "keep dependencies minimal".
- **Under ~15 lines.** The strongest sign of understanding is what got
  deleted. A participant proud of a 40-line file has missed the Relevance slide.
- No file-by-file inventory, no restated language conventions, no "write
  clean code" lines left

## Nudge bank

- "Which line here could you delete without changing what Claude does?"
- "Could Claude break this rule without anyone noticing? What would make a
  violation visible?"
- "Did you run that test command yourself, or did `/init` write it?"
- "A teammate clones this repo tomorrow. Which of these lines do they need?
  Which ones would they find obvious?"

## Predicted effects for common findings

- Freeloader lines kept → Claude behaves the same. The lines cost tokens in
  *every* future session. That is Relevance, paid forever.
- Vague test rule → the bait run produces tests, but not in the project's
  convention
- No-dependencies rule missing or soft → the bait run adds a library
- Wrong or unverified command → a Correctness problem that shows up sessions
  later, with no trace of where it came from
- Content in `CLAUDE.md` → training mode is broken for every later session

## Greenlight bar

Every surviving line passes the freeloader test; the three decisions present
and checkable; commands verified; placement correct. Optional items are one
line if absent, not a round.

## After the run

Task 3's bait run is this file's real test, and `/verify-exercise 3` grades
the file against that evidence. Keep your debrief to one line and hand over
to it. Do not repeat its findings before it runs.

## Held back

The exercise poses to the room: *a line that is true but useless hurts which
dimension? A line that is specific but wrong?* Intended answers: **Relevance** for
the freeloader; **Correctness** for the wrong line. The wrong one is worse,
because it does damage silently while looking trustworthy. **Don't volunteer
this.** If asked directly, give it, with the hook: that difference is why
"verify the command by running it" is the cheapest protection in the whole
exercise.
