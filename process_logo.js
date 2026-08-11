const fs = require('fs');
const sharp = require('sharp');

const sourceImage = 'C:/Users/Gabin/.gemini/antigravity-ide/brain/edc0f031-55c2-4133-b5c6-9a2d962e69cb/media__1786441435219.png';
const logoPath = 'public/logo.png';
const faviconPath = 'public/favicon.png';

async function processImages() {
  // 1. Copy to logo.png
  fs.copyFileSync(sourceImage, logoPath);
  console.log('Copied logo.png');

  // 2. Crop favicon.png
  await sharp(sourceImage)
    .extract({ left: 0, top: 0, width: 76, height: 76 })
    .toFile(faviconPath);
  console.log('Cropped and saved favicon.png');
}

processImages().catch(console.error);
