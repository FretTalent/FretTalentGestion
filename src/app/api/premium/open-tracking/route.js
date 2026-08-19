import { createClient } from '@supabase/supabase-js';
import { sendCandidateApplicationOpenedEmail } from '@/lib/email-service';
import { sendTelegramCandidatureOpenedNotification, notifyTelegramEmailOpened } from '@/lib/telegram';

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

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('t');

  // Headers transparents anti-cache
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

  try {
    const supabaseAdmin = getAdminSupabase();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // 1. Récupérer l'enregistrement de l'email envoyé
    const { data: emailRecord, error: queryErr } = await supabaseAdmin
      .from('candidature_emails')
      .select(`
        id,
        candidature_id,
        candidate_id,
        entreprise_id,
        company_name,
        company_email,
        open_count,
        opened_at
      `)
      .eq('tracking_token', token)
      .maybeSingle();

    if (queryErr) {
      console.error('[Open-Tracking] Erreur DB lookup token:', queryErr);
    }

    if (!emailRecord) {
      console.log(`[Open-Tracking] Token non répertorié : ${token}`);
      await notifyTelegramEmailOpened({
        recipientEmail: 'Destinataire',
        recipientName: 'Destinataire',
        recipientRole: 'candidate',
        emailSubject: 'Email / Relance FretTalent',
        emailType: 'Email FretTalent',
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

    // 4. Déterminer les détails et le rôle du destinataire avec recherche approfondie du nom
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

    // Recherche par email si le nom n'est toujours pas trouvé ou est une adresse email
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

    // Type et sujet précis selon le token
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

    // 5. Si c'est une candidature envoyée à une entreprise (flow Auto-Candidature standard)
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

      if (candidate?.email) {
        await sendCandidateApplicationOpenedEmail({
          email: candidate.email,
          candidateName: candidate.full_name || 'Chauffeur',
          companyName: emailRecord.company_name,
          companyCity: ent?.city || 'votre secteur',
        });
      }

      await sendTelegramCandidatureOpenedNotification({
        companyName: emailRecord.company_name,
        companyCity: ent?.city || 'votre secteur',
        candidateName: candidate?.full_name || 'Chauffeur',
      });
    }

    // 6. NOTIFICATION TELEGRAM UNIVERSELLE POUR TOUTE OUVERTURE D'EMAIL
    await notifyTelegramEmailOpened({
      recipientEmail: recipientEmail || 'gnri02270@gmail.com',
      recipientName,
      recipientRole,
      companyName: isRecruiterEmail ? emailRecord.company_name : undefined,
      candidateName: isCandidateEmail ? recipientName : undefined,
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
