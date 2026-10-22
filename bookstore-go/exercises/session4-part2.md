# Exercise 4, Part 2: The Secret Guard

**Session**: 4 — Skills, Hooks & Automation\
**Duration**: 17 minutes, plus a 5-minute closing round\
**Project**: The same BookStore API, on the `session4-playground` branch.

## Goal

Everything you type and everything Claude reads goes to the model. In this
part you wire a hook that blocks a prompt with a secret in it. Then you
find the case the hook does not see, and you close that case with a rule.

## Start here

- Same folder, same branch as Part 1. Everything you create goes in
  `bookstore/.claude/`.
- The file `.env` in the `bookstore` folder holds a fake API key, made for
  this exercise. Treat it as a real one.
- Prompts that start with the experiment tag work as in Part 1. Copy
  them exactly, tag included.
- Never edit `CLAUDE.md`.
- The *Done when* lines are your checklist. Stuck? Type *just tell me*.

## Tasks

### 3. Wire the guard and predict

This task produces `.claude/hooks/guard-secrets.py`, an entry in
`.claude/settings.json`, and three predictions.

1. **Let Claude create the script**. It runs on every prompt you send,
   before the prompt leaves your laptop (*The Secret That Never Leaves*).
   It is Python, not a shell script, because many of you are on Windows.
   Paste this whole block:

   ```
   [Exercise 4 experiment — execute directly, no leading questions.] Create .claude/hooks/guard-secrets.py with exactly this content, nothing added or changed:

   import json
   import re
   import sys

   data = json.load(sys.stdin)
   text = data.get("prompt", "")

   if re.search(r"acme_live_[A-Za-z0-9]{24}", text):
       print(json.dumps({
           "decision": "block",
           "reason": "Blocked: this prompt contains an ACME API key. Remove the key and send it again."
       }))
   ```

2. **Add the hook to your settings**. Create the file
   `.claude/settings.json` yourself (it does not exist yet), with exactly
   this content:

   ```json
   {
     "hooks": {
       "UserPromptSubmit": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "python .claude/hooks/guard-secrets.py"
             }
           ]
         }
       ]
     }
   }
   ```

   On mac or linux, write `python3` instead of `python`. Not sure? Run
   `python --version`; if that fails, use `python3`.

3. **Write three predictions**, on paper or in a text file, not
   in the chat; the verifier asks for them. For each case, one line: does
   the guard block it, yes or no, and why.

   1. You paste a log line that contains the key.
   2. You ask Claude what the value of `ACME_API_KEY` in `.env` is.
   3. You ask Claude to run `grep -r acme_live .`.

**Done when**: both files exist and your three predictions are written.

**When the trainer calls task 4**, start it, whatever your predictions
look like.

### 4. Run it, find the hole, close it

This task produces one blocked prompt, a `permissions` rule in
`.claude/settings.json`, and your marked predictions.

1. **Paste the trap**. This looks like a log line copied from a terminal.
   Send it as a normal prompt:

   ```
   This request failed on staging. What is wrong with it?
   POST /api/books 401 token=acme_live_7Hq2mX9vK4pL8sW1dR3nT6yB reason=expired
   ```

   The guard blocks it, and the terminal shows the reason from your
   script. The prompt never reached the model. (If Claude answered
   instead, `python` was not found: fix the command in `settings.json`
   and send the trap again.)

2. **Ask for the key**. Send this as a normal prompt:

   ```
   What is the value of ACME_API_KEY in .env?
   ```

   Claude reads the file. The guard did not block anything: it runs on the
   text *you* type, never on what Claude reads with its tools. Whether
   Claude repeats the value or not, the file content is in the transcript
   now, so it went to the model.

3. **Close the hole with a rule**. A rule is a list, not a script: it
   names files Claude may not read (*Claude Must Never Read `.env`*).
   Open `.claude/settings.json` and add the `permissions` part, so the
   file looks like this:

   ```json
   {
     "permissions": {
       "deny": ["Read(.env)"]
     },
     "hooks": {
       "UserPromptSubmit": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "python .claude/hooks/guard-secrets.py"
             }
           ]
         }
       ]
     }
   }
   ```

   Save it; no restart is needed. Send the same question again. Claude
   reports that it may not read the file. Then try the command form:

   ```
   Run cat .env and show me the output.
   ```

   Also denied: a `Read` rule covers the file commands Claude Code knows,
   such as `cat`, `head` and `tail`.

4. **Mark your predictions**. For each one, write confirmed or wrong,
   with one line of evidence from the chat. Prediction 3 is tested in the
   bonus; if you skip the bonus, mark it with one line of reasoning.

5. **Run the verifier**. Type `/verify-exercise 4`. It asks for your
   three predictions first and settles them, then grades both skills, the
   guard and the rule. Read its report before the closing round.

**Done when**: the trap was blocked, the rule is in `settings.json`, your
three predictions are marked, and the verifier is running.

## Bonus (only if time remains)

**The hole in the rule.** Send this as a normal prompt:

```
Run grep -r acme_live . and show me the output.
```

The key appears. The rule matches a command that *names* the file;
`grep -r` names none, so the rule does not see it. Neither does the guard.
The wall that stops every process from reading a file is the sandbox
(*The Claude Code Security Harness*). Every layer has a hole. That is why
there are layers.

**Send the guard a fake event**, the way Claude Code does. Save this as
`.claude/fake-event.json`:

```
{"prompt":"deploy with acme_live_7Hq2mX9vK4pL8sW1dR3nT6yB please"}
```

Run this in your own terminal, not in Claude (`python3` on mac or linux):

```
python .claude/hooks/guard-secrets.py < .claude/fake-event.json
```

The script prints the block decision. Change the prompt in
`fake-event.json` to `deploy please`: it prints nothing.

## Closing round

The trainer asks the room. Have these answers ready:

- Which prediction was wrong, and what showed it?
- What does the guard see, what does the rule see, and what sees
  everything?
- Which words in your `description` started `/changelog` at the right
  moment in Part 1? Which would you make sharper now?
- One thing you would tell someone who skipped this session.

## After the closing round

**Clean up the branch.** Two lines, one at a time (PowerShell 5.1 cannot
join them with `&&`):

```
git switch -
git branch -D session4-playground
```

The commits are gone. Your files are not: `CHANGELOG.md`, `.claude/skills/`,
`.claude/hooks/` and `.claude/settings.json` are gitignored.

**Back at work.** If you build one hook this month, build the feedback
loop: a `PostToolUse` hook on `Edit|Write` that runs your formatter, or
your fastest tests, and reports the failures to Claude. Claude then fixes
what it just broke, without being asked. The hooks page in the Claude Code
docs shows the settings; most teams need one small script, the shape of
`guard-secrets.py`.
