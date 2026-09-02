---
name: bank-diff
description: >-
  Bank the working tree as a named diff file and restore the project to a
  clean state. Usage: /bank-diff <arm> — used in the Session 3 exercise to
  capture each experiment arm (polluted, clean) as session3-<arm>.diff before
  resetting for the next arm.
disable-model-invocation: true
---

# Bank a diff, reset the tree — mechanically

This is a mechanical operation with no learning goal: execute directly, no
leading questions, no commentary beyond the report at the end. It is
stateless — it only reads the working tree — so it works from any session,
including one opened after the experiment session was closed.

`$ARGUMENTS` holds the arm name. Expect `polluted` or `clean`; any other
single word is accepted as a custom label. No argument: ask which arm in
one line and wait.

## How you talk to the participant

Short sentences, plain words, no idioms. Every line you write is either a
question they must answer or a fact about the state of their files. Nothing
else.

## Preconditions — check all three before touching anything

Run these checks scoped to the current project directory (the participant's
`bookstore-*` folder — all four projects share one git repository, so
**every git command below must be scoped with `.` and run from the project
folder**):

1. **Right directory.** The cwd must contain `exercises/session3.md` (it is
   the project root). If not: say where you are, say the command must run
   from the bookstore project folder, and stop.
2. **Something to bank.** `git status --porcelain -- .` must be non-empty.
   If it is empty, there is no diff to bank. Most likely the reset already
   ran, or the implementation never happened. Say so and stop. Do not
   create an empty file.
3. **No accidental overwrite.** If `session3-<arm>.diff` already exists,
   ask in one line whether to overwrite it, and wait. (A leftover from an
   earlier failed attempt is the common case. Overwriting is usually right,
   but it is their evidence, so they decide.)

## The operation

```
git add -A .
git diff --cached > session3-<arm>.diff
git reset -q .
git checkout -- .
git clean -fd .
```

Never add `-x` to `git clean`. Ignored files include the participant's
`CLAUDE.local.md`, their banked diffs, and session 2's `docs/orientation.md`.
`-x` would destroy all of them. Never widen any command beyond `.`.

## Verify, then report

After the reset, confirm `git status --porcelain -- .` is empty and the
diff file is non-empty. Then report in at most four lines:

- the file written and its diffstat (files changed, insertions/deletions —
  `git apply --stat session3-<arm>.diff`)
- confirmation the working tree is clean again
- if this was the `polluted` arm: a reminder to note the `/context` % if
  they have not, and that the session should stay open for the bonus

If verification fails (tree not clean, or the diff file is empty despite a
non-empty status earlier), say exactly what state things are in and what
you did NOT do. Never silently retry destructive commands.
