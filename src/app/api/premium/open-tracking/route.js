import { createClient } from '@supabase/supabase-js';
import { notifyTelegramEmailOpened, sendTelegramCandidatureOpenedNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const TRANSPARENT_1X1_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET(req) {
  const responseHeaders = {
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('t') || searchParams.get('token');

    if (!token) {
      return new Response(TRANSPARENT_1X1_GIF, { status: 200, headers: responseHeaders });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const supabaseAdmin = getAdminClient();

    // 1. Chercher le token dans candidature_emails
    const { data: emailRecord } = await supabaseAdmin
      .from('candidature_emails')
      .select('*')
      .eq('tracking_token', token)
      .maybeSingle();

    // Si le token n'est pas en base (ex: token généré en direct à la volée mail-c-B64...)
    if (!emailRecord) {
      let fallbackEmail = '';
      let fallbackName = 'Destinataire';
      let fallbackSubject = 'E-mail FretTalent';
      let fallbackType = 'Campagne E-mail';

      if (token.startsWith('mail-c-')) {
        try {
          const parts = token.split('-');
          if (parts[2]) {
            let b64 = parts[2];
            const mod = b64.length % 4;
            if (mod === 2) b64 += '==';
            else if (mod === 3) b64 += '=';

            const decodedEmail = Buffer.from(b64, 'base64').toString('utf-8');
            if (decodedEmail.includes('@')) {
              fallbackEmail = decodedEmail;

              // 1. Chercher dans candidates
              const { data: cand } = await supabaseAdmin
                .from('candidates')
                .select('full_name')
                .eq('email', decodedEmail)
                .maybeSingle();

              if (cand?.full_name) {
                fallbackName = cand.full_name;
              } else {
                // 2. Chercher dans companies
                const { data: comp } = await supabaseAdmin
                  .from('companies')
                  .select('name')
                  .eq('email', decodedEmail)
                  .maybeSingle();

                if (comp?.name) {
                  fallbackName = comp.name;
                } else {
                  // 3. Chercher dans profiles
                  const { data: prof } = await supabaseAdmin
                    .from('profiles')
                    .select('full_name')
                    .eq('email', decodedEmail)
                    .maybeSingle();

                  if (prof?.full_name) {
                    fallbackName = prof.full_name;
                  } else {
                    fallbackName = decodedEmail;
                  }
                }
              }
            }
          }
        } catch (e) {}
      }

      if (token.startsWith('remind-')) {
        fallbackSubject = 'Activez votre badge Chauffeur Vérifié 🚛';
        fallbackType = 'Relance Documents Chauffeur';
      } else if (token.startsWith('doc-')) {
        fallbackSubject = 'Action requise : Documents manquants ⚠️';
        fallbackType = 'Documents Manquants';
      } else if (token.startsWith('mail-')) {
        fallbackSubject = 'Message de l\'équipe FretTalent';
        fallbackType = 'Campagne / Email Admin';
      }

      await notifyTelegramEmailOpened({
        recipientEmail: fallbackEmail || 'Destinataire',
        recipientName: fallbackName,
        recipientRole: 'candidate',
        emailSubject: fallbackSubject,
        emailType: fallbackType,
        openCount: 1,
        ip,
        userAgent,
      });

      return new Response(TRANSPARENT_1X1_GIF, { status: 200, headers: responseHeaders });
    }

    const isFirstOpen = (emailRecord.open_count || 0) === 0;
    const currentOpenCount = (emailRecord.open_count || 0) + 1;

    // 2. Enregistrer l'événement d'ouverture dans le journal
    try {
      await supabaseAdmin.from('candidature_open_tracking').insert({
        candidature_email_id: emailRecord.id,
        tracking_token: token,
        ip_address: ip,
        user_agent: userAgent,
        opened_at: new Date().toISOString(),
      });
    } catch (logErr) {
      console.warn('[Open-Tracking] Log insertion warning:', logErr.message);
    }

    // 3. Mettre à jour candidature_emails
    await supabaseAdmin
      .from('candidature_emails')
      .update({
        opened_at: emailRecord.opened_at || new Date().toISOString(),
        open_count: currentOpenCount,
      })
      .eq('id', emailRecord.id);

    // 4. Déterminer les détails du destinataire
    let recipientEmail = emailRecord.company_email || (emailRecord.company_name?.includes('@') ? emailRecord.company_name : '');
    let recipientName = emailRecord.company_name || '';
    let recipientRole = 'candidate';
    let emailType = 'Notification FretTalent';
    let emailSubject = 'Email FretTalent';

    // Recherche par candidate_id si présent
    if (emailRecord.candidate_id) {
      const { data: cand } = await supabaseAdmin
        .from('candidates')
        .select('full_name, email')
        .eq('id', emailRecord.candidate_id)
        .maybeSingle();
      if (cand) {
        if (!recipientEmail) recipientEmail = cand.email;
        if (!recipientName || recipientName.includes('@') || recipientName === 'Destinataire') {
          recipientName = cand.full_name || cand.email;
        }
      }
    }

    // Recherche par email si le nom est manquant
    if ((!recipientName || recipientName.includes('@') || recipientName === 'Destinataire') && recipientEmail) {
      const { data: candByEmail } = await supabaseAdmin
        .from('candidates')
        .select('full_name')
        .eq('email', recipientEmail)
        .maybeSingle();
      if (candByEmail?.full_name) {
        recipientName = candByEmail.full_name;
        recipientRole = 'candidate';
      } else {
        const { data: compByEmail } = await supabaseAdmin
          .from('companies')
          .select('name')
          .eq('email', recipientEmail)
          .maybeSingle();
        if (compByEmail?.name) {
          recipientName = compByEmail.name;
          recipientRole = 'recruiter';
        }
      }
    }

    if (token.startsWith('remind-')) {
      recipientRole = 'candidate';
      emailType = 'Relance Documents Chauffeur';
      emailSubject = 'Activez votre badge Chauffeur Vérifié 🚛';
    } else if (token.startsWith('doc-')) {
      recipientRole = 'candidate';
      emailType = 'Documents Manquants';
      emailSubject = 'Action requise : Documents manquants ⚠️';
    } else if (token.startsWith('mail-')) {
      emailType = 'Campagne / Email Admin';
      emailSubject = 'Message de l\'équipe FretTalent';
    } else if (emailRecord.entreprise_id) {
      recipientRole = 'recruiter';
      emailType = 'Auto-Candidature Premium';
      emailSubject = 'Candidature & Documents Chauffeur (50 km)';
    }

    // 5. Si candidature envoyée à une entreprise (flow Auto-Candidature standard)
    if (isFirstOpen && emailRecord.entreprise_id) {
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

      const { data: ent } = await supabaseAdmin
        .from('entreprises')
        .select('candidatures_opened_count, city')
        .eq('id', emailRecord.entreprise_id)
        .maybeSingle();

      if (ent) {
        await supabaseAdmin
          .from('entreprises')
          .update({ candidatures_opened_count: (ent.candidatures_opened_count || 0) + 1 })
          .eq('id', emailRecord.entreprise_id);
      }

      const { data: candidate } = await supabaseAdmin
        .from('candidates')
        .select('full_name, email')
        .eq('id', emailRecord.candidate_id)
        .maybeSingle();



      await sendTelegramCandidatureOpenedNotification({
        companyName: emailRecord.company_name,
        companyCity: ent?.city || 'votre secteur',
        candidateName: candidate?.full_name || 'Chauffeur',
      });
    }

    // 6. NOTIFICATION TELEGRAM UNIVERSELLE POUR TOUTE OUVERTURE D'EMAIL
    const cleanFinalName = recipientName && recipientName !== 'Destinataire' && recipientName !== 'Chauffeur / Candidat' ? recipientName : '';
    const cleanFinalEmail = recipientEmail || '';

    await notifyTelegramEmailOpened({
      recipientEmail: cleanFinalEmail,
      recipientName: cleanFinalName,
      recipientRole,
      companyName: recipientRole === 'recruiter' ? (cleanFinalName || undefined) : undefined,
      candidateName: recipientRole === 'candidate' ? (cleanFinalName || undefined) : undefined,
      emailSubject,
      emailType,
      openCount: currentOpenCount,
      ip,
      userAgent,
    });
  } catch (err) {
    console.error('[Open-Tracking] Erreur traitement:', err);
  }

  return new Response(TRANSPARENT_1X1_GIF, { status: 200, headers: responseHeaders });
}
