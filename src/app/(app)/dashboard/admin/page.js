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
  MessageSquare,
  Sparkles,
  Zap,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Send,
  Bell,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [testingTelegram, setTestingTelegram] = useState(false);

  const [stats, setStats] = useState({
    candidatesCount: 0,
    pendingCandidatesCount: 0,
    validatedCandidatesCount: 0,
    companiesCount: 0,
    jobsCount: 0,
    pendingJobsCount: 0,
    unlocksCount: 0,
    totalRevenue: 0,
    franceCandidates: 0,
    belgiumCandidates: 0,
    luxembourgCandidates: 0,
    switzerlandCandidates: 0,
    supportConvCount: 0,
    openSupportConvCount: 0,
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

      // 1. Fetch candidates
      const { data: candidates } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      const candCount = candidates ? candidates.length : 0;
      const pendingCand = candidates ? candidates.filter(c => !c.validated).length : 0;
      const valCand = candidates ? candidates.filter(c => c.validated).length : 0;
      const frCand = candidates ? candidates.filter(c => (c.country || 'FR') === 'FR').length : 0;
      const beCand = candidates ? candidates.filter(c => c.country === 'BE').length : 0;
      const luCand = candidates ? candidates.filter(c => c.country === 'LU').length : 0;
      const chCand = candidates ? candidates.filter(c => c.country === 'CH').length : 0;

      // 2. Fetch companies
      const { count: compCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      // 3. Fetch jobs
      const { data: jobs } = await supabase.from('jobs').select('id, is_approved');
      const totalJobs = jobs ? jobs.length : 0;
      const pendingJ = jobs ? jobs.filter(j => !j.is_approved).length : 0;

      // 4. Fetch unlocks
      const { data: unlocks } = await supabase
        .from('unlocks')
        .select(`
          id,
          amount_charged,
          created_at,
          companies ( name ),
          candidates ( full_name, city, country )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      const uCount = unlocks ? unlocks.length : 0;
      const totalRev = unlocks
        ? unlocks.reduce((acc, curr) => acc + (curr.amount_charged || 0), 0) / 100
        : 0;

      // 5. Fetch support conversations
      let openSupportCount = 0;
      try {
        const { data: convs } = await supabase
          .from('support_conversations')
          .select('id, status');
        if (convs) {
          openSupportCount = convs.filter(c => c.status === 'open').length;
        }
      } catch (e) {
        console.error('Erreur support_conversations', e);
      }

      setStats({
        candidatesCount: candCount,
        pendingCandidatesCount: pendingCand,
        validatedCandidatesCount: valCand,
        companiesCount: compCount || 0,
        jobsCount: totalJobs,
        pendingJobsCount: pendingJ,
        unlocksCount: uCount,
        totalRevenue: totalRev,
        franceCandidates: frCand,
        belgiumCandidates: beCand,
        luxembourgCandidates: luCand,
        switzerlandCandidates: chCand,
        supportConvCount: openSupportCount,
        openSupportConvCount: openSupportCount,
      });

      setRecentCandidates(candidates ? candidates.slice(0, 6) : []);
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

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/telegram/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('🚀 Test Telegram envoyé ! Vérifiez votre application Telegram.', { duration: 5000 });
      } else {
        toast.error(`⚠️ ${data.error || 'Erreur lors du test Telegram'}`, { duration: 6000 });
      }
    } catch (err) {
      console.error('Erreur test telegram:', err);
      toast.error('Erreur de connexion au serveur.');
    } finally {
      setTestingTelegram(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
          Chargement du centre de pilotage...
        </p>
      </div>
    );
  }

  const hasUrgentActions = stats.pendingCandidatesCount > 0 || stats.pendingJobsCount > 0 || stats.openSupportConvCount > 0;
  const validationRate = stats.candidatesCount > 0 ? Math.round((stats.validatedCandidatesCount / stats.candidatesCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* HEADER DE PILOTAGE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
              Espace Super Admin
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En direct
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Centre de Pilotage FretTalent
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Supervision du réseau transporteur, modération des pièces officielles et alertes en direct Telegram.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-all cursor-pointer disabled:opacity-50"
            title="Tester l'envoi d'une alerte sur votre Telegram"
          >
            <Send className={`h-3.5 w-3.5 ${testingTelegram ? 'animate-spin' : ''}`} />
            <span>{testingTelegram ? 'Envoi...' : '🔔 Tester Robot Telegram'}</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/admin/chat')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer hover:scale-105"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Tchat Support</span>
            {stats.openSupportConvCount > 0 && (
              <span className="bg-white text-orange-600 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                {stats.openSupportConvCount}
              </span>
            )}
          </button>
          
          <button
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* BANNIÈRE ACTIONS PRIORITAIRES EN ATTENTE */}
      {hasUrgentActions && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-3 rounded-2xl shrink-0 shadow-md">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-amber-950">
                  Actions Prioritaires en Attente
                </h3>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {stats.pendingCandidatesCount + stats.pendingJobsCount + stats.openSupportConvCount} tâche(s)
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {stats.pendingCandidatesCount > 0 && (
                  <span className="mr-3 font-semibold">
                    • <strong>{stats.pendingCandidatesCount}</strong> dossier(s) chauffeur à vérifier
                  </span>
                )}
                {stats.pendingJobsCount > 0 && (
                  <span className="mr-3 font-semibold">
                    • <strong>{stats.pendingJobsCount}</strong> offre(s) d&apos;emploi à approuver
                  </span>
                )}
                {stats.openSupportConvCount > 0 && (
                  <span className="font-semibold">
                    • <strong>{stats.openSupportConvCount}</strong> ticket(s) support ouvert(s)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
            {stats.pendingCandidatesCount > 0 && (
              <button
                onClick={() => router.push('/dashboard/admin/candidates?status=pending')}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
              >
                Valider candidats ({stats.pendingCandidatesCount})
              </button>
            )}
            {stats.pendingJobsCount > 0 && (
              <button
                onClick={() => router.push('/dashboard/admin/jobs')}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
              >
                Modérer annonces ({stats.pendingJobsCount})
              </button>
            )}
            {stats.openSupportConvCount > 0 && (
              <button
                onClick={() => router.push('/dashboard/admin/chat')}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
              >
                Tchat ({stats.openSupportConvCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* GRILLE DES 6 KPIS MAJEURS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* KPI 1 : TRAFIC */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-orange-300 transition-all card-hover-effect">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Visites Site</span>
            <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950">
            Temps Réel
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/stats')}
            className="w-full flex items-center justify-between text-xs font-bold text-orange-600 pt-1 border-t border-slate-100 hover:underline"
          >
            <span>Voir analytics</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* KPI 2 : CHAUFFEURS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-orange-300 transition-all card-hover-effect">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Chauffeurs</span>
            <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-950">{stats.candidatesCount}</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
              🇫🇷 {stats.franceCandidates} • 🇧🇪 {stats.belgiumCandidates} • 🇨🇭 {stats.switzerlandCandidates} • 🇱🇺 {stats.luxembourgCandidates}
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/candidates')}
            className="w-full flex items-center justify-between text-xs font-bold text-orange-600 pt-1 border-t border-slate-100 hover:underline"
          >
            <span>Gérer ({stats.pendingCandidatesCount} att.)</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* KPI 3 : ENTREPRISES */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-blue-300 transition-all card-hover-effect">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Entreprises</span>
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950">{stats.companiesCount}</div>
          <button
            onClick={() => router.push('/dashboard/admin/companies')}
            className="w-full flex items-center justify-between text-xs font-bold text-blue-600 pt-1 border-t border-slate-100 hover:underline"
          >
            <span>Voir entreprises</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* KPI 4 : OFFRES D'EMPLOI */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-amber-300 transition-all card-hover-effect">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Offres d&apos;Emploi</span>
            <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-950">{stats.jobsCount}</div>
            <div className="text-[10px] font-bold text-amber-600 mt-0.5">
              {stats.pendingJobsCount > 0 ? `${stats.pendingJobsCount} à modérer` : 'Toutes validées'}
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/jobs')}
            className="w-full flex items-center justify-between text-xs font-bold text-amber-600 pt-1 border-t border-slate-100 hover:underline"
          >
            <span>Modérer annonces</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* KPI 5 : DÉBLOCAGES */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-emerald-300 transition-all card-hover-effect">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Déblocages</span>
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <Key className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.unlocksCount}</div>
          <button
            onClick={() => router.push('/dashboard/admin/finance')}
            className="w-full flex items-center justify-between text-xs font-bold text-emerald-600 pt-1 border-t border-slate-100 hover:underline"
          >
            <span>Finances</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* KPI 6 : CHIFFRE D'AFFAIRES */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-purple-300 transition-all card-hover-effect">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Revenus Stripe</span>
            <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950">
            {stats.totalRevenue.toFixed(2)}&nbsp;€
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/finance')}
            className="w-full flex items-center justify-between text-xs font-bold text-purple-600 pt-1 border-t border-slate-100 hover:underline"
          >
            <span>Détails Stripe</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* 4 HUBS DE GESTION RAPIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          onClick={() => router.push('/dashboard/admin/candidates')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group card-hover-effect"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="font-black text-slate-950 text-base flex items-center justify-between">
            <span>Gestion Chauffeurs</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Vérifier les pièces d&apos;identité, permis C/CE, cartes chronotachygraphe et relancer par e-mail en 1 clic.
          </p>
        </div>

        <div
          onClick={() => router.push('/dashboard/admin/companies')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group card-hover-effect"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="font-black text-slate-950 text-base flex items-center justify-between">
            <span>Gestion Entreprises</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Contrôle légal SIRET / BCE / RCS / IDE, suivi des déblocages effectués et gestion des forfaits.
          </p>
        </div>

        <div
          onClick={() => router.push('/dashboard/admin/jobs')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group card-hover-effect"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="font-black text-slate-950 text-base flex items-center justify-between">
            <span>Modération Offres</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Validation des fiches de poste, salaires et conditions avant publication sur l&apos;espace public.
          </p>
        </div>

        <div
          onClick={() => router.push('/dashboard/admin/chat')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group card-hover-effect"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="font-black text-slate-950 text-base flex items-center justify-between">
            <span>Support & Tchat</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Réponse en direct aux questions des candidats et entreprises, résolution de tickets d&apos;assistance.
          </p>
        </div>

      </div>

      {/* FEEDS D'ACTIVITÉ EN TEMPS RÉEL (2 COLONNES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DERNIERS CHAUFFEURS INSCRITS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-500" />
              <h3 className="font-black text-slate-950 text-base">Derniers Chauffeurs Inscrits</h3>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin/candidates')}
              className="text-xs text-orange-600 hover:underline font-bold"
            >
              Voir tous ({stats.candidatesCount}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentCandidates.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucun candidat enregistré.</p>
            ) : (
              recentCandidates.map(c => {
                const countryFlag = c.country === 'BE' ? '🇧🇪' : c.country === 'LU' ? '🇱🇺' : c.country === 'CH' ? '🇨🇭' : '🇫🇷';
                return (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/dashboard/admin/candidates/${c.id}`)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50/50 border border-slate-100 hover:border-orange-200 transition-all cursor-pointer text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>{countryFlag}</span>
                        <p className="font-black text-slate-900">{c.full_name || 'Chauffeur anonyme'}</p>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        {c.city || 'Ville non renseignée'} ({c.postal_code || ''}) • {c.licenses?.join(', ') || 'Permis C/CE'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          c.validated
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {c.validated ? 'Validé ✅' : 'À valider ⚠️'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* DERNIÈRES TRANSACTIONS STRIPE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              <h3 className="font-black text-slate-950 text-base">Dernières Transactions Stripe</h3>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin/finance')}
              className="text-xs text-emerald-700 hover:underline font-bold"
            >
              Voir finances →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentUnlocks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucune transaction enregistrée.</p>
            ) : (
              recentUnlocks.map(u => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-blue-500" />
                      <p className="font-black text-slate-900">{u.companies?.name || 'Entreprise de transport'}</p>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Contact débloqué : <strong className="text-slate-700">{u.candidates?.full_name || 'Chauffeur'}</strong> ({u.candidates?.city || ''})
                    </p>
                  </div>

                  <span className="font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200">
                    +{((u.amount_charged || 200) / 100).toFixed(2)}&nbsp;€
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* SECTION ROBOT TELEGRAM ALERTES EN DIRECT */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Send className="h-3.5 w-3.5" />
              <span>Robot Telegram Admin</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Notifications & Alertes Instantanées sur votre Mobile
            </h2>
            <p className="text-xs text-slate-400">
              Recevez les événements clés de la plateforme directement sur votre Telegram sans rafraîchir la page.
            </p>
          </div>

          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send className={`h-4 w-4 ${testingTelegram ? 'animate-spin' : ''}`} />
            <span>{testingTelegram ? 'Envoi du test...' : 'Envoyer un Test Telegram'}</span>
          </button>
        </div>

        {/* 5 ÉVÉNEMENTS NOTIFIÉS AUTOMATIQUEMENT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
            <div className="text-lg">🚛</div>
            <p className="font-bold text-xs text-white">Nouvel Inscrit Chauffeur</p>
            <p className="text-[11px] text-slate-400">Nom, contact, permis, ville & drapeau pays.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
            <div className="text-lg">🏢</div>
            <p className="font-bold text-xs text-white">Nouvelle Entreprise</p>
            <p className="text-[11px] text-slate-400">Raison sociale, SIRET/BCE, e-mail et ville.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
            <div className="text-lg">📄</div>
            <p className="font-bold text-xs text-white">Dépôt Dossier Complet</p>
            <p className="text-[11px] text-slate-400">Alerte dès qu'un chauffeur téléverse ses 7 pièces.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
            <div className="text-lg">💬</div>
            <p className="font-bold text-xs text-white">Demande Tchat Support</p>
            <p className="text-[11px] text-slate-400">Alerte avec aperçu du message et lien direct.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
            <div className="text-lg">💳</div>
            <p className="font-bold text-xs text-white">Déblocage & Stripe</p>
            <p className="text-[11px] text-slate-400">Notification à chaque transaction de 2,00 €.</p>
          </div>

        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              Variables d&apos;environnement requises : <code className="bg-black/40 px-2 py-0.5 rounded text-orange-400 font-mono">TELEGRAM_BOT_TOKEN</code> et <code className="bg-black/40 px-2 py-0.5 rounded text-orange-400 font-mono">TELEGRAM_ADMIN_CHAT_ID</code>.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">
            Protocole officiel Telegram Bot API
          </span>
        </div>
      </div>

    </div>
  );
}
