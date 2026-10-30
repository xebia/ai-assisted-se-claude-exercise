# Exercise 3 — Two skills, a guard, and a rule

**Artifact:** four files in the participant's project folder, all in
gitignored paths — `.claude/skills/commit/SKILL.md`,
`.claude/skills/changelog/SKILL.md` (plus its
`common-changelog-spec.md` sibling), `.claude/hooks/guard-secrets.py`
with its `UserPromptSubmit` entry in `.claude/settings.json`, and the
`permissions.deny` rule `Read(.env)` in that same file — plus one thing
the participant wrote down by hand during the session: their three
task-3 predictions, marked confirmed or wrong in task 4.

**This check runs in two stages.** The sheet calls it at the end of task
4, before the closing round. A fast participant may also run it after
task 2, when only the two skills exist. Never refuse that early run
because the guard is missing: before task 3 the guard is not supposed to
exist yet.

Pick the stage from disk, before anything else:

- **Skills-only stage**: `.claude/hooks/guard-secrets.py` does not exist
  and `.claude/settings.json` is missing or has no `UserPromptSubmit`
  entry. Grade only the two skills. See *Skills-only stage* below.
- **Full stage**: the guard script or the `UserPromptSubmit` entry
  exists. Run the full check in this file. A rule that is still missing
  is a finding, not a reason to stop.

The `session3-playground` branch is deleted after the closing
round; if the participant already did that, every artifact above lives
in a gitignored path and survives.

**Under review: the artifacts, not a prompt.** This is a Session 3
exception to this skill's usual framing. In the full stage, in Step 0,
instead of a prompt, ask for one thing word for word: the three written
task-3 predictions, with the participant's confirmed-or-wrong mark on
each. The sheet told them you would ask, so ask in one line and wait. If
they do not exist, that is itself a finding. A wrong prediction was a
fine outcome; a missing one is the stated failure mode. Then grade what
you can.

**The words this sheet uses.** Say them, not the trainer shorthand:

| Say this | Not this |
| --- | --- |
| your three predictions | the prediction set |
| you marked your predictions | your verdicts, verdict-first |
| the guard (your script) | the hook, the interceptor |
| the rule | the deny list, the permission |
| the guard blocked the prompt | the hook triggered |
| the guard did not see it | the hook did not fire |
| the gap the guard does not see | the hole |
| the test prompt | the trap |

**The guard sees what you type; the rule sees what Claude reads.** The
sheet builds tasks 3 and 4 on that difference. The guard runs on
`UserPromptSubmit`, so it reads the text the participant sends and nothing
else. A file Claude opens with its Read tool, or with `cat`, never passes
through the guard. The `Read(.env)` rule covers those. Keep the two apart
in every sentence you say about predictions 2 and 3.

**What the participant was asked to produce.** A `/commit` skill copied
from `exercises/starters/commit-skill.md` (manual-only, with a
training-mode defense line; Claude copied the file from a tagged prompt,
so compare it with that starter, not with the sheet), a
`/changelog` skill that Claude wrote from the sheet's rule list with a
`description` the participant wrote by hand (auto-invocable,
description-driven, backed by a fetched spec file, and tested in task 2
with two plain-language requests: one that must start the skill, one
that must not), a cross-platform `UserPromptSubmit` guard that blocks a
prompt containing an ACME key (script created from a tagged prompt;
`settings.json` written by hand), and a `Read(.env)` deny rule added by
hand after the participant watched Claude read `.env` past the guard.
That Claude typed the copied and pasted files is not a finding; the sheet
asked for it.

## Skills-only stage — the two skills only

Read both SKILL.md files and `common-changelog-spec.md` from disk. Do
not ask for a prompt and do not ask for predictions: the participant has
not written them yet. In Step 0, ask one question instead, in one line,
and wait: *Which of your two test requests went wrong the first time, if
any, and which word did you change?* The sheet's task 2 step 4 asked them
to test the description with two requests. Then grade the description as
a trigger (see below) and compare your prediction with their answer.

Use the rubric rows **/commit skill** and **/changelog skill** only.
State the grade as *N of 2 dimensions sound*. Use *Establish ground
truth* steps 1 and 2 only, and the Known traps that are about the two
skills.

Do not grade, mention or explain anything of tasks 3 and 4. That means:
no guard, no `settings.json`, no rule, no predictions, nothing about what
a hook can or cannot see. Task 4 depends on the participant finding that
out by running it.

Header of the report: `## Exercise 3, after task 2 — two skills`. Last
line, in place of the retry offer: *Run `/verify-exercise 3` again at the
end of task 4. Then it grades the guard and the rule as well.*

## Rubric — replaces the Session 2 technique table

| Dimension | Passes when… |
| --- | --- |
| **/commit skill** | frontmatter has `name`, `description`, and `disable-model-invocation: true`; the body carries an "execute directly — no leading questions" line near the top; imperative-mood commit-message rules with examples; stages and commits each group in one command line (`git add … && git commit …`); explicit no-`git push` and no-co-author rules |
| **/changelog skill** | frontmatter has **no** `disable-model-invocation` (auto-invocability is the point); the `description` works as a trigger (see below); the body requires reading `common-changelog-spec.md` before editing, and that file exists with real spec content; the must-do behaviors are all present |
| **Guard wiring** | `settings.json` has a `UserPromptSubmit` entry (no matcher needed); the command runs a Python script (no bash/`jq`/`chmod` dependencies — participants are on Windows); the script reads JSON from stdin, tests the `prompt` field with the regex `acme_live_[A-Za-z0-9]{24}`, and prints the top-level `{"decision": "block", "reason": ...}` shape; it prints nothing for a clean prompt |
| **Read rule** | `settings.json` has `permissions.deny` containing `Read(.env)` (the forms `Read(./.env)` and `Read(**/.env)` pass too); it sits in the same file as the hook, both valid JSON |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: predictions before
evidence, one specific expected defect per ❌. In the full stage, state
the grade as *N of 4 dimensions sound*.

**Grading the description as a trigger** — do it the way the context
coach grades a rule: from the description text alone, *predict* one
moment where Claude would rightly invoke the skill and one moment
where it would fail to fire or would misfire. Then say which words
cause each. A description that says only what the skill does, never
*when it applies*, is the common defect. Then compare your prediction
with the participant's own test result from task 2: if their second
request ("summarise the last three commits") started the skill, name the
word that matched too widely.

## What full-marks artifacts contain

- Both invocation polarities correct: `/commit` locked to manual,
  `/changelog` open to the model. The most-copied mistake is pasting
  `disable-model-invocation: true` into both.
- The changelog skill's must-do behaviors: read-or-create
  `CHANGELOG.md` · read the spec file first · inspect recent commits
  and tags · add only NEW commits to Unreleased · four groups in order
  · imperative entries ending in a bracketed commit hash · **Breaking:**
  first inside its group · skip noise
- A guard script that runs on Windows and mac/linux alike, reads
  `prompt` (not `tool_input`), and stays silent on a clean prompt
- Exactly the honored JSON shape for this event — a **top-level**
  `decision` and `reason` — not the nested `hookSpecificOutput` shape
  that `PreToolUse` uses. **Highest-value, least-often-checked:** a
  guard can print something and still block nothing, because the shape
  is the one for another event.
- The rule next to the hook, in the same file: the participant closed
  the gap they saw in task 4 step 2, with the rule, not with a second
  hook

## Establish ground truth

1. Read both SKILL.md files fully. Check the frontmatter keys
   mechanically. Presence and absence are both findings here.
2. Open `common-changelog-spec.md`: is it actually the Common
   Changelog spec (group names, reference rules, version headings), or
   an empty stub? Then confirm the SKILL.md body points at it.
3. Read `.claude/settings.json` and the guard script. Then test the
   script with a fake event, **from a file, never inline**: a key typed
   on your own command line would sit in the transcript, and the
   participant's guard does not run on your tool calls anyway, so a
   file is the honest test. Write
   `{"prompt": "deploy with acme_live_7Hq2mX9vK4pL8sW1dR3nT6yB please"}`
   to `verify-event.json`, run
   `python .claude/hooks/guard-secrets.py < verify-event.json`
   (`python3` on mac/linux), confirm the top-level block shape, then
   overwrite the file with `{"prompt": "deploy please"}` and confirm
   silence. Delete `verify-event.json` afterwards. The `Read(.env)` rule
   applies to you too: do not try to open `.env`; the rule's presence in
   the file is the evidence.
4. Only then look at the rule: `permissions.deny` holds `Read(.env)`,
   and the file is still valid JSON after the hand edit (a missing comma
   between `permissions` and `hooks` is the usual break; Claude Code
   then loads neither).

## Known traps

- **`disable-model-invocation` on the changelog skill** — copied from
  `/commit` without thinking. The description can then never start it.
  The skill is dead while looking fully configured.
- **The nested shape on the wrong event** — `hookSpecificOutput` with
  `permissionDecision: "deny"` is the `PreToolUse` shape. On
  `UserPromptSubmit` only a top-level `decision: "block"` blocks. The
  guard then "works" in the terminal output and blocks nothing.
- **Reads `tool_input` instead of `prompt`** — a script copied from a
  tool hook. The prompt field is empty, the regex never matches, the
  guard is silent on everything.
- **A matcher on `UserPromptSubmit`** — harmless but a sign the entry
  was copied from a tool hook; say so once, do not fail it.
- **A bash script anyway** — `#!/bin/bash`, `jq`, `chmod`. It dies
  silently on the Windows machines this course runs on.
- **Description without a *when*** — "Updates CHANGELOG.md" describes;
  it does not trigger. Predict the misfire and say which words fix it.
  Do not write the sentence for them.
- **Spec file fetched but never referenced** from the skill body —
  dead weight the skill will never load
- **A second hook instead of the rule** — a `PreToolUse` hook on `Read`
  that denies `.env`. It works, and it is more code than the rule for
  the same effect; the sheet asked for the rule to show that a list is
  enough when the file is known. ⚠️, with the one-line rule shown.
- **Invalid JSON after the hand edit** — the rule and the hook are both
  gone, and Claude Code says nothing about it. The fake-event test still
  passes, because it runs the script directly. Check the file.
- **No written predictions** — the participant judged nothing before
  you did. There is nothing to arbitrate.

## Pass bar

Skills-only stage: the two lines about the skills only (polarity with
the execute-directly line, and the spec file). Full stage: all five.

- Invocation polarity correct on both skills, and the execute-directly
  line present in `/commit`
- The fake-event pipe test produces the top-level block shape on a
  prompt with a key and silence otherwise
- The spec file exists with real content and the changelog skill
  requires reading it
- `permissions.deny` holds `Read(.env)` and the file is valid JSON
- The three predictions exist, each marked confirmed or wrong

Partial is the expected first-attempt outcome. Usually one dead wire
(the JSON shape, the `prompt` field, or the comma) sits behind an
otherwise convincing setup. Show the exact line that breaks it and let
them fix it themselves.

## Close by arbitrating their predictions

Full stage only. In the skills-only stage there are no predictions yet.

They marked their predictions first; you close. Never the other way
around. For each of the three, say confirmed or wrong, and cite the
evidence (the message in the chat they named, or the file test you just
ran). Where their reasoning was right for the wrong mechanism, say so.
That distinction is the lesson. Their overrule of you stands. Record it
without arguing further.

## Held back — the task-3 prediction answers

The sheet defines where the guard runs, but never says which of the
three cases it blocks. The session 4 slides do show what the guard sees
and what the rule covers (decision 2026-10-28), so the predictions are
recall, and a wrong one is the lesson. The sheet itself still holds the
answers back. This check runs after the run, so the answers are recorded
here for arbitration:

- **The pasted log line is blocked** — the key is in the text the
  participant typed, the guard runs on that text, the regex matches.
- **Asking for the value in `.env` is not blocked** — the guard runs on
  the prompt, and the prompt holds no key. Claude reads the file with a
  tool; the guard never sees tool calls. That is the gap the rule
  closes in task 4 step 3.
- **`grep -r acme_live .` is not blocked by the guard** — same reason.
  After the rule it still gets through (bonus): a `Read` rule matches a
  command that names the file, and `grep -r` names none. Only the
  sandbox stops every process; that is slide material, not a task.

Use these only when grading. Never paste them into the sheet.
