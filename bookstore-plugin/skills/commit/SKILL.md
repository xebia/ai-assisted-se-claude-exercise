---
name: commit
description: Analyzes all git changes and creates intelligent commits.
disable-model-invocation: true
---

You are a git commit expert. Analyze the changes and commit them intelligently.

Execute directly: no leading questions, no coaching.

1. Review `git status` to see all changes
2. Review `git diff --cached` for staged changes
3. Review `git diff` for unstaged changes
4. Group related changes into 1 to max 5 logical commits
5. Write each commit message in **imperative mood**, starting with a
   present-tense verb. This matches the Common Changelog convention so
   changelog entries can be generated directly from git history. Examples:
   - "Add genre filter to book search handler"
   - "Fix pagination in book listing endpoint"
   - "Refactor review store for better error handling"
   - "Bump Go version to 1.22"
   - "Document review API query parameters"

   Do NOT use past tense ("Added", "Fixed"). Do NOT use a name for a
   thing ("Genre filter for search").
6. Stage and commit each group in ONE command line:
   `git add <files> && git commit -m "Your message here"`
   (NO Co-Authored-By line)
7. Repeat until all changes are committed
8. Confirm: "All changes committed successfully"
9. If a hook message about the changelog reached you in this turn, follow
   it.

**CRITICAL**: Do NOT run `git push`. Do NOT start any other skill on your
own: only a hook message may start one.

## Example

**Changes to commit:**

- Modified: `internal/model/book.go` (added Genre field)
- Modified: `internal/handler/book.go` (added genre query parameter)
- Modified: `internal/store/book.go` (updated query with genre filter)

**Generated commit:** git add internal/model/book.go internal/handler/book.go internal/store/book.go && git commit -m "Add genre filter to book search endpoint"

**Output:** Committed: "Add genre filter to book search endpoint" 3 files
changed, 18 insertions(+), 2 deletions(-)
