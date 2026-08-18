import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase-server';
import CompanyPremiumCandidature from '@/emails/CompanyPremiumCandidature';
import { resend } from '@/lib/resend';
import { findNearbyCompanies, geocodeAddress } from '@/lib/geo';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

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
      candidateId,
      companyId,
      sendTestToEmail,
    } = body;

    const supabaseAdmin = getAdminSupabase();

    // 1. Récupérer les données du candidat
    let candidate = null;
    if (candidateId) {
      const { data: candData } = await supabaseAdmin
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .maybeSingle();
      candidate = candData;
    }

    // Valeurs par défaut si aucun candidat sélectionné
    if (!candidate) {
      candidate = {
        id: 'test-cand-001',
        full_name: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        phone: '06 12 34 56 78',
        city: 'Lyon',
        postal_code: '69000',
        licenses: ['SPL', 'CE', 'C'],
        certifications: ['FIMO', 'FCO', 'Carte Chrono', 'ADR de base'],
        job_preferences: ['Tautliner', 'Frigo', 'Benne'],
        experience_years: 8,
        availability: 'immediate',
        bio: 'Chauffeur SPL expérimenté en grand régional et national, autonome, ponctuel et soigneux du matériel.',
      };
    }

    // 2. Géocoder le candidat si besoin pour calculer les entreprises à 50 km
    let candidateLat = candidate.latitude;
    let candidateLon = candidate.longitude;
    if (!candidateLat || !candidateLon) {
      const geo = await geocodeAddress({
        address: candidate.address || '',
        postalCode: candidate.postal_code || '69000',
        city: candidate.city || 'Lyon',
        country: candidate.country || 'FR',
      });
      if (geo) {
        candidateLat = geo.latitude;
        candidateLon = geo.longitude;
      }
    }

    // 3. Trouver les entreprises dans le rayon de 50 km
    const nearbyCompanies = await findNearbyCompanies(
      supabaseAdmin,
      candidateLat || 45.764,
      candidateLon || 4.835,
      50
    );

    // 4. Déterminer l'entreprise exemple pour la prévisualisation
    let targetCompany = null;
    if (companyId) {
      targetCompany = nearbyCompanies.find(c => c.id === companyId);
      if (!targetCompany) {
        const { data: ent } = await supabaseAdmin
          .from('entreprises')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();
        targetCompany = ent;
      }
    }

    if (!targetCompany) {
      targetCompany = nearbyCompanies[0] || {
        name: 'Transports Express Régional',
        city: 'Lyon',
        postal_code: '69000',
        distance_km: 14.2,
      };
    }

    const distanceKm = targetCompany.distance_km || 14.2;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';

    // 5. Générer le HTML du template d'email
    const emailHtml = await render(
      <CompanyPremiumCandidature
        companyName={targetCompany.name || 'Entreprise de Transport'}
        candidateName={candidate.full_name || 'Chauffeur Routier'}
        candidateCity={candidate.city || 'France'}
        candidatePostalCode={candidate.postal_code || ''}
        distanceKm={distanceKm}
        licenses={candidate.licenses || ['SPL']}
        certifications={candidate.certifications || []}
        specialties={candidate.job_preferences || []}
        experienceYears={candidate.experience_years || 0}
        availability={candidate.availability === 'immediate' ? 'Immédiate' : candidate.availability_date || 'Sous préavis'}
        phone={candidate.phone || '06 00 00 00 00'}
        email={candidate.email || 'chauffeur@email.com'}
        bio={candidate.bio || ''}
        candidateId={candidate.id}
        trackingUrl={`${baseUrl}/api/premium/open-tracking?t=preview-token`}
        summaryPdfHtmlUrl={`${baseUrl}/candidats-disponibles?ref=${candidate.id}`}
      />
    );

    // 6. Si demande d'envoi d'email de test à l'admin
    let testSendResult = null;
    if (sendTestToEmail) {
      try {
        testSendResult = await resend.emails.send({
          from: 'FretTalent <support@frettalent.fr>',
          to: [sendTestToEmail],
          subject: `[TEST APERÇU] ⭐ Candidature Directe : ${candidate.full_name} (${(candidate.licenses || ['SPL']).join('/')}) à ${distanceKm} km`,
          html: emailHtml,
        });
      } catch (sendErr) {
        console.error('Erreur envoi email test admin:', sendErr);
        testSendResult = { error: sendErr.message };
      }
    }

    return NextResponse.json({
      html: emailHtml,
      nearbyCompanies,
      nearbyCount: nearbyCompanies.length,
      candidate,
      targetCompany,
      testSendResult,
    });
  } catch (error) {
    console.error('Erreur /api/admin/premium/preview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
