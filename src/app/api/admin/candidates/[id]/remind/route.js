import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCandidateReminderDay1 } from '@/lib/email-service';

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

    if (candError || !candidate) {
      return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
    }

    if (!candidate.email) {
      return NextResponse.json({ error: "Ce candidat n'a pas d'adresse e-mail renseignée" }, { status: 400 });
    }

    // Envoyer l'email de relance
    const res = await sendCandidateReminderDay1(candidate.email, candidate.full_name || 'Chauffeur');

    if (!res.success) {
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `E-mail de rappel envoyé avec succès à ${candidate.email}`,
    });
  } catch (err) {
    console.error('Erreur API remind candidate:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
