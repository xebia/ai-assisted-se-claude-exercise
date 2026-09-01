# Exercise 4: Build the Tooling That Coached You

**Block**: 4 — Skills, Hooks & Automation **Duration**: 40 minutes
**Project**: Same BookStore API.

**Goal**: The coaches you've been talking to since Block 2 — `/prompt-coach`,
`/context-coach`, `/bank-diff` — are nothing but markdown files in this repo.
Today you build that artifact type yourself: a manual `/commit` skill (pasted,
then understood), an auto-invoked `/changelog` skill (designed by you), and a
hook that connects them — then you run the whole automation and grade its
output.

## How this exercise works

There is no coach for this block. The checklists in the tasks below are the
guardrail, and `/verify-exercise 4` gives the closing verdicts at the end
of task 5 — after yours, as always.

This exercise makes **real commits**, so everything happens on a throwaway
branch; task 6 cleans it up and explains why your work survives the delete.

**Note**: `CLAUDE.md` keeps this project in training mode — and it is
**load-bearing course infrastructure: never edit it**. Skills you write get
their own way of escaping training mode; task 2 shows the move. Stuck or
short on time? Say *"just tell me"*.

## Tasks

1. **Setup & study the coach** (5 min) — first, protect the project: blocks
   5–8 reuse this codebase, and today you commit for real.

   ```
   git switch -c block4-playground
   ```

   Then meet the artifact type you're about to build. Open
   `.claude/skills/bank-diff/SKILL.md` — at the **repo root**, one level above
   your project folder — and read it again, not as a user this time but as the
   author of the next one: it is a complete worked example of a skill. Write
   down 2–3 design moves you'll steal. Candidates you should be able to spot:
   `disable-model-invocation: true` in the frontmatter (runs only when typed);
   `$ARGUMENTS` handling with a one-line fallback ask instead of a guess;
   preconditions checked before any side effect touches the tree; the
   "execute directly, no leading questions" line that keeps training mode out
   of a mechanical operation; every git command scoped to the project folder.
   Copying is allowed — spotting *why* each move is there is the exercise.

   Also glance at the frontmatter `description` in
   `.claude/skills/context-coach/SKILL.md` — just the description, nothing
   else; you'll need it in task 3.

   Stick to the `SKILL.md` files. The `cards/` and `checks/` folders next to
   them hold graded answers for this course's exercises — opening them spoils
   your own verifier run.

2. **Create the /commit skill** (6 min) — create the file
   `.claude/skills/commit/SKILL.md` (in *your project folder* this time, next
   to the code it commits) with this content:

   ```markdown
   ---
   name: commit
   description: Analyzes all git changes and creates intelligent commits.
   disable-model-invocation: true
   ---

   You are a git commit expert. Analyze the changes and commit them intelligently.

   Execute directly — no leading questions, no coaching.

   1. Review `git status` to see all changes
   2. Review `git diff HEAD` for staged changes
   3. Review `git diff` for unstaged changes
   4. Group related changes into 1 to max 5 logical commits
   5. Write each commit message in **imperative mood**, starting with a
      present-tense verb. This matches the Common Changelog convention so changelog
      entries can be generated directly from git history. Examples:
      - "Add genre filter to book search handler"
      - "Fix pagination in book listing endpoint"
      - "Refactor review store for better error handling"
      - "Bump Go version to 1.22"
      - "Document review API query parameters" Do NOT use past tense ("Added",
        "Fixed") or noun phrases ("Genre filter for search").
   6. Run `git add <files>` to stage the next group
   7. Run `git commit -m "Your message here"` (NO Co-Authored-By line)
   8. Repeat until all changes are committed
   9. Confirm: "All changes committed successfully"

   **CRITICAL**: Do NOT run `git push` at the end.

   ## Example

   **Changes to commit:**

   - Modified: `internal/model/book.go` (added Genre field)
   - Modified: `internal/handler/book.go` (added genre query parameter)
   - Modified: `internal/store/book.go` (updated query with genre filter)

   **Generated commit:** git commit -m "Add genre filter to book search endpoint"

   **Output:** Committed: "Add genre filter to book search endpoint" 3 files
   changed, 18 insertions(+), 2 deletions(-)
   ```

   One line here is doing quiet, essential work: **"Execute directly — no
   leading questions, no coaching"** near the top. Without it, training mode
   reads your test run as a teaching moment and turns it into a Socratic
   dialogue about your staging area — the same defense `bank-diff` carries,
   and you read it minutes ago. And note the frontmatter:
   `disable-model-invocation: true` ensures this skill only runs when you
   explicitly type `/commit` — Claude will never trigger it on its own.

   Test it: make a small change to a bookstore file, type `/commit` in Claude
   Code, and verify the commit was created with a good message, no co-author
   line and no push.

3. **Design the /changelog skill** (12 min) — the second skill follows the
   [Common Changelog](https://common-changelog.org/) format, and this one you
   write yourself.

   First, the reference material. Skills can carry supporting files that
   Claude loads when needed — so instead of summarizing the spec inside your
   skill, store the full specification next to it. You have a tool for
   fetching web pages now; it's called Claude. Ask it to fetch
   https://common-changelog.org/ and save the page as clean markdown to
   `.claude/skills/changelog/common-changelog-spec.md`. Your skill directory
   should end up looking like this:

   ```
   .claude/skills/changelog/
   ├── SKILL.md                      # Main instructions (required)
   └── common-changelog-spec.md      # Full spec reference
   ```

   Then write `.claude/skills/changelog/SKILL.md` **yourself** — no paste
   this time. Blank-page insurance: you have a worked example (task 2's
   skill, still open) and this must-do list. Your skill's body must make
   Claude:

   - read the existing `CHANGELOG.md` — or create it if it doesn't exist
   - read `common-changelog-spec.md` before touching the changelog
   - inspect recent commits and existing version tags
   - add only NEW commits — entries already in the changelog stay untouched —
     to an **Unreleased** section at the top
   - categorize under `### Changed` / `### Added` / `### Removed` /
     `### Fixed`, in that order
   - write each entry as an imperative-verb sentence with a commit reference
   - prefix breaking changes with **Breaking:** and sort them first
   - skip noise: dotfile changes, formatting-only changes, dev tooling

   Now the design question that makes this skill different from `/commit`:
   this one must be **auto-invocable**. The hook you wire in task 4 only
   *suggests* running it — Claude decides. So no `disable-model-invocation`,
   and the frontmatter `description` is the trigger: it is what Claude reads
   when deciding whether this skill fits the moment. Put your draft next to
   `context-coach`'s description and compare. What does that one tell Claude
   about *when* it applies, not just what it does? Which words in yours would
   make Claude reach for this skill right after a commit — and which would
   make it fire when you don't want it?

   Key rules from Common Changelog, for your checklist and task 5's grading:
   - File is named `CHANGELOG.md` with a `# Changelog` heading
   - Each release uses `## [VERSION] - YYYY-MM-DD`
   - Change groups use `###` with one of: **Changed**, **Added**, **Removed**,
     **Fixed** (in that order)
   - Each entry starts with an imperative verb (Add, Fix, Remove, Change)
   - Each entry must include a reference (commit or PR link) in parentheses
   - Entries are sorted: breaking changes first (prefixed with **Breaking:**)
   - Exclude noise: dotfile changes, dev-dependency updates, formatting-only
     changes

   No coach checks this draft — the list above is the guardrail, and
   `/verify-exercise 4` grades the result at the end of task 5.

4. **Wire the hook** (6 min) — a skill Claude *may* invoke still needs
   something to remind it at the right moment. That's a hook. You'll add a
   `PostToolUse` hook on the `Bash` tool: the hook matcher can only filter by
   tool name, so a small script decides whether the actual command was a
   `git commit`.

   Hooks run on whatever machine the session runs on — and you are on
   Windows — so the script is cross-platform Python: no bash shebang, no
   `jq`, no `chmod`. Create `.claude/hooks/run-changelog.py`:

   ```python
   import json
   import sys

   data = json.load(sys.stdin)
   command = data.get("tool_input", {}).get("command", "")

   if command.startswith("git commit"):
       print(json.dumps({
           "hookSpecificOutput": {
               "hookEventName": "PostToolUse",
               "additionalContext": "A git commit was just made. Run the /changelog skill to update CHANGELOG.md."
           }
       }))
   ```

   The nested `hookSpecificOutput` shape is not decoration. A top-level
   `additionalContext` key is **not honored** by Claude Code, and plain
   stdout from a PostToolUse hook goes to the transcript only — the model
   never sees it. Only this exact shape reaches Claude.

   Then add the hook to `.claude/settings.json`:

   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Bash",
           "hooks": [
             {
               "type": "command",
               "command": "python .claude/hooks/run-changelog.py"
             }
           ]
         }
       ]
     }
   }
   ```

   (On mac/linux, make that `python3`.)

   **Before you run anything: predict first, in writing.** Three one-line
   predictions:

   1. Does the hook fire when *you* type `/commit`?
   2. Does it fire when Claude runs a `git commit` on its own initiative?
   3. Does it fire on `git commit --amend`?

   A wrong prediction is a fine outcome. A missing one is the only failure —
   without it, task 5 has nothing to check you against.

5. **Test the flow, verdict-first** (6 min) — make a real change: prompt
   Claude to remove the delete functionality from the BookStore API. A
   removal, deliberately — your changelog design has to prove it can file
   something outside the easy `Added` group. Then run `/commit` and watch the
   chain: commit → hook → changelog.

   When the dust settles, two verdicts, both **in writing**, both before
   the verifier gives its own:

   - **Predictions vs. reality** — take your three task-4 predictions and
     mark each confirmed or busted, citing the moment in the transcript that
     decides it.
   - **Self-grade the `CHANGELOG.md`** — pass or fail on each of five checks:
     `# Changelog` heading · an `## Unreleased` section · groups in
     Changed/Added/Removed/Fixed order · entries start with an imperative
     verb · every entry carries a commit reference.

   `/verify-exercise 4` re-grades all of it — both skills, the hook, the
   changelog, and your two verdicts — with evidence. Kick it off now: it
   works standalone from the artifacts and keeps running while you clean
   up in task 6 — read its report before the plenary harvest.

6. **Cleanup + Plenary Harvest** (5 min) — cleanup first, one command per
   line (PowerShell 5.1 can't chain with `&&`):

   ```
   git switch -
   git branch -D block4-playground
   ```

   The commits go; your work stays. `CHANGELOG.md`, `.claude/skills/`,
   `.claude/hooks/` and `.claude/settings.json` are gitignored, so the branch
   delete can't touch them — the same trick that has protected your
   `CLAUDE.local.md` since Block 3.

   Then the trainer popcorns the room — have answers ready: which of your
   three predictions died on contact, and what does that teach you about when
   hooks see commands? The best design move you stole from `bank-diff`?
   Which wording in your `description` do you trust to auto-fire — and which
   would you tighten now? And one skill+hook automation you'd actually build
   at work. Close with **one take-away** you'd give someone who skipped
   today.

## Bonus (only if time remains)

- **Scaffold with skill-creator** — Anthropic ships a skill that writes
  skills. Add the official marketplace:

  ```
  /plugin marketplace add anthropics/claude-plugins-official
  ```

  then open `/plugin`, install the **skill-creator** plugin from that
  marketplace, and run `/reload-plugins`. Use it to scaffold one more skill —
  any repetitive move from your own workday. Compare its scaffold against
  what you wrote by hand in task 3: what did it think of that you didn't?
