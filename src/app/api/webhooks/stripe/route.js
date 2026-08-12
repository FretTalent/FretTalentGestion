import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';

// Stripe Webhook in App Router uses req.text() to get raw body
export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        
        // Find company by customer ID
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (company) {
          const updateData = { has_payment_method: true };
          
          if (session.mode === 'subscription') {
            // It's a subscription checkout
            updateData.subscription_plan = session.metadata?.plan || 'premium_monthly';
          } else if (session.mode === 'setup') {
            // It's a save card checkout for pay_per_unlock
            updateData.subscription_plan = 'pay_per_unlock';
          }

          await supabase
            .from('companies')
            .update(updateData)
            .eq('id', company.id);
            
          console.log(`✅ Company ${company.id} updated after checkout: ${updateData.subscription_plan}`);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (company) {
          // Revert to pay_per_unlock if subscription is cancelled
          await supabase
            .from('companies')
            .update({ subscription_plan: 'pay_per_unlock' })
            .eq('id', company.id);
          
          console.log(`❌ Subscription cancelled for company ${company.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing webhook event', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
