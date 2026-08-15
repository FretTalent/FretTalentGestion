import { NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { notifyTelegramTest } from '@/lib/telegram';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getAuthUser(req) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      const supabaseAdmin = getAdminClient();
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) return user;
    }
  }

  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (user) return user;
  } catch (err) {
    // ignore
  }

  return null;
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const isTokenSet = !!process.env.TELEGRAM_BOT_TOKEN;
    const isChatIdSet = !!process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!isTokenSet || !isChatIdSet) {
      return NextResponse.json({
        success: false,
        error: 'Variables TELEGRAM_BOT_TOKEN ou TELEGRAM_ADMIN_CHAT_ID non configurées dans l\'environnement.',
        isTokenSet,
        isChatIdSet,
      });
    }

    const result = await notifyTelegramTest();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error?.description || result.error?.message || 'Erreur lors de l\'envoi au bot Telegram.',
        details: result.error,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification Telegram de test envoyée avec succès !',
    });
  } catch (error) {
    console.error('Erreur test Telegram:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
