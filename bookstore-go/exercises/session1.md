# Exercise 1: First Conversations

**Session**: 1 — First Steps & Core Concepts\
**Duration**: 25 minutes\
**Project**: "BookStore API" — a Go REST API using only `net/http`. Everyone
clones the same repo.

## Goal

In this exercise you have your first conversations with Claude in your
editor. You do three things:

1. Ask Claude to explain a function, and count how many tool calls and how
   many cycles Claude needs for its answer.
2. Ask Claude to add checks to a function and to write a test for those
   checks.
3. Ask Claude a question about the whole API, and count how many files
   Claude reads.

After each task, you look at the trace and write down what you see. The
trace is the list of every step that Claude took.

## Start here

- Open a terminal in the folder that you cloned. The folder is called
  `bookstore`. Start `claude` in that terminal.
- Training mode is on. This means that the file `CLAUDE.md` tells Claude
  to ask you a question before it helps you. When Claude asks that
  question, answer it. If you do not want to answer, type *just tell me*,
  and Claude answers directly.
- Never edit the file `CLAUDE.md`.
- Write your notes on paper or in a text file outside the project.

## Tasks

### 1. Explain a function, and count the work behind the answer

In this task you ask Claude to explain the function `Search()` of the
book store. You count how many tool calls and how many cycles Claude needs
to answer.

1. **Open the trace pane.** Run this command in the Claude chat. The
   command `/xtrace` came with this project. It opens a pane, which is a
   panel next to the chat, with one row for each step that Claude takes:

   ```
   /xtrace tools model pane
   ```

2. **Learn the two kinds of rows.** A `model` row in the pane is one
   cycle, which is one call to the model. A `tools` row in the pane is one
   tool call, which is one search, read, edit or command that Claude runs.
   A turn is your message plus everything that Claude does until it
   answers.
3. **Guess before you ask.** Write down two numbers as your guess: the
   number of tool calls and the number of cycles that Claude will need to
   explain `Search()`.
4. **Ask the question.** Paste the two lines below into the chat as one
   message. The first line is a tag, which is text in square brackets. The
   tag switches training mode off for this one message. Without the tag,
   Claude would ask you a question first, and the number of rows in the
   pane would change.

   ```
   [Exercise 1 experiment — execute directly, no leading questions.]
   Explain step by step what Search() in the book store does
   ```

5. **Count the rows.** When Claude has answered, count the `tools` rows and
   the `model` rows that appeared in the pane after you pasted the two
   lines. Write down the number of `tools` rows and the number of `model`
   rows.
6. **Check the answer.** Read Claude's answer. Write down *yes* if the
   answer says that the code runs one extra database query for each book.
   Write down *no* if the answer does not mention an extra database query
   for each book. You do not need to open
   the code yourself.
7. **Find the first step.** Look at the first rows that appeared after you
   pasted the two lines. Write down the tool in the first `tools` row, and
   the name of the first file that Claude opened.

If no pane opens, or Claude says that the command `/xtrace` is not found,
use the command `/trace` instead. After each answer from Claude, run
`/trace` in the chat. The command `/trace` lists the tool calls of the last
turn, but it does not show cycles. In that case, count tool calls and skip
the cycle count.

**Done when**: you wrote down your guess of two numbers for `Search()`
(tool calls and cycles), the number of `tools` rows, the number of `model`
rows, *yes* or *no* for the extra database query, and the first tool and
the first file that Claude used.

### 2. Add checks and a test

In this task you ask Claude to add input checks to the function
`CreateReview()`, and then to write a test for those checks. Claude changes
the file `internal/handler/review.go` and creates the test file
`internal/handler/validate_test.go`. You do not edit any file yourself.

1. **Clear the conversation.** Run `/clear` in the chat. This starts a
   new, empty conversation, so Claude no longer has the conversation of
   task 1.
2. **Ask for the checks.** Paste this prompt into the chat. The prompt asks
   Claude to put the checks in a separate function named `validateReview()`:

   ```
   Add input validation to CreateReview in a separate validateReview() function: rating must be 1-5, review_text must be between 10 and 500 characters
   ```

3. **Answer Claude's question.** Training mode is on, so Claude may ask you
   a question before it writes code. If Claude asks, answer that question,
   or type *just tell me*.
4. **Ask for a test.** Paste this prompt into the chat:

   ```
   Write a table-driven test for validateReview() covering: rating 0, rating 6, text of 9 characters, text of 501 characters, and one valid review. Put it in internal/handler/validate_test.go, in package handler, and name it TestValidateReview
   ```

5. **Run the test yourself.** Run this command in your own terminal, not in
   the Claude chat. The output shows five test cases. Look only at the
   output of these five test cases:

   ```
   go test ./internal/handler/ -run TestValidateReview -v
   ```

6. **Move through the turns.** The pane shows the last turn. To see an
   earlier turn, press ctrl+x and then Tab. Now the pane reads your key
   presses, and the chat does not. Press `p` to go back one turn and `n` to
   go forward one turn. Press Esc when you want to type in the chat again.
   If you use `/trace`, run `/trace all` to list the tool calls of every
   turn.
7. **Read the turns.** Look at the turns that came after you pasted the
   prompt in step 2. Write down three things. First, which tool changed the
   file `internal/handler/review.go`. Second, whether Claude ran anything
   to check its own change. Third, whether Claude ran the test or only you
   did. If Claude ran nothing, write down that Claude ran nothing.

**Done when**: the function `validateReview()` exists in
`internal/handler/review.go`, the function `CreateReview()` calls
`validateReview()`, and you wrote down the result of the test command and
your three answers from step 7. A failing test is also a result that you
write down. You do not need to fix the failing test.

### 3. Reset, then ask a question about the whole API

In this task you ask Claude one question about the whole API. You count
how many files Claude reads, and how many status-code problems Claude
finds. There is no right number.

1. **Clear the conversation.** Run `/clear` in the chat. Claude no longer
   has tasks 1 and 2 in its conversation. Your own notes stay.
2. **Ask the question.** Paste this prompt into the chat. Training mode is
   on, so Claude may ask you a question first. If Claude does, answer that
   question:

   ```
   What HTTP status codes does this API return, and which ones violate REST conventions?
   ```

3. **Count the files.** When Claude has answered, count the `Read` rows in
   the pane, in every turn since you ran `/clear`. Each `Read` row names
   one file. If the same file appears in two `Read` rows, count that file
   once. A search row, such as `Grep`, is not a `Read` row, so do not
   count it. Write down the number of files.
4. **Count the problems.** Read Claude's answer and count the status-code
   problems that it lists. If Claude lists the same problem twice, count it
   once. Write down the number of problems.

**Done when**: you wrote down the number of files that Claude read and the
number of status-code problems that Claude found.

## Bonus (only if time remains)

Ask Claude the status-code question again, as a new message in the same
conversation. Do not run `/clear` first. Paste this prompt into the chat:

```
What HTTP status codes does this API return, and which ones violate REST conventions?
```

Then press ctrl+x and then Tab. Press `p` to go back one turn in the pane.
Compare the tool calls of this turn with the tool calls of the turn before.
Write one sentence: did Claude need fewer tool calls this time, and why?

## Closing round

The trainer calls on people at random. Prepare an answer to each of these
three questions about your notes:

- In task 1, how many tool calls and how many cycles did Claude need to
  explain `Search()`?
- In task 2, did Claude run the test, or did only you run it?
- In task 3, how many files did Claude read, and how many status-code
  problems did Claude find?
