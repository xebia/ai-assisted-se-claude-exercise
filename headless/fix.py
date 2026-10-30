# /// script
# requires-python = ">=3.10"
# ///
"""Fix run for exercise 5: a second headless run fixes what the gate found.

Run it from the bookstore folder, after the gate blocked your last commit:

    uv run headless/fix.py

It finds the newest gate answer in headless/out/ for your last commit. If
that answer is "block", it sends the verdict and the findings to Claude on
stdin, and Claude edits the code. It does not commit: you read the diff and
decide. Claude's full answer is saved in headless/out/fix-*.json.
"""
import json
import pathlib
import shutil
import subprocess
import sys
from datetime import datetime

OUT = pathlib.Path("headless/out")

PROMPT = (
    "The review gate blocked the last commit. Its verdict and findings are "
    "on stdin. Fix each finding in the code. Change only what the findings "
    "need. Do not change tests, and do not commit."
)


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True)


def stop(msg, code=2):
    print(msg)
    sys.exit(code)


def newest_gate_run(sha):
    runs = []
    for f in OUT.glob("gate-*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if data.get("commit") == sha:
            runs.append((f.stat().st_mtime, f, data))
    if not runs:
        return None, None
    _, f, data = max(runs, key=lambda r: r[0])
    return f, data


def main():
    claude = shutil.which("claude")
    if not claude:
        stop("Cannot find the claude command. Is Claude Code installed?")

    dirty = git("status", "--porcelain", "--untracked-files=no").stdout.strip()
    if dirty:
        stop("You have changes that are not committed. Commit them or undo them "
             "(git restore .) first, so the fix is the only change.")

    sha = git("rev-parse", "--short", "HEAD").stdout.strip()
    subject = git("log", "-1", "--format=%s").stdout.strip()
    saved, data = newest_gate_run(sha)
    if not data:
        stop(f"No gate run for your last commit ({sha} {subject}). "
             "Run uv run headless/gate.py first.")

    result = (data.get("answer") or {}).get("structured_output") or {}
    verdict = result.get("verdict")
    findings = result.get("findings") or []
    if verdict == "pass":
        stop(f"The gate passed your last commit ({sha} {subject}). Nothing to fix.", 0)
    if not findings:
        stop("The gate gave no findings, so there is nothing to fix. "
             "Run uv run headless/gate.py again.")

    print(f"Fixing {sha} {subject}: {len(findings)} finding(s) from {saved}")
    for finding in findings:
        print(" -", finding)
    gate_answer = json.dumps({"commit": sha, "subject": subject,
                              "verdict": verdict, "findings": findings}, indent=2)

    cmd = [
        claude, "--safe-mode", "-p", PROMPT,
        "--append-system-prompt-file", "headless/team-rules.md",
        "--permission-mode", "acceptEdits",
        "--max-turns", "10",
        "--output-format", "json",
    ]
    run = subprocess.run(cmd, input=gate_answer, capture_output=True, text=True,
                         encoding="utf-8")
    try:
        answer = json.loads(run.stdout)
    except json.JSONDecodeError:
        stop("Claude did not answer with JSON:\n" + (run.stdout or run.stderr)[:800])

    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f"fix-{datetime.now():%H%M%S}-{sha}.json"
    out.write_text(json.dumps({"commit": sha, "subject": subject, "gate_run": str(saved),
                               "answer": answer}, indent=2), encoding="utf-8")

    print()
    print(answer.get("result", "").strip()[:1500])
    print()
    stat = git("diff", "--stat").stdout.strip()
    print(stat or "Claude changed no files.")
    print(f"\nClaude did not commit. Read the diff, then decide.   (saved in {out})")


if __name__ == "__main__":
    main()
