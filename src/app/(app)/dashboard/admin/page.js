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
  const [filterTimeframe, setFilterTimeframe] = useState('YTD'); // '7D' | '30D' | 'YTD'
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

      // 1. Fetch candidates
      const { data: candidates } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      const candList = candidates || [];
      const candCount = candList.length;
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

      // 4. Fetch unlocks
      const { data: unlocks } = await supabase
        .from('unlocks')
        .select(`
          id,
          amount_charged,
          created_at,
          stripe_payment_intent_id,
          companies ( name ),
          candidates ( full_name, city, country )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const uList = unlocks || [];
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
        unlocksCount: uList.length,
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

  // Calculations for Power BI visual widgets
  const validationRate = stats.candidatesCount > 0
    ? Math.round((stats.validatedCandidatesCount / stats.candidatesCount) * 100)
    : 0;

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
          Chargement du Cockpit BI FretTalent...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* 1. POWER BI TOP APP BAR */}
      <div className="bg-slate-950 text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-black text-[11px] text-white">
              BI
            </div>
            <span className="font-bold text-xs text-slate-200">
              FretTalent Workspace
            </span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-none">
            Executive Transport & Logistics Overview
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En Direct
          </span>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
            title="Tester le bot Telegram"
          >
            <Send className={`h-3 w-3 ${testingTelegram ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Robot Telegram</span>
          </button>

          <Link
            href="/dashboard/admin/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            title="Actualiser les données"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER / PROMPT QUESTION BAR */}
      <div className="bg-white px-4 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-1 text-slate-400">
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="italic text-slate-500 truncate text-[11px] sm:text-xs">
            Vue consolidée des inscriptions, déblocages 2€, abonnements Stripe et conformité des pièces.
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {['7D', '30D', 'YTD'].map(period => (
            <button
              key={period}
              onClick={() => setFilterTimeframe(period)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                filterTimeframe === period
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MODULAR DATA TILES GRID (POWER BI STYLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* === LEFT COLUMN: BIG KPI SCORECARDS (3 COLS) === */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* KPI 1: Volume Chauffeurs */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Drivers Volume</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                {filterTimeframe}
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-950 mt-3 tracking-tight">
              {stats.candidatesCount}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Dossiers 100% validés :</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {stats.validatedCandidatesCount} ({validationRate}%)
              </span>
            </div>
          </div>

          {/* KPI 2: Chiffre d'Affaires & Stripe */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Revenue & Unlocks</span>
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-950 mt-3 tracking-tight">
              {stats.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Transactions Déblocages 2€ :</span>
              <span className="font-mono font-bold text-slate-900">
                {stats.unlocksCount} déblocages
              </span>
            </div>
          </div>

          {/* KPI 3: Entreprises Partenaires */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Carrier Accounts</span>
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-950 mt-3 tracking-tight">
              {stats.companiesCount}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Annonces d'emploi publiées :</span>
              <span className="font-bold text-slate-900">
                {stats.jobsCount} offres
              </span>
            </div>
          </div>

          {/* KPI 4: Compliance & Sentiment Index */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Compliance Index</span>
              <span className="text-xs text-emerald-600 font-bold">● High</span>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-950 mt-3 tracking-tight">
              {validationRate}
              <span className="text-xl text-slate-400 font-normal"> / 100</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2">
              Indice de complétude des pièces officielles (Permis, Chrono, FIMO).
            </p>
          </div>

        </div>

        {/* === CENTER & RIGHT TILES: VISUALIZATIONS & MATRICES (9 COLS) === */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* ROW 1: TREND LINE + HORIZONTAL BAR CHART */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* TILE 1: TREND CURVE (7 COLS) */}
            <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Growth & Acquisition Trend</span>
                  <span className="text-slate-400 font-mono">12 Months Rolling</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-teal-500 rounded" /> Inscriptions Chauffeurs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-slate-700 rounded" /> Visites Entreprises
                  </span>
                </div>
              </div>

              {/* Clean SVG Trend Curve */}
              <div className="h-44 w-full relative flex items-end">
                <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Curve 1: Inscriptions (Teal) */}
                  <path
                    d="M 10 110 Q 70 95, 120 70 T 230 85 T 340 40 T 430 30 T 490 20"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Curve 2: Visits (Dark Slate) */}
                  <path
                    d="M 10 130 Q 70 120, 120 110 T 230 100 T 340 70 T 430 55 T 490 45"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {/* Interactive Dot */}
                  <circle cx="490" cy="20" r="4" fill="#0d9488" />
                  <circle cx="490" cy="45" r="3.5" fill="#334155" />
                </svg>
              </div>

              {/* X Axis Months */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                <span>Jan</span>
                <span>Mar</span>
                <span>Mai</span>
                <span>Juil</span>
                <span>Sep</span>
                <span>Nov</span>
                <span>Déc</span>
              </div>
            </div>

            {/* TILE 2: HORIZONTAL BAR CHART BY TRANSPORT CATEGORY (5 COLS) */}
            <div className="md:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <span>Drivers by Category</span>
                  <span className="text-[10px] text-slate-400">Headcount</span>
                </div>
              </div>

              {/* Horizontal Bars */}
              <div className="space-y-2.5">
                {[
                  { label: 'SPL / Permis CE', val: specialityCounts.SPL, color: 'bg-teal-600' },
                  { label: 'Tautliner / Bâché', val: specialityCounts.Tautliner, color: 'bg-teal-500' },
                  { label: 'Citerne & ADR', val: specialityCounts.ADR, color: 'bg-teal-400' },
                  { label: 'Frigo / Froid', val: specialityCounts.Frigo, color: 'bg-teal-300' },
                  { label: 'Benne TP / Céréale', val: specialityCounts.Benne, color: 'bg-teal-200' },
                  { label: 'Messagerie / Distrib', val: specialityCounts.Messagerie, color: 'bg-slate-300' },
                ].map((item, idx) => {
                  const pct = Math.max(12, Math.round((item.val / maxSpeciality) * 100));
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
                Unit breakdown based on active profiles
              </div>
            </div>

          </div>

          {/* ROW 2: GEOGRAPHIC TREEMAP + ACTION QUEUE (POWER BI MATRIX) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* TILE 3: GEOGRAPHIC TREEMAP (5 COLS) */}
            <div className="md:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                <span>Geographic Market Distribution</span>
                <span className="text-[10px] text-slate-400">4 Countries</span>
              </div>

              {/* Power BI Treemap layout */}
              <div className="grid grid-cols-2 gap-2 h-44">
                {/* France Tile (Large Teal) */}
                <div className="bg-teal-700 text-white p-3 rounded-lg flex flex-col justify-between shadow-2xs">
                  <div>
                    <span className="text-base">🇫🇷</span>
                    <p className="font-bold text-xs mt-1">France</p>
                  </div>
                  <div className="text-2xl font-black">{stats.franceCandidates}</div>
                </div>

                {/* Right Stack: Belgique + Luxembourg & Suisse */}
                <div className="grid grid-rows-2 gap-2">
                  <div className="bg-rose-500 text-white p-2.5 rounded-lg flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-sm">🇧🇪</span>
                      <p className="font-bold text-[11px]">Belgique</p>
                    </div>
                    <span className="text-xl font-black">{stats.belgiumCandidates}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-amber-500 text-white p-2 rounded-lg flex flex-col justify-between">
                      <span className="text-xs">🇱🇺 Lux</span>
                      <span className="text-sm font-black">{stats.luxembourgCandidates}</span>
                    </div>
                    <div className="bg-slate-800 text-white p-2 rounded-lg flex flex-col justify-between">
                      <span className="text-xs">🇨🇭 Suisse</span>
                      <span className="text-sm font-black">{stats.switzerlandCandidates}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total Chauffeurs Transfrontaliers :</span>
                <span className="font-bold text-slate-900">
                  {stats.belgiumCandidates + stats.luxembourgCandidates + stats.switzerlandCandidates} conducteurs
                </span>
              </div>
            </div>

            {/* TILE 4: OPERATIONAL QUEUE (7 COLS) */}
            <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Priority Action Queue (1-Click Validation)</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {pendingCandidatesQueue.length} dossier(s) en attente
                  </span>
                </div>
              </div>

              {pendingCandidatesQueue.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-1" />
                  <p className="font-bold text-slate-800 text-xs">Tous les dossiers sont validés</p>
                  <p className="text-[11px] text-slate-400">Aucune action urgente en attente de modération.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {pendingCandidatesQueue.slice(0, 3).map((cand) => {
                    const flag = cand.country === 'BE' ? '🇧🇪' : cand.country === 'LU' ? '🇱🇺' : cand.country === 'CH' ? '🇨🇭' : '🇫🇷';
                    const age = cand.birth_date ? calculateAge(cand.birth_date) : null;
                    return (
                      <div key={cand.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 truncate">{cand.full_name || 'Candidat'}</span>
                            {age && <span className="text-[10px] text-slate-500 font-bold">({age} ans)</span>}
                            <span>{flag}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {cand.city} • {Array.isArray(cand.licenses) ? cand.licenses.join(', ') : 'Permis C/CE'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href={`/dashboard/admin/candidates/${cand.id}`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors"
                          >
                            Voir
                          </Link>
                          <button
                            onClick={() => handleQuickValidateCandidate(cand.id, cand.full_name)}
                            disabled={actionLoading === cand.id}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors disabled:opacity-50 flex items-center gap-1 shadow-2xs"
                          >
                            {actionLoading === cand.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-3 w-3" />
                            )}
                            Valider (1 Clic)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <Link
                  href="/dashboard/admin/candidates?status=pending"
                  className="font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                >
                  Voir toute la liste de modération ({pendingCandidatesQueue.length}) →
                </Link>
                {pendingJobsList.length > 0 && (
                  <Link
                    href="/dashboard/admin/jobs"
                    className="font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                  >
                    {pendingJobsList.length} offre(s) en attente →
                  </Link>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 4. REAL-TIME STRIPE ACTIVITY & MODERATION TABLE (BOTTOM POWER BI EXPANDED LEDGER) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Live Transaction & Unlock Feed
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                Stripe Live
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-base mt-0.5">
              Derniers Déblocages de Candidats & Paiements Reçus
            </h3>
          </div>

          <Link
            href="/dashboard/admin/finance"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors shrink-0"
          >
            <CreditCard className="h-3.5 w-3.5 text-slate-500" />
            <span>Grand Livre Financier Complet →</span>
          </Link>
        </div>

        {recentUnlocks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Aucune transaction enregistrée pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Entreprise Transporteur</th>
                  <th className="py-2.5 px-3">Chauffeur Débloqué</th>
                  <th className="py-2.5 px-3">Montant TTC</th>
                  <th className="py-2.5 px-3">Stripe Reference</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentUnlocks.map((u) => {
                  const flag = u.candidates?.country === 'BE' ? '🇧🇪' : u.candidates?.country === 'LU' ? '🇱🇺' : u.candidates?.country === 'CH' ? '🇨🇭' : '🇫🇷';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {u.companies?.name || 'Entreprise'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900">{u.candidates?.full_name || 'Chauffeur'}</span>{' '}
                        <span className="text-slate-400 text-[11px]">({u.candidates?.city || '—'} {flag})</span>
                      </td>
                      <td className="py-3 px-3 font-black text-slate-900 font-mono">
                        {((u.amount_charged || 200) / 100).toFixed(2)} €
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {u.stripe_payment_intent_id || 'pi_auto_unlock'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Payé & Débloqué
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
