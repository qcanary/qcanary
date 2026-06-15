from PIL import Image

# Start from the ICO-extracted 32x32 frame (correct Q+arrow shape)
img = Image.open('C:/qcanary/apps/web/public/favicon.png').convert('RGBA')
w, h = img.size

# Recolor black pixels to green (#22C55E)
green = (34, 197, 94, 255)
pixels = []
for y in range(h):
    for x in range(w):
        r, g, b, a = img.getpixel((x, y))
        if a == 0:
            pixels.append((0, 0, 0, 0))  # transparent
        elif r == 0 and g == 0 and b == 0:
            # Black -> green
            pixels.append(green)
        elif r > 200 and g > 200 and b > 200:
            # White -> lighter green or keep
            pixels.append((100, 230, 140, 255))  # soft green highlight
        else:
            # Gray -> darker/medium green
            scale = (r + g + b) / (255 * 3)
            nr = int(34 * scale + 20)
            ng = int(197 * scale + 20)
            nb = int(94 * scale + 20)
            pixels.append((min(255, nr), min(255, ng), min(255, nb), 255))

green_img = Image.new('RGBA', (w, h))
green_img.putdata(pixels)
green_img.save('C:/qcanary/apps/web/public/favicon.png')
print("Saved recolored favicon.png (green Q+arrow, from ICO)")

# Verify
non_transp = sum(1 for p in green_img.getdata() if p[3] > 0)
print(f"Non-transparent pixels: {non_transp}")
