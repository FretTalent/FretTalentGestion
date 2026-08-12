const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const keysToSync = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRICE_PRO',
  'STRIPE_PRICE_PREMIUM_PLUS'
];

for (const key of keysToSync) {
  const value = process.env[key];
  if (value) {
    console.log(`Synchronisation de ${key} vers Vercel...`);
    try {
      // L'option --force ou --non-interactive est utile
      // echo value | npx vercel env add [name] [environment]
      execSync(`echo ${value} | npx vercel env add ${key} production`, { stdio: 'inherit' });
    } catch (e) {
      console.error('Erreur lors de la synchronisation de ' + key);
    }
  }
}
console.log('Synchronisation terminée !');
