import os
from PIL import Image

img_dir = 'img'
for filename in os.listdir(img_dir):
    if filename.endswith('.png') or filename.endswith('.jpg'):
        filepath = os.path.join(img_dir, filename)
        try:
            with Image.open(filepath) as img:
                # Convert to RGB if necessary before saving to WebP/JPEG
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGBA")
                
                new_filepath = filepath.rsplit('.', 1)[0] + '.webp'
                img.save(new_filepath, 'webp', quality=80)
                print(f"Compressed {filename} to {new_filepath}")
        except Exception as e:
            print(f"Error compressing {filename}: {e}")
