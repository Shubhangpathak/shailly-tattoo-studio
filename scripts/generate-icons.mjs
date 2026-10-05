import fs from 'node:fs/promises';
import sharp from 'sharp';

// Keep the original studio mark intact inside a circular cream badge.
const logo = await sharp('public/brand-logo.webp').png().toBuffer();
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <circle cx="48" cy="48" r="46" fill="#f6f3ec" stroke="#d8d2c7" stroke-width="1"/>
  <image href="data:image/png;base64,${logo.toString('base64')}" x="7" y="30.8" width="82" height="34.4" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

await fs.writeFile('public/favicon-circle.svg', icon);
await Promise.all([
  sharp(Buffer.from(icon)).resize(96, 96).png().toFile('public/favicon-circle-96.png'),
  sharp(Buffer.from(icon)).resize(512, 512).png().toFile('public/icon-circle-512.png'),
  sharp(Buffer.from(icon)).resize(180, 180).flatten({ background: '#f6f3ec' }).png().toFile('public/apple-touch-circle.png'),
]);
