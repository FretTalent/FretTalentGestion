import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';
import { resend } from '@/lib/resend';

// Clés VAPID par défaut pour Web Push (générées ou configurées)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMe5H-lJ0x8UqV5J_q-oVzM47yT2N90jK5k_x9p3z9P9Z';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'mK4-Z9Z-x9p3z9P9Z_q-oVzM47yT2N90jK5k';

try {
  webpush.setVapidDetails(
    'mailto:support@frettalent.fr',
    vapidPublicKey,
    vapidPrivateKey
  );
} catch (e) {
  console.warn('VAPID setup warning:', e.message);
}

export async function POST(req) {
  try {
    const { title, body, url, target, candidateId, candidateIds, notifyTelegram } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Titre et message requis.' }, { status: 400 });
    }

    let sentPushCount = 0;
    let sentEmailCount = 0;
    let failedCount = 0;

    // 1. Récupérer les candidats ciblés dans la base Supabase
    let candidateQuery = supabase.from('candidates').select('id, full_name, email');

    if (candidateIds && Array.isArray(candidateIds) && candidateIds.length > 0) {
      candidateQuery = candidateQuery.in('id', candidateIds);
    } else if (candidateId) {
      candidateQuery = candidateQuery.eq('id', candidateId);
    }

    const { data: targetedCandidates } = await candidateQuery;
    const targetEmails = (targetedCandidates || []).map((c) => c.email).filter(Boolean);

    // 2. Tenter l'envoi Web Push Mobile
    let subQuery = supabase.from('push_subscriptions').select('*');
    if (candidateIds && Array.isArray(candidateIds) && candidateIds.length > 0) {
      subQuery = subQuery.in('user_id', candidateIds);
    } else if (candidateId) {
      subQuery = subQuery.eq('user_id', candidateId);
    } else {
      subQuery = subQuery.eq('role', 'candidate');
    }

    const { data: subscriptions } = await subQuery;

    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: title,
        body: body,
        url: url || '/dashboard/candidate',
        icon: '/favicon.png',
      });

      for (const subItem of subscriptions) {
        try {
          if (subItem.subscription) {
            await webpush.sendNotification(subItem.subscription, payload);
            sentPushCount++;
          }
        } catch (pushErr) {
          failedCount++;
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('id', subItem.id);
          }
        }
      }
    }

    // 3. Envoi complémentaire / secours par E-MAIL direct aux chauffeurs ciblés
    if (targetEmails.length > 0) {
      for (const email of targetEmails) {
        try {
          await resend.emails.send({
            from: 'FretTalent <support@frettalent.fr>',
            to: [email],
            subject: title,
            html: `
              <div font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://www.frettalent.fr/logo.png" alt="FretTalent" style="height: 40px;" />
                </div>
                <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 12px;">${title}</h2>
                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px; white-space: pre-wrap;">${body}</p>
                <div style="text-align: center; margin-top: 24px;">
                  <a href="https://www.frettalent.fr${url || '/dashboard/candidate'}" style="background-color: #ff7a00; color: #ffffff; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block;">Accéder à mon Espace FretTalent</a>
                </div>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin-top: 30px; margin-bottom: 16px;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} FretTalent. Plateforme de recrutement transport routier.</p>
              </div>
            `,
          });
          sentEmailCount++;
        } catch (mailErr) {
          console.error('Erreur envoi email fallback:', mailErr);
        }
      }
    }

    // 4. Relai Telegram si coché
    if (notifyTelegram) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.frettalent.fr'}/api/notify/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'super_candidate',
            data: {
              title: title,
              message: body,
              link: url || 'https://www.frettalent.fr',
            },
          }),
        });
      } catch (tgErr) {
        console.error('Erreur relai Telegram:', tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Message transmis avec succès ! (✉️ ${sentEmailCount} e-mail(s) délivré(s), 📲 ${sentPushCount} téléphone(s) notifié(s))`,
      sentPushCount,
      sentEmailCount,
      failedCount,
    });
  } catch (err) {
    console.error('Erreur API /api/admin/push:', err);
    return NextResponse.json({ error: err.message || 'Erreur d\'envoi de la notification' }, { status: 500 });
  }
}
