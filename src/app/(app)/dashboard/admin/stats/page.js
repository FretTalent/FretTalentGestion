'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Download,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  UserCheck,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Key,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStatsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchStats = async (selectedTimeframe = timeframe) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/admin/stats?timeframe=${selectedTimeframe}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors du chargement des statistiques');
      }

      const data = await res.json();
      setStatsData(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(timeframe);
  }, [timeframe]);

  const handleExportCSV = () => {
    if (!statsData || !statsData.topPages) {
      toast.error('Aucune donnée à exporter.');
      return;
    }

    const rows = [
      ['Page URL', 'Titre de la Page', 'Vues Totales', 'Visiteurs Uniques', 'Vues SEO Organiques'],
      ...statsData.topPages.map((p) => [
        `"${p.path}"`,
        `"${p.title || ''}"`,
        p.views,
        p.uniques,
        p.organicViews || 0,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `frettalent_stats_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export CSV téléchargé !');
  };

  const {
    kpis = {},
    channels = {},
    funnel = {},
    dailyStats = [],
    topPages = [],
    topReferrers = [],
    devices = {},
    geoBreakdown = {},
  } = statsData || {};

  const totalDeviceCount = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0) || 1;
  const desktopPct = Math.round(((devices.desktop || 0) / totalDeviceCount) * 100);
  const mobilePct = Math.round(((devices.mobile || 0) / totalDeviceCount) * 100);

  // SVG Chart path calculation for daily stats
  const chartPoints = useMemo(() => {
    if (!dailyStats || dailyStats.length === 0) return { pathViews: '', pathUniques: '', points: [] };
    const maxVal = Math.max(...dailyStats.map(d => Math.max(d.views || 0, d.uniques || 0)), 10);
    const width = 500;
    const height = 140;
    const step = dailyStats.length > 1 ? width / (dailyStats.length - 1) : width;

    const pointsViews = dailyStats.map((d, i) => {
      const x = i * step;
      const y = height - ((d.views || 0) / maxVal) * (height - 20) - 10;
      return { x, y, date: d.date, val: d.views };
    });

    const pointsUniques = dailyStats.map((d, i) => {
      const x = i * step;
      const y = height - ((d.uniques || 0) / maxVal) * (height - 20) - 10;
      return { x, y, date: d.date, val: d.uniques };
    });

    const makePath = (pts) => {
      if (pts.length === 0) return '';
      return pts.reduce((acc, p, i, a) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = a[i - 1];
        const cp1x = prev.x + (p.x - prev.x) / 2;
        return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
      }, '');
    };

    return {
      pathViews: makePath(pointsViews),
      pathUniques: makePath(pointsUniques),
      pointsViews,
      pointsUniques,
      maxVal,
    };
  }, [dailyStats]);

  if (loading && !statsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 bg-slate-100/60 rounded-xl p-8">
        <RefreshCw className="h-8 w-8 text-slate-700 animate-spin" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
          Calcul des statistiques d'audience et SEO en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* 1. EN-TÊTE SUPÉRIEURE DE PILOTAGE ANALYTICS */}
      <div className="bg-slate-950 text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-black text-[11px] text-white">
              ST
            </div>
            <span className="font-bold text-xs text-slate-200">
              Audience & Trafic Web
            </span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-none">
            Analytics SEO & Canaux d'Acquisition
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En Direct (Sans Cookie Tiers)
          </span>
        </div>

        {/* Barre d'outils rapides */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => fetchStats(timeframe)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Actualiser les données"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 2. BANDEAU DE CONTEXTE & SÉLECTEUR DE PÉRIODE */}
      <div className="bg-white px-4 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-1 text-slate-400">
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="italic text-slate-500 truncate text-[11px] sm:text-xs">
            Mesure interne de l'audience, positions SEO, consultations des CV et entonnoir de conversion.
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: '7d', label: '7 Jours' },
            { id: '30d', label: '30 Jours' },
            { id: 'all', label: 'Toutes Données' },
          ].map(period => (
            <button
              key={period.id}
              onClick={() => setTimeframe(period.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                timeframe === period.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 3. GRILLE MODULAIRE ANALYTICS (STYLE POWER BI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* === COLONNE GAUCHE : HERO KPIS SCORECARDS (3 COLS) === */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* KPI 1 : Pages Vues Totales */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Pages Vues Totales</span>
              <Eye className="h-4 w-4 text-teal-600" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-950 mt-3 tracking-tight font-mono">
              {(kpis.pageViews || 0).toLocaleString('fr-FR')}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Progression vs N-1 :</span>
              <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                (kpis.pageViewsGrowth || 0) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {(kpis.pageViewsGrowth || 0) >= 0 ? '+' : ''}{kpis.pageViewsGrowth || 0}%
              </span>
            </div>
          </div>

          {/* KPI 2 : Visiteurs Uniques */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Visiteurs Uniques</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-950 mt-3 tracking-tight font-mono">
              {(kpis.uniqueVisitors || 0).toLocaleString('fr-FR')}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Nouveaux utilisateurs :</span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                {kpis.uniqueVisitors || 0} profils
              </span>
            </div>
          </div>

          {/* KPI 3 : Trafic Organique SEO */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Part du Trafic SEO</span>
              <Globe className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-950 mt-3 tracking-tight font-mono">
              {kpis.organicRate || 0}%
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Moteurs Google & Bing :</span>
              <span className="font-bold text-slate-900">
                {(kpis.organicViews || 0).toLocaleString('fr-FR')} vues
              </span>
            </div>
          </div>

          {/* KPI 4 : Taux de Conversion */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Taux de Transformation</span>
              <Target className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-950 mt-3 tracking-tight font-mono">
              {kpis.conversionRate || 0}%
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2">
              Ratio des visiteurs qui finalisent une inscription ou un déblocage.
            </p>
          </div>

        </div>

        {/* === TUILES CENTRALES & DROITE : VISUALISATIONS (9 COLS) === */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* LIGNE 1 : COURBE TEMPORELLE + HISTOGRAMME DES CANAUX */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* TUILE 1 : COURBE D'ÉVOLUTION TEMPORELLE (7 COLS) */}
            <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Évolution Quotidienne du Trafic</span>
                  <span className="text-slate-400 font-mono">Vues vs Visiteurs</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-teal-500 rounded" /> Pages Vues
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-slate-700 rounded" /> Visiteurs Uniques
                  </span>
                </div>
              </div>

              {/* Courbe SVG dynamique */}
              <div className="h-44 w-full relative flex items-end">
                <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                  {/* Lignes de repère */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Courbe Pages Vues */}
                  {chartPoints.pathViews && (
                    <path
                      d={chartPoints.pathViews}
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Courbe Visiteurs Uniques */}
                  {chartPoints.pathUniques && (
                    <path
                      d={chartPoints.pathUniques}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Points */}
                  {chartPoints.pointsViews?.map((pt, idx) => (
                    <circle key={`v-${idx}`} cx={pt.x} cy={pt.y} r="3.5" fill="#0d9488" />
                  ))}
                </svg>
              </div>

              {/* Axe X Dates */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                {dailyStats.slice(-7).map((d, i) => (
                  <span key={i}>{d.date?.slice(5)}</span>
                ))}
              </div>
            </div>

            {/* TUILE 2 : CANAUX D'ACQUISITION (5 COLS) */}
            <div className="md:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <span>Canaux d'Acquisition</span>
                  <span className="text-[10px] text-slate-400">Volume</span>
                </div>
              </div>

              {/* Barres horizontales des canaux */}
              <div className="space-y-2.5">
                {[
                  { label: 'SEO Google & Moteurs', val: channels.organic?.count || 0, color: 'bg-teal-600' },
                  { label: 'Accès Direct & Favoris', val: channels.direct?.count || 0, color: 'bg-teal-500' },
                  { label: 'Réseaux Sociaux (LinkedIn/FB)', val: channels.social?.count || 0, color: 'bg-teal-400' },
                  { label: 'Sites Référents & Partenaires', val: channels.referral?.count || 0, color: 'bg-teal-300' },
                  { label: 'Campagnes & E-mails', val: channels.campaign?.count || 0, color: 'bg-slate-400' },
                ].map((item, idx) => {
                  const maxChannel = Math.max(...Object.values(channels).map(c => c.count || 0), 1);
                  const pct = Math.max(10, Math.round((item.val / maxChannel) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 text-[11px]">{item.label}</span>
                        <span className="font-mono text-slate-900 font-bold text-[11px]">{item.val}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-mono text-right">
                Répartition des sources de trafic qualifié
              </div>
            </div>

          </div>

          {/* LIGNE 2 : ENTONNOIR DE CONVERSION + RÉPARTITION APPAREILS & PAYS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* TUILE 3 : ENTONNOIR DE CONVERSION (6 COLS) */}
            <div className="md:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                <span>Entonnoir de Conversion Recrutement</span>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  Tunnel Recruteur
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { step: '1. Visite Page d\'Accueil', count: funnel.visitors || 0, pct: '100%', color: 'bg-slate-900' },
                  { step: '2. Recherche Chauffeurs / Offres', count: funnel.browsed || 0, pct: '62%', color: 'bg-teal-700' },
                  { step: '3. Consultation Fiche Chauffeur', count: funnel.viewedProfiles || 0, pct: '38%', color: 'bg-teal-500' },
                  { step: '4. Déblocage de Contact (2€ / Pro)', count: funnel.unlocked || 0, pct: `${kpis.conversionRate || 0}%`, color: 'bg-emerald-600' },
                ].map((st, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-[11px] block">{st.step}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{st.count} actions enregistrées</span>
                    </div>
                    <span className={`text-white font-mono font-black text-[11px] px-2 py-0.5 rounded ${st.color}`}>
                      {st.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TUILE 4 : APPAREILS & PAYS (6 COLS) */}
            <div className="md:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <span>Répartition Appareils & Pays</span>
                  <span className="text-[10px] text-slate-400">Desktop vs Mobile</span>
                </div>

                {/* Barre de répartition Appareils */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Monitor className="h-3.5 w-3.5 text-teal-600" /> Ordinateur ({desktopPct}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="h-3.5 w-3.5 text-slate-600" /> Mobile ({mobilePct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-teal-600 h-full" style={{ width: `${desktopPct}%` }} />
                    <div className="bg-slate-700 h-full" style={{ width: `${mobilePct}%` }} />
                  </div>
                </div>

                {/* Grille Pays */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="font-bold text-teal-950">🇫🇷 France</span>
                    <span className="font-mono font-black text-teal-700">{geoBreakdown.FR || '78%'}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="font-bold text-rose-950">🇧🇪 Belgique</span>
                    <span className="font-mono font-black text-rose-700">{geoBreakdown.BE || '14%'}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="font-bold text-amber-950">🇱🇺 Luxembourg</span>
                    <span className="font-mono font-black text-amber-700">{geoBreakdown.LU || '5%'}</span>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="font-bold text-slate-950">🇨🇭 Suisse</span>
                    <span className="font-mono font-black text-slate-700">{geoBreakdown.CH || '3%'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-mono text-right">
                Mesure géographique sans collecte de données personnelles
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 4. DATAGRID DES PAGES LES PLUS CONSULTÉES */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Audience Par Page URL
              </span>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {topPages.length} pages suivies
              </span>
            </div>
            <h3 className="font-black text-slate-950 text-base mt-0.5">
              Classement des Pages les Plus Visitées & Efficacité SEO
            </h3>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Exporter Tableau CSV</span>
          </button>
        </div>

        {topPages.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Aucune visite enregistrée sur cette période.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">URL de la Page</th>
                  <th className="py-3 px-4">Titre de la Page</th>
                  <th className="py-3 px-4 text-center">Vues Totales</th>
                  <th className="py-3 px-4 text-center">Visiteurs Uniques</th>
                  <th className="py-3 px-4 text-center">Trafic SEO</th>
                  <th className="py-3 px-4 text-right">Lien Direct</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topPages.slice(0, 15).map((page, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                      {page.path}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {page.title || 'Page FretTalent'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900">
                      {page.views}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-teal-700">
                      {page.uniques}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        {page.organicViews || 0} vues
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-semibold p-1 hover:bg-slate-100 rounded"
                        title="Ouvrir la page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
