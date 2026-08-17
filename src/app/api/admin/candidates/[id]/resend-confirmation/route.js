import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationEmail } from '@/lib/email-service';

export async function POST(req, context) {
  try {
    const resolvedParams = context?.params ? await context.params : {};
    const candidateId = resolvedParams.id;
    if (!candidateId) {
      return NextResponse.json({ error: 'ID candidat manquant' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 });
    }

    // Vérifier l'authentification admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    // Récupérer le candidat
    const { data: candidate, error: candError } = await supabaseAdmin
      .from('candidates')
      .select('id, full_name, email')
      .eq('id', candidateId)
      .single();

    if (candError || !candidate || !candidate.email) {
      return NextResponse.json({ error: 'Candidat introuvable ou sans e-mail' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.frettalent.fr';
    const redirectTo = `${siteUrl}/login?confirmed=true`;

    // Générer le lien de vérification officiel
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: candidate.email,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 400 });
    }

    const confirmationUrl = linkData?.properties?.action_link;
    if (!confirmationUrl) {
      return NextResponse.json({ error: 'Impossible de générer le lien' }, { status: 500 });
    }

    // Envoi de l'email via Resend
    const res = await sendVerificationEmail(candidate.email, confirmationUrl);

    if (!res.success) {
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail via Resend" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `E-mail d'activation avec lien direct envoyé à ${candidate.email}`,
    });
  } catch (err) {
    console.error('Erreur API resend confirmation:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
