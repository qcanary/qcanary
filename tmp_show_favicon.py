from PIL import Image

# Check the extracted ICO 32x32 frame - what does it look like?
img = Image.open('C:/qcanary/apps/web/public/favicon.png').convert('RGBA')
w, h = img.size

# Print a text representation
print("Favicon (32x32) from ICO:")
print("=" * 36)
for y in range(h):
    line = ""
    for x in range(w):
        r, g, b, a = img.getpixel((x, y))
        if a == 0:
            line += " "
        elif r == 0 and g == 0 and b == 0:
            line += "#"  # black
        elif r > 200 and g > 200 and b > 200:
            line += "."  # white
        else:
            line += "*"  # gray
    print(f"|{line}|")
print("=" * 36)
