from PIL import Image
import os

img = Image.open('C:/qcanary/apps/web/public/logo.png').convert('RGBA')
w, h = img.size
print(f"Original: {w}x{h}")

# Based on analysis: icon area is roughly x=0 to x=1000
# The icon is probably roughly square, centered vertically
# Let's look more carefully at the vertical bounds within the icon area

# Find the vertical extent of non-background content in the icon region (x=0 to 1000)
icon_x_start = 0
icon_x_end = 1000  # estimated icon width

top_y = 0
bottom_y = h - 1

for y in range(h):
    has_content = False
    for x in range(icon_x_start, icon_x_end, 4):
        r, g, b, a = img.getpixel((x, y))
        brightness = 0.299 * r + 0.587 * g + 0.114 * b
        if a > 10 and brightness > 25:  # anything lighter than the dark bg
            has_content = True
            break
    if has_content:
        top_y = y
        break

for y in range(h-1, -1, -1):
    has_content = False
    for x in range(icon_x_start, icon_x_end, 4):
        r, g, b, a = img.getpixel((x, y))
        brightness = 0.299 * r + 0.587 * g + 0.114 * b
        if a > 10 and brightness > 25:
            has_content = True
            break
    if has_content:
        bottom_y = y
        break

print(f"Icon vertical bounds: y=[{top_y},{bottom_y}]")

# Also find horizontal bounds
left_x = 0
for x in range(icon_x_end):
    has_content = False
    for y in range(top_y, bottom_y + 1, 4):
        r, g, b, a = img.getpixel((x, y))
        brightness = 0.299 * r + 0.587 * g + 0.114 * b
        if a > 10 and brightness > 25:
            has_content = True
            break
    if has_content:
        left_x = x
        break

right_x = icon_x_end
for x in range(icon_x_end, -1, -1):
    has_content = False
    for y in range(top_y, bottom_y + 1, 4):
        r, g, b, a = img.getpixel((x, y))
        brightness = 0.299 * r + 0.587 * g + 0.114 * b
        if a > 10 and brightness > 25:
            has_content = True
            break
    if has_content:
        right_x = x
        break

print(f"Icon horizontal bounds: x=[{left_x},{right_x}]")
icon_w = right_x - left_x
icon_h = bottom_y - top_y
print(f"Icon size: {icon_w}x{icon_h}")

# Crop to the icon bounding box
icon_img = img.crop((left_x, top_y, right_x, bottom_y))
icon_img.save('C:/qcanary/tmp_icon_crop.png')
print("Saved icon crop to tmp_icon_crop.png")

# Make it square: use the smaller dimension as the side, center-crop
square_size = min(icon_w, icon_h)
center_x = icon_w // 2
center_y = icon_h // 2
square_crop = icon_img.crop((
    max(0, center_x - square_size // 2),
    max(0, center_y - square_size // 2),
    min(icon_w, center_x + square_size // 2),
    min(icon_h, center_y + square_size // 2)
))
square_crop.save('C:/qcanary/tmp_icon_square.png')
print(f"Square crop: {square_crop.size}")

# Resize to 32x32 using LANCZOS for best quality
favicon = square_crop.resize((32, 32), Image.LANCZOS)
favicon.save('C:/qcanary/apps/web/public/favicon.png')
print(f"Favicon saved: 32x32 -> C:/qcanary/apps/web/public/favicon.png")
