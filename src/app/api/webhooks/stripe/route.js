import { NextResponse } from 'next/server';
import { createClient as createDirectClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import {
  notifyTelegramSubscriptionCancelled,
  notifyTelegramPaymentFailed,
} from '@/lib/telegram';

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    console.error('⚠️ Webhook secret or stripe-signature header is missing');
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const supabaseAdmin = createDirectClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        const customerId = session.customer;
        const companyIdFromMeta = session.metadata?.company_id;
        
        let query = supabaseAdmin.from('companies').select('id, name, email');
        if (companyIdFromMeta) {
          query = query.eq('id', companyIdFromMeta);
        } else if (customerId) {
          query = query.eq('stripe_customer_id', customerId);
        }

        const { data: company } = await query.maybeSingle();

        if (company) {
          const updateData = { has_payment_method: true };
          
          if (session.mode === 'subscription') {
            updateData.subscription_plan = session.metadata?.plan || 'premium_monthly';
          } else if (session.mode === 'setup') {
            updateData.subscription_plan = 'pay_per_unlock';
          }

          await supabaseAdmin
            .from('companies')
            .update(updateData)
            .eq('id', company.id);
            
          console.log(`✅ Company ${company.id} updated after checkout: ${JSON.stringify(updateData)}`);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id, name, email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (company) {
          // Revert to pay_per_unlock if subscription is cancelled
          await supabaseAdmin
            .from('companies')
            .update({ subscription_plan: 'pay_per_unlock' })
            .eq('id', company.id);
          
          // Alerte Telegram
          await notifyTelegramSubscriptionCancelled({
            companyName: company.name || 'Entreprise',
            email: company.email || 'Non renseigné',
            planName: 'Forfait Illimité Pro',
          });

          console.log(`❌ Subscription cancelled for company ${company.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id, name, email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (company) {
          await notifyTelegramPaymentFailed({
            companyName: company.name || 'Entreprise',
            email: company.email || 'Non renseigné',
            amount: `${((invoice.amount_due || 3999) / 100).toFixed(2)} €`,
            reason: invoice.billing_reason || 'Carte rejetée / Fonds insuffisants',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing webhook event', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
