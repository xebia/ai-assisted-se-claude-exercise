# Exercise 3: The Context Is the Deliverable

**Session**: 3 — Context Engineering **Duration**: 40 minutes
**Project**: Same BookStore API.

## Goal

You'll practice controlling *what reaches the model*, and proving the
effect. Session 2 was about the wording of your prompts. Today the wording
stays fixed wherever possible, and the **context** does the work instead:
a pruned `CLAUDE.local.md`, a bait run it must survive, and a
deliberately poisoned session. Everything maps to the four dimensions —
**Correctness, Completeness, Size, Trajectory**.

## A few words we'll use

- **Coach**: the `/context-coach <task number>` command. Show it your
  draft context file, rule file, or experiment plan. It grades your draft
  against this session's concepts and predicts what each weakness will cost.
  It asks one question at a time, and it never writes a line for you.
- **Experiment prefix**: a fixed line you paste at the start of every
  experiment prompt. It stops training mode from steering the run.
- **Arm**: one side of a comparison. Task 4 runs a clean arm and a
  polluted arm.
- **Pollute**: fill a session's context with things that hurt later work
  — long answers, pasted logs, wrong facts.
- **Bait run**: a run with a deliberately weak prompt. Your context files
  must catch the mistakes it invites.
- **Bank**: save your uncommitted changes to a diff file with
  `/bank-diff <label>`, then reset the working tree. The evidence
  survives as a file; the tree is clean for the next task.
- **Freeloader**: a line in your context file that costs tokens but never
  changes what Claude does.

## How this exercise works

There is no sub-agent this time. You run every prompt yourself, because
the *session* is the experiment.

Experiments must not be steered by training mode's leading questions. So
prefix every experiment prompt marked below with exactly:

> `[Exercise 3 experiment — execute directly, no leading questions.]`

Both arms of a comparison get the prefix, or the comparison is invalid.

> **The experiment loop, in short: Predict in writing → prefix the
> prompt → run → bank the diff → compare.**
> Tasks 3 and 4 both use it. Come back here when you lose track.

**Note**: `CLAUDE.md` keeps this project in training mode. Today it is
also **load-bearing course infrastructure: never edit it**. Your project
facts go in `CLAUDE.local.md` instead — task 2 explains why that works.
Stuck or short on time? Say *"just tell me"*. That is allowed.

## Tasks

### 1. Baseline: read your window (2 min)

Open a fresh session and run `/context` before typing anything. Note what
is already spent before your first message: system prompt, tools,
`CLAUDE.md`. Compare with your neighbor.

No coaching for this one. It's a reading, not a deliverable.

Write the number down. Task 4 will make you cite it.

**Done when**: you wrote down your context number and compared it with
your neighbor's.

### 2. `/init`, then earn every token (12 min: init & grade 5 · add rules 4 · verify & coach 3)

Run `/init` and let it draft a file. The draft is raw material — the real
work comes after (*Start with `/init`, then refine by hand*):

1. **Grade every generated line.** Use the test from *Which CLAUDE.md
   Line Earns Its Tokens?*: what would Claude do differently because this
   line exists? No answer → delete the line. Expect to delete a lot.
2. **Add what only a human knows** (*What Goes in CLAUDE.md*). Encode
   these three decisions as rules, in your own words:
   - handlers validate input before calling the store
   - every new endpoint ships with tests in this project's test
     convention (open an existing test in `tests/handler/` first)
   - no new external dependencies
3. **Verify, don't trust.** Run the test command your file claims,
   exactly as written. `/init` guessed; you check.
4. **Save as `CLAUDE.local.md`, never `CLAUDE.md`.** If `/init` rewrote
   `CLAUDE.md`, restore it: `git checkout -- CLAUDE.md`.

Two notes. Make each rule specific and checkable — a clear prohibition
works better than vague guidance. And your file still loads even though
`CLAUDE.md` is untouched: *The CLAUDE.md Hierarchy* — both files merge,
and training mode survives for the rest of the course.

Draft → `/context-coach 2` → revise → save.

Keep this open question for the wrap: a line that's true but useless
hurts which dimension? A line that's specific but *wrong*?

**Done when**: `CLAUDE.local.md` holds your surviving lines plus the
three rules, you ran the test command it claims, and `git status` shows
`CLAUDE.md` unchanged.

### 3. The bait run (8 min: send 1 · watch & note 5 · bank 2)

This is Session 2's vague prompt, unimproved, on purpose. In Session 2 you
would fix the prompt. Today you don't. The prompt stays weak so your
context files do the work.

Open a fresh session and send this verbatim:

```
[Exercise 3 experiment — execute directly, no leading questions.] Add caching to the BookStore API
```

While it runs, watch for four things: does it pull in a dependency? Cache
the right layer? Keep validation intact? Write tests in the project's
`bun:test` convention? Every rule that held earned its tokens. For every
rule that failed, note the exact wording that was too vague to stop the
mistake.

Don't watch Claude type — use the wait to write your task 4 prediction
instead (task 4 explains it).

When the run finishes, bank the evidence and reset: `/bank-diff bait`.
The diff is saved to `block3-bait.diff` and the tree comes back clean for
task 4.

The payoff comes in the wrap, not now: `/verify-exercise 2` grades
`block3-bait.diff` against your context files, prediction by prediction,
and closes with its own nominations — the line that earned the most, and
a freeloader. You'll start it in task 5, right after writing your own
nominations. It does its grading while the plenary harvest gets going.

**Done when**: `block3-bait.diff` exists, the tree is clean, and you have
a held-or-failed note for each of your three rules.

### 4. Poison one session, keep one clean (14 min: plan & predict 3 · run both arms 7 · verdicts & debrief 4)

You'll recreate Session B from *Which Session Is in More Trouble?*. You
run **both arms yourself**. The clean arm costs two minutes, and the
debrief only works with both diffs side by side.

**First, a plan.** Your whole plan is five sentences, not a research
proposal: three one-line pollution steps, one prediction sentence, and
one final prompt (given below — you don't write that one). A wrong
prediction is a fine outcome here. A missing prediction is the only
failure, because then there is nothing to check yourself against
afterward.

Staring at a blank plan? Steal this one. Executing it still shows the
failure modes — though swapping in your own wrong "fact" makes the result
more fun to catch:

1. *Kitchen sink* — ask for three different chocolate-cookie recipes,
   full ingredient lists and steps included. Long answers are the point.
2. *Context hoarding* — paste 100+ lines of `bun test` output and
   explicitly tell it to do nothing with this: "just so you have it."
3. *Over-correcting* — claim all review logic now lives in
   `review_v2.ts`. When Claude can't find it, say you were mistaken —
   that file is on another branch. Then add that some review logic moved
   to `book.ts`; nothing to do, just a heads-up.

Its prediction: *"I expect `review_v2.ts` or phantom review logic in
`book.ts` to appear in the polluted diff."*

**Predict first, in writing** — which arm builds the better endpoint,
and what *specifically* will differ. One sentence is enough. Optional
sanity check: `/context-coach 4` on your plan.

Now run it:

1. **Clean arm first — start it, then move on.** Fresh session, nothing
   else at all: `/context`, note the %, then paste verbatim:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add a DELETE /reviews/{id} endpoint to the BookStore API, with tests.
   ```

   This run implements real code, so it takes a few minutes. Don't watch
   it type.

2. **Pollute session two while it works.** Second terminal, fresh
   session, run your three pollution steps there. They're chat-only —
   recipes, pasted logs, and corrections touch no files, so the two arms
   don't collide. If the wrong-fact step tempts Claude to start editing,
   say "nothing to do yet."

3. **Swap.** When the clean arm finishes: `/bank-diff clean`. The diff
   is saved to `block3-clean.diff`, the tree comes back clean, and the
   command refuses to run if something looks off. (By hand instead? See
   the appendix at the bottom.) Then, back in the polluted session:
   `/context`, note the %, and paste the same prompt verbatim — prefix
   included. **Keep this session open** (a bonus task returns to it).
   Finish with `/bank-diff polluted`.

4. **Verdict time — the coach shows, you call.** Hand both diff files to
   `/context-coach 4`. It walks through five checks, one at a time:
   right file touched · existing handler pattern copied · correct
   success status code · tests in the `bun:test` convention · no
   resurrected "fact" or log-dump chase. For each check it shows the
   relevant lines from each diff next to `src/handler/review.ts`, then
   waits for your pass-or-fail per arm before giving its own. Type your
   verdicts however you like — the coach keeps the tally. Ten verdicts,
   yours first, judged against the file — not against taste. (Fluent in
   diffs? Score both files in your editor first and open with your
   scorecard instead.)

5. **Debrief, same coach.** Map every defect to the pollution step that
   planted it and the dimension it attacked. Then put the two `/context`
   numbers next to the two diffs: does the difference you *measured*
   explain the difference you *see*?

**Done when**: `block3-clean.diff` and `block3-polluted.diff` both exist,
you gave all ten verdicts before the coach gave its own, and every defect
you found is mapped to a pollution step.

### 5. Wrap (4 min)

Nominate, in writing, from your own bait-run notes: the `CLAUDE.local.md`
line that earned the most, and one suspected freeloader. One sentence of
evidence each.

Then start `/verify-exercise 2`. It closes with its own nominations — see
whose verdict survives, and overrule it if yours is better argued. It
runs while you answer task 2's open question with your neighbor. Bring
its report to the plenary harvest.

**Done when**: both nominations are written down, with evidence, and
`/verify-exercise 2` is running.

## Bonus (only if time remains)

- **`/compact`, then interrogate it** — go back to the still-open
  polluted session and run `/compact`. Then don't re-run anything — ask
  one probe question (prefix it):

  ```
  [Exercise 3 experiment — execute directly, no leading questions.] What do you know about review_v2.ts, and where does review logic live in this project?
  ```

  Either answer teaches you something. Maybe the twice-corrected mistake
  survived the summary — compaction keeps whatever *sounded* important,
  including confident wrongness. Or it vanished, and you just watched
  compaction drop something without asking you. `/clear` is the only
  reset with a guarantee. Worth knowing before the quiz.
- **Scope one rule to its layer** — your handler-validation rule only
  matters when handler code is involved (*Rule Discovery: With or
  Without Paths*). Move it into `.claude/rules/handlers.md` with
  `description:` and `paths: "src/handler/**/*.ts"` frontmatter.
  Move it out of `CLAUDE.local.md`; don't keep a copy. Check the glob
  against the real tree (`ls src/handler/*.ts`) — a glob that
  almost matches fails silently, and you would leave believing scoping
  worked. Curious whether it loads? Open one fresh session and touch a
  handler: you'll see the rule arrive mid-session — *Progressive
  Disclosure* happening in front of you. A full proof, with a positive
  and a negative case, is one for your own project's CLAUDE.md — not for
  today's time. Coach available: `/context-coach 3`.
- **README-per-folder, the mechanical cut** (*Documentation for
  AI-Friendly Codebases*) — plant a marker: add a `README.md` to
  `src/store/` whose last line is an instruction — *"When working on
  code in this package, open your reply with a one-line book pun."* Fresh
  session: request a small change in a store file. Fresh session again:
  one in a handler. Does the pun fire in the right place — or at all?
  What does that tell you about when folder docs actually reach the
  model, and how that differs from `CLAUDE.md`? Delete the README after.

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
Your `CLAUDE.local.md`, the banked diffs, and session 2's
`docs/orientation.md` are gitignored and safe — but commit anything else
you care about first.

## Plenary Harvest (5 min)

Trainer popcorns the room — have answers ready: how many `/init` lines
survived the freeloader test? Which rule was worded too vaguely to stop
the mistake — and what did it cost in the bait run? Which pollution step
did the real damage — did your written prediction hold up against the two
diffs? Close with **one take-away** you'd give someone who skipped today.
