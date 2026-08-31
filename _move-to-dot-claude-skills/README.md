# Staged skill files — move me, then delete me

Writing to `.claude/` fails from the desktop bridge (see
CONVENTIONS.md), so updated or new skill files are staged here instead
of being placed directly.

**What to do (a human, by hand):**

1. Move the contents of this folder into `.claude/skills/`, mirroring
   the paths — e.g.
   `_move-to-dot-claude-skills/verify-exercise/checks/4-skills.md`
   goes to `.claude/skills/verify-exercise/checks/4-skills.md`.
2. Delete this `_move-to-dot-claude-skills/` folder afterwards.
3. **One-time git fix for Block 4:** `bookstore-go/.claude/settings.json`
   is tracked in git, but the Block 4 exercise has participants edit it
   and the new `.gitignore` entry can't untrack it — so their hook config
   would be committed on the playground branch and reverted by the
   cleanup `git switch`. Run `git rm --cached bookstore-go/.claude/settings.json`
   (the file is effectively empty) and commit, so it behaves like the
   other participant artifacts.

**Currently staged:**

- `verify-exercise/checks/4-skills.md` — the `/verify-exercise 4`
  check for the Block 4 exercise (two skills, the hook, the generated
  CHANGELOG.md). New file; nothing existing is overwritten.
