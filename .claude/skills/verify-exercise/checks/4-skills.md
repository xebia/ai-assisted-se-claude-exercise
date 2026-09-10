# Exercise 4 — Two skills, a hook, and the changelog they produced

**Artifact:** four files in the participant's project folder, all in
gitignored paths — `.claude/skills/commit/SKILL.md`,
`.claude/skills/changelog/SKILL.md` (plus its
`common-changelog-spec.md` sibling), `.claude/hooks/run-changelog.py`
(in its repaired, compound-command form) with its entry in
`.claude/settings.json`, and the generated
`CHANGELOG.md` — plus one thing the participant wrote down by hand
during the session: their three task-3 hook predictions, marked
confirmed or wrong in task 4.

**This check runs in-session, at the end of task 4**, before the closing
round. The `session4-playground` branch is deleted after the closing
round; if the participant already did that, every artifact above lives
in a gitignored path and survives, but commit hashes cited in
`CHANGELOG.md` may no longer resolve. Grade the *presence and format* of
references, never whether they resolve.

**Under review: the artifacts, not a prompt.** This is a Session 4
exception to this skill's usual framing. In Step 0, instead of a
prompt, ask for one thing word for word: the three written task-3
predictions, with the participant's confirmed-or-wrong mark on each.
The sheet told them you would ask, so ask in one line and wait. If they
do not exist, that is itself a finding. A wrong prediction was a fine
outcome; a missing one is the stated failure mode. Then grade what you
can.

**The words this sheet uses.** Say them, not the trainer shorthand:

| Say this | Not this |
| --- | --- |
| your three predictions | the prediction set |
| you marked your predictions | your verdicts, verdict-first |
| the hook fired (your script ran) | the hook triggered |
| the script printed nothing | the hook did not fire, a no-op |
| the chain | the flow, the pipeline |
| the repaired script | the fixed matcher |

**Firing and printing are two different things**, and the sheet defines
them that way in task 4. The hook fires whenever Claude Code starts the
script after a Bash tool call. The script then decides whether it prints
anything. Never merge the two when you arbitrate prediction 1. A
participant who wrote "no" was wrong about firing, even though the
unrepaired script stayed silent. That difference is the lesson of task
4.

**What the participant was asked to produce.** A `/commit` skill pasted
from the sheet (manual-only, with a training-mode defense line; Claude
created the file from a tagged prompt with the printed content), a
`/changelog` skill that Claude wrote from the sheet's rule list with a
`description` the participant wrote by hand (auto-invocable,
description-driven, backed by a fetched spec file), a cross-platform
PostToolUse hook that nudges Claude toward `/changelog` after any
`git commit` (script created and later replaced from tagged prompts;
`settings.json` written by hand), and one real run of the whole chain
producing a Common Changelog–format `CHANGELOG.md`. The experiment
commit removed the `DELETE /api/books/{id}` endpoint. That Claude typed
the pasted files is not a finding; the sheet asked for it.

**The first run is silent by design.** The pasted `/commit` skill stages
and commits each group in one command line (`git add … && git commit
…`), so the unrepaired `startswith("git commit")` script prints nothing
on the first run, and `/commit` reports that to the participant with the
command line it ran. After the task-4 repair the same `/commit` finishes
the chain. Grade the repaired script; if the first run did finish the
chain anyway, name the reason (a `/commit` that ignored its one-line
rule, or Claude starting the skill on its own) as luck, not wiring.

## Rubric — replaces the Session 2 technique table

| Dimension | Passes when… |
| --- | --- |
| **/commit skill** | frontmatter has `name`, `description`, and `disable-model-invocation: true`; the body carries an "execute directly — no leading questions" line near the top; imperative-mood commit-message rules with examples; stages and commits each group in one command line (`git add … && git commit …`); explicit no-`git push`, no-co-author and no-other-skills rules; a last step that reports the command line and the hook's silence when `.claude/hooks/run-changelog.py` exists |
| **/changelog skill** | frontmatter has **no** `disable-model-invocation` (auto-invocability is the point); the `description` works as a trigger (see below); the body requires reading `common-changelog-spec.md` before editing, and that file exists with real spec content; the must-do behaviors are all present |
| **Hook wiring** | `settings.json` has a `PostToolUse` entry with matcher `Bash`; the command runs a Python script (no bash/`jq`/`chmod` dependencies — participants are on Windows); the script reads JSON from stdin, tests `tool_input.command` for `git commit`, and prints the nested `{"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": ...}}` shape; **after the task-4 repair** it also matches a `git commit` that follows `&&` or `;`, and its `additionalContext` tells Claude to invoke the skill now rather than suggesting it |
| **Changelog output** | `# Changelog` heading · `## Unreleased` section · groups in Changed/Added/Removed/Fixed order · imperative-verb entries · every entry ending with a commit hash in round brackets |

Grade each ✅ / ❌ / ⚠️ with the usual discipline: predictions before
evidence, one specific expected defect per ❌. State the grade as *N of
4 dimensions sound*.

**Grading the description as a trigger** — do it the way the context
coach grades a rule: from the description text alone, *predict* one
moment where Claude would rightly invoke the skill and one moment
where it would fail to fire or would misfire. Then say which words
cause each. A description that says only what the skill does, never
*when it applies*, is the common defect. Auto-invocation under it is
luck, and the hook is covering for it.

## What full-marks artifacts contain

- Both invocation polarities correct: `/commit` locked to manual,
  `/changelog` open to the model. The most-copied mistake is pasting
  `disable-model-invocation: true` into both.
- The changelog skill's must-do behaviors: read-or-create
  `CHANGELOG.md` · read the spec file first · inspect recent commits
  and tags · add only NEW commits to Unreleased · four groups in order
  · imperative entries ending in a bracketed commit hash · **Breaking:**
  first inside its group · skip noise
- A hook script that runs on Windows and mac/linux alike, and stays
  silent on non-commit commands
- The task-4 repair applied: the script splits the command on `&&` and
  `;` before matching, so `/commit`'s `git add ... && git commit ...`
  fires it. An unrepaired `startswith("git commit")` is a ❌ here — the
  participant skipped step 3 of task 4.
  A repaired matcher with a still-advisory `additionalContext` ("Run the
  /changelog skill") is a ⚠️: it fires, but Claude may only suggest.
- Exactly the honored JSON shape — nested `hookSpecificOutput` with
  `hookEventName` — not a top-level `additionalContext`, not a bare
  string. **Highest-value, least-often-checked:** a hook can "work" in
  the transcript while Claude never sees a word of it. Only the nested
  shape reaches Claude.
- A changelog whose test entry (the exercise removed delete
  functionality on purpose) sits under **Removed**, not the reflex
  group

## Establish ground truth

1. Read both SKILL.md files fully. Check the frontmatter keys
   mechanically. Presence and absence are both findings here.
2. Open `common-changelog-spec.md`: is it actually the Common
   Changelog spec (group names, reference rules, version headings), or
   an empty stub? Then confirm the SKILL.md body points at it.
3. Read `.claude/settings.json` and the hook script. Then test the
   script without a real commit, **from a file, never inline**: the
   participant's hook is active in this session too, and an inline
   `echo '... && git commit ...' | python ...` puts `git commit` on your
   own Bash command line, so the repaired script fires on its own test
   and tells you to run the changelog skill mid-report. Write
   `{"tool_input": {"command": "git add . && git commit -m x"}}` to
   `verify-event.json`, run
   `python .claude/hooks/run-changelog.py < verify-event.json`
   (`python3` on mac/linux), confirm the nested output shape, then
   overwrite the file with a `git status` command and confirm silence.
   Delete `verify-event.json` afterwards. If a changelog nudge reaches
   you anyway during this check, ignore it; you are grading, not
   committing.
4. Only then read `CHANGELOG.md` against the five format checks, and
   check which group the delete-removal landed in.

## Known traps

- **`disable-model-invocation` on the changelog skill** — copied from
  `/commit` without thinking. The hook's nudge can then never invoke
  it. The automation is dead while looking fully configured.
- **Top-level `additionalContext`** (or a bare echoed sentence) — the
  old shape. It goes to the transcript only; Claude never sees it. The
  flow may still have "worked" once because Claude noticed the commit
  on its own. Name that as luck, not wiring.
- **Wrong or missing `hookEventName`**, or output that is not valid
  JSON — same silent failure
- **A bash script anyway** — `#!/bin/bash`, `jq`, `chmod`. It dies
  silently on the Windows machines this course runs on.
- **Description without a *when*** — "Updates CHANGELOG.md" describes;
  it does not trigger. Predict the misfire and say which words fix it.
  Do not write the sentence for them.
- **Spec file fetched but never referenced** from the skill body —
  dead weight the skill will never load
- **Past-tense or noun-phrase entries, or entries with no reference**
  — the changelog skill's rules were too soft to catch it
- **The removal filed under Changed or Added** — categorization rules
  present but not followed, or absent
- **No written predictions** — the participant judged nothing before
  you did. There is nothing to arbitrate.
- **Got away with it** — a clean changelog above a weak skill body.
  Claude added discipline the skill never demanded. Say plainly this
  will not repeat.

## Pass bar

- Invocation polarity correct on both skills, and the execute-directly
  line present in `/commit`
- The fabricated-event pipe test produces the nested
  `hookSpecificOutput` shape on a commit command and silence otherwise
- The spec file exists with real content and the changelog skill
  requires reading it
- `CHANGELOG.md` passes at least four of the five format checks, with
  the removal under **Removed**
- The three predictions exist, each marked confirmed or wrong

Partial is the expected first-attempt outcome. Usually one dead wire
(the JSON shape or the polarity) sits behind an otherwise convincing
setup. Show the exact line that breaks it and let them fix it
themselves.

## Close by arbitrating their predictions

They marked their predictions first; you close. Never the other way
around. For each of the three, say confirmed or wrong, and cite the
evidence (the message in the chat they named, or the file test you just
ran). Where their reasoning was right for the wrong mechanism, say so.
That distinction is the lesson. Their overrule of you stands. Record it
without arguing further.

## Held back — the task-3 prediction answers

The sheet defines what "fires" means, but never says which of the
three cases fire. The run teaches that, and no pre-run material may
reveal it. This check runs after the run, so the answers are recorded
here for arbitration:

- **Typing `/commit` fires the hook** — the skill still executes
  `git commit` through the Bash tool, and PostToolUse watches the tool
  call, not who asked for it.
- **Claude's own-initiative commits fire it too** — same reason. The
  hook cannot tell user-driven from model-driven tool calls.
- **`git commit --amend` fires it** — the script tests a prefix
  (`startswith("git commit")`), and the amend command starts with it.

Use these only when grading. Never paste them into anything a
participant reads before their task-4 run.
