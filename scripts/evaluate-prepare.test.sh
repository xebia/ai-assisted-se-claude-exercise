#!/usr/bin/env bash
# Checks for scripts/evaluate-prepare.sh. Run: scripts/evaluate-prepare.test.sh
set -uo pipefail
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
fail=0
# Never touch the real output/evaluations: every script call uses a temp output root.
out_root="$(mktemp -d)"; export EVALUATE_OUTPUT_ROOT="$out_root"
workspaces=()
# Check expressions are single-quoted and read the variables lazily, so paths with spaces are safe.
check() { if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; fail=1; fi; }
# Dependent checks: FAIL outright when the run did not succeed, never pass on defaults.
dep() { if [ "$rc" -ne 0 ]; then echo "FAIL $1 (run failed, rc=$rc)"; fail=1; else check "$1" "$2"; fi; }

scripts/evaluate-prepare.sh 9 go >/dev/null 2>&1; rc9=$?; check "session 9 is rejected with exit 2" '[ $rc9 -eq 2 ]'
scripts/evaluate-prepare.sh 2 rb >/dev/null 2>&1; rcrb=$?; check "language rb is rejected with exit 2" '[ $rcrb -eq 2 ]'
scripts/evaluate-prepare.sh    >/dev/null 2>&1; rc0=$?; check "missing arguments exit 2" '[ $rc0 -eq 2 ]'
scripts/evaluate-prepare.sh 2 go extra >/dev/null 2>&1; rc3=$?; check "more than two arguments exit 2" '[ $rc3 -eq 2 ]'

out="$(scripts/evaluate-prepare.sh 2 go 2>/dev/null)"; rc=$?
check "session 2 go exits 0" '[ $rc -eq 0 ]'
WORKSPACE=; RUN_DIR=; SHEET=; DECK=; COMMIT=
while IFS== read -r k v; do
  case "$k" in WORKSPACE|RUN_DIR|SHEET|DECK|COMMIT) printf -v "$k" '%s' "$v" ;; esac
done <<< "$out"

dep "stdout is exactly the five KEY lines in order" \
  '[ "$(printf "%s\n" "$out" | cut -d= -f1 | paste -sd, -)" = "WORKSPACE,RUN_DIR,SHEET,DECK,COMMIT" ]'
dep "DECK names an existing file iff the sibling deck exists" \
  'if ls "$PWD"/../ai-assisted-se-claude/slidev/decks/02-*.md >/dev/null 2>&1; then [ -n "$DECK" ] && [ -f "$DECK" ]; else [ -z "$DECK" ]; fi'
dep "workspace folder is named bookstore" '[ -n "$WORKSPACE" ] && [ "$(basename "$WORKSPACE")" = bookstore ]'
dep "workspace is outside this repo" 'case "$WORKSPACE" in "") false;; "$PWD"/*) false;; *) true;; esac'
dep "workspace is its own git repo with one commit" '[ "$(git -C "$WORKSPACE" rev-list --count HEAD 2>/dev/null)" = 1 ]'
dep "workspace tree is clean" '[ -d "$WORKSPACE/.git" ] && [ -z "$(git -C "$WORKSPACE" status --porcelain 2>/dev/null)" ]'
dep "workspace has the html sheet" '[ -f "$WORKSPACE/exercises/session2.html" ]'
dep "workspace has no evaluator files" '[ -d "$WORKSPACE" ] && [ ! -e "$WORKSPACE/.claude/agents" ] && [ ! -e "$WORKSPACE/.claude/commands" ] && [ ! -e "$WORKSPACE/scripts" ]'
dep "run dir is <temp output root>/<date>-session2-go" '[ "$RUN_DIR" = "$out_root/$(date +%F)-session2-go" ]'
check "default output root is inside the repo (by inspection)" 'grep -q "EVALUATE_OUTPUT_ROOT:-\$repo/output/evaluations}" scripts/evaluate-prepare.sh'
dep "sheet text exists and has the title" 'grep -q "Exercise 2" "$SHEET"'
dep "sheet text keeps Done when lines" 'grep -qi "done when" "$SHEET"'
dep "sheet text is small (no embedded fonts)" '[ -f "$SHEET" ] && [ "$(wc -c < "$SHEET")" -lt 200000 ]'
dep "commit hash is printed" '[ -n "$COMMIT" ]'

# Second run on the same day: stale run-log.md must not survive beside the fresh sheet.
[ -n "$WORKSPACE" ] && workspaces+=("$WORKSPACE")
if [ "$rc" -eq 0 ] && [ -d "$RUN_DIR" ]; then
  echo stale > "$RUN_DIR/run-log.md"
  out2="$(scripts/evaluate-prepare.sh 2 go 2>/dev/null)"; rc2=$?
  ws2="$(printf '%s\n' "$out2" | sed -n 's/^WORKSPACE=//p')"; [ -n "$ws2" ] && workspaces+=("$ws2")
  check "second run exits 0" '[ $rc2 -eq 0 ]'
  check "second run has no stale run-log.md" '[ -f "$RUN_DIR/sheet.md" ] && [ ! -e "$RUN_DIR/run-log.md" ]'
  check "earlier run was moved to a -prev- sibling" 'prevs=("$RUN_DIR"-prev-*); [ -f "${prevs[0]}/run-log.md" ]'
else
  echo "FAIL second-run checks (first run failed, rc=$rc)"; fail=1
fi

# Remove only what this test created: the temp output root and the temp parents of the workspaces.
for ws in "${workspaces[@]+"${workspaces[@]}"}"; do
  if [ -n "$ws" ] && [ "$(basename "$ws")" = bookstore ]; then rm -rf "$(dirname "$ws")"; fi
done
if [ -n "$out_root" ] && [ -d "$out_root" ]; then rm -rf "$out_root"; fi
exit $fail
