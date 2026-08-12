from PIL import Image

src_path = r'C:\Users\Gabin\.gemini\antigravity-ide\brain\7bc3ac58-2662-41c5-ba6c-a692016b797c\media__1786550396657.png'

img = Image.open(src_path).convert('RGBA')

datas = img.getdata()

new_data = []
for item in datas:
    # item is (R, G, B, A)
    # Check if pixel is white or near-white
    if item[0] > 235 and item[1] > 235 and item[2] > 235:
        new_data.append((255, 255, 255, 0)) # Make transparent
    else:
        new_data.append(item)

img.putdata(new_data)

# Crop out transparent borders (autocrop)
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Add a tiny 10px padding around cropped logo for nice spacing
padding = 10
new_w = img.width + padding * 2
new_h = img.height + padding * 2
final_img = Image.new('RGBA', (new_w, new_h), (255, 255, 255, 0))
final_img.paste(img, (padding, padding))

final_img.save(r'c:\Users\Gabin\Desktop\Fret Talent\public\logo.png')
final_img.save(r'c:\Users\Gabin\Desktop\Fret Talent\public\frettalent-logo.png')

print(f"Logo successfully processed! Original size -> Cropped size: {final_img.size}")
