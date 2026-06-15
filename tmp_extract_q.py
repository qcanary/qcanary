from PIL import Image, ImageDraw, ImageFilter
import os

img = Image.open('C:/qcanary/apps/web/public/logo.png').convert('RGBA')
w, h = img.size

# The green wordmark "Qcanary" spans roughly x=1003 to x=1835
# Let's find the exact left edge of the Q character
# Scan x from 1000 to 1100 to find where the Q starts
print("Finding Q letter bounds...")

# Find left edge of first character
q_left = None
for x in range(1000, 1100):
    has_green = False
    for y in range(0, h, 2):
        r, g, b, a = img.getpixel((x, y))
        if g > r + 10 and g > b + 10:
            has_green = True
            break
    if has_green:
        q_left = x
        break

# Find right edge of Q (find gap between Q and next char)
q_right = q_left
in_green = False
for x in range(q_left or 1003, 1200):
    has_green = False
    for y in range(0, h, 2):
        r, g, b, a = img.getpixel((x, y))
        if g > r + 10 and g > b + 10:
            has_green = True
            break
    if has_green and not in_green:
        in_green = True
    elif not has_green and in_green:
        # Found a gap - this is likely between Q and c
        if x - q_right > 5:  # meaningful gap
            break
        in_green = False
    if has_green:
        q_right = x

# Find vertical bounds of Q
q_top = 0
q_bottom = h
for y in range(0, h):
    has_green = False
    for x in range(q_left or 1003, q_right + 1):
        r, g, b, a = img.getpixel((x, y))
        if g > r + 10 and g > b + 10:
            has_green = True
            break
    if has_green:
        if q_top == 0:
            q_top = y
        q_bottom = y

print(f"Q bounds: x=[{q_left},{q_right}] y=[{q_top},{q_bottom}]")

# Crop the Q letter
q_img = img.crop((q_left, q_top, q_right, q_bottom))
qw, qh = q_img.size
print(f"Q letter size: {qw}x{qh}")

# Make square with padding
sz = max(qw, qh)
# Add some breathing room (20% padding)
padding = int(sz * 0.2)
sz_with_pad = sz + padding * 2
from PIL import ImageOps
# Center the Q in a square canvas
q_square = Image.new('RGBA', (sz_with_pad, sz_with_pad), (0, 0, 0, 0))
offset_x = (sz_with_pad - qw) // 2
offset_y = (sz_with_pad - qh) // 2
q_square.paste(q_img, (offset_x, offset_y))

# Downscale to 32x32 with high quality
favicon = q_square.resize((32, 32), Image.LANCZOS)
favicon.save('C:/qcanary/apps/web/public/favicon.png')
print("Saved! favicon.png from real logo Q letter")
