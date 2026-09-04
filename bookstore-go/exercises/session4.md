# Exercise 4: Two Skills and a Hook

**Session**: 4 — Skills, Hooks & Automation
**Duration**: 40 minutes
**Project**: The same BookStore API.

## Goal

The commands you have used since session 2 — `/prompt-coach`,
`/context-coach`, `/bank-diff` — are markdown files in this repo. In this
exercise you write the same kind of file yourself.

You will do three things:

1. Create a `/commit` skill. You copy it from this sheet, then read why
   each line is there.
2. Design a `/changelog` skill yourself. Claude must be able to run this
   one on its own.
3. Wire a hook that runs after every commit. Then test the chain, watch
   it break, and repair it.

## Before you start: how this exercise is set up

Read this section first. The tasks do not work without it. Titles in
*italics* are slide titles from this session.

**Where to work.** Open a terminal in the `bookstore-go` folder. That is
the folder that contains `go.mod`. Run every command in this exercise from
that folder. Start Claude with `claude`.

**Two `.claude` folders.** There are two, and they are not the same one.
The first one is `.claude/` in the folder that holds `bookstore-go`. That
is the folder you cloned in session 1. From your terminal its path is
`../.claude/`. It holds the course commands, and you only read from it.
The second one is `bookstore-go/.claude/`. Every file you create in this
exercise goes there. Create the folders if they do not exist yet.

**Where to write your notes.** Three tasks ask you to write something
down: things to copy, three predictions, and five pass-or-fail calls. Write
them on paper, or in a text file. Do not keep them in the chat only.
`/verify-exercise 4` asks you to paste them back at the end.

**Training mode.** This project has a `CLAUDE.md` file. Claude reads it at
the start of every session. In this course, the file tells Claude to teach
instead of answer. Before Claude explains something or writes a fix, it
asks you one question that points you to the answer. We call this
behaviour *training mode*. It is on in every session of this course.
Simple requests are not affected: git commands, running tests, or fetching
a web page.

**Switching training mode off for one prompt.** One prompt in this
exercise must start the work at once. Claude must not ask a question
first. That prompt begins with this text in square brackets:

```
[Exercise 4 experiment — execute directly, no leading questions.]
```

We call this the *experiment tag*. It tells Claude to skip training mode
for that one prompt. Copy the prompt exactly as printed, tag included.
("Leading questions" are the teacher questions from training mode.)

A skill file can switch training mode off in the same way. The `/commit`
skill in task 2 carries the line *"Execute directly — no leading
questions"*. Task 2 explains what happens without it.

**Never edit `CLAUDE.md`.** That file holds training mode for the whole
course. If you change it, sessions 5 to 8 break. You may open it and read
it. Everything you write in this exercise goes in new files.

**This exercise makes real commits.** Task 1 creates a branch for them.
Task 6 deletes that branch, and your own files still survive. Task 6
explains why.

**Two course commands.**

- `/bank-diff <name>` is the command from session 3. You do not run it
  here. In task 1 you open its file and read it as an example of a
  well-written skill.
- `/verify-exercise 4` grades your work at the end. It first asks you to
  paste your three predictions and your five pass-or-fail calls, word for
  word. Then it grades both skills, the hook and `CHANGELOG.md`. Its
  report appears in the chat.

**No coach in this session.** Sessions 2 and 3 gave you a coach command
that reviewed your draft. This session has none. The checklists in the
tasks are what you check your own work against.

**Stuck, or out of time?** Say *"just tell me"*. Claude then answers
directly. That is allowed.

## Tasks

### 1. Make a branch and read a real skill (4 min)

This task produces a new git branch and 2–3 notes about one skill file.

1. **Create the branch** (1 min). Sessions 5 to 8 reuse this code, and
   this session makes real commits. Run:

   ```
   git switch -c session4-playground
   ```

2. **Read one skill file** (2 min). Open
   `../.claude/skills/bank-diff/SKILL.md`. That is the course `.claude/`
   folder, not the one in `bookstore-go`. You have used this command since
   session 3. Now read it as the author of the next one. Write down 2–3
   things in it that you want to copy. Things to look for:

   - `disable-model-invocation: true` in the frontmatter. The skill runs
     only when you type its name.
   - what the file does when you give it no argument. It asks one short
     question instead of guessing.
   - the three things it makes sure of before it changes any file.
   - the line *"execute directly, no leading questions"*. That line keeps
     training mode out of a mechanical job.
   - every git command limited to one folder.

3. **Read one description** (1 min). Open
   `../.claude/skills/context-coach/SKILL.md`, in the same course folder,
   and read the `description` line in the frontmatter. Read nothing else in
   that file. You compare your own description against it in task 3.

You may copy these ideas. The task is to see why each one is there.

Do not open the `cards/` and `checks/` folders next to those skill files.
They hold the graded answers for this course. If you read them, you get the
answers before you have found them yourself.

**Done when**: `git status` says you are on `session4-playground`, and you
wrote down 2–3 things you want to copy.

### 2. Create the `/commit` skill (5 min)

This task produces the file `bookstore-go/.claude/skills/commit/SKILL.md`
and one commit.

1. **Create the file** (2 min) with exactly this content:

   ```markdown
   ---
   name: commit
   description: Analyzes all git changes and creates intelligent commits.
   disable-model-invocation: true
   ---

   You are a git commit expert. Analyze the changes and commit them intelligently.

   Execute directly — no leading questions, no coaching.

   1. Review `git status` to see all changes
   2. Review `git diff HEAD` for staged changes
   3. Review `git diff` for unstaged changes
   4. Group related changes into 1 to max 5 logical commits
   5. Write each commit message in **imperative mood**, starting with a
      present-tense verb. This matches the Common Changelog convention so changelog
      entries can be generated directly from git history. Examples:
      - "Add genre filter to book search handler"
      - "Fix pagination in book listing endpoint"
      - "Refactor review store for better error handling"
      - "Bump Go version to 1.22"
      - "Document review API query parameters"

      Do NOT use past tense ("Added", "Fixed"). Do NOT use a name for a
      thing ("Genre filter for search").
   6. Run `git add <files>` to stage the next group
   7. Run `git commit -m "Your message here"` (NO Co-Authored-By line)
   8. Repeat until all changes are committed
   9. Confirm: "All changes committed successfully"

   **CRITICAL**: Do NOT run `git push` at the end.

   ## Example

   **Changes to commit:**

   - Modified: `internal/model/book.go` (added Genre field)
   - Modified: `internal/handler/book.go` (added genre query parameter)
   - Modified: `internal/store/book.go` (updated query with genre filter)

   **Generated commit:** git commit -m "Add genre filter to book search endpoint"

   **Output:** Committed: "Add genre filter to book search endpoint" 3 files
   changed, 18 insertions(+), 2 deletions(-)
   ```

2. **Make a small change by hand** (1 min). Open any file in
   `bookstore-go` and add one comment line. Save it. Do not ask Claude to
   do this. You only need something to commit.
3. **Run the skill** (2 min). Type `/commit` in Claude Code and watch what
   it does.

These two lines in the file matter most.

The line *"Execute directly — no leading questions, no coaching"* switches
training mode off for this skill. Without it, Claude asks you a question
about your staging area instead of committing.

The frontmatter line `disable-model-invocation: true` means Claude never
starts this skill by itself. Only typing `/commit` runs it.

The file says commit messages use *imperative mood*. That means the message
starts with a present-tense verb: "Add", "Fix", "Remove". Not "Added", and
not the name of a thing like "Genre filter for search". The file also names
the *Common Changelog* format. That is the changelog format you use in task
3.

**Done when**: the commit exists, its message starts with a present-tense
verb, it has no co-author line, and nothing was pushed.

### 3. Design the `/changelog` skill (10 min)

This task produces two files under
`bookstore-go/.claude/skills/changelog/`:

```
.claude/skills/changelog/
├── SKILL.md                      # your instructions
└── common-changelog-spec.md      # the full specification
```

1. **Fetch the specification** (2 min). A skill can carry extra files.
   Claude loads them only when the skill runs (*Anatomy of a Skill*). So
   do not summarize the specification inside your skill. Store it next to
   the skill instead. Claude can read web pages itself, so you need no
   extra tool. Paste this:

   ```
   Read https://common-changelog.org/ and save the whole specification as
   markdown to .claude/skills/changelog/common-changelog-spec.md. Keep the
   headings and the examples. Leave out the website menu and footer.
   ```

   Open the saved file afterwards and check that it holds the group names
   and the rules, not an empty page.
2. **Write `SKILL.md` yourself** (6 min). No paste this time. Keep task 2's
   file open next to you; your file has the same shape. Frontmatter between
   two `---` lines, then a numbered list of instructions to Claude. Your
   list must make Claude do all of the following. The first one is written
   out for you. Write the rest in the same style.

   - Rule 1, example: *"Read `CHANGELOG.md` in the project root. If the
     file does not exist, create it with the heading `# Changelog`."*
   - Read `common-changelog-spec.md` before changing the changelog.
   - Look at the recent commits and at the existing version tags.
   - Add only new commits. Entries that are already in the changelog stay
     as they are. New entries go in a `## Unreleased` section at the top.
   - Sort entries under `### Changed`, `### Added`, `### Removed` and
     `### Fixed`, in that order.
   - Write each entry as one sentence that starts with a present-tense
     verb. End the sentence with the short commit hash in round brackets,
     like `(a1b2c3d)`.
   - A *breaking change* is one that forces other people to change their
     own code. Put **Breaking:** in front of such an entry. Inside its
     group, put those entries first.
   - Leave out changes that a reader does not care about: files whose name
     starts with a dot, changes that only touch formatting, and developer
     tools.

3. **Write the `description`** (2 min). Claude reads only the frontmatter
   `description` when it decides whether to start a skill by itself. So
   this skill must **not** have a `disable-model-invocation` line. The hook
   in task 4 only suggests the skill; Claude decides (*Which Description
   Gets This Skill Invoked at the Right Moment?*). Put your draft next to
   the `context-coach` description you read in task 1. That one says *when*
   it applies, not only what it does. Ask yourself two questions. Which
   words in your description would make Claude reach for this skill right
   after a commit? Which words would make it start at a moment you do not
   want?

You grade your own `CHANGELOG.md` in task 5 against these five points, so
keep them next to you:

- The file is called `CHANGELOG.md` and starts with the heading
  `# Changelog`.
- It has an `## Unreleased` section.
- The groups appear in this order: Changed, Added, Removed, Fixed.
- Every entry starts with a present-tense verb.
- Every entry ends with its commit hash in round brackets.

**Done when**: both files exist under `.claude/skills/changelog/`, your
`SKILL.md` has no `disable-model-invocation` line, and your `description`
says when the skill applies, not only what it does.

### 4. Set up the hook (6 min)

This task produces `bookstore-go/.claude/hooks/run-changelog.py`, an entry
in `bookstore-go/.claude/settings.json`, and three predictions on paper.

1. **Create the script** (2 min). A hook matcher can only filter by tool
   name (*Practical Hook Examples*). It cannot look at the command itself.
   A matcher only knows the name of the tool, for example `Bash`. So a
   small script has to look at the command. Hooks run on your own machine,
   and most of you are on Windows. That is why the script is Python and not
   a shell script: no `#!` line at the top, no `jq`, no `chmod`. Create
   `.claude/hooks/run-changelog.py`:

   ```python
   import json
   import sys

   data = json.load(sys.stdin)
   command = data.get("tool_input", {}).get("command", "")

   if command.startswith("git commit"):
       print(json.dumps({
           "hookSpecificOutput": {
               "hookEventName": "PostToolUse",
               "additionalContext": "A git commit was just made. Run the /changelog skill to update CHANGELOG.md."
           }
       }))
   ```

2. **Add the hook to your settings** (2 min). Create or open
   `bookstore-go/.claude/settings.json` and put this in it:

   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Bash",
           "hooks": [
             {
               "type": "command",
               "command": "python .claude/hooks/run-changelog.py"
             }
           ]
         }
       ]
     }
   }
   ```

   On mac or linux, write `python3` instead of `python`. If you are not
   sure which one you have, run `python --version`. If that fails, use
   `python3`.

3. **Write three predictions** (2 min). One line each, on paper.

   First, one word that must be clear. A hook **fires** when Claude Code
   starts your script after a Bash tool call. Your script then decides
   whether it prints anything. So a hook can fire and print nothing.
   Remember that when you write your answers.

   1. Does the hook fire when *you* type `/commit`?
   2. Does it fire when Claude decides to run `git commit` by itself?
   3. Does it fire on `git commit --amend`?

Note two things about the code above. First, the shape of that JSON
matters. Claude does not read an `additionalContext` key at the top level.
Plain text printed by a `PostToolUse` hook only reaches the transcript.
Only this exact nested shape reaches Claude (*Hook Handlers and
Decisions*). Second, the script reads `tool_input.command`. That is the
command line Claude ran, as plain text. The script never sees what the
command did.

It is fine to be wrong. But write all three predictions down, because task
5 checks them against what happened.

**Done when**: the script and the settings entry both exist, and your three
predictions are on paper.

### 5. Test the chain, then repair it (10 min)

The *chain* is the three steps from the slide *Combining Skills and
Hooks*: your commit runs the hook, the hook nudges Claude, and Claude runs
your changelog skill. This task produces a `CHANGELOG.md`, a repaired hook
script, and two grades you write down yourself.

1. **Remove a feature and commit it** (3 min). In Claude, paste this
   exactly:

   ```
   [Exercise 4 experiment — execute directly, no leading questions.] Remove the delete functionality from the BookStore API.
   ```

   A removal is on purpose. Your changelog design has to file something
   under `Removed`, not only under `Added`. When Claude is done, type
   `/commit`.

2. **Look at what happened** (1 min). One of two things is true.

   - `CHANGELOG.md` was not created, and Claude never mentioned your
     changelog skill. This is the usual result.
   - `CHANGELOG.md` was created. This also happens. It means Claude ran
     `git add` and `git commit` as two separate commands.

   Neither one is a mistake. Go on to step 3 either way. It shows the rule
   that decides which of the two you got.

3. **Send your script two fake events** (2 min). Run these two lines from
   the `bookstore-go` folder. They give your script the same JSON that
   Claude Code gives it. Copy the lines exactly as they are; the quotes
   work in PowerShell and in bash. On mac or linux, use `python3`.

   ```
   echo '{"tool_input":{"command":"git commit -m x"}}' | python .claude/hooks/run-changelog.py
   echo '{"tool_input":{"command":"git add . && git commit -m x"}}' | python .claude/hooks/run-changelog.py
   ```

   The first line prints JSON. The second line prints nothing.

   Here is why. The `/commit` skill often joins two commands into one
   line, like this:

   ```
   git add internal/handler/book.go && git commit -m "Remove the delete endpoint"
   ```

   Your script gets that whole line as one string. The string starts with
   `git add`, not with `git commit`. So `command.startswith("git commit")`
   is `False`, and the script prints nothing.

   Now compare what happened with what did not. The hook fired every
   time. Claude Code started your script after every Bash tool call. The
   script stayed silent when the line began with `git add`. Say the rule
   in your own words before you fix it. A hook reads the **text** of a
   command. It does not see what the command did.

4. **Repair the script** (2 min). It must also match a `git commit` that
   comes after `&&` or `;`. One way to do that:

   ```python
   import json
   import re
   import sys

   data = json.load(sys.stdin)
   command = data.get("tool_input", {}).get("command", "")

   parts = re.split(r"&&|\|\||;", command)
   if any(part.strip().startswith("git commit") for part in parts):
       print(json.dumps({
           "hookSpecificOutput": {
               "hookEventName": "PostToolUse",
               "additionalContext": (
                   "A git commit was just made. Invoke the changelog skill now, "
                   "in this same turn. Do not ask the user for permission first."
               )
           }
       }))
   ```

   The script changed in two ways. It now cuts the command into parts and
   checks each part on its own. And the message now tells Claude to act.
   The old message said *"Run the /changelog skill"*. That reads like
   advice, so Claude may answer with a suggestion and wait for you. The new
   message says *"Invoke it now, do not ask"*, which leaves Claude less
   choice. Run the two test lines again. Both print JSON now.

   Your test line itself contains the text `&& git commit`, so the script
   now matches that too. The test line makes no commit, so the extra
   message does no harm.

5. **Run the chain again** (1 min). Make one more small change by hand and
   type `/commit`. This time `CHANGELOG.md` should appear, or grow, without
   you asking for it. It should hold an entry for both commits, and the
   removal belongs under `### Removed`. If nothing happens, look at the
   message text first, not at the matching. Your script can fire and print
   its message, and still nothing changes. That happens when Claude only
   suggests the skill instead of running it.

6. **Grade your own work** (1 min). Do this before you start the verifier.
   Grade two things:

   - **Your predictions against reality.** Take your three predictions from
     task 4. Mark each one confirmed or wrong. Name the message in the
     chat that shows it.
   - **Your own grade for `CHANGELOG.md`.** Pass or fail on each of the
     five points from task 3.

Then start `/verify-exercise 4`. It asks you to paste your three
predictions and your five pass-or-fail calls first. It then works from your
files alone, so it keeps going while you do task 6. Task 6 runs two git
commands, and Claude is using your terminal. So open a second terminal in
the same folder for them. If you prefer, wait for the report and do task 6
after. Read the report before the closing round.

**Done when**: the repaired hook fires on `/commit`, `CHANGELOG.md` exists,
you wrote down both grades, and `/verify-exercise 4` is running.

### 6. Clean up the branch (5 min)

Run these two lines, one at a time. PowerShell 5.1 cannot join commands
with `&&`.

```
git switch -
git branch -D session4-playground
```

The commits are gone now. Your own files are not. `CHANGELOG.md`,
`.claude/skills/`, `.claude/hooks/` and `.claude/settings.json` are all
listed in `.gitignore`, so git never held them. Your `CLAUDE.local.md`
from session 3 is safe for the same reason.

One thing to know for your own projects. The slide *Where settings.json
Lives* said that `.claude/settings.json` is the committed, team-wide file,
and that is true in a normal project: you commit it and your team gets your
hooks. This course project is the exception. It ignores that file on
purpose, so that deleting the branch can never take your work with it.

**Done when**: you are back on your earlier branch, `session4-playground`
is gone, and `CHANGELOG.md` still exists.

## Bonus (only if time remains)

**Let Claude write a skill for you.** Two new words first. A *plugin* is a
package of skills that someone else wrote and that you install into Claude
Code. A *marketplace* is a published list of plugins that Claude Code can
install from. Anthropic keeps an official list, and one plugin on it writes
skills for you.

First tell Claude Code where that list is:

```
/plugin marketplace add anthropics/claude-plugins-official
```

Then run `/plugin`, install **skill-creator** from that list, and run
`/reload-plugins`. Use it to write one more skill. Pick a job you repeat
often in your own week. It creates the folder and a first version of
`SKILL.md` for you. Compare that first version with the one you wrote by
hand in task 3. What did it think of that you did not?

## Closing round (5 min)

The trainer asks the room. Have these answers ready:

- Which of your three predictions turned out wrong?
- What can a hook see, and what can it not see?
- What did you change to make the chain finish?
- Which thing did you copy from the `bank-diff` file?
- Which words in your `description` do you trust to make Claude start the
  skill on its own? Which words would you make sharper now?
- One thing you would tell someone who skipped this session.
