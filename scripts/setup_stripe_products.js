const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // use the latest or existing one
});

async function setupStripeProducts() {
  console.log('Création des produits et prix sur Stripe (Live)...');

  try {
    // 1. Forfait Illimité Pro (39,99€)
    const proProduct = await stripe.products.create({
      name: 'FretTalent - Forfait Illimité Pro',
      description: 'Accès illimité aux profils, documents, et publication d\'offres sans limites.',
    });
    
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 3999, // 39.99 €
      currency: 'eur',
      recurring: { interval: 'month' },
    });
    
    console.log('✅ Forfait Illimité Pro créé:', proPrice.id);

    // 2. Forfait Premium Plus (54,99€)
    const premiumProduct = await stripe.products.create({
      name: 'FretTalent - Forfait Premium Plus',
      description: 'Idéal pour la marque employeur : article dédié, logo en une, et support prioritaire.',
    });

    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 5499, // 54.99 €
      currency: 'eur',
      recurring: { interval: 'month' },
    });

    console.log('✅ Forfait Premium Plus créé:', premiumPrice.id);

    // Write to .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent += `\n# Stripe Prices\nSTRIPE_PRICE_PRO=${proPrice.id}\nSTRIPE_PRICE_PREMIUM_PLUS=${premiumPrice.id}\n`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local mis à jour avec les ID de prix Stripe.');

  } catch (error) {
    console.error('Erreur lors de la création des produits:', error);
  }
}

setupStripeProducts();
