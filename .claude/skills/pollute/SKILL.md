---
name: pollute
description: >-
  Fill the current session with context that hurts later work, on purpose.
  Usage: /pollute — used in the Session 3 exercise, task 4, to build the
  polluted session. Chat only: it never edits files.
disable-model-invocation: true
---

# Pollute this session — mechanically

This command is part of an experiment. Execute directly. No leading
questions, no training mode, no commentary about what pollution is. The
participant knows; the exercise sheet told them. Your job is to make this
session look like Session B from the slide *Which Session Is in More
Trouble?*: long unrelated answers, a pasted log, and then a wrong fact
that gets corrected twice.

**Never edit, create or delete a file during or after this command.** Not
now, and not when the participant sends the three messages at the end. The
only thing you run is the project's test command, which is read-only.

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

The rules above apply to the instructions you print. The recipes and the
log are pollution; they may be as long and as dull as they like.

## Which project this is

Look at the current folder, then use this table for the rest of the command:

| Marker file    | Test command               | Planted file          | Second file      |
| -------------- | -------------------------- | --------------------- | ---------------- |
| `go.mod`       | `go test ./... -v`         | `review_v2.go`        | `book.go`        |
| `gradlew`      | `./gradlew runTests`       | `ReviewHandlerV2.kt`  | `BookHandler.kt` |
| `main.py`      | `python3 -m unittest -v`   | `review_v2.py`        | `book.py`        |
| `package.json` | `bun test`                 | `review_v2.ts`        | `book.ts`        |

On Windows, run `gradlew.bat runTests` instead of `./gradlew runTests`. If
the Kotlin project has no Gradle wrapper, use `mvn test`.

If none of the marker files is in the current folder, say the command must
run from the bookstore project folder, and stop.

## Step 0 — this session must be fresh

Look at the conversation above this command. If there is anything in it —
an earlier prompt, a tool call, a diff, a reply — this session is not
fresh, and pollution on top of real work spoils the comparison. Then print
exactly this and stop:

> This session is not fresh. Type `/exit`, start `claude` again, then run
> `/pollute`.

Only a session where `/pollute` is the first message continues.

## Step 1 — kitchen sink (long unrelated output)

Write three chocolate-cookie recipes. Each recipe has a name, a full
ingredient list with amounts, and numbered steps from oven temperature to
cooling. Each recipe is at least 40 lines. Do not shorten, do not merge,
do not summarize. Length is the goal: a short answer would pollute almost
nothing. Print all three, one after the other, with no introduction.

## Step 2 — context hoarding (a pasted log with no question)

Run the project's test command from the table. Then print the complete
output in your answer, unedited, inside one code block. Above the block
write exactly one line: *"Full test output, just so you have it."* Say
nothing about the result. Do not count the tests. Do not point at
failures. Do not offer to fix anything.

If the output is shorter than 100 lines, run the command a second time and
print that output too.

## Step 3 — hand over the wrong fact

The wrong fact must come from the participant, not from you. Otherwise it
is not a fact you were told; it is a fact you made up. So end your answer
with this block, with the file names from the table filled in:

> Pollution steps 1 and 2 are done. Step 3 is yours.
> Send these three messages, one at a time. Wait for my reply after each.
>
> 1. `All review logic now lives in <planted file>. Take a look.`
> 2. `Sorry, I was wrong. That file is on another branch, not here.`
> 3. `Some review logic moved to <second file>. Nothing to do yet.`
>
> After message 3, run `/context` and write down the percentage.

## When the three messages arrive

Stay out of training mode for these three messages. Reply to each in at
most three lines. No leading question.

- Message 1: search for the planted file. Report that it does not exist in
  this project. Do not guess where review logic might be. Do not read the
  real review handler.
- Message 2: acknowledge in one line. Do not search again.
- Message 3: acknowledge in one line. Do not open the second file. Do not
  edit anything, and do not offer to.

After message 3, do not remind them of anything. The exercise sheet tells
them what comes next: the same prompt as the clean session, pasted
exactly.
