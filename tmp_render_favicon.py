from PIL import Image, ImageDraw

# Render the SVG favicon as a 32x32 PNG
# SVG viewBox="0 0 32 32"
# Q circle: circle cx=16 cy=15 r=12 stroke=#22C55E stroke-width=3
# Q tail: path d="M 25 23 L 28 19" stroke=#22C55E stroke-width=3
# Arrow: path d="M 26 14 L 28 12 L 30 14" stroke=#22C55E stroke-width=2.5

scale = 4
size = 32 * scale

img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

green = (34, 197, 94, 255)

sc = lambda v: int(v * scale)
sw = lambda v: max(1, int(v * scale))

# Q circle: cx=16, cy=15, r=12, stroke-width=3
cx, cy = sc(16), sc(15)
r = sc(12)
draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=green, width=sw(3))

# Q tail: M 25 23 L 28 19
draw.line([sc(25), sc(23), sc(28), sc(19)], fill=green, width=sw(3))

# Arrow graph: M 26 14 L 28 12 L 30 14
draw.line([sc(26), sc(14), sc(28), sc(12)], fill=green, width=sw(3))
draw.line([sc(28), sc(12), sc(30), sc(14)], fill=green, width=sw(3))

favicon = img.resize((32, 32), Image.LANCZOS)
favicon.save('C:/qcanary/apps/web/public/favicon.png')
print("Done! favicon.png saved (32x32)")
