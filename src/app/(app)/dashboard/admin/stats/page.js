'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Share2,
  ExternalLink,
  Target,
  UserCheck,
  Zap,
  Sparkles,
  Download,
  CheckCircle2,
  ShieldCheck,
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
      ['Page URL', 'Titre', 'Vues Totales', 'Visiteurs Uniques', 'Vues Organiques SEO'],
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

  if (loading && !statsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
          Calcul des statistiques d'audience et SEO en cours...
        </p>
      </div>
    );
  }

  const {
    kpis = {},
    channels = {},
    funnel = {},
    dailyStats = [],
    topPages = [],
    topReferrers = [],
    devices = {},
    hourlyDistribution = [],
    geoBreakdown = {},
  } = statsData || {};

  const totalDeviceCount = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0);
  const totalChannelViews = Object.values(channels).reduce((acc, c) => acc + (c.count || 0), 0) || 1;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* 1. EN-TÊTE & SÉLECTEUR DE PÉRIODE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-600 border border-orange-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-orange-500" />
              SEO & Audience Analytics
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Temps Réel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Performance & Trafic FretTalent
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Suivi des canaux d'acquisition, moteurs de recherche SEO, conversion et visites géolocalisées.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            {[
              { id: 'today', label: "Aujourd'hui" },
              { id: '7d', label: '7 jours' },
              { id: '30d', label: '30 jours' },
              { id: 'all', label: 'Tout' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeframe === t.id
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Exporter les statistiques en CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => fetchStats(timeframe)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer"
            title="Actualiser les métriques"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 2. GRILLE DE 4 HERO KPIS AVEC COMPARATIF N-1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Pages Vues */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Pages Vues Totales</span>
            <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950">{kpis?.totalViews || 0}</span>
            {kpis?.viewsGrowth !== undefined && timeframe !== 'all' && (
              <span
                className={`inline-flex items-center text-[11px] font-black px-2 py-0.5 rounded-full ${
                  kpis.viewsGrowth >= 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {kpis.viewsGrowth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {kpis.viewsGrowth >= 0 ? `+${kpis.viewsGrowth}%` : `${kpis.viewsGrowth}%`}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Aujourd'hui : <strong className="text-slate-900">{kpis?.todayCount || 0}</strong> vues
          </p>
        </div>

        {/* Visiteurs Uniques */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Visiteurs Uniques</span>
            <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950">{kpis?.uniqueSessions || 0}</span>
            {kpis?.sessionsGrowth !== undefined && timeframe !== 'all' && (
              <span
                className={`inline-flex items-center text-[11px] font-black px-2 py-0.5 rounded-full ${
                  kpis.sessionsGrowth >= 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {kpis.sessionsGrowth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {kpis.sessionsGrowth >= 0 ? `+${kpis.sessionsGrowth}%` : `${kpis.sessionsGrowth}%`}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Aujourd'hui : <strong className="text-slate-900">{kpis?.todayUniques || 0}</strong> uniques
          </p>
        </div>

        {/* Pages / Visiteur & Taux de Rebond */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Engagement & Rebond</span>
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950">{kpis?.pagesPerSession || '1.0'}</span>
            <span className="text-xs text-slate-400 font-bold">pages / session</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Taux de rebond estimé : <strong className="text-slate-900">{kpis?.estimatedBounceRate || 0}%</strong>
          </p>
        </div>

        {/* Taux de Conversion Global */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Conversion Globale</span>
            <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950">{funnel?.overallConversionRate || '0.0'}%</span>
            <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
              {funnel?.step4_signed_up || 0} inscrits
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Visiteurs convertis en comptes créés
          </p>
        </div>

      </div>

      {/* 3. ENTONNOIR DE CONVERSION EN DIRECT (FUNNEL) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Target className="h-3.5 w-3.5" />
              Entonnoir de Conversion FretTalent
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Tunnel de Transformation Visiteur ➔ Inscription
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Mesure en temps réel du passage des visiteurs à la création de compte recruteur et chauffeur.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Étape 1 */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>1. Visites Globales</span>
              <span className="text-white font-black text-xs">100%</span>
            </div>
            <div className="text-3xl font-black text-white">{funnel?.step1_visitors || 0}</div>
            <p className="text-[11px] text-slate-400">Total des sessions uniques entrantes</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-blue-400 h-full w-full rounded-full" />
            </div>
          </div>

          {/* Étape 2 */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>2. Intérêt Métier</span>
              <span className="text-orange-400 font-black text-xs">{funnel?.intentRate || 0}%</span>
            </div>
            <div className="text-3xl font-black text-white">{funnel?.step2_intent || 0}</div>
            <p className="text-[11px] text-slate-400">Pages Tarifs, Chauffeurs, Offres, Carte</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-orange-400 h-full rounded-full" style={{ width: `${Math.min(100, funnel?.intentRate || 0)}%` }} />
            </div>
          </div>

          {/* Étape 3 */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>3. Entrée Inscription</span>
              <span className="text-purple-400 font-black text-xs">{funnel?.registerRate || 0}%</span>
            </div>
            <div className="text-3xl font-black text-white">{funnel?.step3_register || 0}</div>
            <p className="text-[11px] text-slate-400">Pages /register et formulaires</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-purple-400 h-full rounded-full" style={{ width: `${Math.min(100, funnel?.registerRate || 0)}%` }} />
            </div>
          </div>

          {/* Étape 4 */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>4. Comptes Créés 🎉</span>
              <span className="text-emerald-400 font-black text-xs">{funnel?.overallConversionRate || 0}%</span>
            </div>
            <div className="text-3xl font-black text-emerald-400">{funnel?.step4_signed_up || 0}</div>
            <p className="text-[11px] text-emerald-300">Nouveaux Chauffeurs & Entreprises</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, parseFloat(funnel?.overallConversionRate || 0) * 5)}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* 4. CANAUX D'ACQUISITION & SEO (GOOGLE VS DIRECT VS RÉSEAUX) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Répartition Canaux d'Acquisition (1/3) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-600" />
              <h3 className="font-black text-slate-950 text-base">Canaux d'Acquisition & SEO</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Origine des clics sur FretTalent</p>
          </div>

          <div className="space-y-4">
            {Object.entries(channels).map(([k, c], i) => {
              const pct = Math.round((c.count / totalChannelViews) * 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </span>
                    <span className="font-black text-slate-950">{c.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Badge SEO Santé */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-black">SEO Indexé & Validé</p>
              <p className="text-[11px] text-emerald-700">Sitemap XML, Balises OpenGraph & Données structurées actives.</p>
            </div>
          </div>
        </div>

        {/* Graphique Fréquentation Journalière (2/3) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <h3 className="font-black text-slate-950 text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Évolution Journalière du Trafic
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Vues totales vs Visiteurs uniques par jour</p>
            </div>
            {(() => {
              const maxViews = Math.max(...(dailyStats || []).map((d) => d.views), 0);
              const peakDay = (dailyStats || []).find((d) => d.views === maxViews && maxViews > 0);

              return (
                peakDay && (
                  <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-black border border-orange-200 flex items-center gap-1">
                    🔥 Record : {peakDay.views} vues ({peakDay.date})
                  </span>
                )
              );
            })()}
          </div>

          {dailyStats.length === 0 || dailyStats.every((d) => d.views === 0) ? (
            <div className="py-14 text-center text-slate-400 text-sm space-y-1">
              <p className="font-semibold text-slate-600">Aucune donnée de visite pour cette période.</p>
              <p className="text-xs">Sélectionnez "30 jours" ou "Tout" pour explorer l'historique.</p>
            </div>
          ) : (
            <div className="pt-4 pb-2">
              <div className="h-56 flex items-end gap-2 sm:gap-3 overflow-x-auto pb-2">
                {dailyStats.map((item, idx) => {
                  const maxViews = Math.max(...dailyStats.map((d) => d.views), 1);
                  const heightPercent = item.views > 0 ? Math.max(14, Math.round((item.views / maxViews) * 100)) : 0;
                  const isPeak = item.views === maxViews && maxViews > 0;

                  const parts = item.date.split('-');
                  const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date;

                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[36px] flex flex-col items-center justify-end h-full gap-2 group relative"
                    >
                      {/* Tooltip au survol */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] py-1.5 px-2.5 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        <div className="font-bold">{item.date}</div>
                        <div>
                          {item.views} vue{item.views > 1 ? 's' : ''} ({item.uniques} unique{item.uniques > 1 ? 's' : ''})
                        </div>
                      </div>

                      {/* Nombre de vues au-dessus de la barre */}
                      {item.views > 0 ? (
                        <span className={`text-[10px] font-black ${isPeak ? 'text-orange-600' : 'text-slate-700'}`}>
                          {item.views}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-300 font-semibold">0</span>
                      )}

                      {/* Barre du graphique */}
                      <div className="w-full bg-slate-100 rounded-xl h-full flex items-end overflow-hidden">
                        {item.views > 0 ? (
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-xl transition-all ${
                              isPeak
                                ? 'bg-gradient-to-t from-orange-600 to-amber-400 group-hover:from-orange-700 group-hover:to-amber-500'
                                : 'bg-gradient-to-t from-orange-500 to-amber-300 group-hover:from-orange-600 group-hover:to-amber-400'
                            }`}
                          />
                        ) : (
                          <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                        )}
                      </div>

                      {/* Date */}
                      <span
                        className={`text-[10px] font-semibold truncate max-w-full ${
                          isPeak ? 'text-orange-600 font-bold' : item.views > 0 ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {formattedDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 5. PAGES LES PLUS VUES & RÉPARTITION GÉOGRAPHIQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Pages & SEO Landing Pages */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <h3 className="font-black text-slate-950 text-base">Pages & Landing Pages SEO</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">Vues / Part SEO</span>
          </div>

          <div className="space-y-3">
            {topPages.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucune page vue enregistrée.</p>
            ) : (
              topPages.map((page, i) => {
                const maxP = topPages[0]?.views || 1;
                const pct = Math.round((page.views / maxP) * 100);

                return (
                  <div key={i} className="space-y-1 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 truncate max-w-[240px] sm:max-w-[320px]">
                        <span className="text-slate-400 font-mono text-[11px]">#{i + 1}</span>
                        <span className="text-slate-900 truncate">{page.path}</span>
                        {page.organicViews > 0 && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                            SEO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-950 font-black">{page.views} vues</span>
                        <span className="text-slate-400 text-[11px]">({page.uniques} u.)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Provenance des Clics & Référents */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <h3 className="font-black text-slate-950 text-base">Provenance des Clics</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">Sites Référents</span>
          </div>

          <div className="space-y-3">
            {topReferrers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucune provenance enregistrée.</p>
            ) : (
              topReferrers.map((ref, i) => {
                const totalR = topReferrers.reduce((acc, r) => acc + r.count, 0) || 1;
                const pct = Math.round((ref.count / totalR) * 100);

                return (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black text-slate-700 border border-slate-200 shadow-xs">
                        {ref.domain.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{ref.domain}</p>
                        <p className="text-[11px] text-slate-400">{pct}% du trafic global</p>
                      </div>
                    </div>
                    <span className="font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                      {ref.count} clics
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 6. APPAREILS & HEURES DE FRÉQUENTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Répartition Appareils */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Monitor className="h-5 w-5 text-purple-500" />
            <h3 className="font-black text-slate-950 text-base">Type d'Appareils</h3>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { type: 'Ordinateur', count: devices.desktop || 0, icon: Monitor, color: 'bg-purple-500' },
              { type: 'Mobile / Smartphone', count: devices.mobile || 0, icon: Smartphone, color: 'bg-emerald-500' },
              { type: 'Tablette', count: devices.tablet || 0, icon: Tablet, color: 'bg-blue-500' },
            ].map((d, idx) => {
              const pct = totalDeviceCount > 0 ? Math.round((d.count / totalDeviceCount) * 100) : 0;
              const Icon = d.icon;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Icon className="h-4 w-4 text-slate-500" />
                      {d.type}
                    </div>
                    <span className="font-black text-slate-950">{d.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${d.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heures de pointe (2/3) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              <h3 className="font-black text-slate-950 text-base">Fréquentation par Heure de la Journée</h3>
            </div>
            {(() => {
              const maxH = Math.max(...(hourlyDistribution || [0]), 0);
              const peakH = hourlyDistribution ? hourlyDistribution.indexOf(maxH) : -1;
              return (
                maxH > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black border border-emerald-200 flex items-center gap-1">
                    🔥 Pic à {peakH}h00 ({maxH} visites)
                  </span>
                )
              );
            })()}
          </div>

          <div className="pt-2">
            <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2">
              {hourlyDistribution.map((count, hour) => {
                const maxH = Math.max(...hourlyDistribution, 1);
                const hPct = count > 0 ? Math.max(14, Math.round((count / maxH) * 100)) : 0;
                const isPeak = count === maxH && maxH > 0;

                return (
                  <div
                    key={hour}
                    className="flex-1 min-w-[12px] flex flex-col items-center justify-end h-full gap-1.5 group relative"
                  >
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                      <span className="font-bold">{hour}h00 :</span> {count} visite{count > 1 ? 's' : ''}
                    </div>

                    <div className="w-full bg-slate-100 rounded-t h-full flex items-end overflow-hidden">
                      {count > 0 ? (
                        <div
                          style={{ height: `${hPct}%` }}
                          className={`w-full rounded-t transition-all ${
                            isPeak
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-700 group-hover:to-teal-500'
                              : 'bg-emerald-500/85 group-hover:bg-emerald-600'
                          }`}
                        />
                      ) : (
                        <div className="w-full h-1 bg-slate-200/70 rounded-full" />
                      )}
                    </div>

                    <span
                      className={`text-[9px] font-semibold ${
                        isPeak ? 'text-emerald-700 font-extrabold' : count > 0 ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {hour % 2 === 0 || hour === 23 ? `${hour}h` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
