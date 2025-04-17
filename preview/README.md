there is only 64x64 size image.

If you need original size image, please download from the [website](Still Working On It.).

scale the images yourself:

```bash
sudo apt-get install imagemagick webp

mkdir -p resized_images webp

for img in *.png; do
  convert "$img" -resize 64x64! "resized_images/${img}"
  name_without_extension="${img%.*}"
  cwebp -lossless -exact "resized_images/${img}" -o "webp/${name_without_extension}.webp"
done
```