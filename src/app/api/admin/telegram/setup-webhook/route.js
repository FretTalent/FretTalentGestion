import { NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(req) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN manquant' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    return NextResponse.json({ success: true, webhookInfo: data.result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN non configuré' }, { status: 400 });
    }

    const webhookUrl = 'https://www.frettalent.fr/api/telegram/webhook';
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({ success: false, error: data.description, details: data });
    }

    return NextResponse.json({
      success: true,
      message: `Webhook Telegram configuré avec succès sur ${webhookUrl} !`,
      result: data,
    });
  } catch (error) {
    console.error('Erreur setWebhook:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
