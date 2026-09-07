# Conventions for the BookStore exercise repo

Read this before editing an exercise or a skill, so all four language
versions and all eight sessions keep behaving as one course.

## Repo layout

Four projects — `bookstore-go`, `bookstore-kt`, `bookstore-py`,
`bookstore-ts` — implement the same API with the same deliberate bugs.
Participants pick one language for the whole course. Each project carries
`exercises/session1.md … session8.md`, a `README.md` (build/run) and `preparation.md` (install checklist).
Coaching skills live once, at the repo root, in `.claude/skills/`.

## Naming: sessions, not blocks

The teaching units are **sessions** (Session 1–8), in exercise headers, prose,
skills, and slides — decided with the wider trainer group, 2026-09. "Block"
is reserved for the commercial packaging. Artifact identifiers follow the same rule: `session3-*.diff`, the
`session4-playground` branch, and the matching `.gitignore` entries.

## File names

Lowercase kebab-case for every file and folder (`conventions.md`,
`session3.md`, `2-context-files.md`). The only exceptions are names that tools
look up by convention: `README.md`, `CLAUDE.md`, `CLAUDE.local.md`, `SKILL.md`.
Language-specific source files follow their language's convention.

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

## Writing style

All exercise text follows `writing-style.md` in this repo's root: B1 English
for instructions, flavor skippable and idiom-free, the AI-tell ban list, a
**Done when** line per task, and the final-pass checklist before shipping
any doc. The copy in the course repo (`ai-assisted-se-claude`) is the
source of truth — when it changes there, copy it here again.

## Skills: coach, verifier, save-changes, pollute

- `/prompt-coach` (session 2) and `/context-coach` (session 3): per-task cards
  in `cards/<n>-<slug>.md`, where `<n>` equals the task number in the
  exercise doc. Cards are language-agnostic — they name behaviors and
  layers, never one language's paths. Coach rules (see each SKILL.md):
  never write the artifact for the participant, one nudge per turn, max
  three rounds, participants may overrule, and **held-back answers** (facts
  the run must teach) are marked per card — don't leak them into exercise
  docs or slides either.
- `/verify-exercise <n>`: after-the-fact grading against a rubric in
  `checks/<n>-….md`. Session 3's check runs in-session at the end of the exercise and grades the
  saved `session3-rules.diff`, then arbitrates the participant's own wrap
  nominations.
- `/save-changes <name>`: saves the working tree as `session3-<name>.diff`
  and resets, with preconditions (right cwd, non-empty status, no silent
  overwrite; never `git clean -x`). Windows-safe: writes the diff with
  `git diff --output=` (PowerShell 5.1's `>` produces UTF-16, which
  `git apply` rejects) and runs one git command per call (no `&&`). Reuse
  it for any exercise that needs evidence to survive a reset. Renamed from
  `/bank-diff` 2026-09-07 ("bank" failed the vocabulary rule).
- `/pollute`: session 3, task 4. Runs the fixed pollution script in the
  current session (three long cookie recipes, the full verbose test log
  pasted back), then prints the three over-correcting messages for the
  participant to send by hand. Chat-only: it never edits files. Exists so
  participants write only a prediction, not a plan, and so the polluted
  session is built the same way on every machine.
- **Writing to `.claude/` fails from the desktop bridge.** Stage updated
  skill files in `_move-to-dot-claude-skills/` (mirroring the target
  paths, with a README saying what goes where); a human moves them in and
  deletes the folder.

## Exercise-design patterns (converged over sessions 2–3)

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
- **Overlap waiting time — but never two sessions editing at once**: when
  a build takes several minutes, sequence tasks so the wait overlaps with
  participant work. When a build is short (session 3's endpoint: ~1.5
  min), run sessions one after the other instead; a second terminal that
  might edit the same tree is a bigger risk than a short wait (senior-
  trainer feedback, 2026-09-07).
- **Fresh session means restart**: exercise sheets define "fresh session"
  as closing Claude and starting it again, never as `/clear`. `/clear`
  does not reliably reload a changed `CLAUDE.local.md`.
- **Commit before the first reset**: any exercise that resets the tree
  tells participants to commit earlier sessions' work first (session 2's
  closing and session 3's "Before you start" both do). Otherwise the reset
  removes uncommitted fixes that later sessions build on.
- **Timing**: budget ≈ expert dry-run × 1.3. Session 3 measured 30 min
  expert → 40 min box.
- **Closing**: session 3 uses a single 5-min "Closing round" (popcorn, no
  pair share) per the course-wide no-pairs rule. Other sessions still end
  with the older Pair Discussion + Group Share pair — align them when
  their session gets a redesign pass.
- **Slide sync**: the exercise doc's Duration is the source of truth; the
  deck's exercise-slide `PhaseBanner timing` must match it, and the slide's
  beats must match the doc's tasks.

## Participant artifacts stay out of git

Every project's `.gitignore` ignores `CLAUDE.local.md`, `.claude/rules/`,
`docs/orientation.md`, and `session3-*.diff` — so exercise resets
(`/save-changes`, `git clean`) can never delete a participant's deliverables.
Keep these entries if a `.gitignore` is ever regenerated, and add new
participant-created files to the list when future exercises introduce them.

## Training mode

Each project's `CLAUDE.md` holds course-wide training behavior (teach,
don't answer; investigate like a large codebase) and **must never gain
project facts** — participants write those themselves into
`CLAUDE.local.md` in session 3. Exercises and skills must never instruct
anyone to edit `CLAUDE.md`.
