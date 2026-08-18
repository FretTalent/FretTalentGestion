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
  Clock,
  ArrowUpRight,
  RefreshCw,
  Search,
  Download,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
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
    devices = {},
    geoBreakdown = {},
    hourlyDistribution = [],
  } = statsData || {};

  const totalViews = kpis.totalViews ?? kpis.pageViews ?? 0;
  const viewsGrowth = kpis.viewsGrowth ?? kpis.pageViewsGrowth ?? 0;
  const uniqueVisitors = kpis.uniqueSessions ?? kpis.uniqueVisitors ?? 0;
  const organicViews = channels.organic?.count ?? 0;
  const organicRate = totalViews > 0 ? Math.round((organicViews / totalViews) * 100) : (kpis.organicRate ?? 0);
  const conversionRate = funnel.overallConversionRate ?? kpis.conversionRate ?? '0.0';

  const totalDeviceCount = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0) || 1;
  const desktopPct = Math.round(((devices.desktop || 0) / totalDeviceCount) * 100);
  const mobilePct = Math.round(((devices.mobile || 0) / totalDeviceCount) * 100);

  const chartPoints = useMemo(() => {
    const isToday = timeframe === 'today';
    const width = 500;
    const height = 140;

    const makePath = (pts) => {
      if (!pts || pts.length === 0) return '';
      if (pts.length === 1) return `M 0 ${pts[0].y} L ${width} ${pts[0].y}`;
      return pts.reduce((acc, p, i, a) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = a[i - 1];
        const cp1x = prev.x + (p.x - prev.x) / 2;
        return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
      }, '');
    };

    if (isToday) {
      const hours = Array.isArray(hourlyDistribution) && hourlyDistribution.length === 24
        ? hourlyDistribution
        : Array(24).fill(0);
      const maxVal = Math.max(...hours, 5);
      const step = width / 23;

      const pointsViews = hours.map((count, hour) => {
        const x = hour * step;
        const y = height - (count / maxVal) * (height - 30) - 15;
        return { x, y, label: `${hour}h`, val: count };
      });

      return {
        pathViews: makePath(pointsViews),
        pathUniques: '',
        pointsViews,
        pointsUniques: [],
        labels: ['00h', '04h', '08h', '12h', '16h', '20h', '23h'],
        maxVal,
      };
    }

    if (!dailyStats || dailyStats.length === 0) {
      return { pathViews: '', pathUniques: '', pointsViews: [], pointsUniques: [], labels: [], maxVal: 5 };
    }

    const maxVal = Math.max(...dailyStats.map(d => Math.max(d.views || 0, d.uniques || 0)), 5);
    const step = dailyStats.length > 1 ? width / (dailyStats.length - 1) : width;

    const pointsViews = dailyStats.map((d, i) => {
      const x = i * step;
      const y = height - ((d.views || 0) / maxVal) * (height - 30) - 15;
      return { x, y, date: d.date, val: d.views };
    });

    const pointsUniques = dailyStats.map((d, i) => {
      const x = i * step;
      const y = height - ((d.uniques || 0) / maxVal) * (height - 30) - 15;
      return { x, y, date: d.date, val: d.uniques };
    });

    return {
      pathViews: makePath(pointsViews),
      pathUniques: makePath(pointsUniques),
      pointsViews,
      pointsUniques,
      labels: dailyStats.slice(-7).map(d => d.date?.slice(5) || ''),
      maxVal,
    };
  }, [timeframe, dailyStats, hourlyDistribution]);

  const franceCount = geoBreakdown.france?.candidatesCount ?? 0;
  const belgiumCount = geoBreakdown.belgium?.candidatesCount ?? 0;
  const luxembourgCount = geoBreakdown.luxembourg?.candidatesCount ?? 0;
  const switzerlandCount = geoBreakdown.switzerland?.candidatesCount ?? 0;

  if (loading && !statsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Chargement des analyses de trafic...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. HEADER HERO STATS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#FF7A00] text-[11px] font-black uppercase tracking-wider border border-orange-200/60 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Audience & SEO Analytics
            </span>
            <span className="text-xs font-bold text-slate-600">• Données consolidées en temps réel</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Performance & Trafic du Site
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Mesure des consultations de profil, canaux d'acquisition de chauffeurs et entonnoir de conversion entreprises.
          </p>
        </div>

        {/* Périodes & Actions */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {[
              { id: 'today', label: "Aujourd'hui" },
              { id: '7d', label: '7 Jours' },
              { id: '30d', label: '30 Jours' },
              { id: 'all', label: 'Tout' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setTimeframe(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeframe === p.id
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-[#E53935] rounded-2xl text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 2. KPI CARDS : 4 INDICATEURS CLÉS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 : Pages Vues Totales */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Pages Vues
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalViews.toLocaleString('fr-FR')}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
                viewsGrowth >= 0 ? 'bg-emerald-50 text-[#43A047]' : 'bg-red-50 text-[#E53935]'
              }`}>
                {viewsGrowth >= 0 ? '+' : ''}{viewsGrowth}% vs P-1
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2 : Visiteurs Uniques */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Visiteurs Uniques
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {uniqueVisitors.toLocaleString('fr-FR')}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-700">
                Sessions actives
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3 : Trafic Organique SEO */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Part SEO Moteurs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#43A047] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {organicRate}%
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                {organicViews.toLocaleString('fr-FR')} vues naturelles
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4 : Taux de Conversion */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Taux Conversion
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {conversionRate}%
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                Inscriptions & Achats
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. GRAPHIQUE CENTRAL D'ÉVOLUTION + CANAUX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COURBE TEMPORELLE DE TRAFIC (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {timeframe === 'today' ? "Activité par Heure (Aujourd'hui)" : 'Évolution Temporelle du Trafic'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Courbe dynamique des consultations pages & sessions uniques.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#FF7A00]">
                <span className="w-3 h-1 bg-[#FF7A00] rounded-full" /> Vues
              </span>
              {timeframe !== 'today' && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-1 bg-slate-400 rounded-full" /> Uniques
                </span>
              )}
            </div>
          </div>

          {/* Canvas SVG de la courbe */}
          <div className="h-52 w-full relative flex items-end pt-4">
            <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

              {chartPoints.pathViews && (
                <path
                  d={chartPoints.pathViews}
                  fill="none"
                  stroke="#FF7A00"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {chartPoints.pathUniques && (
                <path
                  d={chartPoints.pathUniques}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}

              {chartPoints.pointsViews?.map((pt, idx) => (
                <circle key={`v-${idx}`} cx={pt.x} cy={pt.y} r="3.5" fill="#FF7A00" />
              ))}
            </svg>
          </div>

          <div className="flex justify-between text-xs text-slate-600 font-mono pt-3 border-t border-slate-100">
            {chartPoints.labels?.map((lbl, i) => (
              <span key={i}>{lbl}</span>
            ))}
          </div>
        </div>

        {/* CANAUX D'ACQUISITION & DEVICES (1/3) */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Canaux d'Acquisition
            </h3>

            <div className="space-y-3 pt-1">
              {[
                { label: 'SEO Google & Moteurs', val: channels.organic?.count || 0, color: 'bg-[#FF7A00]' },
                { label: 'Accès Direct & Liens Mails', val: channels.direct?.count || 0, color: 'bg-amber-500' },
                { label: 'Réseaux Sociaux', val: channels.social?.count || 0, color: 'bg-blue-500' },
                { label: 'Partenaires & Référents', val: channels.referral?.count || 0, color: 'bg-emerald-500' },
              ].map((item, idx) => {
                const maxChannel = Math.max(...Object.values(channels).map(c => c.count || 0), 1);
                const pct = Math.max(10, Math.round((item.val / maxChannel) * 100));
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono text-slate-900">{item.val}</span>
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
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Répartition Appareils
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-[#FF7A00]" /> Ordinateurs ({desktopPct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-slate-600" /> Mobiles ({mobilePct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-[#FF7A00] h-full" style={{ width: `${desktopPct}%` }} />
                <div className="bg-slate-700 h-full" style={{ width: `${mobilePct}%` }} />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 4. TABLEAU DES PAGES LES PLUS CONSULTÉES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Classement des Pages les Plus Visitées
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Audience par URL, titres de pages et volume de trafic organique.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {topPages.length} pages indexées
          </span>
        </div>

        {topPages.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600">
            Aucune visite enregistrée sur cette période.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">URL de la Page</th>
                  <th className="py-3 px-3">Titre</th>
                  <th className="py-3 px-3 text-center">Vues Totales</th>
                  <th className="py-3 px-3 text-center">Visiteurs Uniques</th>
                  <th className="py-3 px-3 text-center">Trafic SEO</th>
                  <th className="py-3 px-3 text-right">Lien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topPages.slice(0, 10).map((page, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 truncate max-w-[200px]">
                      {page.path}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 truncate max-w-[240px]">
                      {page.title || 'Page FretTalent'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                      {page.views}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#FF7A00]">
                      {page.uniques}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {page.organicViews || 0}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
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
