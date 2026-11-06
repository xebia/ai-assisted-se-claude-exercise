#!/usr/bin/env bash
# Checks for scripts/evaluate-prepare.sh. Run: scripts/evaluate-prepare.test.sh
set -uo pipefail
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
fail=0
check() { if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; fail=1; fi; }

scripts/evaluate-prepare.sh 9 go >/dev/null 2>&1; check "session 9 is rejected with exit 2" "[ $? -eq 2 ]"
scripts/evaluate-prepare.sh 2 rb >/dev/null 2>&1; check "language rb is rejected with exit 2" "[ $? -eq 2 ]"
scripts/evaluate-prepare.sh    >/dev/null 2>&1; check "missing arguments exit 2" "[ $? -eq 2 ]"

out="$(scripts/evaluate-prepare.sh 2 go 2>/dev/null)"; rc=$?
check "session 2 go exits 0" "[ $rc -eq 0 ]"
eval "$(printf '%s\n' "$out" | grep -E '^(WORKSPACE|RUN_DIR|SHEET|DECK|COMMIT)=')"
check "workspace folder is named bookstore" "[ \"\$(basename \"${WORKSPACE:-x}\")\" = bookstore ]"
check "workspace is outside this repo" "case \"${WORKSPACE:-$PWD}\" in \"$PWD\"/*) false;; *) true;; esac"
check "workspace is its own git repo with one commit" "[ \"\$(git -C \"${WORKSPACE:-.}\" rev-list --count HEAD 2>/dev/null)\" = 1 ]"
check "workspace tree is clean" "[ -z \"\$(git -C \"${WORKSPACE:-.}\" status --porcelain 2>/dev/null)\" ]"
check "workspace has the html sheet" "[ -f \"${WORKSPACE:-x}/exercises/session2.html\" ]"
check "workspace has no evaluator files" "[ ! -e \"${WORKSPACE:-x}/.claude/agents\" ] && [ ! -e \"${WORKSPACE:-x}/.claude/commands\" ] && [ ! -e \"${WORKSPACE:-x}/scripts\" ]"
check "run dir is under output/evaluations" "case \"${RUN_DIR:-x}\" in \"$PWD\"/output/evaluations/*-session2-go) true;; *) false;; esac"
check "sheet text exists and has the title" "grep -q 'Exercise 2' \"${SHEET:-/nonexistent}\""
check "sheet text keeps Done when lines" "grep -qi 'done when' \"${SHEET:-/nonexistent}\""
check "sheet text is small (no embedded fonts)" "[ \"\$(wc -c < \"${SHEET:-/dev/null}\")\" -lt 200000 ]"
check "commit hash is printed" "[ -n \"${COMMIT:-}\" ]"
exit $fail
