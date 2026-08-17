import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase-server';
import { createClient as createDirectClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

export async function POST(req) {
  try {
    const supabase = await createServerClient();
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    // Fallback: Si getUser échoue (ex: problème de cookies), on lit le header Authorization
    if (authError || !user) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const { data: jwtData } = await supabase.auth.getUser(token);
        if (jwtData?.user) {
          user = jwtData.user;
          authError = null;
        }
      }
    }

    if (authError || !user) {
      console.error('Erreur auth checkout:', authError);
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.email;

    const body = await req.json();
    const rawPlan = body.plan || body.planId || 'premium_monthly';

    // Normalisation du plan
    let plan = 'premium_monthly';
    if (rawPlan === 'pay_per_unlock' || rawPlan === 'acte' || rawPlan === 'setup') {
      plan = 'pay_per_unlock';
    } else if (rawPlan === 'premium_plus_monthly' || rawPlan === 'premium_plus' || rawPlan === 'vip') {
      plan = 'premium_plus_monthly';
    } else if (rawPlan === 'premium_monthly' || rawPlan === 'pro' || rawPlan === 'forfait_pro') {
      plan = 'premium_monthly';
    }

    const supabaseAdmin = createDirectClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Get company details to see if they already have a customer ID
    const { data: company, error: companyError } = await supabaseAdmin
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
        name: company.name || 'Entreprise FretTalent',
        metadata: {
          company_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID in Supabase immediately
      await supabaseAdmin
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    const host = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.frettalent.fr';
    
    let checkoutSessionParams;

    if (plan === 'pay_per_unlock') {
      // Create Setup Checkout Session (to save card for later 4.99€ use)
      checkoutSessionParams = {
        payment_method_types: ['card'],
        mode: 'setup',
        customer: customerId,
        success_url: `${host}/dashboard/recruiter/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${host}/dashboard/recruiter/settings?canceled=true`,
        metadata: {
          company_id: userId,
          plan: 'pay_per_unlock',
        },
      };
    } else {
      // Find the correct Price ID from env
      let priceId;
      if (plan === 'premium_monthly') {
        priceId = process.env.STRIPE_PRICE_PRO || 'price_1U3aXiHrnk1eXtNwjWhVgu1z';
      } else if (plan === 'premium_plus_monthly') {
        priceId = process.env.STRIPE_PRICE_PREMIUM_PLUS || 'price_1U3aXiHrnk1eXtNwZq6ANdKa';
      }

      if (!priceId) {
        return NextResponse.json({ error: 'Price ID non configuré' }, { status: 400 });
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
          company_id: userId,
          plan: plan,
        },
      };
    }

    const stripeSession = await stripe.checkout.sessions.create(checkoutSessionParams);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Erreur Stripe Checkout:', error);
    return NextResponse.json(
      { error: 'Erreur Stripe: ' + (error.message || error.toString()) },
      { status: 500 }
    );
  }
}
