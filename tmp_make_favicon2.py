from PIL import Image
from collections import Counter

img = Image.open('C:/qcanary/apps/web/public/logo.png').convert('RGBA')
w, h = img.size

# Green logo elements (G much higher than R and B)
green_pixels = {}

for x in range(0, 1200):
    for y in range(0, h, 3):
        r, g, b, a = img.getpixel((x, y))
        if a > 10 and g > r + 10 and g > b + 10:
            if x not in green_pixels:
                green_pixels[x] = []
            green_pixels[x].append(y)

if green_pixels:
    xs = list(green_pixels.keys())
    all_ys = [y for ys in green_pixels.values() for y in ys]
    print(f"Green pixels: x=[{min(xs)},{max(xs)}], y=[{min(all_ys)},{max(all_ys)}]")
    print(f"Count: {len(all_ys)}")
    
    # Build heatmap to find dense region
    heatmap = [0] * h
    for y in all_ys:
        heatmap[y] += 1
    
    best_top, best_bot, best_sum = 0, h, 0
    window = 600  # guess at icon height
    for y1 in range(0, h - window, 10):
        s = sum(heatmap[y1:y1+window])
        if s > best_sum:
            best_sum = s
            best_top = y1
            best_bot = y1 + window
    print(f"Best vertical: y=[{best_top},{best_bot}] (sum={best_sum})")
    
    # Crop a generous area
    x1 = max(0, min(xs) - 20)
    x2 = min(1200, max(xs) + 20)
    y1 = max(0, best_top - 20)
    y2 = min(h, best_bot + 20)
    
    icon = img.crop((x1, y1, x2, y2))
    iw, ih = icon.size
    print(f"Crop: {iw}x{ih}")
    
    # Make square by adding padding
    sz = max(iw, ih)
    px = (sz - iw) // 2
    py = (sz - ih) // 2
    from PIL import ImageOps
    icon_sq = ImageOps.expand(icon, border=(px, py, sz - iw - px, sz - ih - py), fill=(0,0,0,0))
    print(f"Square: {icon_sq.size}")
    
    # Resize to 32x32
    favicon = icon_sq.resize((32, 32), Image.LANCZOS)
    favicon.save('C:/qcanary/apps/web/public/favicon.png')
    print("Favicon saved to C:/qcanary/apps/web/public/favicon.png")
else:
    print("No green pixels found!")
    # Fallback: just center-crop the full image to square and resize
    sz = min(w, h)
    cx, cy = w // 2, h // 2
    icon = img.crop((cx-sz//2, cy-sz//2, cx+sz//2, cy+sz//2))
    icon.resize((32, 32), Image.LANCZOS).save('C:/qcanary/apps/web/public/favicon.png')
    print("Favicon saved (center crop fallback)")
