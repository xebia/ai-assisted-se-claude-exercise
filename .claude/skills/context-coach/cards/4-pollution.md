# Task 4 — Poison one session, keep one clean

**What they're refining:** their written prediction, coached *before* they
run the experiment. The pollution script itself is fixed: the `/pollute`
course command runs the kitchen-sink and context-hoarding steps, then
prints the three over-correcting messages for the participant to send by
hand. Afterwards, the verdict walkthrough and debrief work from the two
saved diff files (`session3-polluted.diff`, `session3-clean.diff`).

**Slide anchors:** *Which Session Is in More Trouble?* · *Context Rot: The
Attention Budget* · *Warning Signs of a Polluted Context* · *Anti-Patterns
in Context* · the **Trajectory** dimension.

## Concept applicability

**Load-bearing (4):**

- **Prediction first, in writing** — which arm produces the better endpoint,
  and *what specifically* will differ. "The clean one will be better" is a
  guess. "The polluted one will get the routing style wrong / bring back
  the corrected fact" is a prediction that can be wrong.
- **Each pollution step has a named target** — `/pollute` runs three
  anti-patterns: one unrelated task with long output (kitchen sink), one
  pasted dump with no question (context hoarding), one wrong "fact" stated
  and then corrected twice (over-correcting; the participant sends these
  three messages). The sheet lists the steps. Ask which dimension each
  step attacks. A step they cannot assign to a dimension, they have not
  understood yet; that is the one to nudge on.
- **A controlled comparison** — the participant runs *both arms themselves*,
  one after the other: the clean session first, saved and reset, then the
  polluted session. Never two sessions editing at once. Identical final
  request in both arms, pasted verbatim (retyping adds a second variable),
  identical experiment prefix. The window is the only intended difference.
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
  Session 2 habit in the wrong session. Say so, kindly.

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

- `/pollute` was skipped, or run after the final prompt → the polluted
  session is not polluted. Both arms come out similar and the experiment
  "fails". Ask for the order of what they ran.
- The three over-correcting messages were skipped, or sent as one message
  → no wrong fact was ever stated and then corrected. The Trajectory step
  is missing. The classic defect (the corrected fact coming back) cannot
  appear.
- No written prediction → memory rewrites itself after the fact. The
  debrief grades nothing.
- Different wording between arms, retyped instead of pasted, or prefix on
  one arm only → two changed variables. No conclusion is valid.
- Diffs not saved before the reset (`/save-changes` skipped, raw `git
  checkout` run instead) → the comparison runs on memory and feelings.
  Nothing can be proven.
- Claude *edited files* during the pollution (after the wrong fact) → the
  polluted diff is no longer the final prompt's work alone. Pollution must
  stay chat-only. "Nothing to do yet" is the answer when Claude wants to
  start.
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
*fine*, treat it exactly like a lucky run in Session 2: say it was luck, point
at which pollution step was weakest, and offer the sharper re-run. If they
ran the `/compact` bonus probe: did the twice-corrected mistake survive the
summary? A summary keeps whatever looked important, including confident
wrong facts.

## Greenlight bar

A prediction that can be wrong, and a dimension named for each of the
three steps. Spend the rounds on the prediction. The script is fixed.

## Held back

Two things the run must teach, not you:

- **The expected outcome** — the clean arm follows the existing handler
  patterns better, and the polluted arm's defects trace to specific steps
  (the corrected fact coming back is the classic). Never predict this for
  them, and never confirm their prediction before the run.
- **Pollution beats percentage** — the gauge barely separates the two arms
  while the diffs do. Pollution is cheap in tokens and expensive in
  trajectory. A half-full poisoned window loses to a fuller related one.
  Do not explain why before the run. If asked directly after the run, give
  it, with the hook: this is why the deck says judge the session by
  *behavior*, not by the gauge.
