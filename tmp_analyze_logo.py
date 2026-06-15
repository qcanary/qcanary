from PIL import Image

img = Image.open('C:/qcanary/apps/web/public/logo.png')
print(f"Image size: {img.size}, mode: {img.mode}")

# Convert to RGBA for analysis
img_rgba = img.convert('RGBA')
w, h = img.size

# Sample corners
for label, (x, y) in [("TL", (0,0)), ("TR", (w-1,0)), ("BL", (0,h-1)), ("BR", (w-1,h-1))]:
    px = img_rgba.getpixel((x, y))
    print(f"Corner {label}: RGBA {px}")

# Scan for non-white/non-transparent content
# Alpha-based detection
alpha_min = min(img_rgba.getpixel((x, y))[3] for x, y in [(0,0), (w-1,0), (0,h-1), (w-1,h-1)])
print(f"Alpha at corners: min={alpha_min}")

# Find bounding box of non-white content
# Check center vertical strip to find content width
cx = w // 2
left_bound = 0
right_bound = w - 1

# Scan from edges inward to find content
for x in range(w):
    col_has_content = False
    for y in range(0, h, 5):
        r, g, b, a = img_rgba.getpixel((x, y))
        if a > 10 and (r < 200 or g < 200 or b < 200):
            col_has_content = True
            break
    if col_has_content:
        left_bound = x
        break

for x in range(w-1, -1, -1):
    col_has_content = False
    for y in range(0, h, 5):
        r, g, b, a = img_rgba.getpixel((x, y))
        if a > 10 and (r < 200 or g < 200 or b < 200):
            col_has_content = True
            break
    if col_has_content:
        right_bound = x
        break

# Scan from top/bottom
top_bound = 0
bottom_bound = h - 1

for y in range(h):
    row_has_content = False
    for x in range(0, w, 5):
        r, g, b, a = img_rgba.getpixel((x, y))
        if a > 10 and (r < 200 or g < 200 or b < 200):
            row_has_content = True
            break
    if row_has_content:
        top_bound = y
        break

for y in range(h-1, -1, -1):
    row_has_content = False
    for x in range(0, w, 5):
        r, g, b, a = img_rgba.getpixel((x, y))
        if a > 10 and (r < 200 or g < 200 or b < 200):
            row_has_content = True
            break
    if row_has_content:
        bottom_bound = y
        break

content_w = right_bound - left_bound
content_h = bottom_bound - top_bound
print(f"\nContent bounds: x=[{left_bound},{right_bound}], y=[{top_bound},{bottom_bound}]")
print(f"Content size: {content_w}x{content_h}")

# Sample some colors in the center content area
print("\nCenter content samples:")
cy_mid = (top_bound + bottom_bound) // 2
for x_frac in [0.3, 0.5, 0.7]:
    sx = int(left_bound + content_w * x_frac)
    px = img_rgba.getpixel((sx, cy_mid))
    print(f"  ({sx}, {cy_mid}): RGBA {px}")
