# Task 1 — Write `CLAUDE.local.md`

**What they're refining:** the file `/init` generated, pruned line by line and
extended with human-only decisions, saved as `CLAUDE.local.md`. The
training-mode `CLAUDE.md` stays untouched.

**Rounds:** one, and the visit is optional: the sheet says "only if you
are done before minute 10". So they are early and on a clock. Grade,
nudge once, regrade the delta if they paste again, then say the file is
ready. Never a third message that asks for more.

**Slide anchors:** *`/init` — Bootstrap Your CLAUDE.md* · *Start with `/init`,
then refine by hand* · *What Goes in CLAUDE.md* · *Which CLAUDE.md Line Is Worth
Its Tokens?* · *Writing Effective CLAUDE.md* · *The CLAUDE.md Hierarchy*.

## Concept applicability

**Must (3) — mark *needed*:**

- **Checkable prohibitions** — the three required decisions (validation
  before store · tests per endpoint in the project's own test convention ·
  no new dependencies) are present, in the participant's words, plus the
  layer line (handlers call the store, the store talks to the database).
  Each one can be broken and the break can be seen. Not a wish.
- **Correctness** — the test command the file claims runs. A command that
  does not run is worse than no line at all. Ask whether they ran it.
- **Placement** — content is in `CLAUDE.local.md`; `CLAUDE.md` restored if
  `/init` rewrote it. If they edited `CLAUDE.md`, that is the most expensive
  finding of all: training mode governs the rest of the course.

**Should:**

- **Earns its tokens** — every surviving line passes the freeloader test.
  Give the count. Nudge on it only when all musts are ✅.
- **Include/exclude split** — nothing Claude could learn by reading the code
  for thirty seconds; nothing that restates language defaults.

**Optional polish — mention, never count against them:** a *What NOT To Do*
section · a Gotchas heading.

**Not applicable:**

- **Path scoping** — that is the back-at-work item. A fully scoped file
  here is too early.
- **`@import`** — theory only in this course. Do not nudge toward it, and
  do not count a pasted folder structure as a finding unless every must is
  ✅ and there is nothing else to say.
- **Trajectory** — a fresh file has no conversation to steer yet.

## What a strong file contains

Nudge toward missing elements from this list. Never paste it as content.

- The test command **verified by running it**, not as `/init` guessed it
- The layering rule with the real package/module names of this repo
- The three decisions as specific prohibitions. "Never add a dependency
  without asking" is better than "keep dependencies minimal".
- **Every line survives the question "what does Claude do differently
  because of it?"** There is no line-count target; the sheet says so. The
  strongest sign of understanding is what got deleted and why. A
  participant proud of a 40-line file has missed the Relevance slide; a
  participant who cut to 8 lines and cannot say why each one stays has
  missed it too.
- No file-by-file inventory, no restated language conventions, no "write
  clean code" lines left

## Example bank

One line per concept, on a different project: an Order API for a web shop,
written in Java with Spring. Quote the one you are nudging, word for word,
and say it is from another project. Never turn one into a line for this
project unless the escape hatch says so.

- **Checkable prohibition, dependencies:** "Never add a Maven dependency.
  If a task seems to need one, stop and say which."
- **Checkable prohibition, tests:** "Every new endpoint gets a test in
  `OrderControllerTest`, in the same style as `createOrderReturns201`."
- **Checkable prohibition, validation:** "Controllers validate the request
  body before calling a service. A service never sees an unchecked field."
- **Layer line:** "Controllers call services. Only services call
  repositories. Nothing else touches the database."
- **Verified command:** "Run tests with `./mvnw test` (checked: 42 tests,
  green)."
- **A line to delete:** "Follow Java best practices." — Claude does this
  without being told. The line costs tokens every session.

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
- Vague test rule → the clean session produces tests, but not in the
  project's convention
- No-dependencies rule missing or soft → the bonus caching run adds a
  library; the DELETE run rarely tests this line
- Layer line descriptive, not a rule → the cache lands in the handlers
- Wrong or unverified command → a Correctness problem that shows up sessions
  later, with no trace of where it came from
- Content in `CLAUDE.md` → training mode is broken for every later session

## Ready bar

The three musts ✅ or 🟡. Should items are one line if absent, not a
round.

## After the run

The clean session in task 2 is this file's first real test, and the
grader (`/verify-exercise 3`) grades the file against that diff in the
second terminal. Some lines (no dependencies, the layer line) are rarely
tested by a DELETE endpoint; the bonus weak-prompt run (caching) tests
them. If they come back to you after task 2, keep your debrief to one
line and point at the grader's report. Do not repeat its findings.

## Held back

The closing round poses to the room: *a line that is true but useless hurts
which dimension? A line that is specific but wrong?* Intended answers:
**Relevance** for the freeloader; **Correctness** for the wrong line. The
wrong one is worse, because it does damage silently while looking
trustworthy. **Don't volunteer this.** If asked directly, give it, with the
hook: that difference is why "verify the command by running it" is the
cheapest protection in the whole exercise.
