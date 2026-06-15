from PIL import Image

# Scan the ICO directory
import struct

with open('C:/qcanary/apps/web/app/favicon.ico', 'rb') as f:
    data = f.read()

# ICO header: reserved(2) + type(2) + count(2)
count = struct.unpack_from('<H', data, 4)[0]
print(f"ICO contains {count} icon(s)")

offset = 6
for i in range(count):
    # ICO dir entry: w(1) + h(1) + colors(1) + reserved(1) + planes(2) + bpp(2) + size(4) + offset(4)
    w, h, colors, reserved = struct.unpack_from('<BBBB', data, offset)
    planes, bpp = struct.unpack_from('<HH', data, offset+4)
    img_size = struct.unpack_from('<I', data, offset+8)[0]
    img_offset = struct.unpack_from('<I', data, offset+12)[0]
    
    w = w if w else 256  # 0 means 256
    h = h if h else 256
    
    print(f"  Icon {i}: {w}x{h}, {bpp} bpp, size={img_size} bytes, offset={img_offset}")
    
    offset += 16

# Now extract the PNG from ICO if possible, or just read the raw image data
# But actually, let's just convert the ICO to PNG using Pillow
img = Image.open('C:/qcanary/apps/web/app/favicon.ico')
# Access frames via seek
try:
    frame = 0
    while True:
        img.seek(frame)
        f = img.copy()
        print(f"Frame {frame}: {f.size}x{f.size} mode={f.mode}")
        # Save as PNG for inspection
        f.save(f'C:/qcanary/tmp_ico_frame_{frame}.png')
        frame += 1
except EOFError:
    print(f"Total frames: {frame}")
except Exception as e:
    print(f"Error: {e}")
    
# Save largest frame as reference
img.seek(0)
img.convert('RGBA').save('C:/qcanary/tmp_ico_best.png')
print("Saved ico_best.png")
