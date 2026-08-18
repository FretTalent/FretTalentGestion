import { createClient } from '@supabase/supabase-js';
import { sendCandidateApplicationOpenedEmail } from '@/lib/email-service';
import { sendTelegramCandidatureOpenedNotification } from '@/lib/telegram';

// GIF transparent 1x1 pixel encodé en base64
const TRANSPARENT_1X1_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('t');

  // Toujours répondre immédiatement avec l'image 1x1 pour ne pas bloquer le client mail
  const responseHeaders = {
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_1X1_GIF.length.toString(),
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  if (!token) {
    return new Response(TRANSPARENT_1X1_GIF, { status: 200, headers: responseHeaders });
  }

  // Traitement asynchrone de l'ouverture d'email
  (async () => {
    try {
      const supabaseAdmin = getAdminSupabase();
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';

      // 1. Récupérer l'enregistrement de l'email envoyé
      const { data: emailRecord } = await supabaseAdmin
        .from('candidature_emails')
        .select(`
          id,
          candidature_id,
          candidate_id,
          entreprise_id,
          company_name,
          open_count,
          opened_at
        `)
        .eq('tracking_token', token)
        .maybeSingle();

      if (!emailRecord) return;

      const isFirstOpen = (emailRecord.open_count || 0) === 0;

      // 2. Enregistrer l'événement d'ouverture dans le journal
      await supabaseAdmin.from('candidature_open_tracking').insert({
        candidature_email_id: emailRecord.id,
        tracking_token: token,
        ip_address: ip,
        user_agent: userAgent,
        opened_at: new Date().toISOString(),
      });

      // 3. Mettre à jour candidature_emails
      await supabaseAdmin
        .from('candidature_emails')
        .update({
          opened_at: emailRecord.opened_at || new Date().toISOString(),
          open_count: (emailRecord.open_count || 0) + 1,
        })
        .eq('id', emailRecord.id);

      // 4. Si c'est la première ouverture par cette entreprise :
      if (isFirstOpen) {
        // A. Incrémenter le compteur de la session de candidature
        if (emailRecord.candidature_id) {
          const { data: cand } = await supabaseAdmin
            .from('candidatures')
            .select('opened_count')
            .eq('id', emailRecord.candidature_id)
            .maybeSingle();
          if (cand) {
            await supabaseAdmin
              .from('candidatures')
              .update({ opened_count: (cand.opened_count || 0) + 1 })
              .eq('id', emailRecord.candidature_id);
          }
        }

        // B. Incrémenter les stats de l'entreprise
        if (emailRecord.entreprise_id) {
          const { data: ent } = await supabaseAdmin
            .from('entreprises')
            .select('candidatures_opened_count')
            .eq('id', emailRecord.entreprise_id)
            .maybeSingle();
          if (ent) {
            await supabaseAdmin
              .from('entreprises')
              .update({ candidatures_opened_count: (ent.candidatures_opened_count || 0) + 1 })
              .eq('id', emailRecord.entreprise_id);
          }
        }

        // C. Récupérer les informations du candidat pour lui envoyer l'email d'accusé
        const { data: candidate } = await supabaseAdmin
          .from('candidates')
          .select('full_name, email')
          .eq('id', emailRecord.candidate_id)
          .maybeSingle();

        // Récupérer la ville de l'entreprise si liée
        let companyCity = 'votre secteur';
        if (emailRecord.entreprise_id) {
          const { data: entData } = await supabaseAdmin
            .from('entreprises')
            .select('city')
            .eq('id', emailRecord.entreprise_id)
            .maybeSingle();
          if (entData?.city) companyCity = entData.city;
        }

        if (candidate?.email) {
          await sendCandidateApplicationOpenedEmail({
            email: candidate.email,
            candidateName: candidate.full_name || 'Chauffeur',
            companyName: emailRecord.company_name,
            companyCity,
          });
        }

        // D. Notification Telegram Admin
        await sendTelegramCandidatureOpenedNotification({
          companyName: emailRecord.company_name,
          companyCity,
          candidateName: candidate?.full_name || 'Chauffeur',
        });
      }
    } catch (err) {
      console.error('[Open-Tracking] Erreur traitement:', err);
    }
  })();

  return new Response(TRANSPARENT_1X1_GIF, { status: 200, headers: responseHeaders });
}
