const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Gabin\\.gemini\\antigravity-ide\\brain\\7bc3ac58-2662-41c5-ba6c-a692016b797c\\media__1786550396657.png';
const destLogo = 'c:\\Users\\Gabin\\Desktop\\Fret Talent\\public\\logo.png';
const destLogoFull = 'c:\\Users\\Gabin\\Desktop\\Fret Talent\\public\\frettalent-logo.png';

fs.copyFileSync(src, destLogo);
fs.copyFileSync(src, destLogoFull);
console.log('Logo copied successfully to public/logo.png and public/frettalent-logo.png');
