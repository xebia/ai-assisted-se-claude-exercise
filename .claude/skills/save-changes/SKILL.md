---
name: save-changes
description: >-
  Save all uncommitted changes in the current project as a named diff file,
  then put the project back in a clean state. Usage: /save-changes <name> —
  writes session3-<name>.diff. Used in the Session 3 exercise (names: rules,
  clean, polluted) and reusable in any exercise that must keep evidence
  across a reset.
disable-model-invocation: true
---

# Save the changes, clean the project — mechanically

This is a mechanical operation with no learning goal: execute directly, no
leading questions, no commentary beyond the report at the end. It is
stateless — it only reads the working tree — so it works from any session,
including one opened after the experiment session was closed.

`$ARGUMENTS` holds the name. In session 3 expect `rules`, `clean` or
`polluted`; any other single word is accepted. No argument: ask for the
name in one line and wait.

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

Say "the clean session" and "the polluted session", never "arm"; say
"saved", never "banked". Every line you write is either a question they
must answer or a fact about the state of their files. Nothing else.

## Works on Windows and on macOS/Linux

Participants run PowerShell 5.1, cmd, bash or zsh. The commands below are
chosen so they behave the same everywhere:

- **One git command per tool call.** Never join commands with `&&`, `;`
  or `|`. PowerShell 5.1 does not accept `&&`.
- **Never use shell redirection (`>`) to write the diff file.** PowerShell
  5.1 writes `>` output as UTF-16 with a byte-order mark, and `git apply`
  cannot read that file. Use git's own `--output=` flag instead.
- Paths: use forward slashes and relative paths only (`session3-<name>.diff`,
  `.`). Do not quote the dot.

## Preconditions — check all three before touching anything

Run these checks scoped to the current project directory (the participant's
`bookstore-*` folder — all four projects share one git repository, so
**every git command below must be scoped with `.` and run from the project
folder**):

1. **Right directory.** The cwd must contain `exercises/session3.md` (it is
   the project root). If not: say where you are, say the command must run
   from the bookstore project folder, and stop.
2. **Something to save.** `git status --porcelain -- .` must be non-empty.
   If it is empty, there is nothing to save. Most likely the reset already
   ran, or the implementation never happened. Say so and stop. Do not
   create an empty file.
3. **No accidental overwrite.** If `session3-<name>.diff` already exists,
   ask in one line whether to overwrite it, and wait. (A leftover from an
   earlier failed attempt is the common case. Overwriting is usually right,
   but it is their evidence, so they decide.)

## The operation

Run each line as its own command, in this order:

```
git add -A .
git diff --cached --output=session3-<name>.diff
git reset -q .
git checkout -- .
git clean -fd .
```

Never add `-x` to `git clean`. Ignored files include the participant's
`CLAUDE.local.md`, their saved diffs, and session 2's `docs/orientation.md`.
`-x` would destroy all of them. Never widen any command beyond `.`.

## Verify, then report

After the reset, confirm `git status --porcelain -- .` is empty and the
diff file is non-empty. Then report in at most four lines:

- the file written and its diffstat (files changed, insertions/deletions —
  `git apply --stat session3-<name>.diff`)
- confirmation the project is clean again
- if the name was `polluted`: a reminder to note the `/context` % if
  they have not, and that the session should stay open for the bonus

If the diffstat lists files that the exercise prompt did not touch (for
example session 2's bug fixes in handler or store files), tell them in one
line: those changes were not committed, and the reset removed them. The diff
file still holds them. Do not try to restore anything yourself.

If verification fails (project not clean, or the diff file is empty despite a
non-empty status earlier), say exactly what state things are in and what
you did NOT do. Never silently retry destructive commands.
