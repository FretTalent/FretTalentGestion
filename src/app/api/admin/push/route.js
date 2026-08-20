import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

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
    let failedCount = 0;

    // 1. Récupérer les abonnements push selon la cible
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

    // 2. Relai Telegram si coché
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

    if (sentPushCount === 0) {
      return NextResponse.json({
        success: true,
        sentPushCount: 0,
        message: `📲 0 téléphone notifié : Ce(s) chauffeur(s) n'ont pas encore autorisé les notifications sur leur téléphone (l'application doit être ouverte sur leur smartphone).`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `📲 Notification Push envoyée avec succès sur ${sentPushCount} téléphone(s) mobile(s) !`,
      sentPushCount,
      failedCount,
    });
  } catch (err) {
    console.error('Erreur API /api/admin/push:', err);
    return NextResponse.json({ error: err.message || 'Erreur d\'envoi de la notification' }, { status: 500 });
  }
}
