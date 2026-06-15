from PIL import Image

img = Image.open('C:/qcanary/tmp_ico_best.png').convert('RGBA')
w, h = img.size
print(f"Best ICO frame: {w}x{h}")

# Analyze the pixels
from collections import Counter
colors = Counter()
for y in range(h):
    for x in range(w):
        r, g, b, a = img.getpixel((x, y))
        if a > 10:
            qr, qg, qb = r//15, g//15, b//15
            colors[((qr*15, qg*15, qb*15))] += 1

print(f"\nNon-transparent pixels by color group:")
for (r,g,b), count in colors.most_common(20):
    brightness = 0.299*r + 0.587*g + 0.114*b
    print(f"  RGB({r:3d},{g:3d},{b:3d}) b={brightness:.0f}: {count} px")

# Check structure: scan rows to find the Q shape
print(f"\n=== Row content density ===")
for y in range(0, h, 10):
    row_green = sum(1 for x in range(w) if img.getpixel((x,y))[0:3] == (34,195,94) or img.getpixel((x,y))[1] > 150)
    if row_green > 0:
        print(f"  y={y}: {row_green} green pixels")

# Save the 32x32 frame too
ico32 = Image.open('C:/qcanary/apps/web/app/favicon.ico')
ico32.seek(1)
ico32.convert('RGBA').save('C:/qcanary/tmp_ico_32.png')
print("\nSaved ico_32.png")

# Also check: is the favicon.ico the Q circle+arrow or the full wordmark?
# Compare with our logo-extracted Q
logo_q = Image.open('C:/qcanary/apps/web/public/favicon.png').convert('RGBA')
print(f"\nOur current favicon.png: {logo_q.size}")
our_green = sum(1 for p in logo_q.getdata() if p[3] > 0 and p[1] > 100)
print(f"Our green pixels: {our_green}")
