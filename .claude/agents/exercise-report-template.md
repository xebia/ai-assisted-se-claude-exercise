# Exercise <N> (<lang>) — evaluation

- **Sheet:** bookstore-<lang>/exercises/session<N>.md — "<sheet title>"
- **Date:** <YYYY-MM-DD> · **Commit:** <hash>
- **Workspace:** <path>
- **Dry run:** complete | incomplete (<reason>)
- **Steps:** <ok> ok · <failed> failed · <escape hatch> escape hatch · <skipped by the sheet> skipped by the sheet · <not exercised> not exercised

## Verdicts

| # | Criterion | Verdict | In one line |
| --- | --- | --- | --- |
| 1 | Works | pass / concerns / fail | |
| 2 | Understandable | pass / concerns / fail | |
| 3 | Learning goal | pass / concerns / fail | |
| 4 | Slide coverage | pass / concerns / fail / skipped | |
| 5 | Timing | pass / concerns / fail | |
| 6 | Repeatability | pass / concerns / fail / n/a | |
| 7 | House rules | pass / concerns / fail | |
| 8 | Port drift | pass / concerns / fail / skipped | |

## Findings, most severe first

| # | Severity | Criterion | Where | What is wrong | Evidence | Suggested fix |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | blocker / major / minor | <1-8> | session<N>.md:<line> | | run-log Task <n> step <m> / <file:line> | |

## 1. Works

Run problems: <list (task.step, cause, steps after it unverified) or none>

| Task | Done when | Verdict | Evidence |
| --- | --- | --- | --- |

## 2. Understandable

Confusion notes from the dry run, then the reading against writing-style.md.

## 3. Learning goal

| Goal sentence | Task that makes the participant do or see it | Did it happen in the dry run? |
| --- | --- | --- |

Tasks that serve no goal sentence: <list or none>

## 4. Slide coverage

| Concept in the deck | Slide | Practised in task | Note |
| --- | --- | --- | --- |

Practised but not taught: <list or none>
Slide sync: deck timing <x> vs sheet Duration <y>; beats vs tasks: <match / differences>

## 5. Timing

| Task | Measured | x 1.3 | Sheet budget |
| --- | --- | --- | --- |

Agent time is a rough lower bound for a person. Steps with Status `not exercised` or `skipped by the sheet` are not timed.

## 6. Repeatability

| Key prompt (task.step) | Intended effect | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- | --- |

Key prompts not repeated: <list or none>

## 7. House rules

| Rule (conventions.md) | Verdict | Where |
| --- | --- | --- |

## 8. Port drift

Lines that differ from the Go sheet and are not a language slot: <list or none>
