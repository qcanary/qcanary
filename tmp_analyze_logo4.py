from PIL import Image
from collections import Counter

img = Image.open('C:/qcanary/apps/web/public/logo.png').convert('RGBA')
w, h = img.size

# Sample many pixels in the left 0-1000 region to find what's there
# Look for ANY pixel that significantly differs from the background (~15,21,21)
bg_r, bg_g, bg_b, bg_a = 15, 21, 21, 255

print("=== Sampling icon region (x=0-1000, y=0-1536) ===")
color_counts = Counter()
for x in range(0, 1000, 10):
    for y in range(0, h, 10):
        r, g, b, a = img.getpixel((x, y))
        diff = abs(r-bg_r) + abs(g-bg_g) + abs(b-bg_b)
        if diff > 15:  # significantly different from background
            # Quantize colors
            qr, qg, qb = r//20, g//20, b//20
            color_counts[(qr, qg, qb)] += 1

print(f"Found {sum(color_counts.values())} non-background pixels")
for (qr, qg, qb), count in color_counts.most_common(20):
    r, g, b = qr*20, qg*20, qb*20
    print(f"  ~({r},{g},{b}): {count} pixels")

# Also check if the icon might be lighter teal/white
print("\n=== Looking for lighter elements (brightness > 30) in x=0-1000 ===")
light_pixels = []
for x in range(0, 1000, 5):
    for y in range(0, h, 5):
        r, g, b, a = img.getpixel((x, y))
        brightness = 0.299*r + 0.587*g + 0.114*b
        if a > 10 and brightness > 25:
            light_pixels.append((x, y, r, g, b, brightness))

print(f"Found {len(light_pixels)} pixels with brightness > 25")
if light_pixels:
    xs = [p[0] for p in light_pixels]
    ys = [p[1] for p in light_pixels]
    print(f"  x=[{min(xs)},{max(xs)}], y=[{min(ys)},{max(ys)}]")
    # Sample some colors
    seen = set()
    for p in light_pixels[:10]:
        key = (p[2]//10, p[3]//10, p[4]//10)
        if key not in seen:
            seen.add(key)
            print(f"  Sample: ({p[2]},{p[3]},{p[4]}) at ({p[0]},{p[1]}) brightness={p[5]:.0f}")
