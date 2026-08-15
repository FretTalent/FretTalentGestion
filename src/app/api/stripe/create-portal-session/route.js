import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase-server';
import { createClient as createDirectClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

export async function POST(req) {
  try {
    const supabase = await createServerClient();
    let { data: { user }, error: authError } = await supabase.auth.getUser();

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
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabaseAdmin = createDirectClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('stripe_customer_id, name')
      .eq('id', user.id)
      .single();

    if (!company || !company.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucun compte Stripe associé' }, { status: 404 });
    }

    const host = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.frettalent.fr';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${host}/dashboard/recruiter/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Erreur Stripe Customer Portal:', error);
    return NextResponse.json(
      { error: 'Erreur portail de facturation: ' + (error.message || error.toString()) },
      { status: 500 }
    );
  }
}
