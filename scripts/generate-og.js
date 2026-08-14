const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Get logo dimensions and resize
  const logoMeta = await sharp('public/logo.png').metadata();
  const logoBuffer = await sharp('public/logo.png')
    .resize({ width: 700, height: 280, fit: 'inside' })
    .toBuffer();

  const resizedLogoMeta = await sharp(logoBuffer).metadata();
  const logoLeft = Math.round((width - resizedLogoMeta.width) / 2);
  const logoTop = 110;

  const svgBackground = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#fff7ed" />
          <stop offset="100%" stop-color="#ffedd5" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect x="50" y="40" width="1100" height="550" rx="36" fill="#ffffff" stroke="#ffedd5" stroke-width="3" />
      <text x="600" y="450" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="900" fill="#0f172a" text-anchor="middle">Réseau N°1 du Recrutement Transport</text>
      <text x="600" y="500" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#f97316" text-anchor="middle">France • Belgique • Luxembourg • Suisse</text>
    </svg>
  `);

  await sharp(svgBackground)
    .composite([
      {
        input: logoBuffer,
        top: logoTop,
        left: logoLeft,
      },
    ])
    .png()
    .toFile('public/og-image.png');

  fs.copyFileSync('public/og-image.png', 'src/app/opengraph-image.png');
  fs.copyFileSync('public/og-image.png', 'public/opengraph-image.png');
  console.log('✅ Generated public/og-image.png and src/app/opengraph-image.png');
}

generateOgImage().catch(console.error);
