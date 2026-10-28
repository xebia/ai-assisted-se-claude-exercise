# /// script
# requires-python = ">=3.10"
# ///
"""Morning brief for exercise 5: a script collects the night, Claude writes the brief.

Run it from the bookstore folder:

    uv run headless/brief.py headless/night-full.txt

The script collects the input itself: every line from the server log that is
not a normal 2xx answer, the time range the log covers, and the nightly test
result. It sends that input with your prompt (headless/brief-prompt.txt) to
Claude, and saves both the input and the brief in headless/out/.
"""
import pathlib
import re
import shutil
import subprocess
import sys

HERE = pathlib.Path("headless")
OUT = HERE / "out"
PROMPT_FILE = HERE / "brief-prompt.txt"
LINE = re.compile(r"^(\d\d:\d\d:\d\d) (\S+)\s+(\S+) (\d{3})?")


def stop(msg):
    print(msg)
    sys.exit(2)


def collect(log_path):
    lines = [l.rstrip("\n") for l in open(log_path, encoding="utf-8") if l.strip()]
    entries = [l for l in lines if LINE.match(l)]
    if not entries:
        stop(f"No log lines found in {log_path}.")
    keep = []
    for l in entries:
        m = LINE.match(l)
        status = m.group(4)
        if m.group(2) == "WARN" or (status and not status.startswith("2")):
            keep.append(l)
    first, last = entries[0][:8], entries[-1][:8]
    tests = (HERE / "nightly-tests.txt").read_text(encoding="utf-8").strip()
    return "\n".join([
        f"## Server log: {len(entries)} lines, from {first} to {last}",
        f"## Lines that are not a normal answer: {len(keep)}",
        *keep,
        f"## {tests}",
    ]) + "\n"


def main():
    if len(sys.argv) != 2:
        stop("Usage: uv run headless/brief.py headless/night-full.txt")
    log_path = pathlib.Path(sys.argv[1])
    if not log_path.exists():
        stop(f"No such file: {log_path}")
    if not PROMPT_FILE.exists() or not PROMPT_FILE.read_text(encoding="utf-8").strip():
        stop("Task 4, step 1: write your prompt in headless/brief-prompt.txt first.")
    claude = shutil.which("claude")
    if not claude:
        stop("Cannot find the claude command. Is Claude Code installed?")

    data = collect(log_path)
    OUT.mkdir(parents=True, exist_ok=True)
    name = log_path.stem
    (OUT / f"input-{name}.txt").write_text(data, encoding="utf-8")

    prompt = PROMPT_FILE.read_text(encoding="utf-8").strip()
    cmd = [claude, "--safe-mode", "-p", prompt,
           "--permission-mode", "dontAsk", "--max-turns", "3"]
    run = subprocess.run(cmd, input=data, capture_output=True, text=True, encoding="utf-8")
    brief = (run.stdout or run.stderr).strip()
    (OUT / f"brief-{name}.md").write_text(brief + "\n", encoding="utf-8")
    print(brief)
    print(f"\n(input and brief saved in {OUT}/)")


if __name__ == "__main__":
    main()
