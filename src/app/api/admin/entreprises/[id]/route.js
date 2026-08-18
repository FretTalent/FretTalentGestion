import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase-server';
import { geocodeAddress } from '@/lib/geo';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// GET /api/admin/entreprises/[id] : Détails et historique d'une entreprise
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabaseAdmin = getAdminSupabase();

    const { data: entreprise, error } = await supabaseAdmin
      .from('entreprises')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !entreprise) {
      return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 404 });
    }

    // Récupérer les candidatures reçues par cette entreprise
    const { data: candidaturesReceived } = await supabaseAdmin
      .from('candidature_emails')
      .select(`
        id,
        candidate_id,
        distance_km,
        status,
        sent_at,
        opened_at,
        open_count,
        relance_status,
        relance_sent_at,
        candidates ( full_name, city, postal_code, licenses )
      `)
      .eq('entreprise_id', id)
      .order('sent_at', { ascending: false });

    return NextResponse.json({
      entreprise,
      candidaturesReceived: candidaturesReceived || [],
    });
  } catch (error) {
    console.error('Erreur GET /api/admin/entreprises/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/entreprises/[id] : Mettre à jour une entreprise
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      siret,
      vat_number,
      address,
      postal_code,
      city,
      country = 'FR',
      is_partner,
      specialties,
      notes,
      is_active,
    } = body;

    let latitude = body.latitude !== undefined && body.latitude !== null ? parseFloat(body.latitude) : null;
    let longitude = body.longitude !== undefined && body.longitude !== null ? parseFloat(body.longitude) : null;

    // Recalculer le géocodage si manquant
    if ((latitude === null || longitude === null) && (postal_code || city)) {
      const geo = await geocodeAddress({
        address: address || '',
        postalCode: postal_code,
        city: city,
        country: country,
      });

      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
      }
    }

    const supabaseAdmin = getAdminSupabase();
    const updateData = {
      name,
      email,
      phone: phone || null,
      siret: siret || null,
      vat_number: vat_number || null,
      address: address || null,
      postal_code,
      city,
      country: (country || 'FR').toUpperCase(),
      latitude,
      longitude,
      is_partner: Boolean(is_partner),
      specialties: Array.isArray(specialties) ? specialties : [],
      notes: notes || null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabaseAdmin
      .from('entreprises')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, entreprise: updated });
  } catch (error) {
    console.error('Erreur PUT /api/admin/entreprises/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/entreprises/[id] : Supprimer une entreprise
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 });
    }

    const supabaseAdmin = getAdminSupabase();
    const { error } = await supabaseAdmin.from('entreprises').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/admin/entreprises/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
