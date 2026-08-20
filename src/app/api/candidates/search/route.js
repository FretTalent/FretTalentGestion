import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase-server';

export async function GET(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 1. Tenter de récupérer l'utilisateur connecté via session/cookies ou header Auth
    let user = null;
    try {
      const supabaseServer = await createServerClient();
      const { data: authData } = await supabaseServer.auth.getUser();
      user = authData?.user || null;
    } catch {
      // Fallback au token bearer si présent dans le header
    }

    if (!user) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const { data: jwtData } = await supabaseAdmin.auth.getUser(token);
        if (jwtData?.user) {
          user = jwtData.user;
        }
      }
    }

    let isSubscribed = false;
    let unlockedCandidateIds = new Set();

    // 2. Si l'utilisateur est connecté, vérifier son profil entreprise et ses déblocages
    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'recruiter') {
        // Vérifier le plan d'abonnement de l'entreprise
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('subscription_plan')
          .eq('id', user.id)
          .maybeSingle();

        if (
          company?.subscription_plan === 'premium_monthly' ||
          company?.subscription_plan === 'premium_plus_monthly'
        ) {
          isSubscribed = true;
        }

        // Récupérer la liste des déblocages effectués par cette entreprise
        const { data: unlocks } = await supabaseAdmin
          .from('unlocks')
          .select('candidate_id')
          .eq('company_id', user.id);

        if (unlocks) {
          unlockedCandidateIds = new Set(unlocks.map(u => u.candidate_id));
        }
      }
    }

    // 3. Récupérer tous les candidats actifs
    const { data: candidates, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur de chargement des candidats:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // 4. Masquer les données nominatives côté SERVEUR pour chaque candidat non débloqué
    const sanitizedCandidates = (candidates || []).map(c => {
      const isUnlocked = isSubscribed || unlockedCandidateIds.has(c.id);

      if (isUnlocked) {
        return {
          ...c,
          is_unlocked: true,
        };
      }

      // Candidat non débloqué -> On SUPPRIME / MASQUE complètement les données nominatives
      return {
        id: c.id,
        postal_code: c.postal_code,
        city: c.city,
        mobility_radius: c.mobility_radius,
        experience_years: c.experience_years,
        availability: c.availability,
        availability_date: c.availability_date,
        contract_types: c.contract_types,
        licenses: c.licenses,
        certifications: c.certifications,
        job_preferences: c.job_preferences,
        is_active: c.is_active,
        is_verified: c.is_verified,
        validated: c.validated,
        bio: c.bio,
        country: c.country || 'FR',
        birth_date: c.birth_date,
        created_at: c.created_at,
        updated_at: c.updated_at,
        adr_basic: c.adr_basic,
        adr_tanker: c.adr_tanker,
        fimo: c.fimo,
        // Champs masqués/anonymisés
        full_name: 'Chauffeur Anonyme',
        email: null,
        phone: null,
        address: null,
        documents: null,
        is_unlocked: false,
      };
    });

    return NextResponse.json({ candidates: sanitizedCandidates, isSubscribed });
  } catch (err) {
    console.error('Erreur API search candidates:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
