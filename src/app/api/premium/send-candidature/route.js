import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { geocodeAddress, findNearbyCompanies } from '@/lib/geo';
import {
  sendCompanyPremiumCandidatureEmail,
  sendCandidatePremiumConfirmationEmail,
} from '@/lib/email-service';
import { sendTelegramPremiumPurchaseNotification } from '@/lib/telegram';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { candidateId, stripeSessionId, amountPaid = 1999 } = body;

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId requis' }, { status: 400 });
    }

    const supabaseAdmin = getAdminSupabase();

    // 1. Récupérer les détails complets du candidat
    const { data: candidate, error: candError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .maybeSingle();

    if (candError || !candidate) {
      return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
    }

    // 2. Géocodage de l'adresse du candidat si latitude/longitude absents
    let candidateLat = candidate.latitude;
    let candidateLon = candidate.longitude;

    if (!candidateLat || !candidateLon) {
      const geoResult = await geocodeAddress({
        address: candidate.address || '',
        postalCode: candidate.postal_code || '',
        city: candidate.city || '',
        country: candidate.country || 'FR',
      });

      if (geoResult) {
        candidateLat = geoResult.latitude;
        candidateLon = geoResult.longitude;

        // Mise à jour du candidat
        await supabaseAdmin
          .from('candidates')
          .update({ latitude: candidateLat, longitude: candidateLon })
          .eq('id', candidateId);
      }
    }

    if (!candidateLat || !candidateLon) {
      console.warn(`[Auto-Candidature] Impossible de géocoder la localisation du candidat ${candidateId}.`);
    }

    // 3. Recherche des entreprises dans un rayon de 50 km
    const nearbyCompanies = await findNearbyCompanies(
      supabaseAdmin,
      candidateLat,
      candidateLon,
      50 // Rayon de 50 km
    );

    console.log(`[Auto-Candidature] ${nearbyCompanies.length} entreprise(s) trouvée(s) pour le candidat ${candidate.full_name}.`);

    // 4. Création de l'enregistrement de la session d'auto-candidature
    const { data: candidatureRow, error: candRowError } = await supabaseAdmin
      .from('candidatures')
      .insert({
        candidate_id: candidateId,
        stripe_session_id: stripeSessionId || null,
        amount_paid: amountPaid,
        radius_km: 50,
        candidate_lat: candidateLat,
        candidate_lon: candidateLon,
        candidate_postal_code: candidate.postal_code,
        candidate_city: candidate.city,
        status: 'processing',
        target_companies_count: nearbyCompanies.length,
      })
      .select()
      .single();

    if (candRowError) {
      console.error('[Auto-Candidature] Erreur insertion candidatures:', candRowError);
    }

    const candidatureId = candidatureRow?.id;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';

    let sentCount = 0;
    const emailRecordsToInsert = [];
    const relanceRecordsToInsert = [];

    // 5. Envoi des emails aux entreprises ciblées
    for (const company of nearbyCompanies) {
      // Générer un token unique de tracking d'ouverture
      const trackingToken = `${candidatureId ? candidatureId.slice(0, 8) : 'cand'}-${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
      const trackingUrl = `${baseUrl}/api/premium/open-tracking?t=${trackingToken}`;

      try {
        const sendResult = await sendCompanyPremiumCandidatureEmail({
          toEmail: company.email,
          companyName: company.name,
          candidate,
          distanceKm: company.distance_km || 0,
          trackingUrl,
          summaryPdfHtmlUrl: `${baseUrl}/candidats-disponibles?ref=${candidate.id}`,
        });

        const isSent = sendResult?.success;
        if (isSent) sentCount++;

        const emailRecord = {
          candidature_id: candidatureId,
          candidate_id: candidateId,
          entreprise_id: company.id || null,
          company_name: company.name,
          company_email: company.email,
          distance_km: company.distance_km || null,
          is_partner: company.is_partner || false,
          tracking_token: trackingToken,
          status: isSent ? 'sent' : 'failed',
          resend_email_id: sendResult?.data?.id || null,
          error_message: isSent ? null : String(sendResult?.error || 'Erreur envoi'),
          sent_at: isSent ? new Date().toISOString() : null,
        };

        emailRecordsToInsert.push(emailRecord);
      } catch (sendErr) {
        console.error(`[Auto-Candidature] Erreur envoi vers ${company.email}:`, sendErr);
      }
    }

    // 6. Insertion groupée des enregistrements d'emails et planification des relances J+7
    if (emailRecordsToInsert.length > 0) {
      const { data: insertedEmails } = await supabaseAdmin
        .from('candidature_emails')
        .insert(emailRecordsToInsert)
        .select('id, entreprise_id');

      if (insertedEmails && insertedEmails.length > 0) {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 7); // J+7

        for (const ins of insertedEmails) {
          relanceRecordsToInsert.push({
            candidature_id: candidatureId,
            candidature_email_id: ins.id,
            candidate_id: candidateId,
            entreprise_id: ins.entreprise_id || null,
            scheduled_for: scheduledDate.toISOString(),
            status: 'pending',
          });
        }

        if (relanceRecordsToInsert.length > 0) {
          await supabaseAdmin.from('scheduled_relances').insert(relanceRecordsToInsert);
        }
      }
    }

    // 7. Mettre à jour le statut de la candidature
    if (candidatureId) {
      await supabaseAdmin
        .from('candidatures')
        .update({
          status: 'completed',
          sent_count: sentCount,
          completed_at: new Date().toISOString(),
        })
        .eq('id', candidatureId);
    }

    // 8. Activer le Badge Étoile Premium pour le chauffeur pendant 1 semaine (7 jours)
    await supabaseAdmin
      .from('premium_badges')
      .insert({
        candidate_id: candidateId,
        candidature_id: candidatureId || null,
        is_active: true,
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semaine (7 jours)
      });

    // 9. Envoi d'un email de confirmation au chauffeur
    if (candidate.email) {
      await sendCandidatePremiumConfirmationEmail({
        email: candidate.email,
        candidateName: candidate.full_name || 'Chauffeur',
        companiesCount: nearbyCompanies.length,
        radiusKm: 50,
        city: `${candidate.postal_code || ''} ${candidate.city || ''}`,
      });
    }

    // 10. Notification Telegram Admin
    await sendTelegramPremiumPurchaseNotification({
      candidateName: candidate.full_name || 'Chauffeur',
      candidateCity: candidate.city || 'France',
      candidatePostalCode: candidate.postal_code || '',
      companiesCount: nearbyCompanies.length,
      amount: '19,99 €',
    });

    return NextResponse.json({
      success: true,
      companiesFound: nearbyCompanies.length,
      companiesContacted: sentCount,
      candidatureId,
    });
  } catch (error) {
    console.error('Exception /api/premium/send-candidature:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l’envoi de la candidature' },
      { status: 500 }
    );
  }
}
