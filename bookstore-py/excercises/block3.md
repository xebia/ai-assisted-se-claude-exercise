# Exercise 3: The Context Is the Deliverable

**Block**: 3 — Context Engineering **Duration**: 30 minutes
**Project**: Same BookStore API.

**Goal**: Practice controlling *what reaches the model* — and proving the
effect. Prompt craft was Block 2; today the wording stays fixed wherever
possible and the **context** does the work: a pruned `CLAUDE.local.md`, a
bait run it must survive, and a deliberately poisoned session. Everything maps to
the four dimensions — **Correctness, Completeness, Size, Trajectory**.

## How this exercise works

Where Block 2 had `/prompt-coach`, this block has `/context-coach <task
number>`: show it your draft context file, rule file, or experiment plan and
it grades against the Block 3 concepts, predicts what each weakness will
cost, and nudges you with one question at a time. It never writes a line for
you.

You run everything yourself — no clean-room dispatch this time, because the
*session* is the experiment. Experiments must not be steered by training
mode's leading questions, so prefix every experiment prompt marked below
with exactly:

> `[Exercise 3 experiment — execute directly, no leading questions.]`

Both arms of a comparison get the prefix, or the comparison is invalid.

**Note**: `CLAUDE.md` keeps this project in training mode — and today it is
also **load-bearing course infrastructure: never edit it**. Your project
facts go in `CLAUDE.local.md` (task 2 explains why that works). Stuck or
short on time? Say *"just tell me"*.

## Tasks

1. **Baseline: read your window** (2 min) — fresh session, run `/context`
   before typing anything. Note what's already spent — system, tools,
   `CLAUDE.md` — before your first message. Compare with your neighbor. No
   coaching: this is a reading, not a deliverable. Keep the number; task 4
   will make you cite it.

2. **`/init`, then earn every token** (11 min) — run `/init` and let it
   draft. Then the real work (*Start with `/init`, then refine by hand*):
   - **Grade every generated line** with the test from *Which CLAUDE.md Line
     Earns Its Tokens?*: what would Claude do differently because this line
     exists? No answer → delete it. Expect casualties.
   - **Add what only a human knows** (*What Goes in CLAUDE.md*). Encode
     these three decisions as rules, in your own words, specific and
     checkable — prohibitions beat vague guidance: handlers validate input
     before calling the store · every new endpoint ships with tests in this
     project's test convention (open an existing test in
     `tests/handler/` first) · no new external dependencies.
   - **Verify, don't trust:** run the test command your file claims, as
     written. `/init` guessed; you check.
   - **Save as `CLAUDE.local.md`, never `CLAUDE.md`** — and if `/init`
     rewrote `CLAUDE.md`, restore it: `git checkout -- CLAUDE.md`. Why your
     file still loads: *The CLAUDE.md Hierarchy* — both merge, and training
     mode survives for the rest of the course.
   - Draft → `/context-coach 2` → revise → save.
   - Open question for the wrap: a line that's true but useless hurts which
     dimension? A line that's specific but *wrong*?

3. **The bait run** (7 min) — Block 2's vague prompt, unimproved, on
   purpose. Fresh session, send verbatim (with the experiment prefix):
   _"Add caching to the BookStore API"_
   In Block 2 you'd fix that prompt. Today you don't — the prompt stays weak
   so your context files do the work. Watch: does it pull in a dependency?
   Cache the right layer? Keep validation intact? Write tests in the project's
   unittest convention?
   Every rule that held earned its tokens; every rule that failed, note the
   exact wording that was too soft to convict.
   - **Payoff:** run `/verify-exercise 2` — it grades your context files
     against the bait diff, prediction by prediction. Behind on time? It
     works standalone; run it after the session.
   - Don't keep the bait changes: `git checkout .` once verified.
   - While Claude works, don't watch it type — write your task 4
     prediction instead.

4. **Build a polluted session — on purpose** (8 min) — recreate Session B
   from *Which Session Is in More Trouble?*. Work it as a pair: **one of
   you pollutes, the other stays clean** — same final question, then
   compare across screens.
   - **Both of you, predict first, in writing:** which arm gives the better
     answer, and what *specifically* will differ? Optional sanity check:
     `/context-coach 4` on your plan.
   - **Polluted arm** — fresh session, all three anti-patterns: *kitchen
     sink* — ask something entirely unrelated to BookStore; *context
     hoarding* — paste 100+ lines of `python3 -m unittest -v` output with no
     question, "just so you have it"; *over-correcting* — state a wrong
     "fact" about the codebase (name the wrong file for reviews, say), let
     Claude build on it, then correct yourself. Twice.
   - **Clean arm** — fresh session, nothing else at all.
   - Both run `/context` and note the %. Then both ask, pasted verbatim
     (prefix!):
     _"Which file and functions change to add a DELETE /reviews/{id}
     endpoint, what status code should success return, and which existing
     handler is the pattern to copy?"_
     An answer, not an implementation — nothing to revert, and a
     resurrected wrong "fact" has nowhere to hide in prose.
   - **Compare against `bookstore/handler/review.py`**, not against taste:
     are the named files, functions, and status code right? Did the
     polluted arm resurrect the corrected fact, or chase something from
     the log dump? At what gauge % did each arm sit when it answered?
   - Debrief with the coach: map every defect to the pollution step that
     planted it and the dimension it attacked — then ask yourselves: what
     would the polluted arm have *built* if you'd let it code?

5. **Wrap** (2 min) — answer task 2's open question with your pair. Then
   name the one `CLAUDE.local.md` line that earned the most in the bait run
   — and the one that turned out to be a freeloader after all.

## Bonus (only if time remains)

- **`/compact` vs `/clear`** — back in (a recreation of) the polluted
  session, run `/compact` and re-ask the DELETE prompt. Does summarizing
  rescue it — or does the twice-corrected mistake survive the summary?
  Worth knowing before the quiz.
- **Scope one rule to its layer** — your handler-validation rule only
  matters when handler code is on the table (*Rule Discovery: With or
  Without Paths*). Move it into `.claude/rules/handlers.md` with
  `description:` and `paths: "bookstore/handler/**/*.py"` frontmatter —
  moved out of `CLAUDE.local.md`, not copied. Then **prove the scoping
  works**, negative half first: fresh session touching store code → rule
  absent; fresh session changing a handler → rule loads. Coach available:
  `/context-coach 3`. This is *Progressive Disclosure* in miniature — and
  it pairs well with tonight's CLAUDE.md homework.
- **Full-contact A/B** — run both arms yourself, as *implementations*: ask
  each to actually build the DELETE endpoint with tests, and compare the
  diffs against `bookstore/handler/review.py`. Revert with `git checkout .` after.
- **README-per-folder** (*Documentation for AI-Friendly Codebases*) — draft
  the "why" README for one package, then ask a fresh session what the
  package is for — with and without the file in place.

## Pair Discussion (5 min)

How many `/init` lines survived the freeloader test? Which rule was
worded too softly to convict — and what did it cost in the bait run?
Which pollution step did the real damage, and did your written
prediction survive contact? Choose **one take-away** to present to the
group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
