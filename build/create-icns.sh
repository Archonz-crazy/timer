#!/bin/bash

# Create iconset directory
mkdir icon.iconset

# Convert SVG to PNG files of different sizes
for size in 16 32 64 128 256 512; do
  # Normal resolution
  convert -background none -resize ${size}x${size} icon.svg icon.iconset/icon_${size}x${size}.png
  # High resolution (2x)
  convert -background none -resize $((size*2))x$((size*2)) icon.svg icon.iconset/icon_${size}x${size}@2x.png
done

# Create ICNS file from iconset
iconutil -c icns icon.iconset

# Clean up
rm -rf icon.iconset 