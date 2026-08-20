import { NextResponse } from 'next/server';
import {
  notifyTelegramNewCandidate,
  notifyTelegramNewCompany,
  notifyTelegramDocumentsUploaded,
  notifyTelegramNewSupportTicket,
  notifyTelegramSupportMessage,
  notifyTelegramUnlock,
  notifyTelegramTest,
  notifyTelegramNewJob,
  notifyTelegramSubscriptionCancelled,
  notifyTelegramPaymentFailed,
  notifyTelegramSuperCandidate,
  notifyTelegramAccountDeleted,
} from '@/lib/telegram';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const payload = data || body;

    if (!type) {
      return NextResponse.json({ error: 'Type de notification requis' }, { status: 400 });
    }

    let result = { success: true };

    switch (type) {
      case 'candidate_registered':
        result = await notifyTelegramNewCandidate(payload);
        break;

      case 'company_registered':
        result = await notifyTelegramNewCompany(payload);
        break;

      case 'documents_uploaded':
        // Notifier Telegram UNIQUEMENT lorsque le dossier est 100% complet (7/7 pièces)
        if (payload?.isComplete) {
          result = await notifyTelegramDocumentsUploaded(payload);
        } else {
          result = { skipped: true, reason: 'Dossier non complet' };
        }
        break;

      case 'support_ticket_created':
        result = await notifyTelegramNewSupportTicket(payload);
        break;

      case 'support_message_sent':
        result = await notifyTelegramSupportMessage(payload);
        break;

      case 'unlock_performed':
        result = await notifyTelegramUnlock(payload);
        break;

      case 'new_job':
        result = await notifyTelegramNewJob(payload);
        break;

      case 'subscription_cancelled':
        result = await notifyTelegramSubscriptionCancelled(payload);
        break;

      case 'payment_failed':
        result = await notifyTelegramPaymentFailed(payload);
        break;

      case 'super_candidate':
        result = await notifyTelegramSuperCandidate(payload);
        break;

      case 'account_deleted':
        result = await notifyTelegramAccountDeleted(payload);
        break;

      case 'test':
        result = await notifyTelegramTest();
        break;

      default:
        return NextResponse.json({ error: `Type ${type} non reconnu` }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Erreur API /api/notify/telegram:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi de la notification' },
      { status: 500 }
    );
  }
}
