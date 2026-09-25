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
#     mcp-sqlite/          <- mcp-sqlite/         (session 5, source)
#     mcp-sqlite/bin/      <- prebuilt server, one binary per platform
#     mcp-sqlite-server    <- launcher that picks the binary for this machine
#     exercises/*.pdf      <- the sheets, rendered by scripts/render-sheets.sh
#     preparation.pdf
#
# Participants get the sheets as PDF only. The Markdown stays the single source
# on main and does not ship. PDF=skip ships the Markdown instead (layout-only
# test builds on a machine without pandoc or Chrome).
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
  # Tracked PDFs never ship: render-sheets.sh makes fresh ones from the .md files.
  (cd "$repo/$1" && git ls-files -z -- . ':!*.pdf' | tar --null -T - -cf -) | tar -xf - -C "$out/$2"
}

copy "bookstore-$lang" .
if [ -e "$out/.claude/skills" ]; then
  echo "bookstore-$lang tracks its own .claude/skills; it would collide with the course skills" >&2
  exit 1
fi
copy .claude/skills .claude/skills
copy bookstore-web web
copy mcp-sqlite mcp-sqlite

# Prebuilt MCP server. modernc.org/sqlite is pure Go, so cross-compiling needs no C toolchain.
# -trimpath and an empty build id keep the binaries identical between runs (no branch churn).
mkdir -p "$out/mcp-sqlite/bin"
if command -v go >/dev/null; then
  for target in darwin/arm64 darwin/amd64 linux/amd64 linux/arm64 windows/amd64; do
    os="${target%/*}"; arch="${target#*/}"; ext=""; [ "$os" = windows ] && ext=".exe"
    (cd "$repo/mcp-sqlite" && CGO_ENABLED=0 GOOS="$os" GOARCH="$arch" \
      go build -trimpath -ldflags="-s -w -buildid=" \
      -o "$out/mcp-sqlite/bin/mcp-sqlite-server-$os-$arch$ext" .)
  done
else
  echo "warning: go not found, shipping only the committed darwin-arm64 binary" >&2
  cp "$repo/mcp-sqlite-server" "$out/mcp-sqlite/bin/mcp-sqlite-server-darwin-arm64"
fi

cat > "$out/mcp-sqlite-server" <<'LAUNCHER'
#!/bin/sh
# Starts the prebuilt SQLite MCP server that matches this machine.
os=$(uname -s | tr '[:upper:]' '[:lower:]'); arch=$(uname -m); ext=""
case "$os" in mingw*|msys*|cygwin*) os=windows; ext=.exe ;; esac
case "$arch" in x86_64) arch=amd64 ;; aarch64) arch=arm64 ;; esac
exec "$(dirname "$0")/mcp-sqlite/bin/mcp-sqlite-server-$os-$arch$ext" "$@"
LAUNCHER
chmod +x "$out/mcp-sqlite-server"

# Inside the package the sheets are PDFs, so point every mention of them at the PDF:
# README links, the sheets themselves, and skills that look for a sheet on disk.
if [ "${PDF:-}" != skip ]; then
  find "$out" -name '*.md' -type f -exec \
    perl -pi -e 's{\b(preparation|exercises/session\d+)\.md\b}{$1.pdf}g' {} +
fi

# Lint: paths that only make sense in the old multi-folder layout.
stale="$(cd "$out" && grep -rnE 'bookstore-(go|kt|py|ts|web)/|(^|[^.])\.\./(bookstore|mcp-sqlite)|cd bookstore-|`bookstore-(go|kt|py|ts|web)` (folder|project)' \
  --include='*.md' exercises .claude/skills web/README.md 2>/dev/null || true)"
if [ -n "$stale" ]; then
  echo "old-layout paths still in the package: $(printf '%s\n' "$stale" | wc -l | tr -d ' ') lines" >&2
  printf '%s\n' "$stale" | cut -d: -f1 | sort | uniq -c | sort -rn >&2
  [ "${STRICT:-0}" = 1 ] && exit 1
fi

# Last step, after the lint has read the Markdown: render each sheet to PDF and
# drop its .md from the package.
"$repo/scripts/render-sheets.sh" "$out" "bookstore-$lang"

echo "packaged bookstore-$lang -> $out"
