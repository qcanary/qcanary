import struct
from PIL import Image

with open('C:/qcanary/apps/web/app/favicon.ico', 'rb') as f:
    data = f.read()

# Parse the ICO header entries
reserved, icon_type, count = struct.unpack_from('<HHH', data, 0)

offset = 6
frames = []
for i in range(count):
    w, h, colors, reserved, planes, bpp, img_size, img_offset = struct.unpack_from('<BBBBHHII', data, offset)
    w = w if w else 256
    h = h if h else 256
    frames.append({'w': w, 'h': h, 'bpp': bpp, 'size': img_size, 'offset': img_offset})
    offset += 16

# Find 32x32 frame
for f_info in frames:
    if f_info['w'] == 32:
        off = f_info['offset']
        img_data = data[off:off+f_info['size']]
        print(f"Frame: {f_info['w']}x{f_info['h']} {f_info['bpp']}bpp, {f_info['size']} bytes")
        
        # Parse DIB header
        dib_size = struct.unpack_from('<I', img_data, 0)[0]
        width = struct.unpack_from('<I', img_data, 4)[0]
        height = struct.unpack_from('<I', img_data, 8)[0]
        planes2 = struct.unpack_from('<H', img_data, 12)[0]
        bpp2 = struct.unpack_from('<H', img_data, 14)[0]
        compression = struct.unpack_from('<I', img_data, 16)[0]
        
        # In ICO, height is doubled (AND mask included)
        actual_h = height // 2
        print(f"DIB: {width}x{height} ({actual_h} actual), {bpp2}bpp, compression={compression}")
        
        # For 32bpp BGRA, pixels start at offset 40 (after DIB header)
        pixel_start = 40
        pixel_data = img_data[pixel_start:pixel_start + width * actual_h * 4]
        
        # Create image from raw BGRA data
        img = Image.frombytes('RGBA', (width, actual_h), pixel_data, 'raw', 'BGRA', 0, -1)
        img.save('C:/qcanary/apps/web/public/favicon.png')
        print(f"Saved: {img.size} -> favicon.png")
        
        # Also save a larger version for inspection
        img_256 = img.resize((256, 256), Image.NEAREST)
        img_256.save('C:/qcanary/tmp_favicon_preview.png')
        break
