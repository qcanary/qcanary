from PIL import Image

img = Image.open('C:/qcanary/apps/web/public/logo.png')
print(f"Mode: {img.mode}, Size: {img.size}")

# P mode - check palette
if img.mode == 'P':
    palette = img.getpalette()
    # Palette is [R0,G0,B0, R1,G1,B1, ...]
    num_colors = len(palette) // 3
    print(f"Palette has {num_colors} colors")
    
    # Show unique palette colors used
    used_indices = set()
    for y in range(img.height):
        for x in range(img.width):
            used_indices.add(img.getpixel((x, y)))
    print(f"Used palette entries: {len(used_indices)}")
    
    # Show the most common colors
    from collections import Counter
    color_freq = Counter()
    for y in range(0, img.height, 5):
        for x in range(0, img.width, 5):
            idx = img.getpixel((x, y))
            r = palette[idx*3]
            g = palette[idx*3+1]
            b = palette[idx*3+2]
            color_freq[(r,g,b)] += 1
    
    print("\nMost common palette colors:")
    for (r,g,b), count in color_freq.most_common(30):
        brightness = 0.299*r + 0.587*g + 0.114*b
        print(f"  RGB({r:3d},{g:3d},{b:3d}) brightness={brightness:.0f} x={count}")
    
    # Now check what colors appear in different x-regions
    print("\n=== Left region (0-200) - should be icon ===")
    left_colors = Counter()
    for y in range(0, img.height, 5):
        for x in range(0, 200, 5):
            idx = img.getpixel((x, y))
            r,g,b = palette[idx*3:idx*3+3]
            left_colors[(r,g,b)] += 1
    for (r,g,b), c in left_colors.most_common(10):
        print(f"  RGB({r},{g},{b}) x{c}")
    
    print("\n=== Right icon region (200-1000) ===")
    mid_colors = Counter()
    for y in range(0, img.height, 5):
        for x in range(200, 1000, 5):
            idx = img.getpixel((x, y))
            r,g,b = palette[idx*3:idx*3+3]
            mid_colors[(r,g,b)] += 1
    for (r,g,b), c in mid_colors.most_common(10):
        print(f"  RGB({r},{g},{b}) x{c}")
    
    print("\n=== Text region (1000-1600) ===")
    text_colors = Counter()
    for y in range(0, img.height, 5):
        for x in range(1000, 1600, 5):
            idx = img.getpixel((x, y))
            r,g,b = palette[idx*3:idx*3+3]
            text_colors[(r,g,b)] += 1
    for (r,g,b), c in text_colors.most_common(10):
        print(f"  RGB({r},{g},{b}) x{c}")
