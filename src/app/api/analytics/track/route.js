import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function parseReferrerDomain(referrer) {
  if (!referrer || referrer === '') return 'Direct / Aucun';
  try {
    const url = new URL(referrer);
    let host = url.hostname.replace(/^www\./, '');
    if (host.includes('google')) return 'Google';
    if (host.includes('bing')) return 'Bing';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('facebook') || host.includes('fb.')) return 'Facebook';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('t.co') || host.includes('twitter') || host.includes('x.com')) return 'Twitter / X';
    return host;
  } catch (e) {
    return 'Direct / Autre';
  }
}

function detectDevice(userAgent) {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop|windows phone/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { path, page_title, referrer, session_id } = body;

    if (!path || !session_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ne pas enregistrer les pages d'administration pour ne pas fausser l'audience
    if (path.startsWith('/dashboard/admin')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const referrerDomain = parseReferrerDomain(referrer);
    const deviceType = detectDevice(userAgent);

    // Tenter d'associer un user_id si une session auth existe
    let userId = null;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      }
    } catch (e) {
      // Ignorer l'erreur d'auth pour ne pas bloquer le tracking
    }

    const { error } = await supabase.from('page_views').insert([
      {
        path,
        page_title: page_title || path,
        referrer: referrer || null,
        referrer_domain: referrerDomain,
        device_type: deviceType,
        session_id,
        user_id: userId,
        user_agent: userAgent.slice(0, 300),
      },
    ]);

    if (error) {
      console.error('Error recording page view:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Tracking API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
