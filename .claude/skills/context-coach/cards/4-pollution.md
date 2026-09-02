# Task 4 — Poison one session, keep one clean

**What they're refining:** their experiment plan — the pollution script, the
written prediction, and the comparison criteria — coached *before* they run
it. Afterwards, the verdict walkthrough and debrief work from the two
banked diff files (`block3-polluted.diff`, `block3-clean.diff`).

**Slide anchors:** *Which Session Is in More Trouble?* · *Context Rot: The
Attention Budget* · *Warning Signs of a Polluted Context* · *Anti-Patterns
in Context* · the **Trajectory** dimension.

## Concept applicability

**Load-bearing (5):**

- **Prediction first, in writing** — which arm produces the better endpoint,
  and *what specifically* will differ. "The clean one will be better" is a
  guess. "The polluted one will get the routing style wrong / bring back
  the corrected fact" is a prediction that can be wrong.
- **All three anti-patterns represented** — one unrelated task (kitchen
  sink), one pasted dump with no question (context hoarding), one wrong
  "fact" stated and then corrected twice (over-correcting). Each step
  exists to attack a *named* dimension. A step they cannot assign to a
  dimension is decoration. The exercise sheet offers a worked plan to copy.
  A copied plan is a valid plan (running it shows the failure modes either
  way), so grade it on the same criteria. If they swapped in their own
  wrong "fact", say why that is the better version.
- **A controlled comparison** — the participant runs *both arms themselves*:
  one polluted session, one clean. The exercise orders them clean-first, so
  the pollution steps overlap with the clean arm's build time. That is fine,
  because pollution is chat-only. Identical final request in both arms,
  pasted verbatim (retyping adds a second variable), identical experiment
  prefix. The window is the only intended difference.
- **Concrete comparison criteria** — both arms implement the endpoint, and
  the two banked diffs get pass/fail verdicts per arm on five checks against
  the existing review handler: right file, pattern copied, status code, test
  convention, no return of the corrected "fact". The verdicts are *theirs*,
  given in the walkthrough below, or self-scored in their editor if they
  read diffs well. "Which diff feels better" cannot be wrong, so it cannot
  teach.
- **Gauge reading in both arms** — `/context` percentage noted before the
  final prompt in each arm, so the debrief can compare percentage with
  behavior.

**Not applicable:**

- **Earns its tokens / freeloader test** — no context file under review.
- **Prompt quality** — both arms get the same words on purpose. Improving
  the prompt here would break the control. If they polish it, that is a
  Block 2 habit in the wrong block. Say so, kindly.

## Nudge bank

- "Is the session your script builds more like Session A or Session B from
  the vote? Which step makes the difference?"
- "Which dimension does each of your pollution steps attack? If two steps
  attack the same one, what is missing?"
- "What result would prove your prediction *wrong*? If nothing could, it is
  not a prediction yet."
- "Could someone else apply your criteria to both diffs and reach your
  verdict without you in the room?"

## Predicted effects for common findings

- Pollution is all on-topic questions about the codebase → both arms come
  out similar, and the experiment "fails". Related context degrades much
  more slowly than unrelated content. *Held back — see below.*
- Kitchen-sink step asks a one-line trivia question → almost no tokens,
  almost no drift. The step exists but does almost nothing. Long unrelated
  *output* is what fills the window. That is why the worked plan asks for
  full recipes, not recipe names.
- No written prediction → memory rewrites itself after the fact. The
  debrief grades nothing.
- Different wording between arms, retyped instead of pasted, or prefix on
  one arm only → two changed variables. No conclusion is valid.
- Diffs not banked before the reset (`/bank-diff` skipped, raw `git
  checkout` run instead) → the comparison runs on memory and feelings.
  Nothing can be proven.
- Pollution steps that make Claude *edit files* → the plan is broken two
  ways. The clean arm may be implementing in the same tree at that moment,
  and the polluted diff is no longer the final prompt's work alone.
  Pollution must stay chat-only. "Nothing to do yet" is part of the script.
- Criteria based on feeling → both arms declared "fine". Nothing learned.

## The verdict walkthrough — you show, they call

Most participants cannot read raw unified diffs well, and reading diffs is
not the lesson. Judgment is. So when they hand over the two diff files, run
the five checks **one at a time, evidence first, their verdict before
yours**:

1. Read both diff files and the existing review handler yourself, silently.
2. For each check — right file · pattern copied · status code · test
   convention · returned "fact" / log-dump chase — show the *smallest*
   relevant excerpt from each diff (a few lines, labeled by arm) next to
   the matching lines of the reference handler. Make it clear enough that
   no diff-format knowledge is needed. Explain diff notation once, in one
   line, the first time it matters.
3. Ask for pass or fail, per arm. Accept any clear wording (people cannot
   type ✓/✗; you show the running tally with those marks yourself).
   **Wait.** Never give your verdict first, and never put several checks
   into one question.
4. After their call: confirm, or overturn by pointing at the deciding line.
   Their wrong call, corrected by evidence, teaches more than your right
   call announced.

If they open with a self-made scorecard instead, do not redo the
walkthrough. Spot-check it: confirm what the evidence supports, overturn
what it does not, evidence shown either way.

## During the debrief

After the ten verdicts stand, map every confirmed defect to the pollution
step that planted it and the dimension it attacked. Then compare the gauge:
put the two `/context` percentages next to the two diffs and ask whether
the difference they *measured* explains the difference they *see*. (The
percentages usually sit within a point or two of each other. That is the
A/B slide's point, now in their own terminal.) If the polluted arm did
*fine*, treat it exactly like a lucky run in Block 2: say it was luck, point
at which pollution step was weakest, and offer the sharper re-run. If they
ran the `/compact` bonus probe: did the twice-corrected mistake survive the
summary? A summary keeps whatever looked important, including confident
wrong facts.

## Greenlight bar

All five load-bearing items in the plan. Spend rounds on the prediction and
the criteria. The script itself is usually fine.

## Held back

Two things the run must teach, not you:

- **The expected outcome** — the clean arm follows the existing handler
  patterns better, and the polluted arm's defects trace to specific steps
  (the corrected fact coming back is the classic). Never predict this for
  them, and never confirm their prediction before the run.
- **Pollution beats percentage** — the gauge barely separates the two arms
  while the diffs do. Pollution is cheap in tokens and expensive in
  trajectory. A half-full poisoned window loses to a fuller related one. If
  their script is all on-topic questions, nudge with the Session A/B
  question above. Do not explain why. If asked directly after the run, give
  it, with the hook: this is why the deck says judge the session by
  *behavior*, not by the gauge.
