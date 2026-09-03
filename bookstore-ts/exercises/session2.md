# Exercise 2: Writing Effective Prompts

**Session**: 2 — Bug Fixing & Effective Prompting
**Duration**: 30 minutes
**Project**: The same BookStore API. Its test suite contains deliberate failures.

## Goal

You'll practice writing prompts using the techniques from this session:
CONTEXT-TASK-OUTCOME, Scope/Constrain/Direct/Define done, role framing,
examples, verbatim error context, `/effort`, and plan mode.

One thing to be clear about before you start: the bugs are practice material,
not the goal. A passing test only proves your prompt worked. If a bug stays
unfixed but you can name what was missing from your prompt, you've learned
more than someone who got lucky.

## A few words we'll use

- **Coach**: the `/prompt-coach` command. It reviews your draft and points
  out gaps. It will never write the prompt for you — that's your job.
- **Greenlight**: the coach thinks your prompt is ready to run.
- **Ship**: the coach sends your prompt, word for word, to a sub-agent.
- **Sub-agent**: a fresh Claude session that runs your prompt. It hasn't seen
  your conversation. Whatever you wrote is all it gets.
- **Green**: all tests pass.

## How every task works

Same five steps every time:

1. **Draft**. Write your complete prompt for the task. Don't run it yet.
2. **Coach**. Run `/prompt-coach <task number>` and paste your draft. The
   coach grades it against this session's techniques and predicts what each
   gap will cost you. It asks one question at a time, so the feedback stays
   easy to digest.
3. **Revise**. Improve the prompt until you get the greenlight. Disagree
   with the coach? Say *"run it anyway"* — it will let you, and tell you
   what to watch for. Sometimes you'll be right.
4. **Ship**. Your exact prompt goes to a fresh sub-agent. This is where it
   gets interesting: the sub-agent knows nothing about your chat. If your
   prompt depends on something you discussed earlier, that context is simply
   gone. And if you didn't ask for proof, don't expect any in the report.
   (Task 5 is the exception — you run that one yourself in plan mode,
   because reviewing the plan requires your judgment.)
5. **Debrief**. Read the sub-agent's report with the coach and check: did
   its predictions come true? That comparison is where you learn the most.

> **The loop, in short: Draft → Coach → Revise → Ship → Debrief.**
> Every task below uses it. Come back here when you lose track.

**About training mode**: `CLAUDE.md` keeps this project in training mode, so
Claude asks you a leading question before handing you an answer, and searches
rather than reading whole files. Greenlit prompts skip all that — they passed
review, so they run directly. Stuck or short on time? Just say *"just tell
me"*. That is allowed.

## Tasks

### 1. Baseline (2 min)

Run `bun test` and write down every failing test.

Are the `CreateReview validation` cases on your list? Then you skipped task 3 of
Session 1. Ask Claude to add the validation now (2 min), then continue.

No coaching for this one. It's a simple request with no learning goal, which
is exactly the kind of thing training mode leaves alone.

**Done when**: you have a written list of the failing tests, and
the `CreateReview validation` cases are not on it.

### 2. The orientation prompt (9 min: draft 3 · coach & revise 3 · ship & check 3)

Imagine you're new to this codebase. Write one prompt that produces
`docs/orientation.md` with:

1. **Folder tree** — one line per module/folder on what it owns
2. **Request flow** — from `src/main.ts` to the database and back, layer by
   layer, with a `file:line` reference for each step

You've seen this prompt before — it's the one from the *Prompt Analysis*
slide. Now you compose it yourself, using: CONTEXT-TASK-OUTCOME, role
framing, Scope it, Direct it, Define done, `@file`, and examples.

But watch out: one of those techniques adds nothing for this task. Find out
which one, and why, and tell the coach.

Draft → `/prompt-coach 2` → revise → ship.

**Check your result**: run `/verify-exercise 1`. It compares the prompt you
actually sent against the file it actually produced, claim by claim. Not
enough time? The check works on its own — run it in the next break.

**Done when**: `docs/orientation.md` exists, every step in the request flow
has a `file:line` reference, and you told the coach which technique was
useless here.

### 3. The test-first prompt (6 min: draft 2 · coach & revise 2 · ship & test 2)

`paginate()` in `src/util/pagination.ts` breaks on `page = 0` and
negative pages, and no test covers either case.

Write one prompt that asks for failing tests first, then the fix, then proof
of both. This is Prompt A from the *Which Prompt is Better?* slide — now
it's yours to write.

Techniques in play: Scope it, Direct it (say "tests first" explicitly),
Examples (there's a table-style test in `tests/util/pagination.test.ts`),
Constrain it, Define done.

One decision belongs to you, not Claude: what *should* happen when
`page = 0`? Decide before you prompt. Requirements are yours to make, not
Claude's to guess.

Draft → `/prompt-coach 3` → revise → ship → `bun test tests/util/` →
debrief.

**Done when**: the report shows the new tests failing *before* the fix and
passing *after*, and `bun test tests/util/` is green on your machine.

### 4. The failing-test prompt (5 min: draft 2 · coach & revise 1 · ship & test 2)

`CreateBook returns 201` and `DeleteBook returns 204` have been failing
since your baseline run. Write one prompt that fixes both.

Techniques in play (see *Providing Error Context*): error context, Scope
it, Constrain it, Define done.

Two notes. Paste the error output exactly as it appears — paraphrasing
strips out the searchable details. And the tests are your constraint:
correct means they pass.

And a small side question: what `/effort` level does this task actually
deserve?

Draft → `/prompt-coach 4` → revise → ship →
`bun test tests/handler/book.test.ts` → debrief.

**Done when**: both tests pass in `bun test tests/handler/book.test.ts`, and
you can say why you picked your `/effort` level.

### 5. The plan-mode prompt (7 min: draft 2 · coach & revise 2 · plan & challenge 2 · implement & test 1)

`CreateReview for non-existent book returns 404` expects a `404` but gets a
`201` — and where the fix belongs is genuinely debatable. That makes it a
plan mode job.

Techniques in play (see *Plan Mode* and *Prompting & Extended Thinking*):
plan mode (no code until you approve), directed thinking (name the things
the plan must reason through), Scope it, Define done.

Ask for a recommendation with reasons. If you get a list of options instead,
your prompt allowed Claude to avoid the decision.

Draft the *planning* prompt → `/prompt-coach 5` → revise → run in plan mode
→ **challenge at least one step of the plan** before you approve →
implement → `bun test tests/handler/review.test.ts` → debrief.

**Done when**: you challenged at least one plan step, and
`CreateReview for non-existent book returns 404` passes.

### 6. Wrap (1 min)

Run `bun test`. It should be green now. Sessions 3 to 8 build on this
codebase, so a red test costs you later. Still red? Write down which
test, and which technique the prompt for it was missing.

**Done when**: the test run is green, or you wrote down the failing test
and the missing technique.

## Pair Discussion (5 min)

Talk through with your pair:

- Which single sentence in one of your prompts helped the most?
- Which missing technique actually cost you — did the coach predict it?
- Where did you overrule the coach, and were you right?

Pick **one take-away** to present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
