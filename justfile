# Build the flat participant package for one language into dist/bookstore-<lang>.
# This is exactly what CI publishes to the <lang> branch, so test sheets here.
# Needs pandoc and Chrome for the PDFs; `PDF=skip just package py` keeps the Markdown.
package lang:
    scripts/package.sh {{lang}}

# Build all four packages
package-all:
    for l in go kt py ts; do scripts/package.sh "$l"; done
