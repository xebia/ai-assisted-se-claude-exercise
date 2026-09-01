# Conventions for the BookStore exercise repo

Read this before editing an exercise or a skill, so all four language
versions and all eight blocks keep behaving as one course.

## Repo layout

Four projects — `bookstore-go`, `bookstore-kt`, `bookstore-py`,
`bookstore-ts` — implement the same API with the same deliberate bugs.
Participants pick one language for the whole course. Each project carries
`excercises/block1.md … block8.md` (the folder-name typo is historic; keep
it), a `README.md` (build/run) and `preparation.md` (install checklist).
Coaching skills live once, at the repo root, in `.claude/skills/`.

## Editing exercises: Go first, then port

`bookstore-go` is the reference version. Edit it first, then port to
kt/py/ts by substituting the language slots — everything else must stay
word-for-word identical:

- test directory hint (`internal/handler/` table test · Kotlin
  `src/test/kotlin/bookstore/handler/` · py/ts `tests/handler/`)
- test convention phrase (table-driven · custom `@Test` runner · unittest
  · `bun:test`)
- test-output command (`go test ./... -v` · `./mvnw test` ·
  `python3 -m unittest -v` · `bun test`)
- the review handler path and the `paths:` glob for scoped rules
- store-package path, and any planted file names (`review_v2.go` ↔
  `ReviewHandlerV2.kt` / `review_v2.py` / `review_v2.ts`, same for the
  book file)
- dependency rule suffix (kt adds "beyond sqlite-jdbc")

Verify a port with a structural diff: every differing line must contain a
language slot. Anything else is drift — fix it.

## Skills: coach, verifier, bank-diff

- `/prompt-coach` (block 2) and `/context-coach` (block 3): per-task cards
  in `cards/<n>-<slug>.md`, where `<n>` equals the task number in the
  exercise doc. Cards are language-agnostic — they name behaviors and
  layers, never one language's paths. Coach rules (see each SKILL.md):
  never write the artifact for the participant, one nudge per turn, max
  three rounds, participants may overrule, and **held-back answers** (facts
  the run must teach) are marked per card — don't leak them into exercise
  docs or slides either.
- `/verify-exercise <n>`: after-the-fact grading against a rubric in
  `checks/<n>-….md`. Block 3's check runs in-session at the end of the exercise and grades the
  banked `block3-bait.diff`, then arbitrates the participant's own wrap
  nominations.
- `/bank-diff <label>`: banks the working tree as `block3-<label>.diff`
  and resets, with preconditions (right cwd, non-empty status, no silent
  overwrite; never `git clean -x`). Reuse it for any exercise that needs
  evidence to survive a reset.
- **Writing to `.claude/` fails from the desktop bridge.** Stage updated
  skill files in `_move-to-dot-claude-skills/` (mirroring the target
  paths, with a README saying what goes where); a human moves them in and
  deletes the folder.

## Exercise-design patterns (converged over blocks 2–3)

- **Escape hatch**: every exercise doc tells stuck participants to say
  *"just tell me"* — training-mode CLAUDE.md honors it.
- **Experiment prefix**: runs that must not be steered by training mode
  carry a fixed prefix line, printed in the doc; both arms of any
  comparison get it, or the comparison is invalid.
- **Worked examples over blank pages**: when a task asks participants to
  design something (a plan, a prompt), ship a stealable example — copying
  it still teaches, and blank-page paralysis is the bigger enemy.
- **Predict first, in writing**: experiments require a one-sentence
  written prediction before running; a wrong prediction is fine, a missing
  one is the only failure.
- **Verdict-first**: participants commit to pass/fail judgments before the
  coach or verifier gives its own. Never ask them to type ✓/✗ — those
  aren't on keyboards; the coach renders the tally itself.
- **Bank evidence before resets**: diffs are saved to files before any
  revert, and compared as artifacts, not from memory.
- **Overlap waiting time**: sequence tasks so Claude's implementation runs
  overlap with participant work (e.g. block 3 fires the clean arm, then
  pollutes a second session while it builds — chat-only steps can't
  collide with a tree-writing run).
- **Timing**: budget ≈ expert dry-run × 1.3. Block 3 measured 30 min
  expert → 40 min box.
- **Closing**: block 3 uses a single 5-min "Plenary Harvest" (popcorn, no
  pair share) per the course-wide no-pairs rule. Other blocks still end
  with the older Pair Discussion + Group Share pair — align them when
  their block gets a redesign pass.
- **Slide sync**: the exercise doc's Duration is the source of truth; the
  deck's exercise-slide `PhaseBanner timing` must match it, and the slide's
  beats must match the doc's tasks.

## Participant artifacts stay out of git

Every project's `.gitignore` ignores `CLAUDE.local.md`, `.claude/rules/`,
`docs/orientation.md`, and `block3-*.diff` — so exercise resets
(`/bank-diff`, `git clean`) can never delete a participant's deliverables.
Keep these entries if a `.gitignore` is ever regenerated, and add new
participant-created files to the list when future exercises introduce them.

## Training mode

Each project's `CLAUDE.md` holds course-wide training behavior (teach,
don't answer; investigate like a large codebase) and **must never gain
project facts** — participants write those themselves into
`CLAUDE.local.md` in block 3. Exercises and skills must never instruct
anyone to edit `CLAUDE.md`.
