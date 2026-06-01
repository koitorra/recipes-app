// Рендерит PNG-иконки из assets/icon-source.svg через sharp.
// Запуск: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(dir, '..', 'assets');
const svg = readFileSync(path.join(assets, 'icon-source.svg'));

const targets = [
  ['icon.png', 1024],
  ['adaptive-icon.png', 1024],
  ['splash-icon.png', 1024],
  ['favicon.png', 48],
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(assets, name));
  console.log('✓', name, `${size}x${size}`);
}
