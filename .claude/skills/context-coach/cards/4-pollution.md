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
  guess; "the polluted one will get the routing style wrong / resurrect the
  corrected fact" is a prediction that can lose.
- **All three anti-patterns represented** — one unrelated task (kitchen
  sink), one pasted dump with no question (context hoarding), one wrong
  "fact" stated and then corrected twice (over-correcting). Each step exists
  to attack a *named* dimension; a step they can't assign a dimension to is
  decoration. The exercise sheet offers a worked plan to steal — a copied
  plan is a valid plan (execution shows the failure modes either way), so
  grade it on the same criteria; if they swapped in their own wrong "fact",
  say why that's the better version.
- **A controlled comparison** — the participant runs *both arms themselves*:
  one polluted session, one clean. Identical final request in both arms,
  pasted verbatim (retyping introduces a second variable), identical
  experiment prefix. The window is the only intended difference.
- **Concrete comparison criteria** — the final request is full contact: both
  arms implement the endpoint, and the two banked diffs get ✓/✗ verdicts
  per arm on five checks against the existing review handler: right file,
  pattern copied, status code, test convention, no resurrection of the
  corrected "fact". The verdicts are *theirs* — delivered in the
  walkthrough below, or self-scored in their editor if they're diff-fluent.
  "Which diff feels better" cannot lose, so it cannot teach.
- **Gauge reading in both arms** — `/context` percentage noted before the
  final prompt in each arm, so the debrief can confront percentage with
  behavior.

**Not applicable:**

- **Earns its tokens / freeloader test** — no context file under review.
- **Prompt quality** — both arms get the same words on purpose; improving
  the prompt here would destroy the control. If they polish it, that's
  Block 2 reflexes firing in the wrong block — say so warmly.

## Nudge bank

- "Is the session your script builds more like Session A or Session B from
  the vote? Which step makes the difference?"
- "Which dimension does each of your pollution steps attack? If two steps
  attack the same one, what's missing?"
- "What result would prove your prediction *wrong*? If nothing could, it's
  not a prediction yet."
- "Your criteria — could someone else apply them to both diffs and reach
  your verdict without you in the room?"

## Predicted effects for common findings

- Pollution is all on-topic questions about the codebase → both arms come
  out similar; the experiment "fails" — coherent context degrades far more
  gently than distractors do. *Held back — see below.*
- Kitchen-sink step asks a one-line trivia question → barely any tokens,
  barely any drift; the step exists but doesn't pull. Long unrelated
  *output* is what fills the window — that's why the worked plan asks for
  full recipes, not recipe names.
- No written prediction → hindsight rewrites itself; the debrief grades
  nothing
- Different wording between arms, retyped instead of pasted, or prefix on
  one arm only → two changed variables; no conclusion survives
- Diffs not banked before the reset (`/bank-diff` skipped, raw `git
  checkout` run instead) → the comparison runs on memory and vibes;
  nothing convicts
- Vibes-only criteria → both arms declared "fine"; nothing learned

## The verdict walkthrough — you show, they call

Most participants can't read raw unified diffs fluently, and diff literacy
is not the lesson — judgment is. So when they hand over the two diff files,
run the five checks **one at a time, evidence first, their verdict before
yours**:

1. Read both diff files and the existing review handler yourself, silently.
2. For each check — right file · pattern copied · status code · test
   convention · resurrected "fact"/log-dump chase — show the *minimal*
   relevant excerpt from each diff (a few lines, labeled by arm) next to
   the corresponding lines of the reference handler, plainly enough that
   no diff-format knowledge is needed. Explain diff notation once, in one
   line, the first time it matters.
3. Ask for their ✓/✗ per arm. **Wait.** Never volunteer your verdict first,
   and never batch multiple checks into one question.
4. After their call: confirm, or overturn by pointing at the decisive line.
   Their wrong call corrected by evidence teaches more than your right call
   announced.

If they open with a self-made scorecard instead, don't redo the walkthrough
— spot-check it: confirm what the evidence supports, overturn what it
doesn't, evidence on the table either way.

## During the debrief

After the ten verdicts stand, map every confirmed defect to the pollution
step that planted it and the dimension it attacked. Then confront the
gauge: put the two `/context` percentages next to the two diffs and ask
whether the difference they *measured* explains the difference they *see*.
(The percentages usually sit within a point or two of each other — that's
the A/B slide's punchline landing in their own terminal.) If the polluted
arm did *fine*, treat it exactly like a got-away-with-it in Block 2: name
luck as luck, point at which pollution step was weakest, and offer the
sharper re-run. If they ran the `/compact` bonus probe: did the
twice-corrected mistake survive the summary?
Lossy summarization keeps whatever looked load-bearing — including confident
wrongness.

## Greenlight bar

All five load-bearing items in the plan. Spend rounds on the prediction and
the criteria — the script itself is usually fine.

## Held back

Two things the run must teach, not you:

- **The expected outcome** — the clean arm tracks the existing handler
  patterns better, and the polluted arm's defects trace to specific steps
  (the corrected fact resurfacing is the classic). Never predict this for
  them, and never confirm their prediction before the run.
- **Pollution beats percentage** — that the gauge barely separates the two
  arms while the diffs do: pollution is cheap in tokens and expensive in
  trajectory, and a lightly-filled poisoned window loses to a fuller
  coherent one. If their script is all on-topic questions, nudge with the
  Session A/B question above; don't explain why. If asked directly after
  the run, give it, with the hook: this is why the deck says judge the
  session by *behavior*, not the gauge.
