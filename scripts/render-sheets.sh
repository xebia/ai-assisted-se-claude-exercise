#!/usr/bin/env bash
# Replace the participant sheets of one package with HTML pages:
#   exercises/*.md and preparation.md  ->  same name, .html; the .md is removed
#
#   scripts/render-sheets.sh <package-dir> <source-folder-in-repo>
#
# Each page is one self-contained file in the Xebia style: the page template
# (sheet-template.html) gets the stylesheet (sheet.css), the copy-button script
# (sheet-copy.js), the logo (sheet-logo.svg) and the Inter font (fonts/, SIL OFL)
# inlined, so a sheet opens offline with a double-click and nothing next to it.
# Every code block gets a Copy button; copying keeps a long command or prompt on
# one line however it wraps on screen. The browser can still print a sheet (print rules in sheet.css).
#
# Needs pandoc only. Without it the build fails: a package without sheets is
# useless. HTML=skip ships the Markdown sheets instead (layout-only test builds);
# PDF=skip, the old name, does the same.
#
# The pages are reproducible: the only date in them is the commit date of the
# sheet's .md, so an unchanged sheet gives an identical page, and the generated
# branches only change when a sheet changes.
set -euo pipefail

pkg="${1:?usage: scripts/render-sheets.sh <package-dir> <source-folder-in-repo>}"
src="${2:?usage: scripts/render-sheets.sh <package-dir> <source-folder-in-repo>}"
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(git -C "$here" rev-parse --show-toplevel)"

if [ "${HTML:-}" = skip ] || [ "${PDF:-}" = skip ]; then
  echo "warning: HTML=skip, this package ships the Markdown sheets instead of HTML pages" >&2
  exit 0
fi

if ! command -v pandoc >/dev/null; then
  echo "error: pandoc not found, cannot render the sheets. Install it (macOS: brew install pandoc), or use HTML=skip for a layout-only build" >&2
  exit 1
fi

b64() { base64 < "$1" | tr -d '\n'; }   # GNU base64 wraps at 76, BSD does not

work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT

# Head: font faces and stylesheet.
{
  echo '<style>'
  for face in Regular:400:normal SemiBold:600:normal Italic:400:italic; do
    IFS=: read -r name weight style <<<"$face"
    printf '@font-face{font-family:"Inter";font-weight:%s;font-style:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format("woff2")}\n' \
      "$weight" "$style" "$(b64 "$here/fonts/Inter-$name.woff2")"
  done
  cat "$here/sheet.css"
  echo '</style>'
} > "$work/head.html"

# Masthead: logo and course name.
cat > "$work/before.html" <<EOF
<header class="xb-masthead">
  <img class="xb-logo" src="data:image/svg+xml;base64,$(b64 "$here/sheet-logo.svg")" alt="Xebia">
  <div class="xb-course"><b>Mastering AI-Assisted Software Engineering</b>Xebia Academy</div>
</header>
EOF

count=0
for md in "$pkg"/exercises/*.md "$pkg"/preparation.md; do
  [ -f "$md" ] || continue
  rel="${md#"$pkg"/}"
  # Page title: the first "# " heading outside a code block (preparation.md has
  # none, and a "# comment" in a shell block is not a heading), else the file name.
  title="$(awk '/^ *```/ {code = !code; next} !code && /^# / {sub(/^# /, ""); print; exit}' "$md")"
  name="$(basename "${md%.md}")"
  [ -n "$title" ] || title="$(printf '%s' "${name:0:1}" | tr '[:lower:]' '[:upper:]')${name:1}"
  version="$(git -C "$repo" log -1 --format=%cd --date=short -- "$src/$rel")"

  # Footer (with this sheet's version) and the copy-button script.
  {
    printf '<footer class="xb-footer"><span>Mastering AI-Assisted Software Engineering · Xebia Academy</span><span>Version %s</span></footer>\n' \
      "${version:-unreleased}"
    echo '<script>'; cat "$here/sheet-copy.js"; echo '</script>'
  } > "$work/after.html"

  # GitHub callouts (> [!IMPORTANT]) are not Markdown to pandoc: turn the marker
  # into a label paragraph that sheet.css styles.
  perl -pi -e 's{^(\s*>\s*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$}{$1<p class="xb-callout">\u\L$2\E</p>\n$1\n}' "$md"

  # Own template: no pandoc default styling (it differs per pandoc version),
  # sheet.css is the only style.
  pandoc "$md" -f gfm -t html5 --standalone --no-highlight --wrap=none \
    --template "$here/sheet-template.html" --metadata pagetitle="$title" \
    --include-in-header "$work/head.html" \
    --include-before-body "$work/before.html" \
    --include-after-body "$work/after.html" \
    -o "${md%.md}.html"
  [ -s "${md%.md}.html" ] || { echo "HTML render failed for $rel" >&2; exit 1; }
  rm "$md"
  count=$((count + 1))
done
echo "rendered $count sheets as HTML"
