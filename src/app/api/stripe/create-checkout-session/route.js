import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const body = await req.json();
    const { plan } = body;

    // Get company details to see if they already have a customer ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_customer_id, name')
      .eq('id', userId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 404 });
    }

    let customerId = company.stripe_customer_id;

    // If no customer ID exists, create one in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: company.name,
        metadata: {
          company_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID in Supabase immediately
      await supabase
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    const host = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    let checkoutSessionParams;

    if (plan === 'pay_per_unlock') {
      // Create Setup Checkout Session (to save card for later use)
      checkoutSessionParams = {
        payment_method_types: ['card'],
        mode: 'setup',
        customer: customerId,
        success_url: `${host}/dashboard/recruiter/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${host}/dashboard/recruiter/settings?canceled=true`,
      };
    } else {
      // Find the correct Price ID from env
      let priceId;
      if (plan === 'premium_monthly') {
        priceId = process.env.STRIPE_PRICE_PRO;
      } else if (plan === 'premium_plus_monthly') {
        priceId = process.env.STRIPE_PRICE_PREMIUM_PLUS;
      }

      if (!priceId) {
        return NextResponse.json({ error: 'Plan invalide ou Price ID non configuré' }, { status: 400 });
      }

      checkoutSessionParams = {
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${host}/dashboard/recruiter/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${host}/dashboard/recruiter/settings?canceled=true`,
        metadata: {
          plan: plan, // we pass the plan name to catch it in webhook if needed
        }
      };
    }

    const stripeSession = await stripe.checkout.sessions.create(checkoutSessionParams);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Erreur Stripe Checkout:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
