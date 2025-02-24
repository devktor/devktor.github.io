#!/bin/bash

# Define source directories
SRC_CSS="css"
SRC_JS="js"
SRC_HTML="index.html"

# Define destination directory
DEST="build"

# Create destination directory if it doesn't exist
mkdir -p "$DEST/css" "$DEST/js"

# Minify JavaScript files
for file in "$SRC_JS"/*.js; do
  [ -e "$file" ] || continue  # Skip if no files found
  terser "$file" -o "$DEST/js/$(basename "${file%.js}.js")" --compress --mangle
done

# Minify CSS files
for file in "$SRC_CSS"/*.css; do
  [ -e "$file" ] || continue  # Skip if no files found
  yuicompressor "$file" -o "$DEST/css/$(basename "${file%.css}.css")"
done

# Minify HTML file
if [ -f "$SRC_HTML" ]; then
  html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true -o "$DEST/$(basename "${SRC_HTML%.html}.html")" "$SRC_HTML"
fi

echo "Minification complete. Files saved in '$DEST/'"

