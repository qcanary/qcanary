from PIL import Image

# Open the existing favicon.ico
ico = Image.open('C:/qcanary/apps/web/app/favicon.ico')
print(f"Format: {ico.format}")
print(f"Frames: {ico.n_frames}")

for i in range(ico.n_frames):
    ico.seek(i)
    f = ico.copy()
    rgba = f.convert('RGBA')
    print(f"\nFrame {i}: {f.size}")
    
    # Find non-transparent pixels and their colors
    colored = {}
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = rgba.getpixel((x, y))
            if a > 10:
                qr, qg, qb = r//10, g//10, b//10
                key = (qr, qg, qb)
                if key not in colored:
                    colored[key] = []
                colored[key].append((x, y))
    
    for (qr, qg, qb), pts in sorted(colored.items(), key=lambda kv: -len(kv[1])):
        r, g, b = qr*10+5, qg*10+5, qb*10+5
        pct = len(pts) / (rgba.width * rgba.height) * 100
        print(f"  ~RGB({r},{g},{b}): {len(pts)} px ({pct:.1f}%)")
