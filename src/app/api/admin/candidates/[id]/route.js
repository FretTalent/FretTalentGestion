import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Route GET : récupère un candidat spécifique par ID (admin seulement, bypass RLS)
export async function GET(req, { params }) {
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

    // Récupérer le candidat par ID (service role = bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ candidate: data });
  } catch (err) {
    console.error('Erreur serveur API candidate detail:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
