import sharp from 'sharp';

const canvas = '#f6f3ec';
const ink = '#11110f';
const accent = '#5746d8';
const brandLogo = await sharp('public/brand-logo.webp').toBuffer();

async function createSquareLogo(size, output) {
  const mark = await sharp(brandLogo)
    .resize({ width: Math.round(size * 0.84), height: Math.round(size * 0.52), fit: 'inside' })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: canvas },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(output);
}

await Promise.all([
  createSquareLogo(96, 'public/favicon-96.png'),
  createSquareLogo(180, 'public/apple-touch-icon.png'),
  createSquareLogo(512, 'public/logo-512.png'),
]);

const ogPhoto = await sharp('public/images/new.webp')
  .resize({ width: 520, height: 630, fit: 'cover', position: 'centre' })
  .jpeg({ quality: 88, mozjpeg: true })
  .toBuffer();

const ogLogo = await sharp(brandLogo)
  .resize({ width: 280 })
  .png()
  .toBuffer();

const ogCopy = Buffer.from(`
  <svg width="680" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="680" height="630" fill="${canvas}"/>
    <rect x="72" y="94" width="38" height="6" rx="3" fill="${accent}"/>
    <text x="72" y="230" fill="${ink}" font-family="Arial, sans-serif" font-size="72" font-weight="600" letter-spacing="-3">
      <tspan x="72" dy="0">Permanent art,</tspan>
      <tspan x="72" dy="82" fill="${accent}">made personal.</tspan>
    </text>
    <text x="72" y="420" fill="#68645d" font-family="Arial, sans-serif" font-size="25">
      <tspan x="72" dy="0">Custom tattoo artistry in</tspan>
      <tspan x="72" dy="36">Mumbai and Raipur.</tspan>
    </text>
  </svg>
`);

await sharp({
  create: { width: 1200, height: 630, channels: 3, background: canvas },
})
  .composite([
    { input: ogPhoto, left: 0, top: 0 },
    { input: ogCopy, left: 520, top: 0 },
    { input: ogLogo, left: 850, top: 500 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('public/og-image.jpg');
