import { NextResponse } from 'next/server';
import { sendDailyMorningBriefing } from '@/lib/telegram';

export async function GET(req) {
  try {
    // Protection par CRON_SECRET si configuré
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

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
