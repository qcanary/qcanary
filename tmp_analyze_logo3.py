from PIL import Image
import os

img = Image.open('C:/qcanary/apps/web/public/logo.png').convert('RGBA')
w, h = img.size

# Find the brightest pixels to understand the logo colors
# Sample from the "text area" (x=1100 to 1700)
print("=== Sampling text/logo area (x=1100-1700) ===")
bright_colors = set()
for x in range(1100, 1700, 20):
    for y in range(h//4, 3*h//4, 15):
        r, g, b, a = img.getpixel((x, y))
        brightness = 0.299*r + 0.587*g + 0.114*b
        if brightness > 30:  # brighter than background
            bright_colors.add((r, g, b, round(brightness)))
            
# Sort by brightness and show unique ones
sorted_colors = sorted(bright_colors, key=lambda c: c[3])
print(f"Found {len(sorted_colors)} distinct brighter pixels")
for c in sorted_colors[:15]:
    print(f"  RGBA ({c[0]},{c[1]},{c[2]},{3}): brightness={c[3]:.0f}")

# Now try with a much lower threshold
print("\n=== Re-scanning with threshold > 22 ===")
# Background is ~19, anything above 22 should be logo elements
ranges = {}
for x in range(0, 1000, 15):
    for y in range(0, h, 15):
        r, g, b, a = img.getpixel((x, y))
        if a < 10:
            continue
        brightness = 0.299*r + 0.587*g + 0.114*b
        if brightness > 22:
            bucket = round(brightness / 10) * 10
            if bucket not in ranges:
                ranges[bucket] = []
            ranges[bucket].append((x, y, r, g, b))

for b in sorted(ranges.keys()):
    pts = ranges[b]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    if pts:
        r, g, b, *_ = pts[0][2:]
        print(f"  Brightness ~{b}: {len(pts)} pixels at x=[{min(xs)},{max(xs)}] y=[{min(ys)},{max(ys)}] sample color=({r},{g},{b})")
