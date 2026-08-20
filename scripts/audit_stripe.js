const Stripe = require('stripe');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function runStripeAudit() {
  console.log('====================================================');
  console.log('💳 AUDIT COMPLET DE L\'INTÉGRATION STRIPE FRETTALENT');
  console.log('====================================================\n');

  // 1. VERIFICATION DES VARIABLES D'ENVIRONNEMENT
  console.log('--- 1. AUDIT DES VARIABLES D\'ENVIRONNEMENT STRIPE ---');
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;

  const modeSecret = secretKey ? (secretKey.startsWith('sk_live_') ? '🟢 LIVE (Production)' : secretKey.startsWith('sk_test_') ? '🟡 TEST (Bac à sable)' : '❓ Clé personnalisée') : '❌ MANQUANTE';
  const modePub = pubKey ? (pubKey.startsWith('pk_live_') ? '🟢 LIVE (Production)' : pubKey.startsWith('pk_test_') ? '🟡 TEST (Bac à sable)' : '❓ Clé personnalisée') : '❌ MANQUANTE';

  console.log(`• STRIPE_SECRET_KEY: ${secretKey ? secretKey.slice(0, 12) + '...' : '❌ Non définie'} (${modeSecret})`);
  console.log(`• NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${pubKey ? pubKey.slice(0, 12) + '...' : '❌ Non définie'} (${modePub})`);
  console.log(`• STRIPE_WEBHOOK_SECRET: ${webhookSecret ? webhookSecret.slice(0, 10) + '...' : '❌ Non définie'}`);
  console.log(`• STRIPE_PRO_MONTHLY_PRICE_ID: ${proPriceId ? proPriceId : '⚠️ Non définie (fallback dynamique actif)'}`);

  if (!secretKey) {
    console.error('\n❌ ERREUR CRITIQUE: STRIPE_SECRET_KEY est absente de .env.local.');
    return;
  }

  // Co cohérence des clés Test vs Live
  if (secretKey.startsWith('sk_live_') && pubKey && pubKey.startsWith('pk_test_')) {
    console.log('⚠️ ALERTE INCOHÉRENCE: Clé Secrète en LIVE mais Clé Publique en TEST !');
  } else if (secretKey.startsWith('sk_test_') && pubKey && pubKey.startsWith('pk_live_')) {
    console.log('⚠️ ALERTE INCOHÉRENCE: Clé Secrète en TEST mais Clé Publique en LIVE !');
  } else {
    console.log('✅ Cohérence des clés Secrète & Publique validée.');
  }

  // 2. INTERROGATION API STRIPE EN DIRECT
  console.log('\n--- 2. INTERROGATION API STRIPE EN DIRECT ---');
  const stripe = new Stripe(secretKey);

  try {
    // A. Solde Stripe
    const balance = await stripe.balance.retrieve();
    console.log('✅ Connexion API Stripe réussie !');
    const availableEUR = balance.available.find(b => b.currency === 'eur');
    const pendingEUR = balance.pending.find(b => b.currency === 'eur');
    console.log(`• Solde disponible : ${availableEUR ? (availableEUR.amount / 100).toFixed(2) : '0.00'} €`);
    console.log(`• Solde en attente : ${pendingEUR ? (pendingEUR.amount / 100).toFixed(2) : '0.00'} €`);

    // B. Produits & Tarifs configurés dans Stripe
    console.log('\n--- 3. PRODUITS ET TARIFS DANS STRIPE ---');
    const products = await stripe.products.list({ limit: 10, active: true });
    console.log(`• Nombre de produits actifs dans Stripe : ${products.data.length}`);
    products.data.forEach(p => {
      console.log(`   - Produit: "${p.name}" (ID: ${p.id})`);
    });

    const prices = await stripe.prices.list({ limit: 10, active: true });
    console.log(`• Nombre de tarifs actifs dans Stripe : ${prices.data.length}`);
    prices.data.forEach(p => {
      const amountStr = (p.unit_amount / 100).toFixed(2);
      const typeStr = p.type === 'recurring' ? `Abonnement (${p.recurring?.interval})` : 'Paiement unique (À l\'acte)';
      console.log(`   - Tarif: ${amountStr} ${p.currency.toUpperCase()} | ${typeStr} (ID: ${p.id})`);
    });

    // C. Dernières transactions / Checkout Sessions
    console.log('\n--- 4. DERNIÈRES TRANSACTIONS / CHECKOUT SESSIONS ---');
    const sessions = await stripe.checkout.sessions.list({ limit: 5 });
    console.log(`• 5 dernières Checkout Sessions :`);
    sessions.data.forEach(s => {
      const total = (s.amount_total / 100).toFixed(2);
      console.log(`   - Session ${s.id.slice(0, 15)}... | Statut: ${s.payment_status} | Montant: ${total} € | Client: ${s.customer_details?.email || 'N/A'}`);
    });

    // D. Webhooks Stripe configurés
    console.log('\n--- 5. WEBHOOKS CONFIGURÉS CHEZ STRIPE ---');
    try {
      const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
      console.log(`• Webhooks enregistrés chez Stripe (${webhooks.data.length}) :`);
      webhooks.data.forEach(w => {
        console.log(`   - Endpoint: ${w.url} | Statut: ${w.status} | Événements: ${w.enabled_events.length}`);
      });
    } catch (e) {
      console.log('   ℹ️ (Impossible de lister les endpoints webhook sans permission admin étendue)');
    }

  } catch (err) {
    console.error('❌ ERREUR API STRIPE:', err.message);
  }

  // 3. AUDIT DES FICHIERS DE CODE DE L'APPLICATION
  console.log('\n--- 6. AUDIT DES FICHIERS DE CODE STRIPE ---');

  const routeCheckout = 'src/app/api/stripe/create-checkout-session/route.js';
  const routePortal = 'src/app/api/stripe/create-portal-session/route.js';
  const routeWebhook = 'src/app/api/webhooks/stripe/route.js';

  const checkFile = (filepath) => {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf8');
      console.log(`✅ File '${filepath}': Existe (${(content.length / 1024).toFixed(1)} KB)`);
      return content;
    } else {
      console.log(`❌ File '${filepath}': MANQUANT !`);
      return null;
    }
  };

  const codeCheckout = checkFile(routeCheckout);
  const codePortal = checkFile(routePortal);
  const codeWebhook = checkFile(routeWebhook);

  if (codeCheckout) {
    if (codeCheckout.includes('499') || codeCheckout.includes('4.99')) {
      console.log('   ✓ Déblocage 4,99 € TTC configuré dans Checkout');
    }
    if (codeCheckout.includes('3999') || codeCheckout.includes('39.99')) {
      console.log('   ✓ Formule Pro Illimité 39,99 € HT configurée dans Checkout');
    }
  }

  if (codeWebhook) {
    if (codeWebhook.includes('checkout.session.completed')) {
      console.log('   ✓ Événement checkout.session.completed géré dans le Webhook');
    }
    if (codeWebhook.includes('customer.subscription.deleted')) {
      console.log('   ✓ Événement customer.subscription.deleted géré dans le Webhook');
    }
  }

  console.log('\n====================================================');
  console.log('🎯 FIN DE L\'AUDIT STRIPE FRETTALENT');
  console.log('====================================================');
}

runStripeAudit();
