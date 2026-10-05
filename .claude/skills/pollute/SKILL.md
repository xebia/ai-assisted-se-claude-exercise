---
name: pollute
description: >-
  Fill the current session with context that hurts later work, on purpose.
  Usage: /pollute — used in the Session 3 exercise, task 2, to build the
  polluted session. Chat only: it never edits files.
disable-model-invocation: true
---

# Pollute this session — mechanically

This command is part of an experiment. Execute directly. No leading
questions, no training mode, no commentary about what pollution is. The
participant knows; the exercise sheet told them. Your job is to make this
session look like Session B from the slide *Which Session Is in More
Trouble?*, made worse: a design for review deletion that you write
yourself and that is then half dropped, a pasted log, and a wrong fact
that gets corrected twice. The design is the main attack. Models trust
their own earlier answers more than text a user pastes, and an abandoned
plan from earlier in the same session is how pollution happens at work.
The design breaks this project's rules on purpose: a new library, soft
delete, an owner check, status 204, another error format and another
test style.

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

The rules above apply to the instructions you print. The design and the
log are pollution; write them in full, however long.

## Which project this is

Look at the current folder, then use this table for the rest of the command:

| Marker file    | Test command               | Language | New library for the design      | Planted file          | Second file      |
| -------------- | -------------------------- | -------- | ------------------------------- | --------------------- | ---------------- |
| `go.mod`       | `go test ./... -v`         | Go       | `github.com/go-chi/chi/v5`      | `review_v2.go`        | `book.go`        |
| `gradlew`      | `./gradlew test`           | Kotlin   | `org.jetbrains.exposed`         | `ReviewHandlerV2.kt`  | `BookHandler.kt` |
| `main.py`      | `python3 -m unittest -v`   | Python   | `pydantic`                      | `review_v2.py`        | `book.py`        |
| `package.json` | `bun test`                 | TypeScript | `zod`                         | `review_v2.ts`        | `book.ts`        |

On Windows, run `gradlew.bat test` instead of `./gradlew test`. If
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

## Step 1 — your own design, in the chat only

Write a design called **"review deletion v2"** for this project, in the
language from the table. Do not open any file of this project for it:
write it from the API idea alone. Above it write exactly one line:
*"Draft: review deletion v2."* Then write, in this order:

1. Five decisions, one line each:
   - Soft delete: a `deleted_at` column; deleted reviews stay in the table.
   - Only the author may delete: the user id comes from an `X-User-Id`
     header. No header: 401. Another user: 403.
   - Success returns 204 with an empty body. A review that is already
     deleted returns 404.
   - Errors use the `application/problem+json` format, with `type`,
     `status` and `detail` fields.
   - Input is validated with the library from the table, added as a new
     dependency.
2. The full handler code for `DELETE /reviews/{id}`, with the database
   query inside the handler. At least 60 lines, in one code block.
3. Three tests for it, in a style that uses a mocking library. At least
   40 lines, in one code block.

Present it as a serious proposal. Do not say it differs from this project.
Do not ask whether to build it. Do not shorten it.

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
> 1. `Looks good. The v2 code is already in <planted file>. Take a look.`
> 2. `Sorry, I was wrong. v2 is on another branch, not here.`
> 3. `We dropped most of v2. Keep it simple. Some review logic moved to <second file>. Nothing to do yet.`
>
> After message 3, run `/context` and write down the percentage.

## When the three messages arrive

Stay out of training mode for these three messages. Reply to each in at
most three lines. No leading question.

- Message 1: search for the planted file. Report that it does not exist in
  this project. Do not guess where review logic might be. Do not read the
  real review handler. Do not compare your design with this project.
- Message 2: acknowledge in one line. Do not search again.
- Message 3: acknowledge in one line. Do not ask which parts of v2 stay.
  Do not open the second file. Do not edit anything, and do not offer to.

After message 3, do not remind them of anything. The exercise sheet tells
them what comes next: the same prompt as the clean session, pasted
exactly.
