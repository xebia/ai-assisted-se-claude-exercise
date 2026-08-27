# Task 4 — Build a polluted session, on purpose

**What they're refining:** their experiment plan — the pollution script, the
written prediction, and the comparison criteria — coached *before* they run
it. Afterwards, the debrief maps what happened back to the plan.

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
  decoration.
- **A controlled comparison** — the arms are split across the pair: one
  partner pollutes, the other stays clean. Identical final request in both
  arms, pasted verbatim (retyping introduces a second variable), identical
  experiment prefix. The window is the only intended difference.
- **Concrete comparison criteria** — the final request asks for a committed
  answer, not an implementation: named file and functions, a status code, a
  pattern handler to copy. Each is checkable against the existing handler
  file. "Which answer feels better" cannot lose, so it cannot teach.
- **Gauge reading in both arms** — `/context` percentage noted, so the
  debrief can confront percentage with behavior.

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
- "Your criteria — could someone else apply them to both outputs and reach
  your verdict without you in the room?"

## Predicted effects for common findings

- Pollution is all on-topic questions about the codebase → both arms come
  out similar; the experiment "fails" — coherent context degrades far more
  gently than distractors do. *Held back — see below.*
- No written prediction → hindsight rewrites itself; the debrief grades
  nothing
- Different wording between arms, retyped instead of pasted, or prefix on
  one arm only → two changed variables; no conclusion survives
- Vibes-only criteria → both arms declared "fine"; nothing learned

## During the debrief

Map every observed defect to the pollution step that planted it and the
dimension it attacked. Confront the gauge: what % was the polluted arm at?
(Usually nowhere near full — that's the A/B slide's punchline landing in
their own terminal.) If the polluted arm did *fine*, treat it exactly like a
got-away-with-it in Block 2: name luck as luck, point at which pollution
step was weakest, and offer the sharper re-run. If the pair ran the
full-contact bonus (both arms as implementations), the same mapping applies
to the diffs. If they ran `/compact` as the bonus suggests: did the
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
- **Pollution beats percentage** — that a 30%-full poisoned window loses to
  a fuller coherent one. If their script is all on-topic questions, nudge
  with the Session A/B question above; don't explain why. If asked directly
  after the run, give it, with the hook: this is why the deck says judge the
  session by *behavior*, not the gauge.
