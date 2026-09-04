# Writing Style Guide — Course Materials

For all exercises, slides, and handouts in this course. The audience is
professional developers, many of them Dutch, with English between B1 and C1.
Assume B1 for anything that matters.

## The litmus test

> Could a tired reader, at the end of a training day, with B1 English,
> do the task correctly after reading each sentence once?

If a sentence fails this test and it carries an instruction, rewrite it.
If it fails and it's decoration, cut it or move it out of the way.

## The reader

Write every exercise for this person, and no one more experienced:

- They heard the session's concepts ten minutes ago, for the first time.
  Session 3 example: they have just learned that `CLAUDE.md` exists.
- They know only the words the slides used. Nothing from the trainer's
  design notes, nothing from earlier drafts, nothing from this repo.
- Their English is B1. They read each sentence once.
- They do not know what folder they are in, what a "fresh session" is, or
  where a file should go, unless the sheet says so.

Added 2026-09-04 after lead-trainer feedback on the session 3 sheet
(Urs Peter): the sheet was written for someone who already knew the
design. Concretely, it failed on all four points above.

## Vocabulary rules

- **No invented words.** Every term in a sheet comes from the slides of
  that session, or it is replaced by a plain phrase. "Arm", "bank", "bait
  run", "freeloader" are examples of words that failed: none is on a slide,
  three are English idioms. Write "the clean session", "save the diff",
  "the weak prompt", "a line that is not worth its tokens".
- **A glossary is a warning sign.** If a sheet needs a word list before
  the tasks, the tasks use words they should not. Command names
  (`/bank-diff`, `/context-coach`) are the exception: explain each command
  once, in one sentence, where it is first used.
- **Explain the setup before the tasks.** One section, plain words: what
  the project's `CLAUDE.md` does (training mode), what that changes in
  Claude's answers, how to switch it off when needed, and why the file
  must not be edited. A participant who has not read this section cannot
  understand the exercise.
- **Say where.** Every sheet names the folder to open a terminal in, and
  defines "fresh session" once. Every task that creates or edits a file
  names the file before the steps, not after.
- **Slide references carry the point.** Do not write "use the test from
  *Which CLAUDE.md Line Is Worth Its Tokens?*". Write the test itself, in
  one sentence, and add the slide title after it in parentheses.
- **Worked example first.** When a task asks for several rules, prompts or
  steps, give the first one fully written. Then ask for the rest.

## The two-tier rule

Every piece of text is one of two tiers:

**Tier 1 — load-bearing.** Steps, requirements, definitions, commands,
success criteria. Rules: B1 English. Sentences under ~18 words. One idea per
sentence. No idioms, no irony, no inversion. State the point plainly, first.

**Tier 2 — flavor.** Asides, closers, encouragement, humor. Rules: B2
maximum, and always *skippable* — a reader who skips all flavor loses zero
instructions. Flavor never carries information. At most one flavor line per
section.

## Voice

- Direct address: "you", "your prompt", "decide before you prompt".
- Honest and a little dry — but warmth comes from directness and candor
  ("Sometimes you'll be right"), **not from idioms**.
- Technical jargon is fine when the audience shares it (sub-agent,
  middleware, table test). English idioms are not jargon — they are the
  actual language barrier. Avoid: "earned its keep", "off the hook",
  "goldmine", "buys you nothing", "ship it" *unless defined first*.
- Some AI-typical phrasing is acceptable — this is an AI course — but never
  at the cost of a second read.

## Structure rules

- Define every term of art once, early, before first use.
- Name a list before explaining its items. Never nest rationale inside a
  list item; explain in separate sentences after the list.
- Separate *what to do* (numbered steps, plain verbs) from *why it matters*
  (a short note after).
- Caveats get their own sentence. No em-dash chains, no nested
  parentheticals in Tier 1 text.
- One aphorism per section maximum, always as a closer, never as the
  primary explanation.

## Do / don't (from real material)

**Don't** (original, ~C2, meaning by implication):
> An unfixed bug whose prompt gap you can name beats a lucky fix you can't
> explain.

**Do** (plain first, aphorism as optional closer):
> The goal is a better prompt, not a fixed bug. If a bug stays unfixed but
> you can name what was missing from your prompt, you've learned more than
> someone who got lucky.

**Don't** (rationale nested inside a semicolon list):
> Techniques in play: paste the exact error output — don't paraphrase it,
> paraphrasing throws away the searchable details; Scope it; Constrain it
> (the tests define what correct means); Define done.

**Do** (bare list, then notes):
> Techniques in play: error context, Scope it, Constrain it, Define done.
>
> Two notes. Paste the error output exactly as it appears — paraphrasing
> strips out the searchable details. And the tests are your constraint:
> correct means they pass.

**Don't** (implication the reader must decode):
> If you didn't ask for proof, the report won't contain any.

**Do** (cause and effect spelled out):
> The sub-agent only sees your prompt — nothing from your chat. So
> everything it needs, including what proof to show, must be in the prompt
> itself.

## Settled decisions

1. **Slide rhythm**: most slides keep the term → example → bold punchline
   pattern for predictability. Roughly every 4–5 slides, one breaks it — it
   ends with a question, a plain sentence, or no punchline at all.
2. **Humor**: one dry aside per section is allowed, written in plain B1
   English. Warmth comes from candor and direct address, never from idioms.
3. **Aphorisms**: at most one per section, always as a closer, always after
   the plain statement of the same point.
4. **Final pass is mandatory.** Every new piece gets a dedicated last check
   before delivery (see below). Rules alone are not enough — idioms are how
   fluent writing naturally drifts.

## AI-tell ban list

Phrases and patterns readers recognize as machine-written. Participants
flagged "that's where the learning lands" almost instantly — this list
exists so those never ship. **It is maintained: when a reader flags a
phrase, add it here.**

Banned phrases, with plain replacements:

| Tell | Write instead |
| --- | --- |
| "that's where the learning lands" | "that's where you learn the most" |
| "let's dive in" / "deep dive" | "let's start" / "a closer look" |
| "here's the thing" / "the magic happens" | delete; start with the point |
| "unlocks" / "unleashes" / "supercharges" | "makes possible" / "speeds up" |
| "leverage" (verb) / "empower" / "elevate" | "use" / "help" / "improve" |
| "seamless" / "robust" / "powerful" / "rich" | name the concrete property |
| "navigate the complexities" / "journey" | "deal with" / "process" |
| "game-changer" / "takes it to the next level" | say what actually changes |
| "this begs the question" | "this raises the question" |
| "crucially" / "importantly" as openers | delete; the sentence should show it |
| "doesn't survive first contact with X" | "breaks the first time it meets X" |
| "full contact" / "battle-tested" | say concretely what happens or was tested |
| "harvest" (in participant text) | "closing round" for the end-of-exercise section; "collect answers" for the action. Trainer vocabulary — fine in speaker notes and AGENTS.md |

Banned patterns:

- **Symmetrical antithesis on autopilot**: "X isn't about A — it's about
  B", "There is no neutral". Allowed once per document; more is a watermark.
- **Adjective triads**: "clear, concise, and actionable". Use two items, or
  one concrete one.
- **Ideas as physical objects**: points that "land", insights that
  "surface", questions that get "unpacked". People remember things, notice
  things, and explain things.
- **Nominalization piles**: "invites a dense information dump", "defines
  review lenses". Name the actor and the consequence: "you get pages you
  will never read".
- **The relentless moral**: every section ending with its own bolded lesson.
  Some sections may simply end.
- **Combat and sports metaphors**: "first contact", "in the trenches",
  "moving the goalposts", "slam dunk". These are real native-speaker idioms
  — which is exactly the problem: they read as borrowed cleverness, AI
  over-uses them, and they are culturally opaque at B1/B2. Note the
  criterion for this whole list: not "did AI invent it" but "did a reader
  stumble".

## Slide copy rules

Proven on the Session 2 deck restyle (2026-09); apply with
`slidev/conventions.md`:

- **Ration the epigrams.** Keep the few that earn their place (course-level
  ideas like "megaphone for your habits"); end other slides plainly, with a
  question, or not at all. The facilitator note can carry the punchline —
  spoken lines land better than bold text. Target: ~5 per deck, not one
  per slide.
- **Verdicts state consequences, not categories.** "You get twenty opinions
  and no priorities" — never "vague criteria and subjective critique".
- **Quiz statements sound like a colleague's opinion**, not an exam item:
  "they are only tests, after all" — not "because they do not affect
  runtime behavior". Wrong claims should be fun to vote on.
- **Facilitator notes are exempt from the flavor budget** but not from the
  ban list — trainers read them aloud.

## Exercise structure patterns

Proven on Exercise 2; apply to every exercise document:

- **Done when, per task.** Every task ends with a `**Done when**:` line
  stating observable proof (a file exists, a named test passes, a decision
  was made and told to someone). This also makes the document practice what
  it teaches: Define done.
- **Recap box for the core loop.** If tasks share a repeated workflow,
  state it once in full, then add a one-line recap box the reader can jump
  back to mid-exercise. Nobody should re-read prose to find step 3.
- **Timing: total in the heading, phases on the steps.** The heading
  carries one number: "(12 min)". If a task has phases, put the minutes on
  the step itself: "3. Run the coach (3 min)". Never in the heading —
  "9 min: draft 3 · coach & revise 3 · ship & check 3" was flagged as noise
  by a lead trainer (2026-09-04) and is now banned.
- **Tasks are numbered steps.** Each task is: the file or result it
  produces, then numbered steps with plain verbs and the exact command,
  then at most one short note on why, then **Done when**. Rationale never
  sits inside a step.

### Reference example

A lead trainer rewrote task 1 of session 3 by hand (2026-09-04). It is the
register every task must hit. Before:

> Open a fresh session and run `/context` before typing anything. Note what
> is already spent before your first message: system prompt, tools,
> `CLAUDE.md`. Compare with your neighbor.
> No coaching for this one. It's a reading, not a deliverable.
> Write the number down. Task 4 will make you cite it.

After:

> Open a fresh Claude session and run the `/context` command before typing
> anything.
>
> Note how many tokens are already spent before you type your first
> message, due to the context Claude loads by default, such as the system
> prompt, tools, and `CLAUDE.md`. To which category does `CLAUDE.md`
> belong? Compare the outcome with your neighbor.
>
> In this exercise you don't need the coaching command (`/context-coach`);
> gaining insight into the context window is the goal.
>
> Write down the token count of your clean session. You will re-use this
> number in task 4.

What changed: the command is named in full, the why is in the sentence,
"no coaching" says which command is meant, and every reference ("task 4")
says what for.

## Coach output

The coach skills (`/prompt-coach`, `/context-coach`, `/verify-exercise`,
`/bank-diff`) talk to participants live, mid-exercise. Everything a coach
says is Tier 1: the participant reads it once, on a clock, and acts on it.
Every skill's `SKILL.md` carries this block, word for word, under the
heading *How you talk to the participant*:

> - Write B1 English. Sentences under 18 words. One idea per sentence.
> - No idioms, no irony, no metaphors. Say the plain thing first.
> - Use the course terms exactly as the slides and exercise sheet name them.
>   Do not invent new terms for the same idea.
> - Every ❌ names the actor and the consequence: "Claude will fix one test
>   and stop." Never a category: "insufficient done-condition."
> - One question per turn. Ask it in one sentence, at the end.
> - Keep the shape the loop asks for. Do not add greetings, praise, summaries
>   of what you are about to do, or a closing lesson.
> - Warmth comes from being direct and fair, not from jokes.

Two things follow from this. The card and check files are quasi-output: the
model paraphrases their nudge banks, predicted defects, and greenlight lines
almost word for word. So those lines follow the same rules. And the skill's
own instruction prose sets the register the model answers in, so it stays
plain too — even where only the trainer reads it.

Terms the exercise sheet defines (coach, greenlight, ship, run it anyway,
bank) may be used without re-defining them. "Ship it" as a closing phrase is
fine only because the sheet defines *ship*.

## Final pass checklist

Run this on every piece before delivering it:

- [ ] Any idioms? ("off the hook", "earned its keep", "buys you nothing")
      → replace with plain words.
- [ ] Every Tier 1 sentence under ~18 words and parseable in one read?
- [ ] Is every term of art defined before first use?
- [ ] Is all flavor skippable — no instruction hiding inside a joke or
      aphorism?
- [ ] The litmus test: could a tired B1 reader do the task correctly after
      reading each sentence once?
- [ ] Every non-command term appears on a slide of this session? (No
      invented words, no glossary needed.)
- [ ] Does the sheet say which folder, what a fresh session is, and which
      file each task produces — before the steps?
- [ ] Headings carry one number only?
- [ ] The reader test: someone who has only seen the slides reads the
      sheet once and lists every question they still have. Each question
      is a defect. Zero questions before delivery.
