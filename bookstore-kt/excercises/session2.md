# Exercise 2: The Prompt Is the Deliverable

**Block**: 2 — Bug Fixing & Effective Prompting **Duration**: 30 minutes
**Project**: Same BookStore API. The test suite has deliberate failures baked
in.

**Goal**: Practice composing prompts with the Block 2 techniques —
CONTEXT-TASK-FORMAT, Scope/Constrain/Direct/Define done, role framing,
Examples, verbatim error context, `/effort`, plan mode. The bugs are your
practice targets, not the goal: a green test run is how you *verify* a prompt
worked. An unfixed bug whose prompt gap you can name beats a lucky fix you
can't explain.

## How every task works

1. **Draft** your prompt for the task, in full. Don't send it as work yet.
2. **Coach** — run `/prompt-coach <task number>` and paste your draft. Claude
   grades it against this block's techniques, predicts what each gap will
   cost, and nudges you with one question at a time. It will never write the
   prompt for you.
3. **Revise** until you get the greenlight — or overrule with *"run it
   anyway"* and the coach will tell you what to watch.
4. **Ship it** — the coach dispatches your exact prompt, verbatim, to a
   fresh sub-agent that has seen none of your conversation. What you wrote is
   all it gets: if your prompt leans on context from the chat, the sub-agent
   won't have it — and if you didn't ask for proof, the report won't contain
   any. (Task 5 is the exception: you run that one yourself, in plan mode —
   reviewing the plan needs you in the loop.)
5. **Debrief** — walk through the sub-agent's report with the coach. Did its
   predictions come true? That comparison is where the learning lands.

## Tasks

1. **Baseline** (2 min) — run `./mvnw test` (or `./gradlew test`) and note
   every failing test. Compare with your neighbor — you should both see the
   same failures. No coaching for this one: not every message needs a
   framework, and knowing when not to reach for one is part of the skill.

2. **The orientation prompt** (9 min) — you're onboarding onto this codebase.
   One prompt must produce `docs/orientation.md` containing:
   1. **Package tree** — one line per package on what it owns
   2. **Request flow** — `Main.kt` → database and back, layer by layer, with
      `file:line` per hop
   - Techniques in play (see the *Prompt Analysis* slide — this is that
     prompt, composed by you): CONTEXT-TASK-FORMAT · Role framing · Scope it
     · Direct it · Define done · `@file` · Examples. One of those buys you
     nothing here — which, and why? Tell the coach your answer.
   - Draft → `/prompt-coach 2` → revise → ship.
   - **Payoff:** run `/verify-exercise 1` — it grades the prompt you actually
     sent against the file it actually produced, claim by claim. Behind on
     time? It works standalone; pick it up in the next break.

3. **The test-first prompt** (6 min) — `paginate()` in
   `src/main/kotlin/bookstore/util/Pagination.kt` breaks on `page = 0` and
   negative pages, and no test covers those cases. One prompt: failing tests
   first, then the fix, then proof of both. This is Prompt A from the *Which
   Prompt is Better?* slide — now it's yours to write.
   - Techniques in play: Scope it · Direct it (test-first, explicitly) ·
     Examples (there's a table-style test in
     `src/test/kotlin/bookstore/util/PaginationTest.kt`) · Constrain it ·
     Define done. And: *you* decide what `page = 0` should do — don't
     delegate the requirement.
   - Draft → `/prompt-coach 3` → revise → ship → `./mvnw test` (or
     `./gradlew test`) → debrief.

4. **The failing-test prompt** (5 min) — `createBookReturns201` and
   `deleteBookReturns204` have been failing since your baseline run. One
   prompt fixes both.
   - Techniques in play (see *Providing Error Context*): error context —
     verbatim, not paraphrased · Scope it · Constrain it (the tests are the
     spec) · Define done. What `/effort` does this task deserve?
   - Draft → `/prompt-coach 4` → revise → ship → `./mvnw test` (or
     `./gradlew test`) → debrief.

5. **The plan-mode prompt** (7 min) — `createReviewNonexistentBook` expects
   `404`, gets `201` — and where the fix belongs is genuinely debatable. Use
   plan mode.
   - Techniques in play (see *Plan Mode* and *Prompting & Extended
     Thinking*): plan mode (no code until you approve) · directed thinking —
     name what the plan must reason through · Scope it · Define done. Demand
     a recommendation with rationale, not an options menu.
   - Draft the *planning* prompt → `/prompt-coach 5` → revise → run in plan
     mode → **push back on at least one step**, then approve → implement →
     `./mvnw test` (or `./gradlew test`) → debrief.

6. **Wrap** (1 min) — run the full test suite. **It will not be green —
   that's by design.** The `createReviewValidation` cases are still failing,
   and one bug in this codebase has no test at all. Tell your pair which
   techniques prompts for those two would need.

## Bonus (only if time remains)

Uncoached — apply what the coach kept flagging:

- Fix the `createReviewValidation` cases (all 4). Decide *before prompting*:
  handler, middleware, or store?
- Hunt the testless bug with a review prompt. Which specialist reviews
  (*Role framing*), which package (*Scope it*), looking at what (*Direct
  it*)?
- Fix-until-green — but count your cycles. More than 2 means the prompt, not
  the code, needs work.

## Pair Discussion (5 min)

Which single clause in one of your prompts bought the most? Which missing
technique actually cost you — did the coach's prediction come true? Where did
you overrule the coach, and were you right? Choose **one take-away** to
present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
