import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Route GET : récupère tous les candidats (admin seulement, bypass RLS)
export async function GET(req) {
  try {
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

    // Récupérer TOUS les candidats (service role = bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération candidats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Récupérer le statut de confirmation des emails auth
    const userConfirmMap = {};
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
      (usersData?.users || []).forEach(u => {
        userConfirmMap[u.id] = u.email_confirmed_at || null;
      });
    } catch (e) {
      console.warn('Auth listUsers note:', e.message);
    }

    const enhancedCandidates = (data || []).map(c => ({
      ...c,
      email_confirmed_at: userConfirmMap[c.id] || null,
    }));

    return NextResponse.json({ candidates: enhancedCandidates });
  } catch (err) {
    console.error('Erreur serveur API candidates:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
