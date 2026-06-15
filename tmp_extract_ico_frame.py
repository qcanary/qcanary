from PIL import Image

# Read ICO byte by byte and extract frames
# Structure: header(6) + entries(16 each) + image_data

with open('C:/qcanary/apps/web/app/favicon.ico', 'rb') as f:
    data = f.read()

import struct
# ICO header
reserved, icon_type, count = struct.unpack_from('<HHH', data, 0)
print(f"Reserved={reserved}, Type={icon_type}, Count={count}")

# Parse directory entries
offset = 6
frames = []
for i in range(count):
    w, h, colors, reserved, planes, bpp, img_size, img_offset = struct.unpack_from('<BBBBHHII', data, offset)
    w = w if w else 256
    h = h if h else 256
    frames.append({
        'index': i, 'w': w, 'h': h, 'bpp': bpp,
        'size': img_size, 'offset': img_offset
    })
    offset += 16

for f_info in frames:
    i = f_info['index']
    # Read raw image data
    img_data = data[f_info['offset']:f_info['offset']+f_info['size']]
    
    # Save to temp file and open with PIL
    temp_path = f'C:/qcanary/tmp_ico_frame_{i}.png'
    with open(temp_path, 'wb') as f:
        f.write(img_data)
    
    try:
        img = Image.open(temp_path)
        print(f"Frame {i}: {f_info['w']}x{f_info['h']} {f_info['bpp']}bpp -> {img.size}")
        img.convert('RGBA').save(f'C:/qcanary/tmp_ico_frame_{i}_rgba.png')
    except Exception as e:
        print(f"Frame {i}: {f_info['w']}x{f_info['h']} {f_info['bpp']}bpp -> error: {e}")
        # Try to decode as raw DIB
        print(f"  Raw data first 20 bytes: {img_data[:20].hex()}")

# Extract the 32x32 frame as our favicon
if frames:
    # Find the 32x32 frame
    for f in frames:
        if f['w'] == 32 and f['h'] == 32:
            print(f"\nUsing frame {f['index']} ({32}x{32})")
            img_data = data[f['offset']:f['offset']+f['size']]
            with open('C:/qcanary/tmp_ico_32raw.png', 'wb') as f2:
                f2.write(img_data)
            img = Image.open('C:/qcanary/tmp_ico_32raw.png')
            print(f"Loaded: {img.size} mode={img.mode}")
            # Use PNG data directly if it's PNG
            if f['size'] > 100 and img_data[:8] == b'\x89PNG\r\n\x1a\n':
                print("It's a PNG-formatted icon")
            # Save as favicon
            img.convert('RGBA').save('C:/qcanary/apps/web/public/favicon.png')
            print("Saved as favicon.png!")
            break
