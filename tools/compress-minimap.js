// Compress & convert minimap PNG → WebP
// Usage: node tools/compress-minimap.js
// Requires: npm install sharp  (run once from project root)

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src  = join(__dirname, '../frontend/assets/minimapinformatika.png');
const dest = join(__dirname, '../frontend/assets/minimapinformatika.webp');

await sharp(src)
  .resize({ width: 400, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(dest);

console.log(`Done: ${dest}`);
