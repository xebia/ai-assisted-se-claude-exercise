#!/usr/bin/env bash
# Assemble the participant package for one BookStore language.
#
#   scripts/package.sh <go|kt|py|ts> [out-dir]      (default: dist/bookstore-<lang>)
#
# The package is flat: the language project is the package root, so participants
# work in one folder for the whole course.
#
#   <package root>/        <- bookstore-<lang>/   (code, exercises, CLAUDE.md)
#     .claude/skills/      <- .claude/skills/     (coaches, verify-exercise, ...)
#     web/                 <- bookstore-web/      (sessions 6 and 7)
#     mcp-sqlite/          <- mcp-sqlite/         (session 4: server.py, run with uv)
#     bookstore-plugin/    <- bookstore-plugin/   (session 4 bonus)
#     headless/            <- headless/           (session 5: gate, brief, logs; run with uv)
#     exercises/*.html     <- the sheets, rendered by scripts/render-sheets.sh
#     preparation.html
#
# Participants get the sheets as HTML pages only (Xebia style, a Copy button on
# every code block). The Markdown stays the single source on main and does not
# ship. HTML=skip ships the Markdown instead (layout-only test builds on a
# machine without pandoc).
#
# Only files tracked by git are copied (working-tree version), so local junk
# such as node_modules, store.db or settings.local.json never ships.
# Trainer-only files at the repo root (conventions.md, writing-style.md) stay out.
#
# STRICT=1 makes leftover old-layout paths in sheets and skills a build error.
set -euo pipefail

lang="${1:?usage: scripts/package.sh <go|kt|py|ts> [out-dir]}"
case "$lang" in go|kt|py|ts) ;; *) echo "unknown language: $lang" >&2; exit 2 ;; esac

repo="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
out="${2:-$repo/dist/bookstore-$lang}"

if [ -e "$out" ]; then rm -rf "$out"; fi
mkdir -p "$out"

# copy <tracked folder in the repo> <destination inside the package>
copy() {
  mkdir -p "$out/$2"
  # Tracked PDFs never ship (left over from when the sheets were PDFs);
  # render-sheets.sh makes the HTML sheets from the .md files.
  # Tracked files deleted in the working tree (not yet committed) are skipped,
  # so a package can be built before the deletion is committed.
  (cd "$repo/$1" && git ls-files -z -- . ':!*.pdf' \
    | while IFS= read -r -d '' f; do [ -e "$f" ] && printf '%s\0' "$f"; done \
    | tar --null -T - -cf -) | tar -xf - -C "$out/$2"
}

copy "bookstore-$lang" .
if [ -e "$out/.claude/skills" ]; then
  echo "bookstore-$lang tracks its own .claude/skills; it would collide with the course skills" >&2
  exit 1
fi
copy .claude/skills .claude/skills
copy bookstore-web web
# The MCP server is one Python file (mcp-sqlite/server.py, standard library only);
# participants start it with `uv run --script`, so nothing is built here.
copy mcp-sqlite mcp-sqlite
copy bookstore-plugin bookstore-plugin
# Exercise 5 (headless): two uv scripts, the team rules and two nights of log.
copy headless headless

# Inside the package the sheets are HTML pages, so point every mention of them at
# the page: README links, the sheets themselves, and skills that look for a sheet
# on disk. (session4-part1, session8-alt: any suffix after the number.)
if [ "${HTML:-}" != skip ] && [ "${PDF:-}" != skip ]; then
  find "$out" -name '*.md' -type f -exec \
    perl -pi -e 's{\b(preparation|exercises/session\d+(?:-[a-z0-9]+)?)\.md\b}{$1.html}g' {} +
fi

# Lint: paths that only make sense in the old multi-folder layout.
stale="$(cd "$out" && grep -rnE 'bookstore-(go|kt|py|ts|web)/|(^|[^.])\.\./(bookstore|mcp-sqlite)|cd bookstore-|`bookstore-(go|kt|py|ts|web)`|language folder|four projects share' \
  --include='*.md' exercises .claude/skills web/README.md bookstore-plugin/README.md README.md 2>/dev/null || true)"
if [ -n "$stale" ]; then
  echo "old-layout paths still in the package: $(printf '%s\n' "$stale" | wc -l | tr -d ' ') lines" >&2
  printf '%s\n' "$stale" | cut -d: -f1 | sort | uniq -c | sort -rn >&2
  [ "${STRICT:-0}" = 1 ] && exit 1
fi

# Last step, after the lint has read the Markdown: render each sheet to HTML and
# drop its .md from the package.
"$repo/scripts/render-sheets.sh" "$out" "bookstore-$lang"

echo "packaged bookstore-$lang -> $out"
