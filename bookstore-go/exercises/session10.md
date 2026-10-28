# Exercise 10: Claude Without You Watching

**Session**: 10 — Headless & Automation\
**Duration**: 31 minutes, plus a 4-minute closing round\
**Project**: The same BookStore API, and the `headless` folder in it.

## Goal

In this exercise you run Claude without a chat, and you check whether
you can trust the result. You:

1. Run one prompt headless, twice, and see what loads.
2. Build a review gate: a script asks Claude for a verdict and stops on
   "block".
3. Break a team rule on purpose, and watch the gate stop it.
4. Write the prompt for a morning brief, and test it on two nights.

## Start here

- Open a terminal in the `bookstore` folder. Run every command from
  there.
- You need `uv`. The preparation sheet installs it.
- Every run uses your own Claude login. You do not need an API key.
- Write your notes on paper or in a text file outside the project.
- The trainer tells you when to start each next task.

## Tasks

### 1. One prompt, two runs

This task gives you two answers to the same question, and the reason
they differ.

1. **Predict.** Training mode is on in this folder. Write one line: what
   does Claude do when it wants to ask you a question, but nobody is in
   the chat?
2. **Run it in the project.**

   ```
   claude -p "What does the reviews handler do? Three sentences." --output-format json
   ```

   Read `result`. Write down `total_cost_usd` and `session_id`.
3. **Run it again with `--safe-mode`.**

   ```
   claude --safe-mode -p "What does the reviews handler do? Three sentences."
   ```

   Compare the answer with the first run.

Why: without `--safe-mode`, a headless run loads everything in the
folder, also `CLAUDE.md` with training mode. With `--safe-mode`, it
loads only what you name on the command line.

**Done when**: you can say in one sentence why the two answers differ,
and the cost and session id of the first run are in your notes.

### 2. Build the review gate

This task produces a gate that passes a clean commit. The gate is
`headless/gate.py`: it sends your last commit to Claude, gets a verdict,
and stops on "block".

1. **Read the script.** Open `headless/gate.py`. Find the command it
   runs (`cmd = [...]`) and the two places marked `(I write this)`.
2. **Write the answer shape.** Replace the inside of `SCHEMA` with a JSON
   Schema: an object with `verdict` (`"pass"` or `"block"`) and
   `findings` (a list of strings). Both are required. The slide *Make a
   Script Able to Read It* shows the idea.
3. **Give Claude the rules.** Read `headless/team-rules.md`. Then fill in
   `RULES`: the flag that adds a file to Claude's instructions, and the
   path `headless/team-rules.md`. The slide *The Gate: A Review Before
   Every Push* shows the flag.
4. **Commit your gate.**

   ```
   git add -A .
   git commit -m "Add the review gate"
   ```

5. **Make a clean change, and run the gate.** Add one line to
   `README.md`, for example `Gate test.` Then:

   ```
   git commit -am "Gate test"
   uv run headless/gate.py
   ```

**Done when**: the gate prints `Verdict: pass` for your README change.

### 3. Break a rule on purpose

This task produces a commit that the gate must block.

1. **Predict.** A new endpoint answers an id that is not a number with
   500. Will the gate block it? Write *yes* or *no*.
2. **Let Claude break the rule.** This run uses `--safe-mode`, so your
   rule files from the steering session do not load:

   ```
   claude --safe-mode -p "Do the task in headless/break.txt" --permission-mode acceptEdits
   ```

3. **Commit, and run the gate.**

   ```
   git add -A .
   git commit -m "Add GET /api/reviews/{id}"
   uv run headless/gate.py
   ```

4. **Run the gate once more.** Write down whether the verdict and the
   findings are the same. The gate is a model's judgment, not a compiler.

Claude answered 400 anyway? Then the gate passes, and that is also a
correct result. Write it down and go on.

**Done when**: the gate prints `Verdict: block`, and a finding names
rule 1 and quotes the line.

### 4. The morning brief

This task produces two briefs: one for a bad night, and one for a night
that looks quiet.

1. **Write the prompt.** Create `headless/brief-prompt.txt` and write the
   prompt in your own words. It must ask for: at most 10 lines, the worst
   problem first, every number with the log line it came from, and one
   line when nothing went wrong.
2. **Run it on the full night.**

   ```
   uv run headless/brief.py headless/night-full.txt
   ```

   Does the brief name the endpoint with the errors, give the count, and
   quote a line? The input Claude got is in
   `headless/out/input-night-full.txt`.
3. **Predict, then run it on the second night.** This log was rotated at
   01:40. Will your brief notice that the night is not complete? Write
   *yes* or *no*, then run:

   ```
   uv run headless/brief.py headless/night-cut.txt
   ```

4. **Improve one sentence.** Your brief says "quiet night" and does not
   say that the log stops at 01:40? Add one sentence to your prompt, for
   example a demand for the time range the log covers. Run step 3 again.

**Done when**: the full-night brief names the endpoint with the errors
and quotes a log line, and the second brief says which time range it
covers.

### 5. Check your work

1. **Run the check.** Start `claude` and run `/verify-exercise 10`. It
   reads your gate, the gate answers in `headless/out/` and both briefs.
   It asks one question first. Answer it in one line.
2. **Read the report.**

**Done when**: you have read the report. Bring one line from it to the
closing round.

## Bonus: the gate before every push

A `pre-push` hook runs the gate before `git push`. A push to a folder on
your own disk shows it, without GitHub.

1. Create the file `.git/hooks/pre-push` with these two lines:

   ```
   #!/bin/sh
   exec uv run headless/gate.py
   ```

2. On macOS or Linux, make it executable:

   ```
   chmod +x .git/hooks/pre-push
   ```

3. Make a target and push to it:

   ```
   git init --bare ../gate-target.git
   git push ../gate-target.git HEAD
   ```

The last commit breaks rule 1, so the push stops.

## Take-home: the gate in GitHub Actions

`headless/claude-review.yml` is the same gate as a workflow for a pull
request. Copy it to `.github/workflows/` in a repository of your own.
It needs one secret: `CLAUDE_CODE_OAUTH_TOKEN`. You make it with
`claude setup-token`, and it uses your subscription. The workflow reads
the rules from the base branch, not from the pull request.

## Reference: who runs it, and who pays

| Where it runs | Logs in with | Acts as | Who pays |
| --- | --- | --- | --- |
| `claude -p` or `claude --safe-mode -p` on your laptop | your login | you | your plan |
| `claude --bare -p` in a script | an API key | the key | API billing |
| GitHub Actions | a token from `claude setup-token`, or an API key | the Claude GitHub App | the token owner's plan, or API billing, plus GitHub minutes |
| A cloud scheduled task | your claude.ai account | you | your plan |

## Back at work

Pick one check you do by hand before every push. Write it as a rule in
the style of `headless/team-rules.md`, and run the gate on your own
repository.

## Closing round

The trainer asks the room. Have these answers ready:

- Why did the two runs in task 1 answer differently?
- In the gate, what does Claude decide, and what does the script decide?
- Did your brief notice the short night? Which sentence in your prompt
  made the difference?
- The gate treats "no verdict" as "block". Why is that the safe choice?
