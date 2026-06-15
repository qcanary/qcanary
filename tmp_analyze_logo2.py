from PIL import Image
import statistics

img = Image.open('C:/qcanary/apps/web/public/logo.png').convert('RGBA')
w, h = img.size

# Check the central horizontal row for color changes
# This will help find where icon ends and text begins
cy = h // 2
print(f"Scanning row {cy} across {w}px width...")

# Scan vertical strips to find distinct visual regions
# Look at columns and measure std dev of brightness
prev_strip_avg = None
change_points = []

for x in range(0, w, 10):
    strip_pixels = []
    for y in range(0, h, 5):
        r, g, b, a = img.getpixel((x, y))
        # Convert to perceived brightness
        brightness = 0.299 * r + 0.587 * g + 0.114 * b
        strip_pixels.append(brightness)
    avg = statistics.mean(strip_pixels)
    if prev_strip_avg is not None and abs(avg - prev_strip_avg) > 5:
        change_points.append((x, avg, prev_strip_avg))
    prev_strip_avg = avg

print(f"\nSignificant vertical changes detected at:")
for x, avg, prev in change_points[:20]:
    print(f"  x={x}: brightness shifted from {prev:.1f} to {avg:.1f}")

# Let me also try sampling at different Y coordinates to understand the layout
print("\n--- Horizontal slice analysis ---")
for y_pos in [h//4, h//2, 3*h//4]:
    prev_px = None
    regions = []
    start_x = 0
    for x in range(0, w, 5):
        r, g, b, a = img.getpixel((x, y_pos))
        curr = (r, g, b)
        if prev_px is not None:
            dist = sum(abs(curr[i] - prev_px[i]) for i in range(3))
            if dist > 40:
                regions.append((start_x, x, prev_px, curr))
                start_x = x
        prev_px = curr
    if regions:
        print(f"y={y_pos}: {len(regions)} color transitions")
        for s, e, _, _ in regions[:8]:
            print(f"  region: x=[{s},{e}]")
