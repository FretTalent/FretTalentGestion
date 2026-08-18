import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient as createServerClient } from '@/lib/supabase-server';

export async function POST(req) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le profil du candidat
    const { data: candidate, error: candError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (candError || !candidate) {
      return NextResponse.json({ error: 'Profil candidat introuvable' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';

    // Créer la session Stripe Checkout pour 19,99 €
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Pack Auto-Candidature Premium (50 km)',
              description: 'Transmission automatique de votre CV et documents aux transporteurs dans un rayon de 50 km + Accusé d\'ouverture + Badge 48h + Relance J+7.',
              images: [`${baseUrl}/logo.png`],
            },
            unit_amount: 1999, // 19,99 €
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: candidate.email || user.email,
      client_reference_id: user.id,
      metadata: {
        type: 'auto_candidature_premium',
        candidate_id: user.id,
        candidate_name: candidate.full_name || '',
        candidate_city: candidate.city || '',
        candidate_postal_code: candidate.postal_code || '',
      },
      success_url: `${baseUrl}/dashboard/candidate?payment=success&premium_activated=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/candidate?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Erreur /api/premium/purchase:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
