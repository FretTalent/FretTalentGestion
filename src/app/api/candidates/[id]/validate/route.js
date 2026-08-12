import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/candidates/[id]/validate
 * Valide le profil d'un candidat (admin uniquement)
 * Utilise la service role key pour bypasser le RLS
 */
export async function POST(request, context) {
  const resolvedParams = context?.params ? await context.params : {};
  const candidateId = resolvedParams.id;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Vérification du token admin depuis le header Authorization
    const authHeader = request.headers.get('authorization');
    let adminUser = null;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      adminUser = user;
    }

    // Si pas de header, essayer de récupérer via cookie (fallback)
    if (!adminUser) {
      // En mode serveur sans cookie, on rejette
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Administrateur requis' }, { status: 403 });
    }

    // Vérifier que le candidat existe
    const { data: candidate, error: fetchErr } = await supabaseAdmin
      .from('candidates')
      .select('id, full_name, validated')
      .eq('id', candidateId)
      .single();

    if (fetchErr || !candidate) {
      return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
    }

    // Marquer comme validé (service role bypasse le RLS)
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('candidates')
      .update({
        validated: true,
        validated_at: new Date().toISOString(),
      })
      .eq('id', candidateId)
      .select()
      .single();

    if (updateErr) {
      console.error('Erreur mise à jour validation:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, candidate: updated });
  } catch (err) {
    console.error('Erreur serveur validation candidat:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
