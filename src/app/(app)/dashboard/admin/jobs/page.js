'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Trash2, Edit2, X, Check, Eye, EyeOff, ShieldCheck, AlertCircle, Clock, CheckCircle2, Briefcase, MapPin, Building2, ExternalLink } from 'lucide-react';
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
        .select('*, companies(name)')
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
      toast.success(newStatus === 'approved' ? '✅ Annonce approuvée avec succès !' : 'Annonce rejetée.');
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

  const handleSaveEdit = async e => {
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
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-slate-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* HEADER EXECUTIVE */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Matrice de Modération des Offres
            </span>
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {jobs.length} annonces
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
            Modération des Annonces de Recrutement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation des offres d'emploi publiées par les transporteurs avant diffusion publique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* TABS & SCORECARD ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span>En Attente</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black mt-1">{pendingCount}</div>
        </div>

        <div
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span>Approuvées & En Ligne</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black mt-1">{approvedCount}</div>
        </div>

        <div
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span>Rejetées</span>
            <X className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black mt-1">{rejectedCount}</div>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span>Total Annonces</span>
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black mt-1">{jobs.length}</div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <input
          type="text"
          placeholder="Rechercher par titre de poste, entreprise, ville..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/70"
        />
      </div>

      {/* JOBS DATAGRID */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            Aucune annonce trouvée dans cette catégorie.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Titre de l'offre</th>
                  <th className="py-3 px-4">Entreprise</th>
                  <th className="py-3 px-4">Localisation & Salaire</th>
                  <th className="py-3 px-4">Contrat</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-center">Actions de Modération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredJobs.map((job) => {
                  const status = getJobStatus(job);
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>
                          <span>{job.title}</span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5 font-normal">
                            Publiée le {job.created_at ? new Date(job.created_at).toLocaleDateString('fr-FR') : '—'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {job.companies?.name || 'Entreprise'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="block text-slate-900 font-medium">{job.location || 'France'}</span>
                          <span className="block text-[11px] text-emerald-700 font-mono font-bold">{job.salary || 'Selon profil'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {job.contract_type || 'CDI'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {status === 'approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Approuvée
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            <Clock className="h-3 w-3 text-amber-600" />
                            En Attente
                          </span>
                        )}
                        {status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            <X className="h-3 w-3 text-rose-600" />
                            Rejetée
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedJobPreview(job)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Aperçu rapide de l'offre"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {status !== 'approved' && (
                            <button
                              onClick={() => handleModerateJob(job.id, 'approved')}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Approuver cette offre"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approuver</span>
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button
                              onClick={() => handleModerateJob(job.id, 'rejected')}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Rejeter cette offre"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Rejeter</span>
                            </button>
                          )}

                          <button
                            onClick={() => setEditingJob(job)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => requestDelete(job)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Supprimer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aperçu de l'offre</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedJobPreview.title}</h3>
              </div>
              <button
                onClick={() => setSelectedJobPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
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
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Salaire</span>
                  <span className="font-bold text-emerald-700 font-mono">{selectedJobPreview.salary || 'Non spécifié'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Description</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                Approuver l'offre
              </button>
              <button
                onClick={() => setSelectedJobPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉDITION */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">Modifier l'annonce</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Titre</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={e => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Ville</label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={e => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Salaire</label>
                  <input
                    type="text"
                    value={editingJob.salary}
                    onChange={e => setEditingJob({ ...editingJob, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Description</label>
                <textarea
                  rows={5}
                  value={editingJob.description}
                  onChange={e => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Annuler
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
        message={`Êtes-vous certain de vouloir supprimer l'annonce "${confirmModal.job?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, job: null })}
      />
    </div>
  );
}
