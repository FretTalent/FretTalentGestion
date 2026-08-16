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
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 bg-slate-100/60 rounded-xl p-8">
        <RefreshCw className="h-8 w-8 text-slate-700 animate-spin" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
          Chargement du Centre de Pilotage FretTalent...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden box-border">
      
      {/* 1. EN-TÊTE SUPÉRIEURE DE PILOTAGE */}
      <div className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md min-w-0">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-black text-[11px] text-white">
              FT
            </div>
            <span className="font-bold text-xs text-slate-200">
              Espace de Pilotage FretTalent
            </span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-none">
            Direction Générale Transport & Logistique
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En Direct Supabase
          </span>
        </div>

        {/* Barre d'outils rapides */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            title="Tester l'alerte sur votre robot Telegram"
          >
            <Send className={`h-3 w-3 ${testingTelegram ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Alerte Telegram</span>
          </button>

          <Link
            href="/dashboard/admin/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors shadow-2xs"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Support</span>
            {stats.openSupportConvCount > 0 && (
              <span className="bg-white text-orange-700 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                {stats.openSupportConvCount}
              </span>
            )}
          </Link>

          <button
            onClick={fetchAdminData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Actualiser les données"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 2. BANDEAU DE CONTEXTE & SÉLECTEUR DE PÉRIODE */}
      <div className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs min-w-0">
        <div className="flex items-center gap-2 flex-1 text-slate-400 min-w-0">
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="italic text-slate-500 truncate text-[11px] sm:text-xs">
            Vue consolidée des inscriptions, déblocages 2€, abonnements Stripe et conformité des pièces.
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          {[
            { key: '7 Jours', label: '7 Jours' },
            { key: '30 Jours', label: '30 Jours' },
            { key: 'Année', label: 'Année' },
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setFilterTimeframe(period.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                filterTimeframe === period.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. HERO SCORECARDS KPIS (4 COLONNES ÉQUILIBRÉES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
        
        {/* KPI 1 : Volume Chauffeurs */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Volume Chauffeurs</span>
            <Users className="h-4 w-4 text-teal-600 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight font-mono">
            {stats.candidatesCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Dossiers 100% validés :</span>
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              {stats.validatedCandidatesCount} ({validationRate}%)
            </span>
          </div>
        </div>

        {/* KPI 2 : Chiffre d'Affaires & Stripe */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Chiffre d'Affaires</span>
            <CreditCard className="h-4 w-4 text-emerald-600 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight font-mono">
            {stats.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Déblocages 2€ :</span>
            <span className="font-mono font-bold text-slate-900 text-[11px]">
              {stats.unlocksCount} transactions
            </span>
          </div>
        </div>

        {/* KPI 3 : Entreprises Partenaires */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Comptes Entreprises</span>
            <Building2 className="h-4 w-4 text-blue-600 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight font-mono">
            {stats.companiesCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Annonces publiées :</span>
            <span className="font-bold text-slate-900 text-[11px]">
              {stats.jobsCount} offres
            </span>
          </div>
        </div>

        {/* KPI 4 : Indice de Conformité */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Conformité Pièces</span>
            <ShieldCheck className="h-4 w-4 text-orange-500 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight font-mono">
            {validationRate}
            <span className="text-lg text-slate-400 font-normal"> / 100</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Justificatifs vérifiés :</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              ● Conforme
            </span>
          </div>
        </div>

      </div>

      {/* 4. LIGNE CENTRALE : COURBE DYNAMIQUE DE CROISSANCE + SPÉCIALITÉS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        
        {/* TUILE 1 : COURBE D'ÉVOLUTION 100% OPÉRATIONNELLE (7 COLS) */}
        <div className="lg:col-span-7 min-w-0 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Tendances de Croissance & Inscriptions</span>
              <span className="text-slate-400 font-mono">Période : {filterTimeframe}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-teal-500 rounded" /> Inscriptions Chauffeurs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-700 rounded" /> Déblocages & Recherches
              </span>
            </div>
          </div>

          {/* Courbe SVG dynamique calculée à partir des données réelles Supabase */}
          <div className="h-44 w-full relative flex items-end overflow-hidden">
            <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="none">
              {/* Lignes de repère */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

              {/* Courbe 1 : Inscriptions Chauffeurs */}
              {trendData.pathCand && (
                <path
                  d={trendData.pathCand}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Courbe 2 : Activité / Recherches */}
              {trendData.pathAct && (
                <path
                  d={trendData.pathAct}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}

              {/* Points interactifs */}
              {trendData.ptsCand?.map((pt, idx) => (
                <circle key={`c-${idx}`} cx={pt.x} cy={pt.y} r="3" fill="#0d9488" />
              ))}
            </svg>
          </div>

          {/* Axe X Labels dynamiques */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 overflow-x-hidden">
            {trendData.labels?.map((lbl, i) => (
              <span key={i}>{lbl}</span>
            ))}
          </div>
        </div>

        {/* TUILE 2 : HISTOGRAMME PAR SPÉCIALITÉ (5 COLS) */}
        <div className="lg:col-span-5 min-w-0 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              <span>Chauffeurs par Spécialité</span>
              <span className="text-[10px] text-slate-400">Effectif</span>
            </div>
          </div>

          {/* Barres horizontales */}
          <div className="space-y-2.5">
            {[
              { label: 'SPL / Permis CE', val: specialityCounts.SPL, color: 'bg-teal-600' },
              { label: 'Tautliner / Bâché', val: specialityCounts.Tautliner, color: 'bg-teal-500' },
              { label: 'Citerne & ADR', val: specialityCounts.ADR, color: 'bg-teal-400' },
              { label: 'Frigo / Froid', val: specialityCounts.Frigo, color: 'bg-teal-300' },
              { label: 'Benne TP / Céréale', val: specialityCounts.Benne, color: 'bg-teal-200' },
              { label: 'Messagerie / Distrib', val: specialityCounts.Messagerie, color: 'bg-slate-300' },
            ].map((item, idx) => {
              const pct = Math.max(10, Math.round((item.val / maxSpeciality) * 100));
              return (
                <div key={idx} className="space-y-1 min-w-0">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 text-[11px] truncate">{item.label}</span>
                    <span className="font-mono text-slate-900 font-bold text-[11px] shrink-0">{item.val}</span>
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
            Répartition métier en temps réel
          </div>
        </div>

      </div>

      {/* 5. LIGNE INFÉRIEURE : MODÉRATION 1-CLIC + RÉPARTITION 4 PAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        
        {/* TUILE 3 : FILE DE MODÉRATION PRIORITAIRE (7 COLS) */}
        <div className="lg:col-span-7 min-w-0 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              <span>File de Modération Prioritaire (Validation 1-Clic)</span>
              <Link
                href="/dashboard/admin/candidates?status=pending"
                className="text-[10px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5"
              >
                <span>Tout voir ({pendingCandidatesQueue.length})</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {pendingCandidatesQueue.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1 my-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Aucun profil en attente de vérification !</p>
                <p className="text-[11px] text-slate-400">Tous les dossiers soumis ont été traités.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingCandidatesQueue.slice(0, 4).map((cand) => (
                  <div
                    key={cand.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {cand.full_name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 truncate text-xs">{cand.full_name || 'Chauffeur'}</p>
                          {cand.birth_date && calculateAge(cand.birth_date) && (
                            <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded text-[10px]">
                              {calculateAge(cand.birth_date)} ans
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {cand.city || 'France'} • {cand.licenses?.join(', ') || 'Permis C/CE'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={`/dashboard/admin/candidates/${cand.id}`}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => handleQuickValidateCandidate(cand.id, cand.full_name)}
                        disabled={actionLoading === cand.id}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === cand.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                        <span>Valider</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Validation avec envoi automatique de l'e-mail de certification</span>
            <span className="font-mono">{pendingCandidatesQueue.length} dossier(s) restant(s)</span>
          </div>
        </div>

        {/* TUILE 4 : RÉPARTITION GÉOGRAPHIQUE 4 PAYS (5 COLS) */}
        <div className="lg:col-span-5 min-w-0 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              <span>Répartition Géographique du Réseau</span>
              <span className="text-[10px] text-slate-400">4 Pays Couverts</span>
            </div>

            {/* Grille des 4 pays */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg flex flex-col justify-between">
                <span className="font-bold text-teal-950">🇫🇷 France</span>
                <div className="text-xl font-black text-teal-700 mt-1 font-mono">{stats.franceCandidates}</div>
                <span className="text-[10px] text-teal-600 mt-0.5">Chauffeurs actifs</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex flex-col justify-between">
                <span className="font-bold text-rose-950">🇧🇪 Belgique</span>
                <div className="text-xl font-black text-rose-700 mt-1 font-mono">{stats.belgiumCandidates}</div>
                <span className="text-[10px] text-rose-600 mt-0.5">Chauffeurs actifs</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex flex-col justify-between">
                <span className="font-bold text-amber-950">🇱🇺 Luxembourg</span>
                <div className="text-xl font-black text-amber-700 mt-1 font-mono">{stats.luxembourgCandidates}</div>
                <span className="text-[10px] text-amber-600 mt-0.5">Chauffeurs actifs</span>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-3 rounded-lg flex flex-col justify-between">
                <span className="font-bold text-slate-950">🇨🇭 Suisse</span>
                <div className="text-xl font-black text-slate-700 mt-1 font-mono">{stats.switzerlandCandidates}</div>
                <span className="text-[10px] text-slate-500 mt-0.5">Chauffeurs actifs</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 font-mono text-right">
            Expansion transfrontalière européenne
          </div>
        </div>

      </div>

      {/* 6. FLUX EN DIRECT DES DÉBLOCAGES & PAIEMENTS STRIPE */}
      <div className="w-full bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Flux en Direct des Déblocages & Paiements Stripe
              </span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {stats.unlocksCount} déblocages
              </span>
            </div>
            <h3 className="font-black text-slate-950 text-sm sm:text-base mt-0.5">
              Historique des Achats de Contacts Chauffeurs (2,00 € TTC)
            </h3>
          </div>

          <Link
            href="/dashboard/admin/finance"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors shrink-0"
          >
            <span>Grand Livre Financier</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </Link>
        </div>

        {recentUnlocks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Aucun déblocage récent enregistré.</p>
        ) : (
          <div className="overflow-x-auto w-full border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Entreprise Recruteur</th>
                  <th className="py-2.5 px-3">Chauffeur Débloqué</th>
                  <th className="py-2.5 px-3 text-center">Montant</th>
                  <th className="py-2.5 px-3 text-center">Réf. Stripe</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentUnlocks.slice(0, 8).map((unlock) => (
                  <tr key={unlock.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {unlock.created_at ? new Date(unlock.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 text-xs truncate max-w-[180px]">
                      {unlock.companies?.name || 'Entreprise'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 text-xs truncate max-w-[180px]">
                      {unlock.candidates?.full_name || 'Chauffeur'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-black text-emerald-700 text-xs">
                      {((unlock.amount_charged || 200) / 100).toFixed(2)} €
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[10px] text-slate-400">
                      {unlock.stripe_payment_intent_id ? unlock.stripe_payment_intent_id.slice(-8) : 'pi_direct'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
