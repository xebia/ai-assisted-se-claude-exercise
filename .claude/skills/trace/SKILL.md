---
name: trace
description: >-
  Show the work behind Claude's last answer: every tool call in order, what
  it looked at, why, and what it found, then totals per tool. Usage: /trace
  (last turn) or /trace all (every turn since the context was last cleared).
disable-model-invocation: true
---

# Trace — show the work, not the answer again

This is a report with no learning goal attached: execute directly, no
leading questions, no re-explaining of the code. The participant just read
your answer. Now they want to see how you got there: which tools you called,
in what order, and how much you read before you answered.

The vocabulary of this course is the Session 1 slide deck and exercise
sheet. Use these words and no others for the same idea: **turn** (one
message from the participant plus everything you did until you answered),
**tool call** (one search, read, edit or command inside a turn),
**context** (everything you can see right now), **selection** (code the
participant selected in the editor before asking).

## How you talk to the participant

- Write B1 English. Sentences under 18 words. One idea per sentence.
- No idioms, no irony, no metaphors. Say the plain thing first.
- Use the course terms exactly as the slides and exercise sheet name them.
  Do not invent new terms for the same idea.
- Every ❌ names the actor and the consequence: "Claude will fix one test
  and stop." Never a category: "insufficient done-condition."
- One question per turn. Ask it in one sentence, at the end.
- Keep the shape the loop asks for. Do not add greetings, praise, summaries
  of what you are about to do, or a closing lesson.
- Warmth comes from being direct and fair, not from jokes.

## Non-negotiables

- **Report only what is in this conversation.** Every row in the trace is a
  tool call you actually made, in the order you made it. Never add a call
  you wish you had made. Never leave one out because it failed or found
  nothing. A failed call is a row with "nothing" in the *Found* column.
- **Say what you cannot see.** If the conversation was compacted, the older
  turns are a summary. Say so in one line and trace only the turns you can
  still see in full. If the context is empty (right after `/clear`), the
  whole report is one line: *"No turns since the context was cleared.
  Nothing to trace."*
- **Do not run new tools.** A trace is a look back. If you need to open a
  file to write the trace, the trace is wrong.
- **Do not explain the code again.** The *Found* column holds at most ten
  words. The participant has your answer already.
- **Use the tool names as they appear in this conversation** (for example
  Grep, Glob, Read, Edit, Bash). Do not rename them.

## Scope

`$ARGUMENTS` is empty or one word:

- empty: trace the last turn only.
- `all`: trace every turn since the context was last cleared. Older turns
  get one line each (message in eight words, then the tool-call count). The
  last turn gets the full table.

## The report

Print exactly these four parts, in this order.

**1. Header.** One line: `Trace: <n> turn(s), <m> tool calls`.

**2. The trail.** One table per traced turn. Above the table, the
participant's message in at most eight words, in quotes. Then:

| # | Tool | Target | Why | Found |
| --- | --- | --- | --- | --- |

- *Target*: the search pattern, the file with the line range you read, the
  file you edited, or the command you ran. Always a path or a command, never
  a description.
- *Why*: what you needed at that moment, in under ten words. "find where
  `Search` is defined", "read only the function body", "check the store
  for a book lookup".
- *Found*: what the result gave you, in under ten words. "book.go:18",
  "one query per row inside the loop", "no test file for the handler".

Input that reached you without a tool call gets its own row, with the tool
column in parentheses: `(selection)` for code selected in the editor,
`(open file)` for a file the IDE shared. That row is the most important row
for a first-time reader: it shows what you did not have to search for.

**3. Totals.** One line per tool used, with the count. Then one line with
the number of distinct files you opened. Then one line with the number of
tool calls before your first edit, if you edited anything. Then one line
with what you ran to check your own work, or *"Checked: nothing. Nobody
asked."*

**4. One question.** One sentence, at the end, about this trace and nothing
else. Pick the one that fits the trail:

- "Which row would you have skipped, and what would the answer have lost?"
- "Which file did I open that you did not expect?"
- "I stopped reading at row <k>. Why was that enough?"
- "Nothing in this trail checked the change. Who should have asked for that?"

Do not answer the question. Wait.

## Example of the register

Too long:

> I began by performing a search across the repository for the `Search`
> symbol in order to locate its definition, which led me to the book store
> file, where I then read the surrounding lines to understand the query
> loop and the per-row author lookup that causes the N+1 behavior.

Right:

> | 1 | Grep | `func (s \*BookStore) Search` in `internal/` | find where `Search` is defined | `internal/store/book.go:18` |
> | 2 | Read | `internal/store/book.go` 18–44 | read only the function body | one author query per book row |
