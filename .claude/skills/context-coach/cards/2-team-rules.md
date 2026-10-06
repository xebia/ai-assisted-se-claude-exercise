# Task 2 — Put the team's decisions where Claude reads them

**What they're bringing:** two pieces they wrote themselves, pasted as one
message: the rule file `.claude/rules/handlers.md` (decision 2) and the
decision 3 line in `CLAUDE.local.md`. Two things were given on the sheet
word for word; do not coach them: the rule file for decision 1,
`.claude/rules/testing.md` (use it as the model they copied), and the
first line of `CLAUDE.local.md`, which tells Claude to read the matching
rule file before it writes or edits under the test or handler folders.
That line exists because `paths:` only loads a rule when Claude opens a
matching file with its own file tools; a new file, or an edit through a
shell command or a script, may not load it.

The three decisions, as the sheet gives them:

1. New handler tests use the project's test kit; old tests are not
   rewritten. (Given as a finished rule.)
2. Bad input gives a 400, not a 500. New endpoints do this; old endpoints
   are fixed later, in a separate change.
3. A change touches only what the task asks for. No tidying up on the side.

**Rounds:** one. The sheet makes the coach optional and limits it to one
round. Name the single weakest point, ask one question, stop. The grader
(`/verify-exercise 3`) gives the real feedback after the second run.

**Slide anchors:** *Rules — Splitting CLAUDE.md by Topic* · *Rule
Discovery: With or Without Paths* · *Progressive Disclosure* · *Which
CLAUDE.md Line Is Worth Its Tokens?* · the **Relevance** and
**Correctness** dimensions.

## Concept applicability

**Load-bearing (3):**

- **Checkable** — someone who reads a diff can say "this breaks the
  rule". The given rule for decision 1 shows the strongest pattern: it
  says what to do *even when the code around it shows the old way*. A
  rule for decision 2 that says the same about the old 500s is strong. "Handle bad input properly" is not checkable. "New endpoints
  return 400 when the id is not a number" is.
- **The limit is written down** — decision 2 is for *new* endpoints only.
  A rule without that limit invites Claude to "fix" the old 500s in the
  same change, which breaks decision 3 and old tests. The rule must say
  what stays as it is.
- **Right place** — decision 2 is in a rule file with a `paths:` line that
  matches the handler files of this project. Decision 3 has no `paths:`:
  it applies everywhere, so it belongs in `CLAUDE.local.md`. Check the
  glob against the real tree (list the handler folder); do not trust it by
  reading.

**Optional polish:**

- A `description:` that says when the rule applies.
- Decision 3 says what "the task" is (the files or behavior the prompt
  names), so a diff can show a violation.

**Not applicable:**

- The test kit rule. It was given.
- Length. There is no line target; one or two sentences per decision is
  normal.
- Anything about pollution or the conversation. Nothing conversational is
  under test.

## Nudge bank

- "Read your rule as Claude, while it edits the book handler for another
  task. What does it tell you to do there?"
- "Someone reads the diff. Which line would prove your rule was broken?"
- "Which files does your `paths:` line match? List the folder and check."
- "Decision 3 applies to every file. What does a `paths:` line do to a
  rule like that?"

## Predicted effects for common findings

- No limit to new endpoints → Claude changes the old handlers' 500s too.
  Old tests may fail, and the change grows beyond the task.
- Glob does not match the handler files → the rule never loads. The
  second run looks like the first one, and nothing says why.
- Rule not checkable ("validate input well") → Claude may still return 500
  for a bad id, and nobody can point at the broken line.
- Decision 3 put in a rule file with handler `paths:` → it loads only for
  handler files. A drive-by change in a test or store file is not covered.

## Greenlight bar

Checkable and the limit written down. The place is the round worth
spending only when the glob cannot match.

## Held back

Whether Claude followed the decisions in their first run. The grader
shows that after the second run, with the lines that decided it. Never
predict the outcome of the second run.

## Example bank

On another project, an Order API in Java with Spring:

- **Rule file:** `.claude/rules/controllers.md` with
  `paths: "src/main/java/**/controller/**/*.java"`:
  "New controllers return dates as ISO-8601 strings. Existing controllers
  keep their current date format; do not change them."
- **Glob check:** "`ls src/main/java/shop/controller/` lists the three
  controllers and nothing else, so the pattern matches the layer."
- **A project-wide line in `CLAUDE.local.md`:** "Never add a new library.
  Ask first."
