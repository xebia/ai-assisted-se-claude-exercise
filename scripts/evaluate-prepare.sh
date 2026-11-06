#!/usr/bin/env bash
# Prepare one exercise dry run for /evaluate-exercise (trainer-only, never packaged).
#
#   scripts/evaluate-prepare.sh <session 1-8> <go|kt|py|ts>
#
# Builds the participant package, copies it to a folder named `bookstore`
# outside this repo, gives it its own git repository (so resets behave as on a
# participant's clone), converts the HTML sheet to text for the participant
# agent, and prints the paths as KEY=value lines on stdout.
#
# Environment (for tests): EVALUATE_OUTPUT_ROOT, an absolute path, replaces the
# default output root $repo/output/evaluations. RUN_DIR is
# <root>/<date>-session<N>-<lang>.
#
# Exit codes: 2 bad arguments, 3 package build failed, 4 sheet missing,
# 5 pandoc missing or the sheet conversion failed.
set -euo pipefail

usage="usage: scripts/evaluate-prepare.sh <session 1-8> <go|kt|py|ts>"
[ "$#" -le 2 ] || { echo "$usage" >&2; exit 2; }
session="${1:-}"; lang="${2:-}"
case "$session" in [1-8]) ;; *) echo "$usage" >&2; exit 2 ;; esac
case "$lang" in go|kt|py|ts) ;; *) echo "$usage" >&2; exit 2 ;; esac

repo="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "pandoc is required to convert the exercise sheet but was not found on PATH" >&2
  exit 5
fi

# The package build prints progress on stdout; keep our stdout for the KEY=value lines.
# HTML=skip / PDF=skip from the caller's environment would make package.sh ship Markdown.
if ! env -u HTML -u PDF STRICT=1 "$repo/scripts/package.sh" "$lang" >&2; then
  echo "package build failed for $lang" >&2
  exit 3
fi

workspace="$(mktemp -d)/bookstore"
cp -R "$repo/dist/bookstore-$lang" "$workspace"

sheet_html="$workspace/exercises/session$session.html"
if [ ! -f "$sheet_html" ]; then
  echo "sheet not in the package: exercises/session$session.html" >&2
  exit 4
fi

git -C "$workspace" init -q
git -C "$workspace" add -A
git -C "$workspace" -c user.name=participant -c user.email=participant@example.com \
  -c commit.gpgsign=false commit -q -m "Participant package"

output_root="${EVALUATE_OUTPUT_ROOT:-$repo/output/evaluations}"
run_dir="$output_root/$(date +%F)-session$session-$lang"
if [ -e "$run_dir/run-log.md" ] || [ -e "$run_dir/report.md" ]; then
  prev="$run_dir-prev-$(date +%H%M%S)"
  mv "$run_dir" "$prev"
  echo "earlier run found; moved it aside to $prev" >&2
fi
mkdir -p "$run_dir"
# The sheet as text, outside the workspace, so the workspace stays exactly what a
# participant has. Converted from the shipped HTML, so a broken render shows up.
if ! pandoc -f html -t gfm --wrap=none "$sheet_html" -o "$run_dir/sheet.md"; then
  echo "pandoc failed to convert $sheet_html" >&2
  exit 5
fi

deck="$(ls "$repo"/../ai-assisted-se-claude/slidev/decks/0"$session"-*.md 2>/dev/null | head -1 || true)"

echo "WORKSPACE=$workspace"
echo "RUN_DIR=$run_dir"
echo "SHEET=$run_dir/sheet.md"
echo "DECK=$deck"
echo "COMMIT=$(git -C "$repo" rev-parse --short HEAD)"
