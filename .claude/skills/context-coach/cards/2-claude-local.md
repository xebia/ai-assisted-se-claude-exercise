# Task 2 — `/init`, then earn every token

**What they're refining:** the file `/init` generated, pruned line by line and
extended with human-only decisions, saved as `CLAUDE.local.md` — with the
training-mode `CLAUDE.md` left untouched.

**Slide anchors:** *`/init` — Bootstrap Your CLAUDE.md* · *Start with `/init`,
then refine by hand* · *What Goes in CLAUDE.md* · *Which CLAUDE.md Line Earns
Its Tokens?* · *Writing Effective CLAUDE.md* · *The CLAUDE.md Hierarchy*.

## Concept applicability

**Load-bearing (5):**

- **Earns its tokens** — every surviving line passes the freeloader test.
- **Include/exclude split** — nothing Claude could infer by reading the code
  for thirty seconds; nothing that restates language defaults.
- **Checkable prohibitions** — the three required decisions (validation
  before store · tests per endpoint in the project's own test convention ·
  no new dependencies) present, in the participant's words, each one
  violable-and-catchable rather than aspirational.
- **Correctness** — every command and path the file claims is true of this
  repo. A build command that doesn't run is worse than no line at all.
- **Placement** — content lands in `CLAUDE.local.md`; `CLAUDE.md` restored if
  `/init` rewrote it. If they edited `CLAUDE.md`, that's the most expensive
  finding on the board: training mode governs the rest of the course.

**Optional polish — mention, never count against them:** a *What NOT To Do*
section · `@import` for anything long · a Gotchas heading.

**Not applicable:**

- **Path scoping** — that's the bonus scoped-rule task; a fully scoped
  file here is premature.
- **Trajectory** — a fresh file has no conversation to steer yet.

## What a strong file contains

Nudge toward missing elements from this list; never paste it as content.

- Build and test commands **as verified by running them**, not as `/init`
  guessed them
- The layering rule with the real package/module names of this repo
- The three decisions as specific prohibitions — "never add a dependency
  without asking" beats "keep dependencies minimal"
- **Under ~15 lines.** The strongest signal of understanding is what got
  deleted. A participant proud of a 40-line file has missed the Size slide.
- No file-by-file inventory, no restated language conventions, no "write
  clean code" survivors

## Nudge bank

- "Which line here would Claude behave identically without?"
- "Could this rule be violated without anyone noticing? What would make a
  violation catchable?"
- "Did you run that test command, or did `/init`?"
- "If a teammate cloned this repo tomorrow, which of these lines would they
  need — and which would they roll their eyes at?"

## Predicted effects for common findings

- Freeloader lines kept → zero behavior change, pure token cost in *every*
  future session — Size, paid forever
- Vague test rule → the bait run will produce tests, but not in the
  project's convention
- No-dependencies rule missing or soft → the bait run pulls in a library
- Wrong or unverified command → Correctness debt that surfaces sessions
  later, with no trace of where it came from
- Content in `CLAUDE.md` → training mode clobbered for every later block

## Greenlight bar

Every surviving line passes the freeloader test; the three decisions present
and checkable; commands verified; placement correct. Optional items are a
one-line mention if absent, not a round.

## After the run

Task 3's bait run is this file's field test, and `/verify-exercise 2` grades
the file against that evidence — keep your debrief to one line and hand over
to it. Don't preempt its findings.

## Held back

The exercise poses to the room: *a line that's true but useless hurts which
dimension? A line that's specific but wrong?* Intended answers: **Size** for
the freeloader; **Correctness** for the wrong line — and the wrong one is
worse, because it compounds silently while looking authoritative. **Don't
volunteer this.** If asked directly, give it, with the hook: that asymmetry
is why "verify the command by running it" is the cheapest insurance in the
whole exercise.
