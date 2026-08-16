'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  Trash2,
  Edit2,
  X,
  Check,
  Eye,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  Search,
  HelpCircle,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'approved' | 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobPreview, setSelectedJobPreview] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    job: null,
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') return router.push('/');

      const { data: fetchedJobs } = await supabase
        .from('jobs')
        .select('*, companies(name, country)')
        .order('created_at', { ascending: false });

      if (fetchedJobs) setJobs(fetchedJobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const getJobStatus = (job) => {
    if (job.status) return job.status;
    if (job.is_approved === true) return 'approved';
    if (job.is_approved === false) return 'rejected';
    return 'pending';
  };

  const handleModerateJob = async (jobId, newStatus) => {
    setActionLoading(true);
    try {
      const isApprovedBool = newStatus === 'approved';
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, is_approved: isApprovedBool })
        .eq('id', jobId);

      if (error) throw error;
      setJobs(
        jobs.map(j => (j.id === jobId ? { ...j, status: newStatus, is_approved: isApprovedBool } : j)),
      );
      toast.success(newStatus === 'approved' ? '✅ Annonce approuvée et mise en ligne !' : 'Annonce rejetée.');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  const requestDelete = job => {
    setConfirmModal({ isOpen: true, job });
  };

  const executeDelete = async () => {
    const job = confirmModal.job;
    setConfirmModal({ isOpen: false, job: null });
    if (!job) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', job.id);

      if (error) throw error;
      setJobs(jobs.filter(j => j.id !== job.id));
      toast.success(`Annonce "${job.title}" supprimée`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression de l'annonce");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: editingJob.title,
          location: editingJob.location,
          salary: editingJob.salary,
          description: editingJob.description,
          contract_type: editingJob.contract_type,
        })
        .eq('id', editingJob.id);

      if (error) throw error;

      setJobs(jobs.map(j => (j.id === editingJob.id ? { ...j, ...editingJob } : j)));
      setEditingJob(null);
      toast.success('Annonce modifiée avec succès');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la modification de l'annonce");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = jobs.filter(j => getJobStatus(j) === 'pending').length;
  const approvedCount = jobs.filter(j => getJobStatus(j) === 'approved').length;
  const rejectedCount = jobs.filter(j => getJobStatus(j) === 'rejected').length;

  const filteredJobs = jobs.filter(job => {
    const status = getJobStatus(job);
    const matchesTab = activeTab === 'all' || status === activeTab;
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 bg-slate-100/60 rounded-xl p-8">
        <RefreshCw className="h-8 w-8 text-slate-700 animate-spin" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
          Chargement de la Console de Modération des Offres...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden box-border">
      
      {/* 1. EN-TÊTE SUPÉRIEURE DE PILOTAGE MODÉRATION DES OFFRES */}
      <div className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md min-w-0">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-[11px] text-white">
              JB
            </div>
            <span className="font-bold text-xs text-slate-200">
              Modération des Annonces & Offres d'Emploi
            </span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-none">
            Validation & Contrôle Qualité des Postes Transporteurs
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En Direct Supabase
          </span>
        </div>

        {/* Barre d'outils rapides */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link
            href="/offres"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-colors shadow-2xs border border-slate-800 cursor-pointer"
          >
            <span>Voir Offres en Ligne</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>

          <button
            onClick={fetchJobs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Actualiser les annonces"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 2. BANDEAU DE CONTEXTE */}
      <div className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs min-w-0">
        <div className="flex items-center gap-2 flex-1 text-slate-400 min-w-0">
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="italic text-slate-500 truncate text-[11px] sm:text-xs">
            Approbation en 1 clic pour diffusion publique ou mise en réserve des offres suspectes.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-mono text-[11px]">
          <strong>{filteredJobs.length}</strong> annonces affichées / <strong>{jobs.length}</strong> total
        </div>
      </div>

      {/* 3. HERO SCORECARDS KPIS (4 COLONNES CLICQUABLES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
        
        {/* KPI 1 : En Attente */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-80">
            <span className="truncate">En Attente de Validation</span>
            <Clock className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-2 tracking-tight font-mono">
            {pendingCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-current/10 flex items-center justify-between text-xs opacity-80">
            <span className="text-[11px]">Priorité modération :</span>
            <span className="font-bold text-[10px]">À traiter</span>
          </div>
        </div>

        {/* KPI 2 : Approuvées */}
        <div
          onClick={() => setActiveTab('approved')}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-600/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            <span className="truncate">Approuvées & En Ligne</span>
            <ShieldCheck className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 mt-2 tracking-tight font-mono">
            {approvedCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Visibles sur /offres :</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              Actives
            </span>
          </div>
        </div>

        {/* KPI 3 : Rejetées */}
        <div
          onClick={() => setActiveTab('rejected')}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-600/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-rose-600">
            <span className="truncate">Offres Rejetées</span>
            <XCircle className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 mt-2 tracking-tight font-mono">
            {rejectedCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Non conformes :</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
              Bloquées
            </span>
          </div>
        </div>

        {/* KPI 4 : Total Offres */}
        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Total Annonces Déposées</span>
            <Briefcase className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight font-mono">
            {jobs.length}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Volume global :</span>
            <span className="font-bold font-mono text-slate-900 text-[10px]">100%</span>
          </div>
        </div>

      </div>

      {/* 4. BARRE DE RECHERCHE & ONGLETS DE STATUTS */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 min-w-0">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative flex-1 w-full min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre de poste, entreprise recruteur, ville..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-slate-50/70"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {[
              { id: 'pending', label: `⏳ En Attente (${pendingCount})` },
              { id: 'approved', label: `✅ Approuvées (${approvedCount})` },
              { id: 'rejected', label: `❌ Rejetées (${rejectedCount})` },
              { id: 'all', label: `📋 Toutes (${jobs.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. TABLEAU DU DATAGRID DE MODÉRATION HAUTE DENSITÉ */}
      <div className="w-full bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Console de Modération
              </span>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {filteredJobs.length} résultats
              </span>
            </div>
            <h3 className="font-black text-slate-950 text-sm sm:text-base mt-0.5">
              Annonces Déposées & Actions de Contrôle
            </h3>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">Aucune annonce trouvée dans cette sélection.</p>
        ) : (
          <div className="overflow-x-auto w-full border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Titre de l'Offre</th>
                  <th className="py-2.5 px-3">Entreprise Recruteur</th>
                  <th className="py-2.5 px-3">Localisation & Contrat</th>
                  <th className="py-2.5 px-3">Salaire Proposé</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                  <th className="py-2.5 px-3 text-center">Actions de Modération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredJobs.map((job) => {
                  const status = getJobStatus(job);
                  const countryFlag = job.companies?.country === 'BE' ? '🇧🇪' : job.companies?.country === 'LU' ? '🇱🇺' : job.companies?.country === 'CH' ? '🇨🇭' : '🇫🇷';

                  return (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[200px] text-xs">
                          {job.title}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Déposée le {job.created_at ? new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <span className="truncate max-w-[150px]">{job.companies?.name || 'Entreprise'}</span>
                          <span>{countryFlag}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-800 text-xs block truncate max-w-[130px]">{job.location || 'France'}</span>
                          <span className="inline-block bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded text-[10px]">
                            {job.contract_type || 'CDI'}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-emerald-700 text-xs">
                          {job.salary || 'Selon profil'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {status === 'approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            En Ligne
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Clock className="h-3 w-3 text-amber-600" />
                            En Attente
                          </span>
                        )}
                        {status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            <X className="h-3 w-3 text-rose-600" />
                            Rejetée
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedJobPreview(job)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold transition-colors cursor-pointer"
                            title="Aperçu rapide de l'offre"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {status !== 'approved' && (
                            <button
                              onClick={() => handleModerateJob(job.id, 'approved')}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Approuver et publier l'offre"
                            >
                              <Check className="h-3 w-3" />
                              <span>Valider</span>
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button
                              onClick={() => handleModerateJob(job.id, 'rejected')}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Rejeter cette offre"
                            >
                              <X className="h-3 w-3" />
                              <span>Rejeter</span>
                            </button>
                          )}

                          <button
                            onClick={() => setEditingJob(job)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => requestDelete(job)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md text-xs transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL APERÇU RAPIDE DE L'OFFRE */}
      {selectedJobPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aperçu fiche offre</span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{selectedJobPreview.title}</h3>
              </div>
              <button
                onClick={() => setSelectedJobPreview(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Entreprise</span>
                  <span className="font-bold text-slate-900">{selectedJobPreview.companies?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Localisation</span>
                  <span className="font-bold text-slate-900">{selectedJobPreview.location || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contrat</span>
                  <span className="font-bold text-slate-900">{selectedJobPreview.contract_type || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rémunération</span>
                  <span className="font-bold text-emerald-700 font-mono">{selectedJobPreview.salary || 'Non spécifié'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] uppercase font-bold mb-1">Description du Poste</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  {selectedJobPreview.description || 'Aucune description fournie.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  handleModerateJob(selectedJobPreview.id, 'approved');
                  setSelectedJobPreview(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
              >
                Approuver l'offre
              </button>
              <button
                onClick={() => setSelectedJobPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉDITION */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900">Modifier l'annonce</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Titre de l'offre</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={e => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Ville / Région</label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={e => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Salaire Indicatif</label>
                  <input
                    type="text"
                    value={editingJob.salary}
                    onChange={e => setEditingJob({ ...editingJob, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Description complète</label>
                <textarea
                  rows={5}
                  value={editingJob.description}
                  onChange={e => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Supprimer cette annonce ?"
        message={`Êtes-vous certain de vouloir supprimer l'annonce « ${confirmModal.job?.title} » ? Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, job: null })}
      />
    </div>
  );
}
