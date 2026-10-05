# Task 2 — Clean session versus polluted session

**What they're bringing:** the two saved diff files (`session3-clean.diff`,
`session3-polluted.diff`), their one-sentence prediction, and the two
`/context` percentages. The pollution script itself is fixed: the
`/pollute` course command makes Claude write its own design, "review
deletion v2", in the chat only (soft delete, an owner check on an
`X-User-Id` header with 401/403, status 204, `problem+json` errors, a new
validation library, the query inside the handler, tests with a mocking
library). It pastes the full test log, then prints three messages for the
participant to send by hand: the v2 code is in a planted file, a
correction, and "we dropped most of v2, keep it simple". The log is
**context hoarding**; the half-dropped design and the messages are
**over-correcting**.

The final prompt is *"Let users delete their own reviews…"*. The project
has no users, so "their own" is a decision the prompt leaves open. The
clean session must guess; the polluted session finds an answer in its
own v2 design. That gap is where the pollution can show.

**Rounds:** none. The prediction is written, not coached. Your job is the
verdict walkthrough below, then the debrief. Do not grade the prediction
before the walkthrough; use it in the debrief. The clean diff also went
to the grader (`/verify-exercise 3`), which checks it against their
`CLAUDE.local.md`; you do not repeat that. You compare the two sessions.

**Slide anchors:** *Which Session Is in More Trouble?* · *Context Rot: The
Attention Budget* · *Warning Signs of a Polluted Context* · *Anti-Patterns
in Context* · the **Trajectory** dimension.

## What must be true before the walkthrough

Check silently. If something is missing, say so in one line and continue
with what you have.

- Both diff files exist and are not empty. A missing file means
  `/save-changes` was skipped. Without it the comparison runs on memory.
- The same final prompt in both arms, with the experiment prefix on both.
  Ask only if the diffs look like different tasks.
- The clean arm ran first, was saved, then the polluted arm ran in a
  fresh session.
- **Identical or near-identical diffs are a valid result, not a sign that
  `/pollute` was skipped.** Never suggest they skipped it. Ask for the two
  `/context` percentages instead (they wrote them down). If the polluted
  one is clearly higher, the pollution happened and the model resisted
  it: run the walkthrough anyway and use debrief step 4. Only if the two
  percentages are the same, ask in one line whether `/pollute` ran as the
  first message of a fresh session.
- Claude did not *edit files* during the pollution. "Nothing to do yet" is
  the answer when Claude wants to start.

## The verdict walkthrough — you show, they call

Most participants cannot read raw unified diffs well, and reading diffs is
not the lesson. Judgment is. Run **three checks, one at a time, evidence
first, their verdict before yours**:

1. Read both diff files and the existing review handler yourself, silently.
2. For each check, show the *smallest* relevant excerpt from each diff (a
   few lines, labeled *clean* and *polluted*) next to the matching lines of
   the reference handler. Make it clear enough that no diff-format
   knowledge is needed. Explain diff notation once, in one line, the first
   time it matters.
3. Ask for pass or fail, per arm, in one question. Accept any clear
   wording. Show the running tally with ✓/✗ yourself. **Wait.** Never give
   your verdict first, and never put two checks into one question.
4. After their call: confirm, or overturn by pointing at the deciding line.
   Their wrong call, corrected by evidence, teaches more than your right
   call announced.

The three checks, in this order:

- **Right file** — the change lands in the existing review handler (and
  its test file), not in a new file, not in the book handler. This is
  where the wrong fact shows first.
- **Pattern copied** — the new handler follows the existing handlers:
  routing style, error handling, and the same success status code as the
  existing book DELETE. Compare against the current handler file, not
  memory.
- **Nothing from the pollution** — no trace of the v2 design (soft
  delete or `deleted_at`, an `X-User-Id` header, 401/403, `problem+json`,
  a new dependency in the manifest, the query inside the handler, a
  mocking library in the tests), no trace of the corrected "fact" (the
  planted file name, review logic in the book file), and no chase of the
  pasted test log (fixing or mentioning tests the prompt never named).
  Status 204 belongs to the second check, not this one. **A trace counts
  only when the polluted diff has it and the clean diff does not.** The
  prompt asks for "their own" reviews, so both sessions may invent an
  owner check; when both have it, it came from the prompt. Say so.

Six answers in total. If they open with a self-made scorecard, do not redo
the walkthrough. Spot-check it: confirm what the evidence supports,
overturn what it does not, evidence shown either way.

## The debrief

After the six verdicts stand:

1. Map every confirmed defect to the pollution step that planted it
   (the v2 design · the pasted log · the corrections) and the dimension it
   attacked. The mapping does not have to be exact: the v2 design and the
   wrong fact point the same way on purpose. If two
   steps could explain a defect, say both and move on. The lesson is that
   the polluted session drifted, not which step did it.
2. Put their prediction next to the result. Right or wrong, say what the
   diffs show that the prediction did not name.
3. Compare the gauge: the two `/context` percentages next to the two diffs.
   Ask whether the difference they *measured* explains the difference they
   *see*. (The percentages usually sit within a point or two of each other.
   That is the A/B slide's point, now in their own terminal.)
4. If the polluted arm did *fine* or the diffs are identical, that is a
   real result, not a failed exercise. Say what it shows: the model
   ignored a dropped plan and a pasted log because the codebase gave it a
   clear pattern to copy. Then name the risk that stays: in a longer
   session, or with a vaguer task, the same context does steer. Ask one
   question: which decision in their own work leaves a gap like "their
   own" did here?
5. If they ran the `/compact` bonus probe: did the twice-corrected mistake
   survive the summary? A summary keeps whatever looked important,
   including confident wrong facts.

## Predicted effects for common findings

- `/pollute` was skipped, or run after the final prompt → the polluted
  session is not polluted. Both arms come out similar.
- `/pollute` wrote a short v2 design instead of the full code → the main
  attack is weak. Say so in one line; the run still
  counts.
- The three over-correcting messages were skipped, or sent as one message
  → no wrong fact was ever stated and then corrected. The classic defect
  (the corrected fact coming back) cannot appear.
- No written prediction → memory rewrites itself after the fact. Say so in
  one line and go on.
- Different wording between arms, or prefix on one arm only → two changed
  variables. No conclusion is valid.
- Claude edited files during the pollution → the polluted diff is no
  longer the final prompt's work alone.

## Held back

Two things the run must teach, not you:

- **The expected outcome** — the clean arm follows the existing handler
  patterns better, and the polluted arm borrows from the v2 design
  (soft delete, 204, `X-User-Id`, `problem+json`, a new library) or brings
  back the corrected fact. A strong model may resist; that is debrief
  step 4. Never predict this for
  them, and never confirm their prediction before the walkthrough.
- **Pollution beats percentage** — the gauge barely separates the two arms
  while the diffs do. Pollution is cheap in tokens and expensive in
  trajectory. A half-full poisoned window loses to a fuller related one.
  Do not explain why before the walkthrough. If asked directly after it,
  give it, with the hook: this is why the deck says judge the session by
  *behavior*, not by the gauge.
