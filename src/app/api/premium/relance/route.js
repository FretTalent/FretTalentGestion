import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendCompanyRelanceDay7Email,
  sendCandidateRelanceSentEmail,
} from '@/lib/email-service';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function POST(req) {
  return handleRelances(req);
}

export async function GET(req) {
  return handleRelances(req);
}

async function handleRelances(req) {
  try {
    const supabaseAdmin = getAdminSupabase();
    const now = new Date().toISOString();

    // 1. Récupérer toutes les relances programmées échues
    const { data: dueRelances, error: fetchError } = await supabaseAdmin
      .from('scheduled_relances')
      .select(`
        id,
        candidature_id,
        candidature_email_id,
        candidate_id,
        entreprise_id,
        scheduled_for
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(100);

    if (fetchError) {
      console.error('[Relances] Erreur récupération relances échues:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!dueRelances || dueRelances.length === 0) {
      return NextResponse.json({ success: true, message: 'Aucune relance due à exécuter.', processedCount: 0 });
    }

    console.log(`[Relances] ${dueRelances.length} relance(s) due(s) à traiter.`);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';

    // Grouper les relances par candidat pour n'envoyer qu'un seul email de confirmation au candidat
    const candidateRelanceCounts = {};
    let sentCount = 0;

    for (const relance of dueRelances) {
      try {
        // Récupérer l'email original et le candidat
        const { data: candEmail } = await supabaseAdmin
          .from('candidature_emails')
          .select('*')
          .eq('id', relance.candidature_email_id)
          .maybeSingle();

        const { data: candidate } = await supabaseAdmin
          .from('candidates')
          .select('*')
          .eq('id', relance.candidate_id)
          .maybeSingle();

        if (candEmail && candidate) {
          const trackingToken = `relance-${candEmail.tracking_token}`;
          const trackingUrl = `${baseUrl}/api/premium/open-tracking?t=${trackingToken}`;

          const sendResult = await sendCompanyRelanceDay7Email({
            toEmail: candEmail.company_email,
            companyName: candEmail.company_name,
            candidate,
            distanceKm: candEmail.distance_km || 0,
            trackingUrl,
          });

          if (sendResult?.success) {
            sentCount++;
            candidateRelanceCounts[relance.candidate_id] = (candidateRelanceCounts[relance.candidate_id] || 0) + 1;

            // Marquer la relance comme effectuée
            await supabaseAdmin
              .from('scheduled_relances')
              .update({ status: 'sent', executed_at: new Date().toISOString() })
              .eq('id', relance.id);

            await supabaseAdmin
              .from('candidature_emails')
              .update({ relance_status: 'sent', relance_sent_at: new Date().toISOString() })
              .eq('id', relance.candidature_email_id);
          } else {
            await supabaseAdmin
              .from('scheduled_relances')
              .update({ status: 'failed', error_message: String(sendResult?.error || 'Erreur envoi') })
              .eq('id', relance.id);
          }
        }
      } catch (err) {
        console.error(`[Relances] Erreur traitement relance ${relance.id}:`, err);
      }
    }

    // 2. Notifier chaque candidat concerné que sa relance J+7 a été transmise
    for (const [candId, count] of Object.entries(candidateRelanceCounts)) {
      try {
        const { data: cand } = await supabaseAdmin
          .from('candidates')
          .select('full_name, email')
          .eq('id', candId)
          .maybeSingle();

        if (cand?.email) {
          await sendCandidateRelanceSentEmail({
            email: cand.email,
            candidateName: cand.full_name || 'Chauffeur',
            companiesCount: count,
          });
        }
      } catch (notifyErr) {
        console.error(`[Relances] Erreur notification candidat ${candId}:`, notifyErr);
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: dueRelances.length,
      relancesSent: sentCount,
    });
  } catch (error) {
    console.error('Exception /api/premium/relance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
