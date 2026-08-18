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
  Activity,
  ArrowRight,
  ShieldAlert,
  Calendar,
  DollarSign,
  AlertCircle,
  Eye,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');

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
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('🚀 Alerte Telegram envoyée avec succès sur votre téléphone !');
      } else {
        toast.error('Erreur Telegram : ' + (data.error?.description || data.error || 'Token non configuré'));
      }
    } catch (e) {
      toast.error('Erreur de communication Telegram');
    } finally {
      setTestingTelegram(false);
    }
  };

  // Filtrage des candidats pour la liste de traitement rapide
  const filteredCandidates = useMemo(() => {
    return allCandidates.filter(c => {
      const nameMatch = (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.postal_code || '').includes(searchQuery);

      if (!nameMatch) return false;

      if (quickFilter === 'pending') return !c.validated;
      if (quickFilter === 'validated') return c.validated;
      if (quickFilter === 'with_docs') {
        return c.documents && Object.keys(c.documents).length > 0;
      }
      return true;
    });
  }, [allCandidates, searchQuery, quickFilter]);

  // Données de distribution géographique calculées
  const totalCountry = (stats.franceCandidates + stats.belgiumCandidates + stats.luxembourgCandidates + stats.switzerlandCandidates) || 1;
  const geoShare = {
    fr: Math.round((stats.franceCandidates / totalCountry) * 100),
    be: Math.round((stats.belgiumCandidates / totalCountry) * 100),
    lu: Math.round((stats.luxembourgCandidates / totalCountry) * 100),
    ch: Math.round((stats.switzerlandCandidates / totalCountry) * 100),
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Chargement du centre de contrôle...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* =========================================================
          1. HEADER HERO DU TABLEAU DE BORD (Large, Pro, Spacieux)
          ========================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#FF7A00] text-[11px] font-black uppercase tracking-wider border border-orange-200/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Pilotage SaaS FretTalent
            </span>
            <span className="text-xs font-bold text-slate-600">• 4 Pays Actifs (FR, BE, LU, CH)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Vue d'ensemble de la Plateforme
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Suivi des validations chauffeurs en temps réel, modération des offres, flux de trésorerie Stripe et supervision Telegram.
          </p>
        </div>

        {/* Boutons d'actions rapides */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>

          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white shadow-md shadow-orange-500/25 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{testingTelegram ? 'Test en cours...' : 'Tester Bot Telegram'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. KPI CARDS : GRILLE LARGE (4 Cartes Maîtresses SaaS)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 : Candidats Inscrits & En Attente (ALERTE ROUGE SI ATTENTE) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Total Chauffeurs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {stats.candidatesCount}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {stats.pendingCandidatesCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-50 text-[#E53935] border border-red-200">
                  <ShieldAlert className="w-3 h-3" />
                  {stats.pendingCandidatesCount} à certifier
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-[#43A047] border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Tous certifiés
                </span>
              )}
              <span className="text-[11px] text-slate-600 font-semibold">{stats.validatedCandidatesCount} certifiés 🛡️</span>
            </div>
          </div>

          <Link
            href="/dashboard/admin/candidates"
            className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#FF7A00] hover:text-[#E56700]"
          >
            <span>Gérer les dossiers chauffeurs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* KPI 2 : Entreprises & Recruteurs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Entreprises Actives
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {stats.companiesCount}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                <Activity className="w-3 h-3 text-emerald-700" />
                Transport & Logistique
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/admin/companies"
            className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-950"
          >
            <span>Voir les comptes entreprises</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* KPI 3 : Offres d'emploi & Modération */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Offres d'Emploi
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {stats.jobsCount}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {stats.pendingJobsCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3" />
                  {stats.pendingJobsCount} en attente
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3 h-3" />
                  Toutes validées
                </span>
              )}
            </div>
          </div>

          <Link
            href="/dashboard/admin/jobs"
            className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-950"
          >
            <span>Modérer les annonces</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* KPI 4 : Revenus Déblocages & Stripe */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Déblocages & Recettes
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#43A047] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {stats.totalRevenue.toFixed(2)} €
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                {stats.unlocksCount} déblocages effectués
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/admin/finance"
            className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-950"
          >
            <span>Consulter les finances</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* =========================================================
          3. GRILLE CENTRALE : STATISTIQUES GÉO & MODÉRATION RAPIDE
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE (2/3) : GESTION RAPIDE DES CANDIDATS & VALIDATIONS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            
            {/* Header de section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#FF7A00]" />
                  Derniers Chauffeurs Inscrits & Documents
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Certifiez les profils en 1 clic pour activer leur visibilité auprès des transporteurs.
                </p>
              </div>

              {/* Filtres de statut */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'pending', label: 'À valider' },
                  { key: 'validated', label: 'Certifiés' },
                  { key: 'with_docs', label: 'Avec docs' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setQuickFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      quickFilter === f.key
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville ou code postal..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
              />
            </div>

            {/* Liste des candidats */}
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
              {filteredCandidates.length === 0 ? (
                <div className="py-12 text-center text-slate-600 text-xs">
                  Aucun chauffeur ne correspond aux critères de recherche.
                </div>
              ) : (
                filteredCandidates.slice(0, 15).map(candidate => {
                  const docs = candidate.documents || {};
                  const docCount = Object.keys(docs).length;
                  const isPending = !candidate.validated;

                  return (
                    <div
                      key={candidate.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-2xl px-2.5 transition-colors"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                            candidate.validated
                              ? 'bg-emerald-50 text-[#43A047] border border-emerald-200'
                              : 'bg-orange-50 text-[#FF7A00] border border-orange-200'
                          }`}
                        >
                          {candidate.country === 'BE' ? '🇧🇪' : candidate.country === 'LU' ? '🇱🇺' : candidate.country === 'CH' ? '🇨🇭' : '🇫🇷'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/dashboard/admin/candidates/${candidate.id}`}
                              className="text-sm font-black text-slate-900 hover:text-[#FF7A00] transition-colors truncate"
                            >
                              {candidate.full_name || 'Chauffeur sans nom'}
                            </Link>

                            {candidate.validated ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" /> Certifié 🛡️
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-[#E53935]">
                                <Clock className="w-3 h-3" /> En attente
                              </span>
                            )}

                            {docCount > 0 && (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                📑 {docCount} doc{docCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                            <span>{candidate.city || 'Ville non renseignée'} ({candidate.postal_code || '—'})</span>
                            <span>•</span>
                            <span>Permis : {Array.isArray(candidate.licenses) && candidate.licenses.length > 0 ? candidate.licenses.join(', ') : 'C/CE'}</span>
                            {candidate.birth_date && (
                              <>
                                <span>•</span>
                                <span>{calculateAge(candidate.birth_date)} ans</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Link
                          href={`/dashboard/admin/candidates/${candidate.id}`}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Détails</span>
                        </Link>

                        {isPending && (
                          <button
                            onClick={() => handleQuickValidateCandidate(candidate.id, candidate.full_name)}
                            disabled={actionLoading === candidate.id}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{actionLoading === candidate.id ? 'Validation...' : 'Valider'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <Link
                href="/dashboard/admin/candidates"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#FF7A00] hover:underline"
              >
                <span>Voir le répertoire complet des {stats.candidatesCount} chauffeurs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* TABLEAU EN DIRECT DES DÉBLOCAGES STRIPE RÉCENTS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FF7A00]" />
                  Dernières Transactions Stripe
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Flux en direct des achats de coordonnées chauffeurs (4,99 € TTC).
                </p>
              </div>
              <Link
                href="/dashboard/admin/finance"
                className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1"
              >
                <span>Grand livre financier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentUnlocks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-600">
                Aucune transaction enregistrée pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Entreprise Recruteur</th>
                      <th className="py-2.5 px-3">Chauffeur</th>
                      <th className="py-2.5 px-3 text-right">Montant</th>
                      <th className="py-2.5 px-3 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentUnlocks.slice(0, 5).map(unlock => (
                      <tr key={unlock.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {unlock.created_at ? new Date(unlock.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 truncate max-w-[150px]">
                          {unlock.companies?.name || 'Entreprise'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 truncate max-w-[150px]">
                          {unlock.candidates?.full_name || 'Chauffeur'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 text-xs">
                          {((unlock.amount_charged || 200) / 100).toFixed(2)} €
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Check className="h-2.5 w-2.5" />
                            Succès
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

        {/* COLONNE DROITE (1/3) : RÉPARTITION GÉOGRAPHIQUE & OFFRES EN ATTENTE */}
        <div className="space-y-6">
          
          {/* Carte 1 : Répartition Géographique (France, Belgique, Luxembourg, Suisse) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span>Répartition par Pays</span>
              <span className="text-[11px] font-bold text-slate-600">{stats.candidatesCount} Chauffeurs</span>
            </h3>

            {/* Barres de progression par pays */}
            <div className="space-y-3.5 pt-1">
              
              {/* France */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">🇫🇷 France</span>
                  <span>{stats.franceCandidates} ({geoShare.fr}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#FF7A00] h-full rounded-full transition-all" style={{ width: `${geoShare.fr}%` }} />
                </div>
              </div>

              {/* Belgique */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">🇧🇪 Belgique</span>
                  <span>{stats.belgiumCandidates} ({geoShare.be}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${geoShare.be}%` }} />
                </div>
              </div>

              {/* Luxembourg */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">🇱🇺 Luxembourg</span>
                  <span>{stats.luxembourgCandidates} ({geoShare.lu}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${geoShare.lu}%` }} />
                </div>
              </div>

              {/* Suisse */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">🇨🇭 Suisse</span>
                  <span>{stats.switzerlandCandidates} ({geoShare.ch}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full transition-all" style={{ width: `${geoShare.ch}%` }} />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
              Couverture active sur les 4 zones frontalières et grands bassins logistiques.
            </p>
          </div>

          {/* Carte 2 : Annonces nécessitant une modération rapide */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" />
                Modération Annonces
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                {pendingJobsList.length} en attente
              </span>
            </div>

            {pendingJobsList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-600">
                ✅ Aucune offre en attente de modération.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingJobsList.slice(0, 3).map(job => (
                  <div
                    key={job.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-slate-900 leading-tight">
                        {job.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-600 shrink-0">
                        {job.city || 'France'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Par : <strong>{job.companies?.name || 'Entreprise'}</strong>
                    </p>
                    <div className="pt-1 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleQuickApproveJob(job.id, job.title)}
                        disabled={actionLoading === job.id}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {actionLoading === job.id ? '...' : 'Approuver'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/dashboard/admin/jobs"
                className="flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-950"
              >
                <span>Accéder à toute la modération</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Carte 3 : Support & Tchats Ouverts */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md shadow-slate-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Support En Ligne
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black font-mono">
                {stats.openSupportConvCount} conversation{stats.openSupportConvCount > 1 ? 's' : ''} ouverte{stats.openSupportConvCount > 1 ? 's' : ''}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Répondez directement aux chauffeurs et transporteurs en temps réel.
              </p>
            </div>

            <Link
              href="/dashboard/admin/chat"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E56700] text-white text-xs font-black tracking-wide transition-all shadow-md shadow-orange-500/25 cursor-pointer"
            >
              <span>Ouvrir la Messagerie Support</span>
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
