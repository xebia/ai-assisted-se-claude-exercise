---
description: "Trainer-only. Dry-run one exercise sheet in a fresh participant package and write an evaluation report. Usage: /evaluate-exercise <session 1-8> <go|kt|py|ts>"
argument-hint: <session 1-8> <go|kt|py|ts>
disable-model-invocation: true
---

# Evaluate exercise $ARGUMENTS

You orchestrate one evaluation. You do not evaluate anything yourself, and
you never edit a sheet, a skill, code or slides.

## Step 1 — Arguments

`$ARGUMENTS` must be a session number 1-8 and a language `go`, `kt`, `py`
or `ts`, in that order. If either is missing or invalid, print the usage
line and stop. The usage line is `/evaluate-exercise <session 1-8> <go|kt|py|ts>`.

## Step 2 — Prepare

Run from the repository root:

```bash
scripts/evaluate-prepare.sh <session> <lang>
```

- Exit code 2: print the usage line and stop.
- Exit code 3: the package build failed. Show the build output, say that
  the build is the finding, and stop.
- Exit code 4: the sheet is not in the package. Say so and stop.
- Exit code 5: pandoc is needed to convert the sheet (it is missing, or the
  conversion failed). Say that pandoc is needed, and stop.
- Any other non-zero exit code: show the script's stderr and stop.
- Exit code 0: read `WORKSPACE`, `RUN_DIR`, `SHEET`, `DECK` and `COMMIT`
  from the output.

If the script moved an earlier same-day run aside (it says so on stderr,
with a folder name containing `-prev-`), tell the user in one line where
that run now is.

Tell the user in one line where the workspace is and that the dry run can
take 15 to 40 minutes. Add that the nested Claude in the workspace runs
without permission prompts.

## Step 3 — Participant

Start one agent of type `exercise-participant` with exactly this prompt
(fill in the paths, add nothing else):

```
Follow exercise sheet <session>.
WORKSPACE=<WORKSPACE>
SHEET=<SHEET>
RUN_LOG=<RUN_DIR>/run-log.md
```

The two agents run as subagents of this session. If the Agent tool offers
a background option, use it: a run can take longer than a foreground call
allows. Wait for the completion notice of the participant before you start
the reviewer. Never write a run log or a report yourself.

Do not give it the deck, this repository's path, `conventions.md` or any
hint about what the exercise expects. Do not do its work yourself, and do
not predict its result.

When it finishes, check that `<RUN_DIR>/run-log.md` exists. If it does
not, the participant ended without a run log: say so and stop. Otherwise
relay the participant's reply to the user in one line (completed or
incomplete, and the number of confusion notes). If the run is incomplete,
continue: the reviewer handles a partial log.

## Step 4 — Reviewer

Start one agent of type `exercise-reviewer` with exactly this prompt:

```
Review exercise sheet <session> for <lang>.
SESSION=<session>
LANG=<lang>
RUN_DIR=<RUN_DIR>
WORKSPACE=<WORKSPACE>
DECK=<DECK>
COMMIT=<COMMIT>
REPO=<absolute path of this repository>
```

If `DECK` came back empty, pass `DECK=` with nothing after it; do not look
for a deck yourself. Use the background option here too, if there is one.
Wait for its completion notice.

Then check that `<RUN_DIR>/report.md` exists. If it does not, say so,
point to `<RUN_DIR>/run-log.md`, and stop. Never write the report or a
verdict table yourself.

## Step 5 — Result

Print the verdict table from the reviewer's reply. If the reply has no
table, read it from `<RUN_DIR>/report.md` (section "Verdicts"). Also print
the number of blocker and major findings (count them in the findings
table of `<RUN_DIR>/report.md`), the "Run problems" line from the
report when it is not "none", the transcripts folder path
`<RUN_DIR>/transcripts`, and links to `<RUN_DIR>/report.md` and
`<RUN_DIR>/run-log.md`. If `DECK` was empty, say that slide coverage was
skipped because the slides repository was not found beside this one.

Do not offer to fix findings unless the user asks.
