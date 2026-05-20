# Exercise 5: Build Two Custom Skills

**Block**: 5 — Skills, Hooks & Automation **Duration**: 30 minutes **Project**:
Same BookStore API.

**Goal**: Create two reusable skills — a manual `/commit` skill and an
auto-triggered `/changelog` skill — and wire the changelog into a hook.

## Tasks

1. **Create the `/commit` skill** (5 min) — create the file
   `.claude/skills/commit/SKILL.md` with this content:

   ```markdown
   ---
   name: commit
   description: Analyzes all git changes and creates intelligent commits.
   disable-model-invocation: true
   ---

   You are a git commit expert. Analyze the changes and commit them intelligently.

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
      - "Bump Python version requirement to 3.11"
      - "Document review API query parameters" Do NOT use past tense ("Added",
        "Fixed") or noun phrases ("Genre filter for search").
   6. Run `git add <files>` to stage the next group
   7. Run `git commit -m "Your message here"` (NO Co-Authored-By line)
   8. Repeat until all changes are committed
   9. Confirm: "All changes committed successfully"

   **CRITICAL**: Do NOT run `git push` at the end.

   ## Example

   **Changes to commit:**

   - Modified: `bookstore/model/book.py` (added genre field)
   - Modified: `bookstore/handler/book.py` (added genre query parameter)
   - Modified: `bookstore/store/book.py` (updated query with genre filter)

   **Generated commit:** git commit -m "Add genre filter to book search endpoint"

   **Output:** Committed: "Add genre filter to book search endpoint" 3 files
   changed, 18 insertions(+), 2 deletions(-)
   ```

   Note the frontmatter: `disable-model-invocation: true` ensures this skill
   only runs when you explicitly type `/commit` — Claude will never trigger it
   on its own. Test: make a small change to a bookstore file, type `/commit` in
   Claude Code, and verify the commit was created with a good message, no
   co-author line and no push.

2. **Create the `/changelog` skill** (8 min) — this skill follows the
   [Common Changelog](https://common-changelog.org/) format. Skills can include
   supporting files that Claude loads when needed. Instead of summarizing the
   spec in your skill, store the full specification as a reference file.

   First, save the Common Changelog spec as a markdown file. Go to
   https://common-changelog.org/, select all content and copy it. Then use
   [Clipboard to Markdown](https://euangoddard.github.io/clipboard2markdown/) to
   convert the HTML to clean markdown. Alternatively, use
   [SafeMarkdown](https://safemarkdown.com) to paste a URL and download the page
   as markdown. Save the result to
   `.claude/skills/changelog/common-changelog-spec.md`. Your skill directory
   should look like this:

   ```
   .claude/skills/changelog/
   ├── SKILL.md                      # Main instructions (required)
   └── common-changelog-spec.md      # Full spec reference
   ```

   Then create `.claude/skills/changelog/SKILL.md` with this content:

   ```markdown
   ---
   name: changelog
   description: Updates CHANGELOG.md following the Common Changelog format.
   ---

   You maintain a changelog following the Common Changelog specification.

   **This skill is triggered automatically after every commit.**

   For the full specification, see
   [common-changelog-spec.md](common-changelog-spec.md). Read it before making any
   changes to the changelog.

   1. Read the current `CHANGELOG.md` (create it if it doesn't exist)
   2. Read [common-changelog-spec.md](common-changelog-spec.md) for the formatting
      rules
   3. Run `git log --oneline -10` to see recent commits
   4. Run `git tag --sort=-v:refname` to get existing version tags
   5. Compare the latest commits against what's already in the changelog
   6. For any NEW commits not yet in the changelog, add entries to the
      **Unreleased** section at the top
   7. If a tag points to a commit that has an "Unreleased" section, rename that
      section to `## [TAG] - YYYY-MM-DD` using the tag name and the tag's date
   8. Categorize each change under the correct group heading:
      - `### Changed` — existing functionality altered
      - `### Added` — new functionality
      - `### Removed` — functionality taken away
      - `### Fixed` — bug fixes
   9. Format each entry as:
      - Start with imperative verb (Add, Fix, Remove, Change, Refactor)
      - Include commit reference as a link: ([`short-hash`](commit-url))
      - Prefix breaking changes with **Breaking:**
   10. Skip noise: dotfile changes, formatting-only changes, dev tooling
   11. Write the updated `CHANGELOG.md`

   ## Unreleased section

   If there is no release yet, use this format at the top of the changelog:

   ## Unreleased

   ### Added

   - Add genre filter to book search endpoint
     ([`a1b2c3d`](https://github.com/owner/repo/commit/a1b2c3d))

   When a release is made, rename "Unreleased" to the version and date.

   ## Example

   **New commit:** `a1b2c3d Add genre filter to book search endpoint`

   **Entry added to CHANGELOG.md:**

   ### Added

   - Add genre filter to book search endpoint
     ([`a1b2c3d`](https://github.com/owner/repo/commit/a1b2c3d))
   ```

   Note: this skill does NOT have `disable-model-invocation: true`, so Claude
   can trigger it automatically — which is what we want for the hook in the next
   step. Key rules from Common Changelog:
   - File is named `CHANGELOG.md` with a `# Changelog` heading
   - Each release uses `## [VERSION] - YYYY-MM-DD`
   - Change groups use `###` with one of: **Changed**, **Added**, **Removed**,
     **Fixed** (in that order)
   - Each entry starts with an imperative verb (Add, Fix, Remove, Change)
   - Each entry must include a reference (commit or PR link) in parentheses
   - Entries are sorted: breaking changes first (prefixed with **Breaking:**)
   - Exclude noise: dotfile changes, dev-dependency updates, formatting-only
     changes

3. **Wire up auto-triggering** (4 min) — make the changelog skill run
   automatically after every `git commit`. The hook matcher can only filter by
   tool name (e.g. `Bash`), so you need a small script that checks whether the
   actual command was a `git commit`. First, create
   `.claude/hooks/run-changelog.sh`:

   ```bash
   #!/bin/bash
   # Read the hook JSON from stdin
   COMMAND=$(jq -r '.tool_input.command')

   # Only trigger on git commit commands
   if echo "$COMMAND" | grep -q '^git commit'; then
     echo '{"additionalContext": "A git commit was just made. Run the /changelog skill to update CHANGELOG.md."}'
   fi
   ```

   Make it executable:
   ```bash
   chmod +x .claude/hooks/run-changelog.sh
   ```

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
               "command": ".claude/hooks/run-changelog.sh"
             }
           ]
         }
       ]
     }
   }
   ```

   This fires on every Bash call, but the script exits silently unless the
   command starts with `git commit`. Only then does it return
   `additionalContext` telling Claude to run the changelog skill.

4. **Test the full flow** (3 min) — make a change to the bookstore project
   (prompt to remove delete functionality), run `/commit`, then verify that
   `CHANGELOG.md` was automatically created/updated. Check that it follows
   Common Changelog format: has a `# Changelog` heading, an `## Unreleased`
   section, entries use imperative verbs with commit links, and entries are
   under the correct group (`Added`, `Fixed`, etc.).

## Pair Discussion (5 min)

Compare your `CHANGELOG.md` files side by side with your partner. Did the AI
categorize changes the same way? How did you solve the hook triggering — does it
fire too often? What other skills would benefit from auto-triggering via hooks?
Choose **one take-away** to present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
