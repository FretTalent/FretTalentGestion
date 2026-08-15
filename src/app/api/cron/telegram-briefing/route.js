import { NextResponse } from 'next/server';
import { sendDailyMorningBriefing } from '@/lib/telegram';

export async function GET(req) {
  try {
    const result = await sendDailyMorningBriefing();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors du briefing matinal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Briefing matinal Telegram envoyé avec succès !',
    });
  } catch (error) {
    console.error('Erreur API cron telegram briefing:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
