import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d'; // 'today', '7d', '30d', 'all'

    let startDate = new Date();
    if (timeframe === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate = new Date(0); // all
    }

    // Récupération des vues de page avec supabaseAdmin
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('page_views')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (viewsError) {
      console.error('Error fetching page views:', viewsError);
      return NextResponse.json({ error: viewsError.message }, { status: 500 });
    }

    const allViews = views || [];

    // 1. Calcul KPIs Globaux
    const totalViews = allViews.length;
    const uniqueSessions = new Set(allViews.map(v => v.session_id)).size;

    // Calcul vues aujourd'hui
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayViews = allViews.filter(v => new Date(v.created_at) >= todayStart);
    const todayCount = todayViews.length;
    const todayUniques = new Set(todayViews.map(v => v.session_id)).size;

    // 2. Répartition par Jour (Journalier avec calendrier continu)
    const dailyMap = {};
    const numDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === 'today' ? 1 : 14;

    if (timeframe !== 'all') {
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        dailyMap[dayStr] = { date: dayStr, views: 0, sessions: new Set() };
      }
    }

    allViews.forEach(v => {
      const day = new Date(v.created_at).toISOString().split('T')[0];
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, views: 0, sessions: new Set() };
      }
      dailyMap[day].views += 1;
      dailyMap[day].sessions.add(v.session_id);
    });

    const dailyStats = Object.values(dailyMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        date: d.date,
        views: d.views,
        uniques: d.sessions.size,
      }));

    // 3. Pages les plus vues
    const pageMap = {};
    allViews.forEach(v => {
      const p = v.path || '/';
      if (!pageMap[p]) {
        pageMap[p] = { path: p, title: v.page_title || p, views: 0, sessions: new Set() };
      }
      pageMap[p].views += 1;
      pageMap[p].sessions.add(v.session_id);
    });

    const topPages = Object.values(pageMap)
      .map(p => ({ path: p.path, title: p.title, views: p.views, uniques: p.sessions.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    // 4. Provenance des clics (Référents / Sources)
    const referrerMap = {};
    allViews.forEach(v => {
      const ref = v.referrer_domain || 'Direct / Aucun';
      if (!referrerMap[ref]) {
        referrerMap[ref] = { domain: ref, count: 0 };
      }
      referrerMap[ref].count += 1;
    });

    const topReferrers = Object.values(referrerMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 5. Répartition Appareils
    const deviceMap = { desktop: 0, mobile: 0, tablet: 0 };
    allViews.forEach(v => {
      const dev = v.device_type || 'desktop';
      if (deviceMap[dev] !== undefined) {
        deviceMap[dev] += 1;
      } else {
        deviceMap.desktop += 1;
      }
    });

    // 6. Distribution Horaire (Heures de pointe)
    const hourlyMap = Array(24).fill(0);
    allViews.forEach(v => {
      const hour = new Date(v.created_at).getHours();
      hourlyMap[hour] += 1;
    });

    return NextResponse.json({
      timeframe,
      kpis: {
        totalViews,
        uniqueSessions,
        todayCount,
        todayUniques,
      },
      dailyStats,
      topPages,
      topReferrers,
      devices: deviceMap,
      hourlyDistribution: hourlyMap,
    });
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
