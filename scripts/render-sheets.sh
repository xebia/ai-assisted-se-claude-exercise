#!/usr/bin/env bash
# Replace the participant sheets of one package with PDFs:
#   exercises/*.md and preparation.md  ->  same name, .pdf; the .md is removed
#
#   scripts/render-sheets.sh <package-dir> <source-folder-in-repo>
#
# Pipeline: pandoc (GitHub Markdown -> one HTML file, styled by scripts/sheet.css)
# then headless Chrome prints that HTML to PDF. No LaTeX needed.
#
# Needs pandoc and Chrome or Chromium. Set CHROME to point at a specific binary.
# Without them the build fails: a package without PDFs would have no sheets.
# PDF=skip keeps the Markdown sheets instead, for layout-only test builds.
#
# The PDFs are reproducible: Chrome stamps the current time into the file, so we
# replace it with the commit date of the .md. An unchanged sheet gives an
# identical PDF, and the generated branches only change when a sheet changes.
set -euo pipefail

pkg="${1:?usage: scripts/render-sheets.sh <package-dir> <source-folder-in-repo>}"
src="${2:?usage: scripts/render-sheets.sh <package-dir> <source-folder-in-repo>}"
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(git -C "$here" rev-parse --show-toplevel)"

find_chrome() {
  local c
  for c in "${CHROME:-}" google-chrome google-chrome-stable chromium chromium-browser \
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      "/Applications/Chromium.app/Contents/MacOS/Chromium" \
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"; do
    [ -n "$c" ] || continue
    if command -v "$c" >/dev/null 2>&1; then command -v "$c"; return; fi
  done
  return 1
}

if [ "${PDF:-}" = skip ]; then
  echo "warning: PDF=skip, this package ships the Markdown sheets instead of PDFs" >&2
  exit 0
fi

missing=""
command -v pandoc >/dev/null || missing="pandoc"
chrome="$(find_chrome)" || missing="${missing:+$missing and }Chrome/Chromium"
if [ -n "$missing" ]; then
  echo "error: $missing not found, cannot render the sheets. Install what is missing (macOS: brew install pandoc), or use PDF=skip for a layout-only build" >&2
  exit 1
fi

work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
{ echo "<style>"; cat "$here/sheet.css"; echo "</style>"; } > "$work/style.html"

count=0
for md in "$pkg"/exercises/*.md "$pkg"/preparation.md; do
  [ -f "$md" ] || continue
  rel="${md#"$pkg"/}"
  title="$(sed -n 's/^# //p' "$md" | head -1)"
  pandoc "$md" -f gfm -t html5 --standalone --no-highlight \
    --metadata pagetitle="${title:-$rel}" --include-in-header "$work/style.html" \
    -o "$work/sheet.html"
  "$chrome" --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="${md%.md}.pdf" "file://$work/sheet.html" >/dev/null 2>&1
  [ -s "${md%.md}.pdf" ] || { echo "PDF export failed for $rel" >&2; exit 1; }

  # Same length as Chrome's own timestamp, so the PDF structure stays valid.
  stamp="$(TZ=UTC git -C "$repo" log -1 --format=%cd --date=format-local:%Y%m%d%H%M%S -- "$src/$rel")"
  perl -pi -e "s/D:\\d{14}/D:${stamp:-20000101000000}/g" "${md%.md}.pdf"
  rm "$md"
  count=$((count + 1))
done
echo "rendered $count PDFs"
