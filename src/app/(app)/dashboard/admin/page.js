'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Truck,
  Users,
  Key,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building2,
  Mail,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    candidatesCount: 0,
    pendingCandidatesCount: 0,
    companiesCount: 0,
    jobsCount: 0,
    pendingJobsCount: 0,
    unlocksCount: 0,
    totalRevenue: 0,
    franceCandidates: 0,
    belgiumCandidates: 0,
  });

  const [recentCandidates, setRecentCandidates] = useState([]);
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      // Fetch candidates
      const { data: candidates } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      const candCount = candidates ? candidates.length : 0;
      const pendingCand = candidates ? candidates.filter(c => !c.validated).length : 0;
      const frCand = candidates ? candidates.filter(c => (c.country || 'FR') === 'FR').length : 0;
      const beCand = candidates ? candidates.filter(c => c.country === 'BE').length : 0;
      const luCand = candidates ? candidates.filter(c => c.country === 'LU').length : 0;
      const chCand = candidates ? candidates.filter(c => c.country === 'CH').length : 0;

      // Fetch companies
      const { count: compCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      // Fetch jobs
      const { data: jobs } = await supabase.from('jobs').select('id, is_approved');
      const totalJobs = jobs ? jobs.length : 0;
      const pendingJ = jobs ? jobs.filter(j => !j.is_approved).length : 0;

      // Fetch unlocks
      const { data: unlocks } = await supabase
        .from('unlocks')
        .select(`
          id,
          amount_charged,
          created_at,
          companies ( name ),
          candidates ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const uCount = unlocks ? unlocks.length : 0;
      const totalRev = unlocks
        ? unlocks.reduce((acc, curr) => acc + (curr.amount_charged || 0), 0) / 100
        : 0;

      setStats({
        candidatesCount: candCount,
        pendingCandidatesCount: pendingCand,
        companiesCount: compCount || 0,
        jobsCount: totalJobs,
        pendingJobsCount: pendingJ,
        unlocksCount: uCount,
        totalRevenue: totalRev,
        franceCandidates: frCand,
        belgiumCandidates: beCand,
        luxembourgCandidates: luCand,
        switzerlandCandidates: chCand,
      });

      setRecentCandidates(candidates ? candidates.slice(0, 5) : []);
      setRecentUnlocks(unlocks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Chargement du tableau de bord...</p>
      </div>
    );
  }

  const hasAlerts = stats.pendingCandidatesCount > 0 || stats.pendingJobsCount > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Title & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Tableau de bord Administrateur</h1>
          <p className="text-slate-500 text-sm mt-0.5">Vue globale, modération & performances financières</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Banner Actions Requises en Attente */}
      {hasAlerts && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500 text-white p-3 rounded-2xl shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900">Modération en attente !</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                {stats.pendingCandidatesCount > 0 && `${stats.pendingCandidatesCount} candidat(s) à valider administrativement. `}
                {stats.pendingJobsCount > 0 && `${stats.pendingJobsCount} annonce(s) d'emploi en attente d'approbation.`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {stats.pendingCandidatesCount > 0 && (
              <button
                onClick={() => router.push('/dashboard/admin/candidates')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Valider candidats ({stats.pendingCandidatesCount})
              </button>
            )}
            {stats.pendingJobsCount > 0 && (
              <button
                onClick={() => router.push('/dashboard/admin/jobs')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Modérer annonces ({stats.pendingJobsCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-orange-200 transition-colors">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Visites Site (Aujourd'hui)
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            Trafic
            <div className="bg-orange-50 p-2.5 rounded-2xl">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Pages vues & clics</span>
            <button
              onClick={() => router.push('/dashboard/admin/stats')}
              className="text-orange-500 hover:underline font-bold flex items-center gap-0.5"
            >
              Stats site <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-orange-200 transition-colors">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chauffeurs Inscrits
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {stats.candidatesCount}
            <div className="bg-orange-50 p-2.5 rounded-2xl">
              <Truck className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium truncate">
              🇫🇷 {stats.franceCandidates} | 🇧🇪 {stats.belgiumCandidates} | 🇱🇺 {stats.luxembourgCandidates || 0} | 🇨🇭 {stats.switzerlandCandidates || 0}
            </span>
            <button
              onClick={() => router.push('/dashboard/admin/candidates')}
              className="text-orange-500 hover:underline font-bold flex items-center gap-0.5 flex-shrink-0 ml-1"
            >
              Gérer <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-200 transition-colors">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Entreprises Recruteurs
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {stats.companiesCount}
            <div className="bg-blue-50 p-2.5 rounded-2xl">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">SIRET, BCE, RCS & IDE vérifiés</span>
            <button
              onClick={() => router.push('/dashboard/admin/companies')}
              className="text-blue-600 hover:underline font-bold flex items-center gap-0.5"
            >
              Gérer <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-emerald-200 transition-colors">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Déblocages Effectués
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {stats.unlocksCount}
            <div className="bg-emerald-50 p-2.5 rounded-2xl">
              <Key className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-emerald-600 font-medium">Mises en relation 2€</span>
            <button
              onClick={() => router.push('/dashboard/admin/finance')}
              className="text-emerald-600 hover:underline font-bold flex items-center gap-0.5"
            >
              Finances <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-purple-200 transition-colors">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chiffre d'Affaires
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {stats.totalRevenue.toFixed(2)} €
            <div className="bg-purple-50 p-2.5 rounded-2xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Revenus Stripe</span>
            <button
              onClick={() => router.push('/dashboard/admin/finance')}
              className="text-purple-600 hover:underline font-bold flex items-center gap-0.5"
            >
              Détails <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Live Feeds & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Candidates */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-slate-900 text-base">Derniers Chauffeurs Inscrits</h3>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin/candidates')}
              className="text-xs text-orange-500 hover:underline font-semibold"
            >
              Tout voir
            </button>
          </div>

          <div className="space-y-3">
            {recentCandidates.length === 0 ? (
              <p className="text-xs text-slate-400">Aucun candidat pour le moment.</p>
            ) : (
              recentCandidates.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{c.full_name || 'Nom non spécifié'}</p>
                    <p className="text-slate-500">{c.city || 'Ville non spécifiée'} • {(c.job_preferences || []).join(', ')}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${c.validated ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {c.validated ? 'Validé' : 'En attente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Unlock Transactions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Dernières Transactions Stripe</h3>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin/finance')}
              className="text-xs text-emerald-600 hover:underline font-semibold"
            >
              Voir finances
            </button>
          </div>

          <div className="space-y-3">
            {recentUnlocks.length === 0 ? (
              <p className="text-xs text-slate-400">Aucune transaction récente.</p>
            ) : (
              recentUnlocks.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{u.companies?.name || 'Entreprise'}</p>
                    <p className="text-slate-500">Candidat: {u.candidates?.full_name || 'Débloqué'}</p>
                  </div>
                  <span className="font-black text-slate-950 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                    +{((u.amount_charged || 0) / 100).toFixed(2)} €
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
