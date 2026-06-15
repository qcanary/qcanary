"""Render the SVG favicon as a high-quality 32x32 PNG using cairosvg"""
import cairosvg

# Read the SVG source
with open('C:/qcanary/apps/web/public/favicon.svg', 'r') as f:
    svg = f.read()

# Render at 4x for crisp anti-aliasing then downscale
# First render at 128x128
png_data = cairosvg.svg2png(bytestring=svg.encode(), output_width=128, output_height=128)

with open('C:/qcanary/tmp_favicon_128.png', 'wb') as f:
    f.write(png_data)

# Now downscale to 32x32 using Pillow's LANCZOS
from PIL import Image
img = Image.open('C:/qcanary/tmp_favicon_128.png')
print(f"SVG rendered at: {img.size}")

favicon = img.resize((32, 32), Image.LANCZOS)
favicon.save('C:/qcanary/apps/web/public/favicon.png')
print("Saved favicon.png (32x32 from SVG via cairosvg)")

# Verify
pixels = list(favicon.getdata())
non_transparent = sum(1 for p in pixels if isinstance(p, tuple) and len(p) > 3 and p[3] > 0)
print(f"Non-transparent pixels: {non_transparent}")
