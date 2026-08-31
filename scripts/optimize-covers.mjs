import sharp from 'sharp';
import { readdir, stat, copyFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_IMG = join(__dirname, '..', 'public', 'img');
const MAX_WIDTH = 800;
const WEBP_QUALITY = 80;
const SIZE_THRESHOLD = 100_000;

async function optimizeImage(filePath) {
  const before = await stat(filePath);
  if (before.size < SIZE_THRESHOLD) return null;

  const outPath = join(PUBLIC_IMG, basename(filePath).replace(/\.\w+$/, '.webp'));
  await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outPath);

  const after = await stat(outPath);
  return { file: basename(filePath), before: before.size, after: after.size };
}

async function main() {
  const files = await readdir(PUBLIC_IMG);
  const imageFiles = files.filter(f => /\.(png|jpe?g)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('No hay imágenes para optimizar');
    return;
  }

  console.log('Optimizando imágenes...');
  let totalSaved = 0;

  for (const f of imageFiles) {
    const res = await optimizeImage(join(PUBLIC_IMG, f));
    if (res) {
      const saved = res.before - res.after;
      totalSaved += saved;
      console.log(`  ${res.file}: ${(res.before / 1024).toFixed(0)}KB → ${(res.after / 1024).toFixed(0)}KB`);
    }
  }

  console.log(`\nTotal ahorrado: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
}

main().catch(console.error);
