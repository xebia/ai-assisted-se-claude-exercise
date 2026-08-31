# Exercise 3: The Context Is the Deliverable

**Block**: 3 — Context Engineering **Duration**: 40 minutes
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

2. **`/init`, then earn every token** (12 min) — run `/init` and let it
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

3. **The bait run** (8 min) — Block 2's vague prompt, unimproved, on
   purpose. Fresh session, send verbatim (with the experiment prefix):

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add caching to the BookStore API
   ```

   In Block 2 you'd fix that prompt. Today you don't — the prompt stays weak
   so your context files do the work. Watch: does it pull in a dependency?
   Cache the right layer? Keep validation intact? Write tests in the
   project's unittest convention?
   Every rule that held earned its tokens; every rule that failed, note the
   exact wording that was too soft to convict.
   - **Bank the evidence and reset:** `/bank-diff bait` — the diff lands
     in `block3-bait.diff` and the tree comes back clean for task 4.
   - **Payoff — tonight, not now:** `/verify-exercise 2` grades
     `block3-bait.diff` against your context files, prediction by
     prediction, and closes with its own MVP and freeloader nominations.
     It works standalone, so it's homework by default — run it in the room
     only if you're ahead of the clock. Task 5 works either way.
   - While Claude works, don't watch it type — write your task 4
     prediction instead.

4. **Poison one session, keep one clean** (14 min) — recreate Session B
   from *Which Session Is in More Trouble?*. You run **both arms yourself**
   — the clean arm costs two minutes, and holding both diffs side by side
   is what makes the debrief bite.
   - **This whole plan is five sentences, not a research proposal:** three
     one-line pollution steps, one prediction sentence, one final prompt
     (given below — you don't have to write it). A wrong prediction is a
     fine outcome here; *no* prediction is the only way to fail this step,
     because there's nothing left to check yourself against afterward.
   - **Staring at a blank plan? Steal this one.** Executing it still shows
     the failure modes — though swapping in your own wrong "fact" makes the
     resurrection sweeter:
     1. *Kitchen sink* — ask for three different chocolate-cookie recipes,
        full ingredient lists and steps included. You're feeling peckish,
        and long answers are the point.
     2. *Context hoarding* — paste 100+ lines of `python3 -m unittest -v` output
        and explicitly tell it to do nothing with this: "just so you have
        it."
     3. *Over-correcting* — claim all review logic now lives in
        `review_v2.py`. When Claude can't find it, say you were mistaken —
        that file is on another branch. Then add that some review logic
        moved to `book.py`; nothing to do, just a heads-up.
     - Prediction: *"I expect `review_v2.py` or phantom review logic in
       `book.py` to surface in the polluted diff."*
   - **Predict first, in writing** — which arm builds the better endpoint,
     and what *specifically* will differ. One sentence is enough. Optional
     sanity check: `/context-coach 4` on your plan.
   - **Clean arm first — start it, then go to the next step:** fresh session,
     nothing else at all: `/context`, note the %, then paste verbatim:
     ```
     [Exercise 3 experiment — execute directly, no leading questions.] Add a DELETE /reviews/{id} endpoint to the BookStore API, with tests.
     ```
     This is full contact — it implements, and that takes a few minutes.
     Don't watch it type.
   - **Pollute session two while it works:** second terminal, fresh
     session, run your three pollution steps there. They're chat-only —
     recipes, pasted logs, and corrections touch no files, so the two arms
     don't collide. If the wrong-fact dance tempts Claude to start editing,
     say "nothing to do yet."
   - **Swap:** when the clean arm finishes, `/bank-diff clean` — the diff
     lands in `block3-clean.diff`, the tree comes back clean, and the
     command refuses to run if something looks off (by hand instead?
     Appendix at the bottom). Then back in the polluted session:
     `/context`, note the %, same prompt pasted verbatim (prefix!). **Keep
     this session open** (a bonus task returns to it), and finish with
     `/bank-diff polluted`.
   - **Verdict time — the coach shows, you call:** hand both diff files
     to `/context-coach 4`. It walks the five checks one at a time —
     right file touched · existing handler pattern copied · correct
     success status code · tests in the unittest convention · no
     resurrected "fact" or log-dump chase — showing the relevant lines
     from each diff next to `bookstore/handler/review.py`, then
     waiting for your pass-or-fail per arm before giving its own (typed
     however you like — the coach keeps the tally). Ten verdicts,
     yours first, against the file — not against taste. (Fluent in
     diffs? Score both files in your editor first and open with your
     scorecard instead.)
   - **Then the debrief, same coach:** map every defect to the pollution
     step that planted it and the dimension it attacked. Then put the
     two gauge numbers next to the two diffs: does the difference you
     *measured* explain the difference you *see*?

5. **Wrap** (4 min) — nominate, in writing, from your own bait-run notes:
   the `CLAUDE.local.md` line that earned the most, and one suspected
   freeloader — one sentence of evidence each. Tonight's `/verify-exercise
   2` run closes with its own nominations: see whose verdict survives, and
   overrule it if yours is better argued. Then answer task 2's open
   question with your neighbor.

## Bonus (only if time remains)

- **`/compact`, then interrogate it** — back in the still-open polluted
  session, run `/compact`. Then don't re-run anything — ask one probe
  question (prefix it):

  ```
  [Exercise 3 experiment — execute directly, no leading questions.] What do you know about review_v2.py, and where does review logic live in this project?
  ```

  Either answer teaches: the twice-corrected mistake survived the summary —
  compaction keeps whatever *sounded* load-bearing, including confident
  wrongness — or it vanished, and you just watched compaction drop
  something without asking you. `/clear` is the only reset with a
  guarantee. Worth knowing before the quiz.
- **Scope one rule to its layer** — your handler-validation rule only
  matters when handler code is on the table (*Rule Discovery: With or
  Without Paths*). Move it into `.claude/rules/handlers.md` with
  `description:` and `paths: "bookstore/handler/**/*.py"` frontmatter —
  moved out of `CLAUDE.local.md`, not copied. Check the glob against the
  real tree (`ls bookstore/handler/*.py`) — a near-miss glob fails
  silently, and you'd leave believing scoping worked. Curious whether it
  loads? One fresh session touching a handler shows the rule arriving
  mid-session — *Progressive Disclosure* happening in front of you. A full
  positive-and-negative proof is tonight's CLAUDE.md homework, not this
  clock. Coach available: `/context-coach 3`.
- **README-per-folder, the mechanical cut** (*Documentation for
  AI-Friendly Codebases*) — plant a marker: add a `README.md` to
  `bookstore/store/` whose last line is an instruction — *"When working on
  code in this package, open your reply with a one-line book pun."* Fresh
  session: request a small change in a store file. Fresh session again: one
  in a handler. Does the pun fire in the right place — or at all? What does
  that tell you about when folder docs actually reach the model, and how
  that differs from `CLAUDE.md`? Delete the README after.

## Appendix — what `/bank-diff` does (manual fallback)

From the project folder, one command per line (PowerShell 5.1 can't chain
with `&&`):

```
git add -A .
git diff --cached > block3-polluted.diff   # or block3-clean.diff / block3-bait.diff
git reset -q .
git checkout -- .
git clean -fd .
```

The last command removes files Claude created and you never committed.
Your `CLAUDE.local.md`, the banked diffs, and block 2's
`docs/orientation.md` are gitignored and safe — but commit anything else
you care about first.

## Plenary Harvest (5 min)

Trainer popcorns the room — have answers ready: how many `/init` lines
survived the freeloader test? Which rule was worded too softly to convict —
and what did it cost in the bait run? Which pollution step did the real
damage — did your written prediction survive contact with the two diffs?
Close with **one take-away** you'd give someone who skipped today.
