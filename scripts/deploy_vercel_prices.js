const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const keysToSync = [
  'STRIPE_PRICE_PRO',
  'STRIPE_PRICE_PREMIUM_PLUS'
];

for (const key of keysToSync) {
  const value = process.env[key];
  if (value) {
    console.log(`Syncing ${key}...`);
    try {
      execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
    } catch(e) {}
    try {
      execSync(`npx vercel env add ${key} production --value "${value.trim()}" --yes`, { stdio: 'inherit' });
    } catch (e) {
      console.log('Failed for ' + key);
    }
  }
}
try {
  execSync(`npx vercel --prod --yes`, { stdio: 'inherit' });
} catch(e) {}
