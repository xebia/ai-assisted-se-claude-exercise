# Exercise 1: First Conversations

**Session**: 1 — First Steps & Core Concepts\
**Duration**: 25 minutes\
**Project**: "BookStore API" — a Python 3 REST API using only the stdlib
(`http.server`, `sqlite3`). Everyone clones the same repo.

## Goal

In this exercise you have your first conversations with Claude in your
editor. You do three things:

1. Ask Claude to explain a function, and count how many tool calls and how
   many cycles Claude needs for its answer.
2. Ask Claude to find a bug, to add checks to a function, and to write a
   test for those checks.
3. After each task, look at the trace and write down what you see. The
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

In this task you ask Claude to explain the function `search()` of the
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
   explain `search()`.
4. **Ask the question.** Paste the two lines below into the chat as one
   message. The first line is a tag, which is text in square brackets. The
   tag switches training mode off for this one message. Without the tag,
   Claude would ask you a question first, and your counts would change.

   ```
   [Exercise 1 experiment — execute directly, no leading questions.]
   Explain step by step what search() in the book store does
   ```

5. **Count the rows.** When Claude has answered, count the `tools` rows and
   the `model` rows that the pane shows for this turn. Write down the
   number of `tools` rows and the number of `model` rows.
6. **Check the answer.** Read Claude's answer. Write down *yes* if the
   answer says that the code runs one extra database query for each book.
   Write down *no* if the answer does not say that. You do not need to open
   the code yourself.
7. **Find the first step.** Look at the first rows of the pane. Write down
   the name of the first tool that Claude used and the name of the first
   file that Claude opened.

If no pane opens, or Claude says that the command `/xtrace` is not found,
use the command `/trace` instead. After each answer from Claude, run
`/trace` in the chat. The command `/trace` lists the tool calls of the last
turn, but it does not show cycles. In that case, count tool calls and skip
the cycle count.

**Done when**: you wrote down your guess for the `search()` question, the
number of `tools` rows, the number of `model` rows, *yes* or *no* for the
extra database query, and the first tool and the first file that Claude
used.

### 2. Find a bug

In this task you ask Claude whether the function `create_review()` has a
bug. You find out which files Claude opens to answer.

1. **Clear the conversation.** Run `/clear` in the chat. This starts a
   new, empty conversation, so Claude no longer has the conversation of
   task 1.
2. **Guess before you ask.** Write one sentence as your guess: besides
   `bookstore/handler/review.py`, which file will Claude open to find out
   whether `create_review()` has a bug?
3. **Ask the question.** Paste this prompt into the chat:

   ```
   Is there a bug in create_review() in bookstore/handler/review.py?
   ```

4. **Answer Claude's question.** Training mode is on, so Claude asks you
   a question before it answers your prompt. Answer that question in your
   own words. Then read Claude's answer to your prompt.
5. **Go back one turn in the pane.** The pane shows the last turn. To
   see the turn before the last turn, press ctrl+x and then Tab. Now the
   pane reads your key presses, and the chat does not. Then press `p` to
   go back one turn. Press Esc when you want to type in the chat again.
   If you use `/trace`, run `/trace all` to list the tool calls of every
   turn.
6. **Find the file.** Look at the `Read` rows in the pane. Write down
   which file Claude opened and in which turn, and write down whether your
   guess about the file was right.

**Done when**: Claude named a bug, and you can say in one sentence what
`create_review()` does not check.

### 3. Add checks, say no, add a test

In this task you ask Claude to add input checks to `create_review()`. You
reject the way that Claude adds them, and then you ask Claude to write a
test. Claude changes the file `bookstore/handler/review.py` and creates the
test file `tests/handler/test_validate_review.py`. You do not edit any file
yourself.

1. **Clear the conversation.** Run `/clear` in the chat to start a new,
   empty conversation.
2. **Ask for the checks.** Paste this prompt into the chat:

   ```
   Add input validation to create_review: rating must be 1-5, review_text must be between 10 and 500 characters
   ```

3. **Answer Claude's question.** If Claude asks a question, answer it, or
   type *just tell me*.
4. **Look at the change.** Run `git diff` in a second terminal in the same
   folder. Look at the diff and write down where Claude put the checks: in
   the handler, in a separate function, or in a dataclass.
5. **Reject the solution.** Paste this prompt into the chat. The prompt
   asks Claude to move the checks into a function of their own:

   ```
   No, extract the validation into a separate validate_review() function instead
   ```

6. **Ask for a test.** Paste this prompt into the chat:

   ```
   Write a unittest test class for validate_review() with one test per case covering: rating 0, rating 6, text of 9 characters, text of 501 characters, and one valid review. Put it in tests/handler/test_validate_review.py and name the class TestValidateReview
   ```

7. **Run the test yourself.** Run this command in your own terminal, not in
   the Claude chat. The output shows five test cases. Look only at the
   output of these five test cases:

   ```
   python3 -m unittest tests.handler.test_validate_review -v
   ```

8. **Read the pane.** Press ctrl+x and then Tab. Press `p` to go back one
   turn and `n` to go forward one turn. Look at the turns that came after
   your first prompt in this task. Write down three things. First, which tool changed the file
   `bookstore/handler/review.py`. Second, whether Claude ran anything to
   check its own change. Third, whether Claude ran the test or only you
   did. If Claude ran nothing, write down that Claude ran nothing.

Saying no to Claude is normal. You decide what goes into your code.

**Done when**: the function `validate_review()` exists in
`bookstore/handler/review.py`, the function `create_review()` calls
`validate_review()`, and you wrote down the result of the test command. A
failing test is also a result that you write down.

### 4. Reset, then ask a question about the whole API

In this task you ask Claude one question about the whole API. You count
how many files Claude reads, and how many status-code problems Claude
finds. There is no right number.

1. **Clear the conversation.** Run `/clear` in the chat. Claude no longer
   has tasks 1 to 3 in its conversation. Your own notes stay.
2. **Ask the question.** Paste this prompt into the chat. Training mode is
   on, so Claude may ask you a question first. If Claude does, answer that
   question:

   ```
   What HTTP status codes does this API return, and which ones violate REST conventions?
   ```

3. **Count the files.** When Claude has answered, count the `Read` rows in
   the pane. Each `Read` row names one file. If the same file appears in
   two `Read` rows, count that file once. A search row, such as `Grep`, is
   not a `Read` row, so do not count it. Write down the number of files.
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
four questions about your notes:

- In task 1, how many tool calls and how many cycles did Claude need to
  explain `search()`?
- In task 2, which file did Claude open first to look for the bug in
  `create_review()`? Was your guess about that file right?
- In task 3, did Claude run the test, or did only you run it?
- In task 4, how many files did Claude read, and how many status-code
  problems did Claude find?
