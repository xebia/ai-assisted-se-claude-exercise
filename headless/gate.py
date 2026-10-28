# /// script
# requires-python = ">=3.10"
# ///
"""Review gate for exercise 10: Claude checks your last commit, a script decides.

Run it from the bookstore folder:

    uv run headless/gate.py

Exit code 0: pass. Exit code 1: block, or no verdict (no verdict counts as
block). Exit code 2: the gate could not run. Each run saves Claude's full
answer in headless/out/, so you can see later what it decided and why.
"""
import json
import pathlib
import shutil
import subprocess
import sys
from datetime import datetime

OUT = pathlib.Path("headless/out")

PROMPT = (
    "Review this diff against the team rules. "
    "Block only when a line in the diff breaks a rule. "
    "For every finding, name the rule and quote the line."
)

# Task 2, step 2: the shape of Claude's answer, as a JSON Schema.
# It needs a "verdict" that is "pass" or "block", and "findings": a list of strings.
SCHEMA = {
    # (I write this)
}

# Task 2, step 3: the file with your team rules, and the flag that gives it to Claude.
RULES = [
    # (I write this)
]


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True)


def stop(msg, code=2):
    print(msg)
    sys.exit(code)


def main():
    if not SCHEMA:
        stop("Task 2, step 2: SCHEMA in headless/gate.py is still empty.")
    if not RULES:
        stop("Task 2, step 3: RULES in headless/gate.py is still empty.")
    claude = shutil.which("claude")
    if not claude:
        stop("Cannot find the claude command. Is Claude Code installed?")

    diff = git("diff", "HEAD~1", "HEAD", "--", ".")
    if diff.returncode != 0:
        stop("Cannot read the last commit: " + diff.stderr.strip())
    if not diff.stdout.strip():
        stop("The last commit changes nothing. Nothing to review.", 0)
    sha = git("rev-parse", "--short", "HEAD").stdout.strip()
    subject = git("log", "-1", "--format=%s").stdout.strip()
    print(f"Reviewing {sha} {subject} ...")

    cmd = [
        claude, "--safe-mode", "-p", PROMPT,
        *RULES,
        "--permission-mode", "dontAsk",
        "--max-turns", "5",
        "--output-format", "json",
        "--json-schema", json.dumps(SCHEMA),
    ]
    run = subprocess.run(cmd, input=diff.stdout, capture_output=True, text=True,
                         encoding="utf-8")
    try:
        answer = json.loads(run.stdout)
    except json.JSONDecodeError:
        stop("Claude did not answer with JSON:\n" + (run.stdout or run.stderr)[:800])

    OUT.mkdir(parents=True, exist_ok=True)
    saved = OUT / f"gate-{datetime.now():%H%M%S}-{sha}.json"
    saved.write_text(json.dumps({"commit": sha, "subject": subject, "answer": answer},
                                indent=2), encoding="utf-8")

    result = answer.get("structured_output") or {}
    verdict = result.get("verdict")
    for finding in result.get("findings", []):
        print(" -", finding)
    print(f"Verdict: {verdict or 'none'}   (saved in {saved})")
    if verdict == "pass":
        sys.exit(0)
    if verdict is None:
        print("No verdict. The gate treats that as block.")
    sys.exit(1)


if __name__ == "__main__":
    main()
