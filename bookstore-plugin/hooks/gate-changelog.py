# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Stop hook: refuse "done" while commits since the last tag are missing
from CHANGELOG.md.

The slide *Done Means Done* (session 4) walks this script. It never starts
the changelog skill. It blocks the stop and names the missing commits;
Claude then picks /bookstore-plugin:changelog by its description, or
writes the entries itself. Either way the gate passes on the next stop.

Commits that touch only CHANGELOG.md or dotfiles are not changelog
material (the changelog skill skips them too), so they never block.

Loop guard: Claude Code sets `stop_hook_active` to true when Claude is
already continuing because of a stop hook. Exit 0 then. Without it, a check that
can never pass keeps Claude retrying until Claude Code's own cap of 8
consecutive continuations ends the turn."""

import json
import os
import subprocess
import sys

data = json.load(sys.stdin)
if data.get("stop_hook_active"):
    sys.exit(0)

cwd = data.get("cwd") or os.getcwd()


def git(*args):
    result = subprocess.run(
        ["git", *args], cwd=cwd, capture_output=True, text=True, check=False
    )
    return result.stdout.strip() if result.returncode == 0 else ""


tag = git("describe", "--tags", "--abbrev=0")
log_range = f"{tag}..HEAD" if tag else "HEAD"
log = git("log", "--format=%h %s", "--max-count=50", log_range)
if not log:
    sys.exit(0)

changelog_path = os.path.join(cwd, "CHANGELOG.md")
try:
    with open(changelog_path, encoding="utf-8") as f:
        changelog = f.read()
except OSError:
    changelog = ""

missing = []
for line in log.splitlines():
    short, _, subject = line.partition(" ")
    if short in changelog:
        continue
    files = git("show", "--name-only", "--format=", short).splitlines()
    if files and all(
        f == "CHANGELOG.md" or os.path.basename(f).startswith(".") for f in files
    ):
        continue
    missing.append(f"{short} {subject}")

if missing:
    print(json.dumps({
        "decision": "block",
        "reason": (
            "CHANGELOG.md has no entry for: " + "; ".join(missing)
            + ". Bring the changelog up to date before you finish."
        ),
    }))
