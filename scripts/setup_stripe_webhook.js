const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function setupWebhook() {
  console.log('Création du webhook sur Stripe (Live)...');

  try {
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: 'https://frettalent.fr/api/webhooks/stripe',
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.deleted',
      ],
    });

    console.log('✅ Webhook créé avec succès !');
    console.log('URL du Webhook :', webhookEndpoint.url);
    console.log('ID du Webhook :', webhookEndpoint.id);
    
    // Le secret du webhook n'est disponible qu'au moment de sa création via l'API.
    // L'API ne le renvoie pas toujours directement dans l'objet selon la version, 
    // mais dans la version récente, on y a accès sous `secret`.
    if (webhookEndpoint.secret) {
      console.log('Secret du Webhook :', webhookEndpoint.secret);
      
      const envPath = path.join(__dirname, '..', '.env.local');
      let envContent = fs.readFileSync(envPath, 'utf8');

      // On remplace l'ancien secret par le nouveau
      envContent = envContent.replace(
        /STRIPE_WEBHOOK_SECRET=.*(\r?\n|$)/g,
        `STRIPE_WEBHOOK_SECRET=${webhookEndpoint.secret}\n`
      );
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env.local mis à jour avec le nouveau secret du webhook.');
    } else {
      console.log('⚠️ Secret non renvoyé par l\'API. Gardez l\'ancien ou récupérez-le manuellement sur Stripe.');
    }

  } catch (error) {
    console.error('Erreur lors de la création du webhook:', error.message);
  }
}

setupWebhook();
