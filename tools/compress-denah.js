// Compress & convert denah lantai PNG → WebP
// Usage: node tools/compress-denah.js
// Requires: npm install sharp  (run once from project root)

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '../frontend/assets');

const files = ['DenahLantai1', 'DenahLantai2', 'DenahLantai3'];

for (const name of files) {
  const src  = join(assetsDir, `${name}.png`);
  const dest = join(assetsDir, `${name}.webp`);
  await sharp(src)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(dest);
  console.log(`Done: ${dest}`);
}
