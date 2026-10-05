# Exercise 3: Change What Claude Sees

**Session**: 3 — Context Engineering\
**Duration**: 45 minutes, plus a 5-minute closing round\
**Project**: The same BookStore API.

## Goal

In session 2 you improved the words in your prompt. Now the prompt stays
weak. You change the **context** instead: the files and the conversation
that Claude sees. Then you check what that does to the code.

Two steps: write rules for this project in `CLAUDE.local.md`. Then give
one prompt to a clean session and to a polluted session, and compare the
code. The clean session also shows whether your rules work.

If you finish early, do the bonus.

## Start here

- Open two terminals in the `bookstore` folder. Start `claude` in the
  first one.
- Run `bun test` and `git status`. A test fails, or `git status` lists
  changes? Press Shift+Tab until the screen says auto mode, then run
  `/catch-up 2`. It commits your session 2 work, which the reset in
  task 2 would otherwise remove.
- Training mode is on. Never edit `CLAUDE.md`: your own rules go in
  `CLAUDE.local.md`. Stuck? Type *just tell me*.
- The trainer tells you when to start task 2.

## Tasks

### 1. Write `CLAUDE.local.md`

This task produces `CLAUDE.local.md`: the file Claude reads at the start
of every session in this project. It holds the rules a new teammate needs
but cannot read from the code (*Start with `/init`, then refine by hand*).

1. **Run `/init`**. In this project it writes `CLAUDE.local.md`,
   not `CLAUDE.md`. Check with `git status`. If `CLAUDE.md` is listed:
   run `git diff CLAUDE.md`, copy the added lines into `CLAUDE.local.md`,
   then run `git checkout -- CLAUDE.md`.
2. **Delete every line that changes nothing**. For each line,
   ask: what would Claude do differently because this line exists? No
   answer: delete it (*Which CLAUDE.md Line Is Worth Its Tokens?*).
   Delete a line like *"Write clean code"*. Keep the exact test command.
   Keep the line that says only the store touches the database. If there
   is none, add this one: *"Every handler (`BookHandler`, `AuthorHandler`, `ReviewHandler`)
   calls the store. Only the store talks to the database."*
3. **Add three team rules**. A rule is a decision your team made;
   Claude cannot read it from the code. Write each rule at the end of
   `CLAUDE.local.md`, in one or two sentences. (The `.claude/rules` folder
   comes later, in the "Back at work" section.) Rule 1 is written for
   you. Write rules 2 and 3 in the same style, in your own words:
   - Rule 1: *"Handlers validate the request before they call the store.
     A handler never passes unchecked input to a store function."*
   - Rule 2: every new endpoint comes with tests, in the same style as the
     existing tests. Open a test in `tests/handler/`
     first to see the style: `bun:test`, with `describe`/`test` blocks and
     `expect` assertions.
   - Rule 3: no new external dependencies.

   A rule must be checkable: someone who reads a diff can say "this
   breaks the rule". *"Keep dependencies minimal"* is not checkable.
   *"Never add a new library"* is.
4. **Run the test command from your file**. `/init` guessed it.
   Run it exactly as written. If the command does not run, fix the line.
5. **Optional: ask the coach, one round.** Only if the trainer has not
   called task 2 yet. Run `/context-coach 1` (1 is the task number), then paste
   the whole file as your next message. The coach names the weakest line
   and asks one question. Fix that one thing, then go on.

**Done when**: the file has the lines you kept, a database line and three
rules. Its test command runs. `git status` does not list `CLAUDE.md`.

### 2. Clean session versus polluted session

This task produces two saved diffs, `session3-clean.diff` and
`session3-polluted.diff`: the same prompt, once in a fresh session and
once in a polluted session. The fresh session also shows whether your
rules hold.

The first terminal does all the edits, one session at a time. The second
terminal only reads.

1. **Write a prediction and a guess.** Both sessions get a prompt that
   adds a DELETE endpoint for reviews, with tests. Write one sentence:
   which session builds the better endpoint, and what will differ?
   Example: *"I expect the polluted session to put code in the wrong
   place."* A wrong prediction is fine. No prediction is the only
   failure. Then make one guess. Four lines from your file get tested
   this round: the database line, rule 1, rule 2 and rule 3. Which one
   will Claude break in the clean session? Write it down.
2. **Run the clean session.** In the first terminal, type `/exit` and
   start `claude` again. Not `/clear`: it does not always reload a
   changed `CLAUDE.local.md`. Run `/context` and write down the
   percentage of the context window in use. Then paste this exactly. The
   tag at the start switches training mode off for this one prompt:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add a DELETE /reviews/{id} endpoint to the BookStore API, with tests.
   ```

   Watch which files Claude opens before it writes code.
3. **Save the clean result.** When Claude is done, run
   `/save-changes clean`. It saves all changes to `session3-clean.diff`
   and cleans the project. `CLAUDE.local.md` is not touched. Then type
   `/exit`.
4. **Start the grader.** In the second terminal, start `claude` and run
   `/verify-exercise 3`. It grades `session3-clean.diff` against your
   `CLAUDE.local.md`. It only reads; it never edits the project. It first
   asks for your guess: type the name of the line, for example *rule 3*.
   Leave it running and go back to the first terminal.
5. **Pollute a new session.** In the first terminal, start `claude` and
   run `/pollute`. Claude prints review code from another application,
   the "Library service", and pastes the whole test output. Then it
   prints three messages. Send them one at a time, and wait for each
   reply. If Claude wants to start editing, answer *"nothing to do yet"*,
   without the tag. Then run `/context` and write down the percentage.
6. **Run the polluted session.** Paste the prompt from step 2 again, tag
   included. When Claude is done, run `/save-changes polluted`. Keep this
   session open for the bonus.
7. **Compare.** Go to the second terminal. If the grader is still
   working, wait for it. Its report stays on the screen; task 3 scrolls
   up to it. Type `/exit`, start `claude` again, and run
   `/context-coach 2`. Then type the two file names on one line:
   `session3-clean.diff session3-polluted.diff`. The coach goes through
   three checks, one at a time:
   - Did the change land in the right file?
   - Does the new handler copy the existing handlers, including the
     status code the book DELETE returns?
   - Is there nothing from the pollution: the Library code, the wrong
     fact or the pasted log?

   For each check, the coach shows lines from both diffs next to the
   current `src/handler/review.ts`. You answer *pass* or *fail* for both sessions,
   for example *clean: pass, polluted: fail*. Give each answer before the
   coach gives its own. Then tell the coach the two `/context`
   percentages and ask whether they explain the difference in the code.

**Done when**: `session3-clean.diff` and `session3-polluted.diff` exist.
You gave six answers before the coach did. For every mistake in the
polluted diff, you wrote down what in the pollution could have caused it.

### 3. Closing: read the grader's report

Scroll up in the second terminal to the report from `/verify-exercise 3`.
Write down three lines:

1. **Your guess.** The report says for each of your four lines whether
   Claude followed it (*held*), broke it (*failed*), or never needed it
   in this run (*not tested*). Write the result next to the line you
   guessed.
2. **The line that helped the most.** The report names one and shows the
   diff line it prevented or forced. Do you agree? One sentence.
3. **A line not worth its tokens.** The report names one line that
   changes nothing. Agree, or say what Claude does differently because of
   it. One sentence.

**Done when**: three lines are written down, each with one sentence of
evidence. Bring them to the closing round.

## Bonus (only if time remains)

**Test your rules with a weak prompt.** A DELETE endpoint rarely tempts
Claude to add a library or to put the cache logic in the handler instead
of the store. Caching does.
Open a fresh session in the first terminal and paste this exactly. It is
the vague prompt from session 2, unchanged:

```
[Exercise 3 experiment — execute directly, no leading questions.] Add caching to the BookStore API
```

When Claude is done, run `/save-changes rules`. Then, in the second
terminal, run `/verify-exercise 3` again in a fresh session. It now
grades `session3-rules.diff`, which tests all four lines. Compare its
report with the first one: which lines were *not tested* before?

**`/compact`, then ask about the wrong fact.** In the polluted session,
run `/compact`. Then ask, with the tag:

```
[Exercise 3 experiment — execute directly, no leading questions.] What do you know about review_v2.ts, and where does review logic live in this project?
```

If the wrong fact survived: `/compact` keeps what sounded important,
including confident mistakes. If it is gone: `/compact` dropped something
without asking you. Only a fresh session is a guaranteed reset.

## Back at work: try this on your own project

**Move one rule to its own file.** The handler-validation rule only
matters when Claude edits handler code (*Rule Discovery: With or Without
Paths*). Move it to `.claude/rules/handlers.md` (create the folder) and
remove it from `CLAUDE.local.md`. The file starts with these lines, then
the rule:

```
---
description: How handlers treat incoming requests
paths: "src/handler/**/*.ts"
---
```

Check the pattern with `ls src/handler/*.ts`. A pattern with a small
mistake matches nothing, and you get no error. Then ask for a small change
in a handler. The rule appears in the session only then (*Progressive
Disclosure*). `/context-coach 4` reviews the file (4 is this item's
number for the coach).

**A README per folder.** Put a `README.md` in `src/store/` with one
instruction on its last line. Ask for a change in a store file, then in a
handler. When does the instruction reach Claude?

## Appendix: `/save-changes` by hand

If the command stops, it says why. Or run these from the project folder,
one per line:

```
git add -A .
git diff --cached --output=session3-polluted.diff
git reset -q .
git checkout -- .
git clean -fd .
```

Replace `polluted` with `clean` or `rules`. The last command deletes files
Claude created that you never committed. `CLAUDE.local.md` and the saved
diffs are ignored by git and stay.

## Closing round

The trainer asks the room. Have these answers ready:

- How many `/init` lines did you keep?
- A line is true but changes nothing: which dimension does it hurt? A
  line is specific but wrong: which dimension does that one hurt?
- Which pollution step did the real damage? Did your prediction hold?
- One thing you would tell someone who skipped this session.
