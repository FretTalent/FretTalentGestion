'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Trash2, Edit2, X, Check, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
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
      toast.success('Annonce mise à jour avec succès');
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
      setJobs(
        jobs.map(j => (j.id === editingJob.id ? { ...j, ...editingJob } : j)),
      );
      setEditingJob(null);
      toast.success('Annonce modifiée avec succès');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la modification de l'annonce");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const filteredJobs = jobs.filter(j => getJobStatus(j) === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Modération des Annonces
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Gérez les offres d'emploi, validez les nouvelles annonces et supprimez
          celles obsolètes.
        </p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-6 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'pending'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          En attente ({jobs.filter(j => getJobStatus(j) === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-4 px-6 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'approved'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          En ligne ({jobs.filter(j => getJobStatus(j) === 'approved').length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-4 px-6 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'rejected'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Rejetées ({jobs.filter(j => getJobStatus(j) === 'rejected').length})
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredJobs.length === 0 ? (
          <p className="text-slate-400 text-sm p-12 text-center">
            Aucune offre trouvée dans cette catégorie.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredJobs.map(job => {
              const currentStatus = getJobStatus(job);
              return (
              <div key={job.id} className="p-6">
                {editingJob?.id === job.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-800">
                        Modifier l'annonce
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingJob(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Titre de l'annonce
                        </label>
                        <input
                          type="text"
                          required
                          value={editingJob.title}
                          onChange={e =>
                            setEditingJob({
                              ...editingJob,
                              title: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Contrat
                        </label>
                        <input
                          type="text"
                          required
                          value={editingJob.contract_type}
                          onChange={e =>
                            setEditingJob({
                              ...editingJob,
                              contract_type: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Localisation
                        </label>
                        <input
                          type="text"
                          required
                          value={editingJob.location}
                          onChange={e =>
                            setEditingJob({
                              ...editingJob,
                              location: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Salaire (Optionnel)
                        </label>
                        <input
                          type="text"
                          value={editingJob.salary || ''}
                          onChange={e =>
                            setEditingJob({
                              ...editingJob,
                              salary: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        required
                        value={editingJob.description}
                        onChange={e =>
                          setEditingJob({
                            ...editingJob,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                      ></textarea>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingJob(null)}
                        className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-4 py-2 text-sm font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Sauvegarder
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {job.contract_type}
                        </span>
                        {currentStatus === 'approved' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                            <Check className="w-3 h-3 mr-1" /> En ligne
                          </span>
                        )}
                        {currentStatus === 'rejected' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            <EyeOff className="w-3 h-3 mr-1" /> Hors ligne
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        🏢 Entreprise : {job.companies?.name || 'Inconnue'}
                      </p>
                      <div className="text-xs text-slate-500">
                        📍 Localisation : {job.location}{' '}
                        {job.salary && ` | 💶 Salaire : ${job.salary}`}
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 max-w-4xl line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 justify-end">
                      {currentStatus === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              handleModerateJob(job.id, 'approved')
                            }
                            disabled={actionLoading}
                            className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors gap-1"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() =>
                              handleModerateJob(job.id, 'rejected')
                            }
                            disabled={actionLoading}
                            className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors gap-1"
                          >
                            Rejeter
                          </button>
                        </>
                      )}

                      {currentStatus === 'approved' && (
                        <button
                          onClick={() => handleModerateJob(job.id, 'rejected')}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors gap-1"
                          title="Mettre hors ligne"
                        >
                          <EyeOff className="w-4 h-4" /> Masquer
                        </button>
                      )}

                      {currentStatus === 'rejected' && (
                        <button
                          onClick={() => handleModerateJob(job.id, 'approved')}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors gap-1"
                          title="Remettre en ligne"
                        >
                          <Eye className="w-4 h-4" /> Publier
                        </button>
                      )}

                      <button
                        onClick={() => setEditingJob(job)}
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors gap-1"
                        title="Modifier l'annonce"
                      >
                        <Edit2 className="w-4 h-4" /> Éditer
                      </button>

                      <button
                        onClick={() => requestDelete(job)}
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors gap-1"
                        title="Supprimer l'annonce"
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Supprimer cette annonce ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement l'annonce "${confirmModal.job?.title}" ?`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, job: null })}
        variant="danger"
        confirmText="Oui, supprimer"
      />
    </div>
  );
}
