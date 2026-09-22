---
name: catch-up
description: >-
  Bring the project to the state the next session expects, unattended.
  Usage: /catch-up <session number> — finishes the named session's code
  work (fixes the code until the tests pass, never the tests), takes the
  default for any decision the participant did not make, and commits.
  Used at the end of exercise 2 and at the start of exercise 3.
disable-model-invocation: true
---

# Catch up — finish the session's code work, then commit

This is a mechanical operation with no learning goal: execute directly,
no leading questions, no training mode, no commentary beyond the report
at the end. The participant may have walked away. Nothing you print is
read until they come back, so never ask a question. If you cannot finish,
say what is left and stop.

`$ARGUMENTS` holds the session number. Read `sessions/<n>.md` beside this
file in full; it names the target state. No argument, or no matching
file: list the available session files by number and stop.

## How you talk to the participant

- Write B1 English. Sentences under 18 words. One idea per sentence.
- No idioms, no irony, no metaphors. Say the plain thing first.
- Use the course terms exactly as the slides and exercise sheet name them.
  Do not invent new terms for the same idea.
- Every ❌ names the actor and the consequence: "Claude will fix one test
  and stop." Never a category: "insufficient done-condition."
- One question per turn. Ask it in one sentence, at the end.
- Keep the shape the loop asks for. Do not add greetings, praise, summaries
  of what you are about to do, or a closing lesson.
- Warmth comes from being direct and fair, not from jokes.

Exception to "one question per turn": this command asks none.

## Which project this is

Look at the current folder, then use this table:

| Marker file    | Test command               |
| -------------- | -------------------------- |
| `go.mod`       | `go test ./...`            |
| `gradlew`      | `./gradlew runTests`       |
| `main.py`      | `python3 -m unittest`      |
| `package.json` | `bun test`                 |

On Windows, run `gradlew.bat runTests`. If the Kotlin project has no
Gradle wrapper, use `mvn test`. If none of the marker files is in the
current folder, say the command must run from the bookstore project
folder, and stop.

The frontend (`web/`) and the plugin share the project's git repository.
**Every git command is scoped with `.` and runs from the project folder.** One git command per tool
call; never join commands with `&&`, `;` or `|` (PowerShell 5.1 does not
accept `&&`).

## Rules that do not bend

- **Fix the code, never a test file.** The tests define what correct
  means. If a test looks wrong to you, leave it and report it.
- **No new dependency.** Not in the manifest, not vendored.
- **Follow the existing pattern.** Copy how the neighbouring handler,
  store or test does it. Do not restructure, rename or "clean up".
- **Touch only what the session file lists.** No other improvements.
- **Never edit `CLAUDE.md`.** It carries training mode for the course.
- **Do not touch the participant's own files**: `CLAUDE.local.md`,
  `docs/`, `session*-*.diff`, `.claude/rules/`. They are ignored by git
  and are not yours.

## The operation

1. **Check the state.** Run the test command. Run
   `git status --porcelain -- .`.
   - Tests green and status empty: print "Nothing to do. Tests pass and
     everything is committed." and stop.
   - Tests green, status not empty: go to step 4.
2. **Fix, in the order the session file lists.** For each item: read the
   test that fails, read the code it tests, make the smallest change that
   satisfies the test in the existing style. Where the session file says
   the participant may have decided something, look for their decision
   first (a test they wrote, a comment, a line in their prompt file). Use
   the default only when there is no decision to find, and say so in the
   report.
3. **Re-run the test command.** At most three fix rounds. Still red after
   three: stop fixing. Report which tests fail and what you tried. Do not
   commit a red suite unless the session file says a red test is
   acceptable.
4. **Commit.** Run these as separate commands:

   ```
   git add -A .
   git commit -m "session <n> (catch-up)"
   ```

   If git says nothing to commit, that is fine.

## The report

At most eight lines, in this order:

- Tests before: `<n> failed` (or "all passing").
- What changed: one line per file, with the reason (the test it satisfies).
- Decisions taken by default, if any, in the words the session file gives.
- Tests after: "all passing", or the names that still fail.
- The commit: hash and message, or "nothing to commit".

No question at the end. No advice. The exercise sheet says what comes
next.
