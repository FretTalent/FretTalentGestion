import { NextResponse } from 'next/server';
import { createClient as createDirectClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }
  } else {
    // Mode fallback si pas de signature (ex: tests ou proxy interne)
    try {
      event = JSON.parse(body);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
  }

  const supabaseAdmin = createDirectClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // 2. Gestion des abonnements et déblocages entreprises
        const customerId = session.customer;
        const companyIdFromMeta = session.metadata?.company_id;
        
        let query = supabaseAdmin.from('companies').select('id');
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
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (company) {
          // Revert to pay_per_unlock if subscription is cancelled
          await supabaseAdmin
            .from('companies')
            .update({ subscription_plan: 'pay_per_unlock' })
            .eq('id', company.id);
          
          console.log(`❌ Subscription cancelled for company ${company.id}`);
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
