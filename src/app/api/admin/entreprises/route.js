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

// GET /api/admin/entreprises : Liste et statistiques des entreprises de transport
export async function GET(req) {
  try {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || 'all';
    const partner = searchParams.get('partner') || 'all'; // 'all' | 'true' | 'false'

    const supabaseAdmin = getAdminSupabase();
    let query = supabaseAdmin.from('entreprises').select('*').order('created_at', { ascending: false });

    if (country !== 'all') {
      query = query.eq('country', country);
    }

    if (partner === 'true') {
      query = query.eq('is_partner', true);
    } else if (partner === 'false') {
      query = query.eq('is_partner', false);
    }

    const { data: entreprises, error } = await query;
    if (error) throw error;

    let filtered = entreprises || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.city?.toLowerCase().includes(q) ||
          e.postal_code?.includes(q) ||
          e.siret?.includes(q) ||
          e.phone?.includes(q)
      );
    }

    // Statistiques consolidées
    const totalCount = entreprises?.length || 0;
    const partnerCount = entreprises?.filter(e => e.is_partner).length || 0;
    const totalCandidaturesReceived = entreprises?.reduce((acc, curr) => acc + (curr.candidatures_received_count || 0), 0) || 0;
    const totalCandidaturesOpened = entreprises?.reduce((acc, curr) => acc + (curr.candidatures_opened_count || 0), 0) || 0;

    return NextResponse.json({
      entreprises: filtered,
      stats: {
        totalCount,
        partnerCount,
        totalCandidaturesReceived,
        totalCandidaturesOpened,
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/admin/entreprises:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/entreprises : Ajouter une entreprise manuellement avec géocodage automatique
export async function POST(req) {
  try {
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
      is_partner = false,
      specialties = [],
      notes,
    } = body;

    if (!name || !email || !postal_code || !city) {
      return NextResponse.json(
        { error: 'Nom, email, code postal et ville sont obligatoires.' },
        { status: 400 }
      );
    }

    // Géocodage automatique si non fourni
    let latitude = body.latitude ? parseFloat(body.latitude) : null;
    let longitude = body.longitude ? parseFloat(body.longitude) : null;

    if (!latitude || !longitude) {
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
    const { data: newCompany, error: insertError } = await supabaseAdmin
      .from('entreprises')
      .insert({
        name,
        email,
        phone: phone || null,
        siret: siret || null,
        vat_number: vat_number || null,
        address: address || null,
        postal_code,
        city,
        country: country.toUpperCase(),
        latitude,
        longitude,
        is_partner: Boolean(is_partner),
        specialties: Array.isArray(specialties) ? specialties : [],
        notes: notes || null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, entreprise: newCompany });
  } catch (error) {
    console.error('Erreur POST /api/admin/entreprises:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
