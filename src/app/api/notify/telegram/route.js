import { NextResponse } from 'next/server';
import {
  notifyTelegramNewCandidate,
  notifyTelegramNewCompany,
  notifyTelegramDocumentsUploaded,
  notifyTelegramNewSupportTicket,
  notifyTelegramSupportMessage,
  notifyTelegramUnlock,
  notifyTelegramTest,
} from '@/lib/telegram';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type) {
      return NextResponse.json({ error: 'Type de notification requis' }, { status: 400 });
    }

    let result = { success: true };

    switch (type) {
      case 'candidate_registered':
        result = await notifyTelegramNewCandidate(data || {});
        break;

      case 'company_registered':
        result = await notifyTelegramNewCompany(data || {});
        break;

      case 'documents_uploaded':
        // Notifier Telegram UNIQUEMENT lorsque le dossier est 100% complet (7/7 pièces)
        if (data?.isComplete) {
          result = await notifyTelegramDocumentsUploaded(data || {});
        } else {
          result = { skipped: true, reason: 'Dossier non complet' };
        }
        break;

      case 'support_ticket_created':
        result = await notifyTelegramNewSupportTicket(data || {});
        break;

      case 'support_message_sent':
        result = await notifyTelegramSupportMessage(data || {});
        break;

      case 'unlock_performed':
        result = await notifyTelegramUnlock(data || {});
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
