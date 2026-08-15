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
    let prevStartDate = new Date();
    let numDays = 7;

    if (timeframe === 'today') {
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevStartDate.setHours(0, 0, 0, 0);
      numDays = 1;
    } else if (timeframe === '7d') {
      numDays = 7;
      startDate.setDate(startDate.getDate() - 7);
      prevStartDate.setDate(prevStartDate.getDate() - 14);
    } else if (timeframe === '30d') {
      numDays = 30;
      startDate.setDate(startDate.getDate() - 30);
      prevStartDate.setDate(prevStartDate.getDate() - 60);
    } else {
      startDate = new Date(0); // all
      prevStartDate = new Date(0);
      numDays = 30;
    }

    // 1. Récupération des vues de la période sélectionnée et de la période précédente (pour calcul de progression)
    const [
      { data: currentViews, error: viewsError },
      { data: prevViews },
      { data: periodCandidates },
      { data: periodCompanies },
    ] = await Promise.all([
      supabaseAdmin
        .from('page_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      timeframe !== 'all'
        ? supabaseAdmin
            .from('page_views')
            .select('id, session_id, created_at')
            .gte('created_at', prevStartDate.toISOString())
            .lt('created_at', startDate.toISOString())
        : Promise.resolve({ data: [] }),
      supabaseAdmin
        .from('candidates')
        .select('id, created_at, country')
        .gte('created_at', startDate.toISOString()),
      supabaseAdmin
        .from('companies')
        .select('id, created_at, country')
        .gte('created_at', startDate.toISOString()),
    ]);

    if (viewsError) {
      console.error('Error fetching page views:', viewsError);
      return NextResponse.json({ error: viewsError.message }, { status: 500 });
    }

    const allViews = currentViews || [];
    const previousPeriodViews = prevViews || [];

    // 2. Calcul KPIs Globaux & Croissance vs Période N-1
    const totalViews = allViews.length;
    const prevTotalViews = previousPeriodViews.length;
    const viewsGrowth = prevTotalViews > 0
      ? Math.round(((totalViews - prevTotalViews) / prevTotalViews) * 100)
      : totalViews > 0 ? 100 : 0;

    const uniqueSessions = new Set(allViews.map(v => v.session_id)).size;
    const prevUniqueSessions = new Set(previousPeriodViews.map(v => v.session_id)).size;
    const sessionsGrowth = prevUniqueSessions > 0
      ? Math.round(((uniqueSessions - prevUniqueSessions) / prevUniqueSessions) * 100)
      : uniqueSessions > 0 ? 100 : 0;

    // Vues aujourd'hui
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayViews = allViews.filter(v => new Date(v.created_at) >= todayStart);
    const todayCount = todayViews.length;
    const todayUniques = new Set(todayViews.map(v => v.session_id)).size;

    // Taux de rebond estimé (sessions avec 1 seule page vue)
    const sessionViewsCount = {};
    allViews.forEach(v => {
      sessionViewsCount[v.session_id] = (sessionViewsCount[v.session_id] || 0) + 1;
    });
    const singlePageSessions = Object.values(sessionViewsCount).filter(cnt => cnt === 1).length;
    const estimatedBounceRate = uniqueSessions > 0
      ? Math.round((singlePageSessions / uniqueSessions) * 100)
      : 0;

    // 3. Répartition Journalière (Daily Stats)
    const dailyMap = {};
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

    // 4. Canaux d'Acquisition & SEO (Recherche Google, Direct, Réseaux sociaux, etc.)
    const channelStats = {
      organic: { label: 'Recherche Google / SEO', count: 0, color: '#10b981', icon: 'Search' },
      direct: { label: 'Trafic Direct / Notoriété', count: 0, color: '#6366f1', icon: 'Globe' },
      social: { label: 'Réseaux Sociaux (LinkedIn, etc.)', count: 0, color: '#0ea5e9', icon: 'Share2' },
      referral: { label: 'Sites Référents & Partenaires', count: 0, color: '#f59e0b', icon: 'ExternalLink' },
    };

    const searchEnginesMap = {};

    allViews.forEach(v => {
      const ref = (v.referrer_domain || '').toLowerCase();
      if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo') || ref.includes('duckduckgo') || ref.includes('qwant') || ref.includes('ecosia') || ref.includes('seo')) {
        channelStats.organic.count += 1;
        const seName = ref.includes('google') ? 'Google' : ref.includes('bing') ? 'Bing' : 'Autre Moteur';
        searchEnginesMap[seName] = (searchEnginesMap[seName] || 0) + 1;
      } else if (ref.includes('linkedin') || ref.includes('facebook') || ref.includes('instagram') || ref.includes('twitter') || ref.includes('x.com') || ref.includes('tiktok') || ref.includes('telegram') || ref.includes('whatsapp')) {
        channelStats.social.count += 1;
      } else if (ref.includes('direct') || !ref || ref === 'direct / aucun' || ref === 'direct / autre') {
        channelStats.direct.count += 1;
      } else {
        channelStats.referral.count += 1;
      }
    });

    // 5. Entonnoir de Conversion (Funnel)
    const highIntentSessions = new Set();
    const registerSessions = new Set();

    allViews.forEach(v => {
      const p = (v.path || '').toLowerCase();
      if (p.includes('/tarifs') || p.includes('/candidats-disponibles') || p.includes('/offres') || p.includes('/comment-ca-marche') || p.includes('/chauffeurs') || p.includes('/entreprises')) {
        highIntentSessions.add(v.session_id);
      }
      if (p.includes('/register') || p.includes('/login')) {
        registerSessions.add(v.session_id);
      }
    });

    const newSignupsCount = (periodCandidates?.length || 0) + (periodCompanies?.length || 0);

    const funnel = {
      step1_visitors: uniqueSessions,
      step2_intent: highIntentSessions.size,
      step3_register: registerSessions.size,
      step4_signed_up: newSignupsCount,
      intentRate: uniqueSessions > 0 ? Math.round((highIntentSessions.size / uniqueSessions) * 100) : 0,
      registerRate: uniqueSessions > 0 ? Math.round((registerSessions.size / uniqueSessions) * 100) : 0,
      overallConversionRate: uniqueSessions > 0 ? ((newSignupsCount / uniqueSessions) * 100).toFixed(1) : '0.0',
    };

    // 6. Pages les plus vues & Landing Pages SEO
    const pageMap = {};
    allViews.forEach(v => {
      const p = v.path || '/';
      if (!pageMap[p]) {
        pageMap[p] = { path: p, title: v.page_title || p, views: 0, sessions: new Set(), organicViews: 0 };
      }
      pageMap[p].views += 1;
      pageMap[p].sessions.add(v.session_id);
      const ref = (v.referrer_domain || '').toLowerCase();
      if (ref.includes('google') || ref.includes('bing') || ref.includes('seo')) {
        pageMap[p].organicViews += 1;
      }
    });

    const topPages = Object.values(pageMap)
      .map(p => ({
        path: p.path,
        title: p.title,
        views: p.views,
        uniques: p.sessions.size,
        organicViews: p.organicViews,
        organicPct: p.views > 0 ? Math.round((p.organicViews / p.views) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    // 7. Provenance Référents
    const referrerMap = {};
    allViews.forEach(v => {
      const ref = v.referrer_domain || 'Direct / Notoriété';
      if (!referrerMap[ref]) {
        referrerMap[ref] = { domain: ref, count: 0 };
      }
      referrerMap[ref].count += 1;
    });

    const topReferrers = Object.values(referrerMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 8. Répartition Appareils
    const deviceMap = { desktop: 0, mobile: 0, tablet: 0 };
    allViews.forEach(v => {
      const dev = v.device_type || 'desktop';
      if (deviceMap[dev] !== undefined) {
        deviceMap[dev] += 1;
      } else {
        deviceMap.desktop += 1;
      }
    });

    // 9. Distribution Horaire
    const hourlyMap = Array(24).fill(0);
    allViews.forEach(v => {
      const hour = new Date(v.created_at).getHours();
      hourlyMap[hour] += 1;
    });

    // 10. Répartition Géographique (France, Belgique, Suisse, Luxembourg)
    const geoBreakdown = {
      france: { name: 'France', flag: '🇫🇷', candidatesCount: (periodCandidates || []).filter(c => c.country === 'FR').length },
      belgium: { name: 'Belgique', flag: '🇧🇪', candidatesCount: (periodCandidates || []).filter(c => c.country === 'BE').length },
      switzerland: { name: 'Suisse', flag: '🇨🇭', candidatesCount: (periodCandidates || []).filter(c => c.country === 'CH').length },
      luxembourg: { name: 'Luxembourg', flag: '🇱🇺', candidatesCount: (periodCandidates || []).filter(c => c.country === 'LU').length },
    };

    return NextResponse.json({
      timeframe,
      kpis: {
        totalViews,
        viewsGrowth,
        uniqueSessions,
        sessionsGrowth,
        todayCount,
        todayUniques,
        estimatedBounceRate,
        pagesPerSession: uniqueSessions > 0 ? (totalViews / uniqueSessions).toFixed(1) : '1.0',
      },
      channels: channelStats,
      searchEngines: searchEnginesMap,
      funnel,
      dailyStats,
      topPages,
      topReferrers,
      devices: deviceMap,
      hourlyDistribution: hourlyMap,
      geoBreakdown,
    });
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
