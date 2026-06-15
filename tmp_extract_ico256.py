import struct
from PIL import Image

with open('C:/qcanary/apps/web/app/favicon.ico', 'rb') as f:
    data = f.read()

reserved, icon_type, count = struct.unpack_from('<HHH', data, 0)
offset = 6
frames = []
for i in range(count):
    w, h, colors, _, _, bpp, img_size, img_offset = struct.unpack_from('<BBBBHHII', data, offset)
    w = w if w else 256
    h = h if h else 256
    frames.append({'w': w, 'h': h, 'bpp': bpp, 'size': img_size, 'offset': img_offset})
    offset += 16

# Extract and analyze the 256x256 frame (largest)
for f_info in frames:
    if f_info['w'] == 256:
        off = f_info['offset']
        img_data = data[off:off+f_info['size']]
        
        dib_size = struct.unpack_from('<I', img_data, 0)[0]
        width = struct.unpack_from('<I', img_data, 4)[0]
        height = struct.unpack_from('<I', img_data, 8)[0]
        bpp2 = struct.unpack_from('<H', img_data, 14)[0]
        actual_h = height // 2
        
        print(f"256x256 DIB: {width}x{height} ({actual_h} actual), {bpp2}bpp")
        
        # Extract and flip (BMP is bottom-up)
        pixel_start = dib_size + 4  # 4 bytes for the color mask start offset
        # Actually for 32bpp no palette, pixels at 40
        pixel_data = img_data[40:40 + width * actual_h * 4]
        
        img = Image.frombytes('RGBA', (width, actual_h), pixel_data, 'raw', 'BGRA', 0, -1)
        
        # Show what the 256x256 icon looks like
        print(f"\n== 256x256 favicon content ==")
        # Find content boundary
        from collections import Counter
        color_count = Counter()
        for y in range(actual_h):
            for x in range(width):
                r, g, b, a = img.getpixel((x, y))
                if a > 0:
                    color_count[('#' if r+g+b<100 else '.' if r+g+b>600 else '*')] += 1
        print(f"Black pixels: {color_count.get('#', 0)}")
        print(f"White pixels: {color_count.get('.', 0)}")
        print(f"Gray pixels: {color_count.get('*', 0)}")
        
        # Save as reference
        img.save('C:/qcanary/tmp_ico_256.png')
        print("Saved 256x256 frame")
        
        # Now use this to create a GOOD 32x32
        # Downscale with LANCZOS
        small = img.resize((32, 32), Image.LANCZOS)
        small.save('C:/qcanary/apps/web/public/favicon.png')
        print("Saved 32x32 favicon from downscaled 256x256 ICO frame")
        break
