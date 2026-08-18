'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { calculateAge } from '@/lib/country';
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
  Download,
  Share2,
  Filter,
  Layers,
  PieChart,
  HelpCircle,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

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

  const [allCandidates, setAllCandidates] = useState([]);
  const [pendingJobsList, setPendingJobsList] = useState([]);
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTimeframe, setFilterTimeframe] = useState('30 Jours'); // '7 Jours' | '30 Jours' | 'Année'
  const [searchQuery, setSearchQuery] = useState('');

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

      // 1. Fetch candidates with exact count
      const { count: candTotal, data: candidates } = await supabase
        .from('candidates')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      const candList = candidates || [];
      const candCount = candTotal ?? candList.length;
      const pendingCand = candList.filter(c => !c.validated).length;
      const valCand = candList.filter(c => c.validated).length;
      const frCand = candList.filter(c => (c.country || 'FR') === 'FR').length;
      const beCand = candList.filter(c => c.country === 'BE').length;
      const luCand = candList.filter(c => c.country === 'LU').length;
      const chCand = candList.filter(c => c.country === 'CH').length;

      // 2. Fetch companies
      const { count: compCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      // 3. Fetch jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });

      const totalJobs = jobs ? jobs.length : 0;
      const pendingJ = jobs ? jobs.filter(j => !j.is_approved) : [];

      // 4. Fetch unlocks with exact count & timestamp fallback
      const { count: unlockTotal, data: unlocks } = await supabase
        .from('unlocks')
        .select(`
          id,
          amount_charged,
          created_at,
          unlocked_at,
          stripe_payment_intent_id,
          companies ( name ),
          candidates ( full_name, city, country )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50);

      const uList = (unlocks || []).map(u => ({
        ...u,
        created_at: u.created_at || u.unlocked_at,
      }));
      const totalRev = uList.reduce((acc, curr) => acc + (curr.amount_charged || 0), 0) / 100;

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
        pendingJobsCount: pendingJ.length,
        unlocksCount: unlockTotal ?? uList.length,
        totalRevenue: totalRev,
        franceCandidates: frCand,
        belgiumCandidates: beCand,
        luxembourgCandidates: luCand,
        switzerlandCandidates: chCand,
        supportConvCount: openSupportCount,
        openSupportConvCount: openSupportCount,
      });

      setAllCandidates(candList);
      setPendingJobsList(pendingJ);
      setRecentUnlocks(uList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 1-Click Candidate Approval
  const handleQuickValidateCandidate = async (candidateId, name) => {
    setActionLoading(candidateId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/candidates/${candidateId}/validate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur de validation');

      setAllCandidates(prev =>
        prev.map(c => (c.id === candidateId ? { ...c, validated: true } : c))
      );
      setStats(prev => ({
        ...prev,
        pendingCandidatesCount: Math.max(0, prev.pendingCandidatesCount - 1),
        validatedCandidatesCount: prev.validatedCandidatesCount + 1,
      }));
      toast.success(`✅ ${name || 'Chauffeur'} validé et certifié 100% Vérifié !`);
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la validation');
    } finally {
      setActionLoading(null);
    }
  };

  // 1-Click Job Approval
  const handleQuickApproveJob = async (jobId, title) => {
    setActionLoading(jobId);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_approved: true, status: 'approved' })
        .eq('id', jobId);

      if (error) throw error;

      setPendingJobsList(prev => prev.filter(j => j.id !== jobId));
      setStats(prev => ({
        ...prev,
        pendingJobsCount: Math.max(0, prev.pendingJobsCount - 1),
      }));
      toast.success(`✅ Offre "${title || 'Annonce'}" approuvée !`);
    } catch (err) {
      toast.error('Erreur lors de l’approbation de l’offre');
    } finally {
      setActionLoading(null);
    }
  };

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

  // Calculations for visual widgets
  const validationRate = stats.candidatesCount > 0
    ? Math.round((stats.validatedCandidatesCount / stats.candidatesCount) * 100)
    : 0;

  // Calcul dynamique et 100% opérationnel de la courbe de croissance
  const trendData = useMemo(() => {
    const is7d = filterTimeframe === '7 Jours';
    const is30d = filterTimeframe === '30 Jours';
    const numPoints = is7d ? 7 : is30d ? 15 : 12;

    const width = 500;
    const height = 140;
    const step = width / (numPoints - 1);

    const makePath = (pts) => {
      if (!pts || pts.length === 0) return '';
      return pts.reduce((acc, p, i, a) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = a[i - 1];
        const cp1x = prev.x + (p.x - prev.x) / 2;
        return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
      }, '');
    };

    if (is7d || is30d) {
      const days = [];
      const now = new Date();
      const spanDays = is7d ? 7 : 30;
      const stepSize = is7d ? 1 : 2;

      for (let i = spanDays - 1; i >= 0; i -= stepSize) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const dayLabel = is7d
          ? d.toLocaleDateString('fr-FR', { weekday: 'short' })
          : `${d.getDate()}/${d.getMonth() + 1}`;

        const candCount = allCandidates.filter(c => c.created_at && c.created_at.startsWith(dayStr)).length;
        const unlockCount = recentUnlocks.filter(u => u.created_at && u.created_at.startsWith(dayStr)).length;

        days.push({
          date: dayStr,
          label: dayLabel,
          candidates: candCount,
          activity: candCount + unlockCount + (candCount > 0 ? 2 : 0),
        });
      }

      const maxVal = Math.max(...days.map(d => Math.max(d.candidates, d.activity)), 3);

      const ptsCand = days.map((d, i) => ({
        x: i * (width / (days.length - 1)),
        y: height - (d.candidates / maxVal) * (height - 30) - 15,
        val: d.candidates,
        label: d.label,
      }));

      const ptsAct = days.map((d, i) => ({
        x: i * (width / (days.length - 1)),
        y: height - (d.activity / maxVal) * (height - 30) - 15,
        val: d.activity,
        label: d.label,
      }));

      return {
        pathCand: makePath(ptsCand),
        pathAct: makePath(ptsAct),
        ptsCand,
        ptsAct,
        labels: days.filter((_, idx) => is7d || idx % 2 === 0).map(d => d.label),
        totalCand: allCandidates.length,
      };
    } else {
      // 12 Mois
      const months = [];
      const now = new Date();
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;

        const candCount = allCandidates.filter(c => c.created_at && c.created_at.startsWith(monthKey)).length;
        const unlockCount = recentUnlocks.filter(u => u.created_at && u.created_at.startsWith(monthKey)).length;

        months.push({
          monthKey,
          label: monthNames[m],
          candidates: candCount,
          activity: candCount + unlockCount + (candCount > 0 ? 1 : 0),
        });
      }

      const maxVal = Math.max(...months.map(m => Math.max(m.candidates, m.activity)), 4);

      const ptsCand = months.map((m, i) => ({
        x: i * step,
        y: height - (m.candidates / maxVal) * (height - 30) - 15,
        val: m.candidates,
        label: m.label,
      }));

      const ptsAct = months.map((m, i) => ({
        x: i * step,
        y: height - (m.activity / maxVal) * (height - 30) - 15,
        val: m.activity,
        label: m.label,
      }));

      return {
        pathCand: makePath(ptsCand),
        pathAct: makePath(ptsAct),
        ptsCand,
        ptsAct,
        labels: months.filter((_, idx) => idx % 2 === 0).map(m => m.label),
        totalCand: allCandidates.length,
      };
    }
  }, [filterTimeframe, allCandidates, recentUnlocks]);

  // Segment breakdown: Specialities
  const specialityCounts = useMemo(() => {
    const counts = {
      SPL: 0,
      Tautliner: 0,
      Frigo: 0,
      ADR: 0,
      Benne: 0,
      Messagerie: 0,
      Plateau: 0,
    };
    allCandidates.forEach(c => {
      const prefs = Array.isArray(c.job_preferences) ? c.job_preferences : [];
      const lics = Array.isArray(c.licenses) ? c.licenses : [];
      if (lics.includes('SPL') || lics.includes('CE')) counts.SPL++;
      if (prefs.some(p => /tautliner|bâché/i.test(p))) counts.Tautliner++;
      if (prefs.some(p => /frigo|frais/i.test(p))) counts.Frigo++;
      if (c.adr_basic || c.adr_tanker || prefs.some(p => /adr|citerne/i.test(p))) counts.ADR++;
      if (prefs.some(p => /benne/i.test(p))) counts.Benne++;
      if (prefs.some(p => /messagerie/i.test(p))) counts.Messagerie++;
      if (prefs.some(p => /plateau/i.test(p))) counts.Plateau++;
    });
    return counts;
  }, [allCandidates]);

  const maxSpeciality = Math.max(...Object.values(specialityCounts), 1);

  // Queue of candidates needing review
  const pendingCandidatesQueue = useMemo(() => {
    return allCandidates.filter(c => !c.validated);
  }, [allCandidates]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-slate-900 text-sm font-bold">Chargement du Centre de Pilotage</p>
          <p className="text-slate-400 text-xs">Synchronisation en direct avec la base Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* 1. HEADER DE PILOTAGE SAAS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tableau de bord
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Direct Supabase
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Vue consolidée des inscriptions, déblocages 4,99€, modération des pièces et revenus Stripe.
          </p>
        </div>

        {/* Barre d'outils et sélecteur */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Segmented Timeframe Switcher */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
            {[
              { key: '7 Jours', label: '7J' },
              { key: '30 Jours', label: '30J' },
              { key: 'Année', label: '1 An' },
            ].map(period => (
              <button
                key={period.key}
                onClick={() => setFilterTimeframe(period.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTimeframe === period.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Tester l'alerte sur votre robot Telegram"
          >
            <Send className={`h-3.5 w-3.5 text-slate-500 ${testingTelegram ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Alerte Telegram</span>
          </button>

          <Link
            href="/dashboard/admin/chat"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs shadow-orange-500/20"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Support</span>
            {stats.openSupportConvCount > 0 && (
              <span className="bg-white text-orange-600 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                {stats.openSupportConvCount}
              </span>
            )}
          </Link>

          <button
            onClick={fetchAdminData}
            className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="Actualiser les données"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. 4 SCORECARDS KPIS (DESIGN MODERNE AVEC ACCENT TOP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        
        {/* KPI 1 : Volume Chauffeurs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="uppercase tracking-wider text-[11px]">Volume Chauffeurs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            {stats.candidatesCount}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Dossiers validés</span>
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 text-[10px]">
              {stats.validatedCandidatesCount} ({validationRate}%)
            </span>
          </div>
        </div>

        {/* KPI 2 : Chiffre d'Affaires */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="uppercase tracking-wider text-[11px]">Chiffre d&apos;Affaires</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            {stats.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Déblocages 4,99€</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
              {stats.unlocksCount} ventes
            </span>
          </div>
        </div>

        {/* KPI 3 : Entreprises & Recruteurs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="uppercase tracking-wider text-[11px]">Comptes Entreprises</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            {stats.companiesCount}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Annonces publiées</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
              {stats.jobsCount} offres
            </span>
          </div>
        </div>

        {/* KPI 4 : Conformité Pièces */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="uppercase tracking-wider text-[11px]">Conformité Pièces</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            {validationRate}
            <span className="text-lg text-slate-400 font-normal"> / 100</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Justificatifs vérifiés</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 text-[10px]">
              ● Dossiers audités
            </span>
          </div>
        </div>

      </div>

      {/* 3. LIGNE CENTRALE : COURBE DYNAMIQUE + SPÉCIALITÉS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
        
        {/* COURBE DE CROISSANCE SAAS (7 COLS) */}
        <div className="lg:col-span-7 min-w-0 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span className="text-slate-900 font-black text-sm normal-case">Tendances de Croissance</span>
              <span className="text-slate-400 font-mono text-[11px]">Période : {filterTimeframe}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> Inscriptions Chauffeurs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" /> Déblocages & Recherches
              </span>
            </div>
          </div>

          {/* Courbe SVG dynamique */}
          <div className="h-44 w-full relative flex items-end overflow-hidden pt-2">
            <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="candGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Lignes de repère */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

              {/* Courbe 1 : Inscriptions Chauffeurs */}
              {trendData.pathCand && (
                <path
                  d={trendData.pathCand}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Courbe 2 : Activité / Recherches */}
              {trendData.pathAct && (
                <path
                  d={trendData.pathAct}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}

              {/* Points interactifs */}
              {trendData.ptsCand?.map((pt, idx) => (
                <g key={`c-${idx}`}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                </g>
              ))}
            </svg>
          </div>

          {/* Axe X Labels */}
          <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-100 overflow-x-hidden">
            {trendData.labels?.map((lbl, i) => (
              <span key={i}>{lbl}</span>
            ))}
          </div>
        </div>

        {/* HISTOGRAMME PAR SPÉCIALITÉ (5 COLS) */}
        <div className="lg:col-span-5 min-w-0 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 font-black text-sm">Chauffeurs par Spécialité</h3>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                Effectif total
              </span>
            </div>

            {/* Barres horizontales */}
            <div className="space-y-3">
              {[
                { label: 'SPL / Permis CE', val: specialityCounts.SPL, gradient: 'from-orange-500 to-amber-500' },
                { label: 'Tautliner / Bâché', val: specialityCounts.Tautliner, gradient: 'from-orange-400 to-amber-400' },
                { label: 'Citerne & ADR', val: specialityCounts.ADR, gradient: 'from-blue-500 to-indigo-500' },
                { label: 'Frigo / Froid', val: specialityCounts.Frigo, gradient: 'from-cyan-500 to-blue-400' },
                { label: 'Benne TP / Céréale', val: specialityCounts.Benne, gradient: 'from-emerald-500 to-teal-400' },
                { label: 'Messagerie / Distrib', val: specialityCounts.Messagerie, gradient: 'from-slate-400 to-slate-500' },
              ].map((item, idx) => {
                const pct = Math.max(10, Math.round((item.val / maxSpeciality) * 100));
                return (
                  <div key={idx} className="space-y-1.5 min-w-0">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 text-[11px] truncate">{item.label}</span>
                      <span className="font-mono text-slate-900 font-bold text-[11px] shrink-0">{item.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-400 font-medium text-right border-t border-slate-100 mt-4">
            Répartition métier en temps réel
          </div>
        </div>

      </div>

      {/* 4. LIGNE INFÉRIEURE : MODÉRATION 1-CLIC + RÉPARTITION 4 PAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
        
        {/* FILE DE MODÉRATION PRIORITAIRE (7 COLS) */}
        <div className="lg:col-span-7 min-w-0 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-900 font-black text-sm">File de Modération Prioritaire</h3>
                <p className="text-xs text-slate-400">Validation 1-clic des justificatifs</p>
              </div>
              <Link
                href="/dashboard/admin/candidates?status=pending"
                className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 transition-colors"
              >
                <span>Tout voir ({pendingCandidatesQueue.length})</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {pendingCandidatesQueue.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2 my-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Aucun profil en attente de vérification !</p>
                <p className="text-[11px] text-slate-400">Tous les dossiers soumis sont conformes.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingCandidatesQueue.slice(0, 4).map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 flex items-center justify-between gap-3 text-xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {cand.full_name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 truncate text-xs">{cand.full_name || 'Chauffeur'}</p>
                          {cand.birth_date && calculateAge(cand.birth_date) && (
                            <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded text-[10px]">
                              {calculateAge(cand.birth_date)} ans
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {cand.city || 'France'} • {cand.licenses?.join(', ') || 'Permis C/CE'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/dashboard/admin/candidates/${cand.id}`}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors shadow-2xs"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => handleQuickValidateCandidate(cand.id, cand.full_name)}
                        disabled={actionLoading === cand.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs shadow-emerald-600/20"
                      >
                        {actionLoading === cand.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        <span>Valider</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between mt-3">
            <span>Envoi automatique d&apos;e-mail de certification</span>
            <span className="font-mono font-bold text-slate-700">{pendingCandidatesQueue.length} dossier(s) restant(s)</span>
          </div>
        </div>

        {/* RÉPARTITION GÉOGRAPHIQUE 4 PAYS (5 COLS) */}
        <div className="lg:col-span-5 min-w-0 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-900 font-black text-sm">Réseau Géographique</h3>
                <p className="text-xs text-slate-400">4 pays européens couverts</p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                International
              </span>
            </div>

            {/* Grille des 4 pays */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl flex flex-col justify-between hover:bg-blue-50 transition-colors">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <span className="text-base">🇫🇷</span> France
                </span>
                <div className="text-2xl font-black text-blue-700 mt-2 font-mono">{stats.franceCandidates}</div>
                <span className="text-[10px] text-blue-600 mt-0.5">Chauffeurs actifs</span>
              </div>
              <div className="bg-rose-50/60 border border-rose-100 p-3.5 rounded-xl flex flex-col justify-between hover:bg-rose-50 transition-colors">
                <span className="font-bold text-rose-950 flex items-center gap-1.5">
                  <span className="text-base">🇧🇪</span> Belgique
                </span>
                <div className="text-2xl font-black text-rose-700 mt-2 font-mono">{stats.belgiumCandidates}</div>
                <span className="text-[10px] text-rose-600 mt-0.5">Chauffeurs actifs</span>
              </div>
              <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl flex flex-col justify-between hover:bg-amber-50 transition-colors">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="text-base">🇱🇺</span> Luxembourg
                </span>
                <div className="text-2xl font-black text-amber-700 mt-2 font-mono">{stats.luxembourgCandidates}</div>
                <span className="text-[10px] text-amber-600 mt-0.5">Chauffeurs actifs</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex flex-col justify-between hover:bg-slate-100/70 transition-colors">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-base">🇨🇭</span> Suisse
                </span>
                <div className="text-2xl font-black text-slate-700 mt-2 font-mono">{stats.switzerlandCandidates}</div>
                <span className="text-[10px] text-slate-500 mt-0.5">Chauffeurs actifs</span>
              </div>
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-400 font-medium text-right border-t border-slate-100 mt-4">
            Expansion transfrontalière européenne
          </div>
        </div>

      </div>

      {/* 5. FLUX EN DIRECT DES DÉBLOCAGES & PAIEMENTS STRIPE */}
      <div className="w-full bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                Achats de Contacts Chauffeurs (4,99 € TTC)
              </h3>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {stats.unlocksCount} déblocages
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historique en direct des transactions Stripe
            </p>
          </div>

          <Link
            href="/dashboard/admin/finance"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <span>Grand Livre Financier</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>

        {recentUnlocks.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 rounded-xl">
            Aucun déblocage récent enregistré.
          </p>
        ) : (
          <div className="overflow-x-auto w-full border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Entreprise Recruteur</th>
                  <th className="py-3 px-4">Chauffeur Débloqué</th>
                  <th className="py-3 px-4 text-center">Montant</th>
                  <th className="py-3 px-4 text-center">Réf. Stripe</th>
                  <th className="py-3 px-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentUnlocks.slice(0, 8).map((unlock) => (
                  <tr key={unlock.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {unlock.created_at ? new Date(unlock.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-xs truncate max-w-[180px]">
                      {unlock.companies?.name || 'Entreprise'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs truncate max-w-[180px]">
                      {unlock.candidates?.full_name || 'Chauffeur'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-black text-emerald-700 text-xs">
                      {((unlock.amount_charged || 200) / 100).toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-400">
                      {unlock.stripe_payment_intent_id ? unlock.stripe_payment_intent_id.slice(-8) : 'pi_direct'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        <Check className="h-2.5 w-2.5" />
                        Payé
                      </span>
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

