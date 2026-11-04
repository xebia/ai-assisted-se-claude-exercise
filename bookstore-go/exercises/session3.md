# Exercise 3: Two Skills and a Secret Guard

**Session**: 3 — Skills, Hooks & Guardrails\
**Duration**: 40 minutes, plus a 5-minute closing round\
**Project**: The same BookStore API.

## Goal

1. Copy a ready-made `/commit` skill and run it.
2. Let Claude write a `/changelog` skill. Write its `description` yourself
   and test it.
3. Add a hook that blocks a prompt with a secret key in it. Find what the
   hook does not see, and close that gap with a rule.

## Start here

- Open a terminal in the `bookstore` folder that you cloned. It holds
  `exercises` and `.env`. Start `claude` there. Your files go in its
  `.claude/` folder.
- `.env` holds a fake API key. Treat it as a secret.
- Training mode is on. Copy tagged prompts exactly, tag included. Stuck?
  Type *just tell me* in the chat.
- Never edit `CLAUDE.md`.
- Start each next task when the trainer says, even if you are not done.

## Tasks

### 1. Copy the `/commit` skill and run it

This task produces a branch, the file `.claude/skills/commit/SKILL.md`, and
one commit.

1. **Create a branch.** Do not push it. You delete it after the closing
   round.

   ```
   git switch -c session3-playground
   ```

2. **Let Claude copy the skill.** The folder `exercises/starters` holds a
   ready-made skill, `commit-skill.md`. The text in square brackets is the
   tag. It turns training mode off for this prompt. Paste:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Copy exercises/starters/commit-skill.md to .claude/skills/commit/SKILL.md. Change nothing in the content.
   ```

3. **Change a file by hand.** Add one comment line to any source file and
   save it. Do not ask Claude.
4. **Run the skill.** Type `/commit` in the chat. A new skill works at
   once, with no restart.
5. **Read three parts.** Open `.claude/skills/commit/SKILL.md`. Find these
   three, and read what each one does:
   - `disable-model-invocation: true`: only you can start the skill, by
     typing `/commit`.
   - The line *Execute directly — no leading questions*: Claude commits
     and does not ask questions.
   - The rule *imperative mood*: the commit message starts with a verb,
     such as "Add" or "Fix". Task 2 uses these messages.

**Done when**: `git log -1` shows a new commit with your change. Its
message starts with a verb, such as "Add" or "Fix".

### 2. Let Claude write `/changelog`, then write its description

This task produces `.claude/skills/changelog/SKILL.md` and, next to it,
`common-changelog-spec.md`: the rules of Common Changelog, a standard
layout for a changelog.

1. **Paste one prompt for both files.**

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Create the skill .claude/skills/changelog/SKILL.md. Frontmatter: `name: changelog` and `description: (I write this)`, no other lines. Body: numbered instructions. Read CHANGELOG.md, and create it with the heading `# Changelog` if it is missing. Read common-changelog-spec.md, next to this file, before you change the changelog. Add only new commits, under `## Unreleased`, in the groups Changed, Added, Removed and Fixed. Write one sentence per entry. Start it with a present-tense verb and end it with the short commit hash in round brackets. Put breaking changes first in their group, marked **Breaking:**. Save the rules from https://common-changelog.org/ as markdown in common-changelog-spec.md.
   ```

   If your network blocks the page, ask Claude to write the spec file from
   what it knows.

2. **Check two things.** The spec file holds rules, not an empty page.
   `SKILL.md` has **no** `disable-model-invocation` line, so Claude can
   start the skill by itself.
3. **Write the description.** In your editor, replace `(I write this)`.
   Claude reads only this line when it decides to start a skill on its own.
   A good description names the file, the format and the moment to act
   (*Which Description Gets This Skill Invoked at the Right Moment?*).
   Note for the closing round: which words start the skill at the right
   moment, and which would start it at the wrong one?
4. **Test the description.** Type each request in the chat, without a
   slash. The chat shows the name `changelog` when Claude starts the
   skill. First:

   ```
   I just committed. Bring the changelog up to date.
   ```

   Claude must start the skill. Now the second request:

   ```
   Summarise the last three commits for me, in two sentences.
   ```

   Claude must **not** start the skill. If one went wrong, change the
   words that caused it and send it again.

**Done when**: both files exist, request 1 started the skill, and request
2 did not.

### 3. Add the guard and predict

This task produces `.claude/hooks/guard-secrets.py`, the file
`.claude/settings.json`, and three written predictions. The guard is a
script that runs on every prompt you send, before it leaves your laptop
(*The Secret That Never Leaves*). It is written in Python, which
runs on Windows too.

1. **Let Claude copy two files.** The script and the settings are in
   `exercises/starters`. The settings file tells Claude Code to start the
   script. Paste:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Copy exercises/starters/guard-secrets.py to .claude/hooks/guard-secrets.py. Copy exercises/starters/guard-settings.json to .claude/settings.json. Change nothing in the content. Then run `python --version`. If that fails, replace `python` with `python3` in the command line of .claude/settings.json.
   ```

2. **Read both files.** The script looks in your prompt for `acme_live_`
   and 24 letters or digits. If it finds them, it prints a block decision.
   Claude Code picks up a new settings file without a restart.
3. **Write three predictions** on paper or in a text file. Write one line
   for each case: does the guard block it, yes or no, and why. Task 4
   asks for them. The bonus tests case 3.

   1. You paste a log line that contains the key.
   2. You ask Claude what the value of `ACME_API_KEY` in `.env` is.
   3. You ask Claude to run `grep -r acme-live .`.

**Done when**: both files exist and your three predictions are written down.

### 4. Run the guard, find the gap, close it

This task produces a blocked prompt, a rule in `.claude/settings.json`,
and your marked predictions.

1. **Send a test prompt**, without a tag. It looks like a log line:

   ```
   This request failed on staging. What is wrong with it?
   POST /api/books 401 token=acme-live-7Hq2mX9vK4pL8sW1dR3nT6yB reason=expired
   ```

   The guard blocks it and the terminal shows the reason. Did Claude answer
   instead? Type `/hooks` to see whether the guard loaded. Check `python`
   or `python3` in `settings.json`, and send the prompt again. If neither
   runs, ask the trainer.

2. **Ask for the key.** Send this without a tag:

   ```
   What is the value of ACME_API_KEY in .env?
   ```

   Claude reads the file. The guard does not block this: it checks only
   the text you type, not what Claude reads. The file content is now in
   the chat, so it went to the model, even if Claude does not repeat the
   value. If Claude asks a question first, type *just tell me*.

3. **Close the gap with a rule.** A rule lists files Claude may not read
   (*Claude Must Never Read `.env`*). Let Claude add it:

   ```
   [Exercise 3 experiment — execute directly, no leading questions.] Add this part to .claude/settings.json, and keep the hooks part: "permissions": {"deny": ["Read(.env)"]}
   ```

   Check that `.claude/settings.json` holds both `permissions` and
   `hooks`. Send the question from step 2 again. Claude now refuses to
   read the file. Then send:

   ```
   Run cat .env and show me the output.
   ```

   This is denied too: the rule also covers `cat`, `head` and `tail`.

4. **Mark your predictions** *confirmed* or *wrong*, each with a line from
   the chat as evidence.
5. **Run the check.** Type `/verify-exercise 3`. When it asks, type your
   three predictions in the chat. Read its report before the closing round.

**Done when**: the test prompt was blocked, the rule is in `settings.json`,
your predictions are marked, and `/verify-exercise 3` gave its report.

## Bonus (only if time remains)

**A command the rule does not see.** Send this without a tag:

```
Run grep -r acme-live . and show me the output.
```

The key appears. The rule only sees commands that name the file, and
`grep -r` names none. The guard does not see it either. Only the sandbox
stops every process (*The Claude Code Security Harness*).

**Test the guard with a fake event.** Claude Code sends the guard one JSON
object on stdin. Let Claude do the same:

```
[Exercise 3 experiment — execute directly, no leading questions.] Run .claude/hooks/guard-secrets.py twice, with one JSON object on stdin, like Claude Code does. First object: a "prompt" field with the text deploy acme_live_ and then 24 letters a. Second object: a "prompt" field with the text deploy please. Show both outputs.
```

The first run prints the block decision. The second prints nothing.

## Closing round

Have these answers ready for the trainer:

- Which prediction was wrong, and what showed it?
- What does the guard see, what does the rule see, and what stops every
  process?
- Which words in your `description` started `/changelog` at the right
  moment? Which would you change now?
- One thing you would tell someone who skipped this session.

## After the closing round

**Delete the branch.** Run the two lines one at a time. The first goes
back to your previous branch. The second deletes this branch.

```
git switch -
git branch -D session3-playground
```

Your commits on that branch are gone. Your files stay, because git does
not track them: `CHANGELOG.md` and the `.claude/` files.

**After the course.** Build a `PostToolUse` hook on `Edit|Write`. It runs your
formatter or fastest tests after Claude edits a file, and reports the
failures to Claude. The hooks page in the Claude Code docs shows the
settings.

The plugin **skill-creator** writes a first version of a skill for you.
Type these commands in the chat, one at a time. `/plugin` opens a menu:
install skill-creator there.

```
/plugin marketplace add anthropics/claude-plugins-official
/plugin
/reload-plugins
```

Try it on a job you repeat every week.
