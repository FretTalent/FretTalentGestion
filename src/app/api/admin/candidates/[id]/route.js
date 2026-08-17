import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Route GET : récupère un candidat spécifique par ID (admin seulement, bypass RLS)
export async function GET(req, context) {
  try {
    const resolvedParams = context?.params ? await context.params : {};
    const id = resolvedParams.id;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Vérification du token admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que le demandeur est admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // Récupérer le candidat par ID (service role = bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error.message, '| ID cherché:', id);
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 });
    }

    // Récupérer le statut auth (email_confirmed_at)
    let emailConfirmedAt = null;
    try {
      const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(id);
      emailConfirmedAt = authUserData?.user?.email_confirmed_at || null;
    } catch (e) {
      console.warn('Auth user status check note:', e.message);
    }

    return NextResponse.json({
      candidate: {
        ...data,
        email_confirmed_at: emailConfirmedAt,
      },
    });
  } catch (err) {
    console.error('Erreur serveur API candidate detail:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
