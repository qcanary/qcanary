from PIL import Image

img = Image.open('C:/qcanary/apps/web/public/logo.png')
w, h = img.size
palette = img.getpalette()

# Scan in strips to find exactly where green appears
print("=== Scanning for green pixels by x-position ===")
green_found = False
green_start = w

for x in range(w):
    has_green = False
    for y in range(0, h, 4):
        idx = img.getpixel((x, y))
        r, g, b = palette[idx*3:idx*3+3]
        if g > r + 10 and g > b + 10:
            has_green = True
            break
    if has_green and not green_found:
        print(f"  Green starts at x={x}")
        green_found = True
        green_start = x
    if not has_green and green_found:
        print(f"  Green ends at x={x}")
        green_found = False

# Also look for non-dark, non-green colors
print("\n=== Looking for any colored pixels (not dark, not green) ===")
other_colors = set()
for x in range(0, w, 20):
    for y in range(0, h, 20):
        idx = img.getpixel((x, y))
        r, g, b = palette[idx*3:idx*3+3]
        brightness = 0.299*r + 0.587*g + 0.114*b
        is_dark = brightness < 30
        is_green = g > r + 10 and g > b + 10
        if not is_dark and not is_green:
            other_colors.add((r, g, b))

print(f"Non-dark, non-green colors: {len(other_colors)}")
for c in sorted(other_colors, key=lambda c: 0.299*c[0]+0.587*c[1]+0.114*c[2]):
    print(f"  RGB({c[0]},{c[1]},{c[2]}) brightness={0.299*c[0]+0.587*c[1]+0.114*c[2]:.0f}")
    
# Let me check what the full right side looks like
print("\n=== Full horizontal scan ===")
for x_range in [(0,500), (500,1000), (1000,1200), (1200,1600), (1600,2200), (2200,2816)]:
    xs, xe = x_range
    green_cnt = 0
    total = 0
    for x in range(xs, xe, 10):
        for y in range(0, h, 10):
            idx = img.getpixel((x, y))
            r, g, b = palette[idx*3:idx*3+3]
            if g > r + 10 and g > b + 10:
                green_cnt += 1
            total += 1
    pct = green_cnt / max(total, 1) * 100
    print(f"  x=[{xs},{xe}]: {green_cnt}/{total} green pixels ({pct:.1f}%)")
