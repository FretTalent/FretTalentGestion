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
  RefreshCw,
  Calendar,
  Filter,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

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

  if (loading && !statsData) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Chargement des statistiques d'audience...</p>
      </div>
    );
  }

  const { kpis, dailyStats = [], topPages = [], topReferrers = [], devices = {}, hourlyDistribution = [] } = statsData || {};
  const totalDeviceCount = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Analytics & Trafic
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 mt-1">Statistiques du Site</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Suivi en temps réel des visites, pages consultées et provenance des clics
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: '7d', label: '7 jours' },
            { id: '30d', label: '30 jours' },
            { id: 'all', label: 'Tout' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === t.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => fetchStats(timeframe)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1"
            title="Actualiser"
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

      {/* Cartes KPI Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Visites Aujourd'hui</span>
            <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950">{kpis?.todayCount || 0}</div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="text-orange-600 font-bold">{kpis?.todayUniques || 0}</span> visiteurs uniques
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Pages Vues</span>
            <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950">{kpis?.totalViews || 0}</div>
          <div className="text-xs text-slate-500 font-medium">
            Sur la période sélectionnée
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Visiteurs Uniques</span>
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950">{kpis?.uniqueSessions || 0}</div>
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Sessions distinctes
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Pages / Visiteur</span>
            <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950">
            {kpis?.uniqueSessions > 0
              ? (kpis.totalViews / kpis.uniqueSessions).toFixed(1)
              : '1.0'}
          </div>
          <div className="text-xs text-slate-500 font-medium">Moyenne par session</div>
        </div>
      </div>

      {/* Graphique de Fréquentation Journalière */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Évolution du trafic à la journée
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Vues totales vs Visiteurs uniques par jour</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {dailyStats.length} jour(s) enregistré(s)
          </span>
        </div>

        {dailyStats.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Aucune donnée de visite enregistrée pour cette période.
          </div>
        ) : (
          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end gap-2 sm:gap-3 overflow-x-auto pb-2">
              {dailyStats.map((item, idx) => {
                const maxViews = Math.max(...dailyStats.map((d) => d.views), 1);
                const heightPercent = Math.max(10, Math.round((item.views / maxViews) * 100));

                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      <div className="font-bold">{item.date}</div>
                      <div>{item.views} vues ({item.uniques} uniques)</div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-xl h-full flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-xl group-hover:from-orange-600 group-hover:to-amber-500 transition-all"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold group-hover:text-slate-900 truncate max-w-full">
                      {item.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pages les Plus Vues & Provenance des Clics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Vues */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-slate-900 text-base">Pages les plus vues</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Vues & Uniques</span>
          </div>

          <div className="space-y-3">
            {topPages.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucune page vue enregistrée.</p>
            ) : (
              topPages.map((page, i) => {
                const maxP = topPages[0]?.views || 1;
                const pct = Math.round((page.views / maxP) * 100);

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 font-bold truncate max-w-[240px] sm:max-w-[320px]">
                        {page.path}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-black">{page.views} vues</span>
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

        {/* Provenance des Clics (Référents) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-slate-900 text-base">Provenance des clics</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Sources de trafic</span>
          </div>

          <div className="space-y-3">
            {topReferrers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucune provenance enregistrée.</p>
            ) : (
              topReferrers.map((ref, i) => {
                const totalR = topReferrers.reduce((acc, r) => acc + r.count, 0) || 1;
                const pct = Math.round((ref.count / totalR) * 100);

                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white rounded-xl shadow-xs text-slate-600 font-bold border border-slate-200">
                        {ref.domain.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{ref.domain}</p>
                        <p className="text-[11px] text-slate-400">{pct}% du trafic global</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-950 bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200">
                      {ref.count} clics
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Appareils & Heures de Fréquentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition Appareils */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Monitor className="h-5 w-5 text-purple-500" />
            <h3 className="font-bold text-slate-900 text-base">Type d'appareils</h3>
          </div>

          <div className="space-y-4 pt-2">
            {[
              {
                type: 'Ordinateur',
                count: devices.desktop || 0,
                icon: Monitor,
                color: 'bg-purple-500 text-purple-600 bg-purple-50',
              },
              {
                type: 'Mobiles',
                count: devices.mobile || 0,
                icon: Smartphone,
                color: 'bg-emerald-500 text-emerald-600 bg-emerald-50',
              },
              {
                type: 'Tablettes',
                count: devices.tablet || 0,
                icon: Tablet,
                color: 'bg-blue-500 text-blue-600 bg-blue-50',
              },
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
                    <span className="font-extrabold text-slate-900">{d.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${d.color.split(' ')[0]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heures de pointe (2/3 de largeur) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Fréquentation par heure de la journée</h3>
            </div>
            {(() => {
              const maxH = Math.max(...(hourlyDistribution || [0]), 0);
              const peakH = hourlyDistribution ? hourlyDistribution.indexOf(maxH) : -1;
              const totalH = (hourlyDistribution || []).reduce((a, b) => a + b, 0);

              if (totalH === 0) {
                return (
                  <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    0 visite sur cette période
                  </span>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                    {totalH} vues réparties
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    🔥 Pic à {peakH}h00 ({maxH} visites)
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="pt-4">
            {(() => {
              const maxH = Math.max(...(hourlyDistribution || [0]), 0);
              const totalH = (hourlyDistribution || []).reduce((a, b) => a + b, 0);

              if (totalH === 0) {
                return (
                  <div className="py-10 text-center text-slate-400 text-sm space-y-1">
                    <p className="font-semibold text-slate-600">Aucune visite enregistrée pour le filtre sélectionné.</p>
                    <p className="text-xs">Changez le filtre en haut (ex: "7 jours", "30 jours" ou "Tout") pour voir l'historique complet.</p>
                  </div>
                );
              }

              return (
                <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2">
                  {hourlyDistribution.map((count, hour) => {
                    const hPct = maxH > 0 && count > 0 ? Math.max(14, Math.round((count / maxH) * 100)) : 0;
                    const isPeak = count === maxH && maxH > 0;

                    return (
                      <div
                        key={hour}
                        className="flex-1 min-w-[12px] flex flex-col items-center justify-end h-full gap-1.5 group relative"
                      >
                        {/* Bulle d'information au survol */}
                        <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                          <span className="font-bold">{hour}h00 :</span> {count} visite{count > 1 ? 's' : ''}
                        </div>

                        {/* Barre de valeur */}
                        <div className="w-full bg-slate-100/80 rounded-t h-full flex items-end overflow-hidden">
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

                        {/* Label de l'heure */}
                        <span
                          className={`text-[9px] font-semibold transition-colors ${
                            isPeak
                              ? 'text-emerald-700 font-extrabold'
                              : count > 0
                                ? 'text-slate-700'
                                : 'text-slate-400'
                          }`}
                        >
                          {hour % 2 === 0 || hour === 23 ? `${hour}h` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
