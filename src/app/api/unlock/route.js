import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function POST(req) {
  try {
    // 1. Initialiser le client de base de données
    const supabase = await createClient();

    // 2. Extraire et valider l'utilisateur
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Fallback: Si getUser échoue ou n'est pas autorisé par les cookies de sous-requête fetch,
    // on peut tenter de lire l'access token directement depuis les cookies du header de la requête entrante.
    let activeUser = user;
    if (authError || !activeUser) {
      // Tenter de lire l'access token depuis le cookie de session sb-access-token
      const authHeader = req.headers.get('Authorization');
      let token = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }

      if (token) {
        const { data: jwtData } = await supabase.auth.getUser(token);
        if (jwtData?.user) {
          activeUser = jwtData.user;
        }
      }
    }

    if (!activeUser) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Valider que l'utilisateur est bien un recruteur.
    // On utilise un client privilégié (avec le service role) pour contourner la RLS sur la table profiles lors de l'authentification API.
    const {
      createClient: createDirectClient,
    } = require('@supabase/supabase-js');
    const supabaseAdmin = createDirectClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', activeUser.id)
      .single();

    if (profileErr || profile?.role !== 'recruiter') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // 3. Récupérer les paramètres du body
    const { candidateId } = await req.json();
    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId est requis' },
        { status: 400 },
      );
    }

    // 4. Charger l'entreprise de l'utilisateur
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', activeUser.id)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise introuvable' },
        { status: 404 },
      );
    }

    // Si pas de carte bancaire, erreur
    if (!company.has_payment_method) {
      return NextResponse.json(
        { error: 'Moyen de paiement requis' },
        { status: 402 },
      );
    }

    // 5. Créer l'enregistrement de déblocage (2,00 €)
    const { error: insertError } = await supabaseAdmin.from('unlocks').insert([
      {
        company_id: company.id,
        candidate_id: candidateId,
        amount_charged: 200,
      },
    ]);

    if (insertError) {
      return NextResponse.json(
        { error: 'Déblocage déjà existant ou invalide' },
        { status: 409 },
      );
    }

    // 6. Intégration Stripe (Post-payé) :
    // On ajoute un Invoice Item pour ce client sur sa facture mensuelle en attente.
    if (company.stripe_customer_id) {
      try {
        await stripe.invoiceItems.create({
          customer: company.stripe_customer_id,
          amount: 200, // 2.00 EUR en centimes
          currency: 'eur',
          description: `Déblocage du contact candidat ${candidateId.slice(0, 8)}`,
        });
      } catch (stripeErr) {
        console.error(
          'Erreur de création de ligne de facturation Stripe :',
          stripeErr,
        );
        // Note : On ne bloque pas le retour car le déblocage est validé en base locale.
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
