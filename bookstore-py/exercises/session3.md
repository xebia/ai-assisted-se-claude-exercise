# Exercise 3: Two Skills and a Secret Guard

**Session**: 3 — Skills, Hooks & Guardrails\
**Duration**: 40 minutes, plus a 5-minute closing round\
**Project**: The same BookStore API.

## Goal

You learn that the `description` of a skill decides when Claude starts the
skill by itself. You also learn that a hook sees only the text you type, so
a permission rule must cover the files Claude reads.

## Start here

- Open a terminal in the `bookstore` folder that you cloned, and start
  `claude` there. Claude creates the `.claude` folders in it when you ask.
- The file `.env` in this folder holds a fake API key. Treat it as a secret.
- Training mode is on: Claude asks you questions before it helps. Stuck?
  Type *just tell me* in the chat.
- Never edit `CLAUDE.md`.
- The trainer tells you when to start each next task, even if you are not
  done.

## Tasks

### 1. Copy the `/commit` skill and run it

A skill is a file that Claude Code runs when you type its name. You copy a
ready-made skill and run it.

1. **Create a branch.** Do not push it. You delete it after the closing
   round.

   ```
   git switch -c session3-playground
   ```

2. **Let Claude copy the skill.** The folder `exercises/starters` in `bookstore` holds a
   ready-made skill file, `commit-skill.md`. The text in square brackets is
   the tag. It switches training mode off for this one prompt. Copy every
   tagged prompt exactly, tag included. A prompt without a tag goes in as
   you type it, and training mode stays on. Paste:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Copy exercises/starters/commit-skill.md to .claude/skills/commit/SKILL.md. Change nothing in the content.
   ```

3. **Change a file by hand.** Add one comment line to any source file in the
   project and save the file. Do not ask Claude.
4. **Run the skill.** Type `/commit` in the chat. A new skill works at
   once, with no restart.
5. **Find three lines in the skill.** Open `.claude/skills/commit/SKILL.md`
   and read what each line does. You change nothing.
   - `disable-model-invocation: true`: only you can start the skill, by
     typing `/commit`.
   - *Execute directly — no leading questions*: Claude commits and does not
     ask questions.
   - The rule *imperative mood*: the commit message starts with a verb,
     such as "Add" or "Fix". The `/changelog` skill in task 2 reads these
     messages.

**Done when**: `git log -1` shows a new commit with your change, and the
message starts with a verb, such as "Add" or "Fix".

### 2. Let Claude write `/changelog`, then write its description

Claude can start `/commit` only when you type it. For `/changelog`, Claude
may start the skill by itself, and you write the `description` line that
decides when.

1. **Paste the prompt that creates two files.** Claude writes
   `.claude/skills/changelog/SKILL.md` and, next to it,
   `common-changelog-spec.md`. The second file holds the rules of Common
   Changelog, a standard layout for a changelog.

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Create the skill .claude/skills/changelog/SKILL.md. Frontmatter: `name: changelog` and `description: (I write this)`, no other lines. Body: numbered instructions. Read CHANGELOG.md, and create it with the heading `# Changelog` if it is missing. Read common-changelog-spec.md, next to this file, before you change the changelog. Add only new commits, under `## Unreleased`, in the groups Changed, Added, Removed and Fixed. Write one sentence per entry. Start it with a present-tense verb and end it with the short commit hash in round brackets. Put breaking changes first in their group, marked **Breaking:**. Save the rules from https://common-changelog.org/ as markdown in common-changelog-spec.md.
   ```

2. **Check the two new files.** `common-changelog-spec.md` holds rules,
   not an empty page. `SKILL.md` has **no** `disable-model-invocation`
   line, so Claude can start the skill by itself.
3. **Write the description.** In your editor, open `SKILL.md` and replace
   `(I write this)` with one sentence that has no colon. Claude reads only
   this line when it decides to start a skill on its own. Name the file,
   the format and the moment to act (*Which Description Gets This Skill
   Invoked at the Right Moment?*). Then write in your notes which of your words
   start the skill at the right moment, and which could start it at the
   wrong one. You need this for the closing round.
4. **Send a request that must start the skill.** Type it in the chat,
   without a slash. The chat shows the name `changelog` when Claude starts
   the skill.

   ```
   I just committed. Bring the changelog up to date.
   ```

5. **Send a request that must not start the skill.** Type it in the chat,
   without a slash.

   ```
   Summarise the last three commits for me, in two sentences.
   ```

   If one request went wrong, change the words of your description that
   caused it and send that request again.

If your network blocks the page common-changelog.org, ask Claude to write
the spec file from what it knows.

**Done when**: both new files exist, the request that must start the skill
started it, and the request that must not start it did not.

### 3. Add the guard and predict

Skills do not protect secrets, and the fake key in `.env` must never reach the model. The guard is a script
that runs on every prompt you send, before the prompt leaves your laptop
(*The Secret That Never Leaves*). It is written in Python, which runs on
Windows too.

1. **Let Claude copy two files.** The folder `exercises/starters` holds the
   script `guard-secrets.py` and the settings file `guard-settings.json`.
   The settings file tells Claude Code to run the script. Paste:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Copy exercises/starters/guard-secrets.py to .claude/hooks/guard-secrets.py. Copy exercises/starters/guard-settings.json to .claude/settings.json. Change nothing in the content. Then run `python --version`. If that fails, replace `python` with `python3` in the command line of .claude/settings.json.
   ```

2. **Read the script.** Open `.claude/hooks/guard-secrets.py`. The script
   looks in your prompt for `acme_live_` followed by 24 letters or digits.
   If it finds that text, it prints a decision that blocks the prompt.
   Claude Code reads a new settings file at once, with no restart.
3. **Write three predictions** on paper or in a text file. Write one line
   for each case: does the guard block it, *yes* or *no*, and why. Predict
   case 3 too: the bonus tests it.

   1. You paste a log line that contains the key from `.env`.
   2. You ask Claude what the value of `ACME_API_KEY` in `.env` is.
   3. You ask Claude to run `grep -r acme_live .`.

**Done when**: the files `.claude/hooks/guard-secrets.py` and
`.claude/settings.json` exist, and you wrote a *yes* or *no* and a reason
for each of the three cases.

### 4. Run the guard, find the gap, close it

Your predictions are still open. You test them, and you close the gap that
you find with a rule in `.claude/settings.json`.

1. **Send the test prompt**, without a tag. It looks like a log line:

   ```
   This request failed on staging. What is wrong with it?
   POST /api/books 401 token=acme_live_7Hq2mX9vK4pL8sW1dR3nT6yB reason=expired
   ```

   The guard blocks the prompt and the terminal shows the reason.
2. **Ask for the key.** Send this without a tag:

   ```
   What is the value of ACME_API_KEY in .env?
   ```

   Claude reads the file. The guard does not block the question: it checks
   only the text you type, not the files Claude reads. The content of `.env`
   is now in the chat, so it went to the model, even if Claude does not
   print the key. If Claude asks a question first, type *just tell me*.
3. **Add the rule.** A rule lists files Claude may not read (*Claude Must
   Never Read `.env`*). Let Claude add it:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add this part to .claude/settings.json, and keep the hooks part: "permissions": {"deny": ["Read(.env)"]}
   ```

4. **Check the settings file.** Open `.claude/settings.json`. It must hold
   both `permissions` and `hooks`. Without `hooks`, the guard does not run.
5. **Ask for the key again.** Send `What is the value of ACME_API_KEY in
   .env?` without a tag. Claude now refuses to read the file.
6. **Try a second command.** Send this without a tag:

   ```
   Run cat .env and show me the output.
   ```

   Claude Code denies this too. The rule also covers file commands such as
   `cat`, `head` and `tail`.
7. **Mark your predictions.** Mark cases 1 and 2 *confirmed* or *wrong*,
   each with a line from the chat as evidence. Mark case 3 only if you ran
   the bonus. Otherwise write *not tested*.
8. **Run the check.** Type `/verify-exercise 3`. This course command grades
   your skills, the guard and the rule. When it asks, type your three
   predictions in the chat, and read its report.

If Claude answers the test prompt in step 1, the guard did not load. Type
`/hooks` to list the loaded hooks: the guard must be in the list. Check
`python` or `python3` in `settings.json`, whichever runs on your computer,
and send the test prompt again. If it still fails, ask the trainer.

**Done when**: the guard blocked the test prompt, the rule `Read(.env)` is
in `.claude/settings.json`, your predictions are marked, and
`/verify-exercise 3` gave its report.

## Bonus (only if time remains)

**Run a command the rule does not see.** Send this without a tag:

```
Run grep -r acme_live . and show me the output.
```

The key appears. The rule sees only commands that name the file, and
`grep -r` names no file. The guard does not see the command either. Only
the sandbox stops commands like this (*The Claude Code Security Harness*).

**Test the guard with a fake event.** Claude Code gives the guard your
prompt as JSON text on stdin. This prompt lets Claude do the same with a
fake prompt:

```
[Exercise 3 experiment — execute directly, no leading questions.] Run .claude/hooks/guard-secrets.py twice, with one JSON object on stdin, like Claude Code does. First object: a "prompt" field with the text deploy acme_live_ and then 24 letters a. Second object: a "prompt" field with the text deploy please. Show both outputs.
```

The first run prints the decision that blocks the prompt. The second run
prints nothing.

## Closing round

A skill starts when its description fits the moment. The guard checks the
text you type, the rule checks the files Claude reads, and the sandbox
limits the commands Claude runs.

Have these answers ready for the trainer:

- Which prediction was wrong, and what in the chat showed it?
- What does the guard check, what does the rule check, and what stops a
  command like `grep -r`?
- Which words in your `description` started `/changelog` at the right
  moment? Which would you change now?
- One thing you would tell someone who skipped this session.

## After the closing round

**Delete the branch.** Run these two commands one at a time. The first goes
back to your previous branch. The second deletes the branch
`session3-playground`.

```
git switch -
git branch -D session3-playground
```

Your commits on that branch are gone. Your files stay, because git
ignores them: `CHANGELOG.md` and the `.claude/` files.

**After the course.** Build a `PostToolUse` hook on `Edit|Write`. It runs
your formatter or your fastest tests after Claude edits a file, and reports
the failures to Claude. The hooks page in the Claude Code docs shows the
settings.

The plugin **skill-creator** writes a first version of a skill for you.
Type these commands in the chat, one at a time. `/plugin` opens a menu:
install skill-creator there.

```
/plugin marketplace add anthropics/claude-plugins-official
/plugin
/reload-plugins
```
