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
  Clock,
  Briefcase,
  ExternalLink,
  Search,
  Building2,
  MapPin,
  AlertCircle,
  CheckCircle2,
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
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Chargement des offres d'emploi...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. HEADER HERO JOBS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-wider border border-amber-200/60 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Modération des Annonces Transport
            </span>
            <span className="text-xs font-bold text-slate-600">• Contrôle Qualité des Postes</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Modération des Offres d'Emploi
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Validation rapide en 1 clic pour publication sur la vitrine publique ou rejet des annonces non conformes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            href="/offres"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <span>Voir Offres en Ligne</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={fetchJobs}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Actualiser les annonces"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* En Attente (Amber) */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">
              En Attente
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeTab === 'pending' ? 'bg-white/10 text-white' : 'bg-amber-50 text-amber-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {pendingCount}
            </div>
            <p className="text-xs mt-2 opacity-90 font-semibold">
              Priorité modération
            </p>
          </div>
        </div>

        {/* Approuvées (Vert) */}
        <div
          onClick={() => setActiveTab('approved')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            activeTab === 'approved'
              ? 'bg-[#43A047] text-white border-[#43A047] shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">
              Approuvées & En Ligne
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeTab === 'approved' ? 'bg-white/10 text-white' : 'bg-emerald-50 text-[#43A047]'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {approvedCount}
            </div>
            <p className="text-xs mt-2 opacity-90 font-semibold">
              Visibles sur /offres
            </p>
          </div>
        </div>

        {/* Rejetées (Rouge) */}
        <div
          onClick={() => setActiveTab('rejected')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            activeTab === 'rejected'
              ? 'bg-[#E53935] text-white border-[#E53935] shadow-md ring-2 ring-red-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">
              Rejetées / Bloquées
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeTab === 'rejected' ? 'bg-white/10 text-white' : 'bg-red-50 text-[#E53935]'}`}>
              <X className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {rejectedCount}
            </div>
            <p className="text-xs mt-2 opacity-90 font-semibold">
              Hors ligne
            </p>
          </div>
        </div>

        {/* Total Annonces */}
        <div
          onClick={() => setActiveTab('all')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            activeTab === 'all'
              ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-75">
              Total Déposées
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeTab === 'all' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {jobs.length}
            </div>
            <p className="text-xs mt-2 opacity-75 font-semibold">
              Historique complet
            </p>
          </div>
        </div>

      </div>

      {/* 3. TABLEAU DES OFFRES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="Rechercher par titre, entreprise ou ville..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            {[
              { id: 'pending', label: 'À Valider' },
              { id: 'approved', label: 'Approuvées' },
              { id: 'rejected', label: 'Rejetées' },
              { id: 'all', label: 'Toutes' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-600">
            Aucune offre d'emploi dans cette section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Titre de l'Offre</th>
                  <th className="py-3 px-3">Entreprise</th>
                  <th className="py-3 px-3">Localisation</th>
                  <th className="py-3 px-3 text-center">Type Contrat</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredJobs.map(job => {
                  const status = getJobStatus(job);

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-black text-slate-900">
                        {job.title}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {job.companies?.name || 'Entreprise'}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {job.location || job.city || 'France'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          {job.contract_type || 'CDI'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#43A047] border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> En Ligne
                          </span>
                        ) : status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-[#E53935] border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <X className="w-3 h-3" /> Rejetée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> À modérer
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status !== 'approved' && (
                            <button
                              onClick={() => handleModerateJob(job.id, 'approved')}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer"
                              title="Approuver l'offre"
                            >
                              Approuver
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button
                              onClick={() => handleModerateJob(job.id, 'rejected')}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                              title="Rejeter l'offre"
                            >
                              Rejeter
                            </button>
                          )}

                          <button
                            onClick={() => requestDelete(job)}
                            className="p-1.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Supprimer cette offre d'emploi ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement l'annonce "${confirmModal.job?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, job: null })}
      />

    </div>
  );
}
