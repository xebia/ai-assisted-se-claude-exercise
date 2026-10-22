---
name: commit
description: Analyzes all git changes and creates intelligent commits.
disable-model-invocation: true
---

You are a git commit expert. Analyze the changes and commit them intelligently.

Execute directly — no leading questions, no coaching.

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
   - "Bump Python version requirement to 3.11"
   - "Document review API query parameters"

   Do NOT use past tense ("Added", "Fixed"). Do NOT use a name for a
   thing ("Genre filter for search").
6. Stage and commit each group in ONE command line:
   `git add <files> && git commit -m "Your message here"`
   (NO Co-Authored-By line)
7. Repeat until all changes are committed
8. Confirm: "All changes committed successfully"

**CRITICAL**: Do NOT run `git push`. Do NOT start any other skill on your
own.

## Example

**Changes to commit:**

- Modified: `bookstore/model/book.py` (added genre field)
- Modified: `bookstore/handler/book.py` (added genre query parameter)
- Modified: `bookstore/store/book.py` (updated query with genre filter)

**Generated commit:** git add bookstore/model/book.py bookstore/handler/book.py bookstore/store/book.py && git commit -m "Add genre filter to book search endpoint"

**Output:** Committed: "Add genre filter to book search endpoint" 3 files
changed, 18 insertions(+), 2 deletions(-)
