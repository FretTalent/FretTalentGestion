'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Search, Trash2, FileText, Download, X, Users, Shield, Building2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminUsers() {
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocsUser, setSelectedDocsUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    user: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

      const { data: profiles } = await supabase
        .from('profiles')
        .select(
          `
          id, 
          role, 
          created_at,
          candidates(full_name, documents),
          companies(name)
        `,
        )
        .order('created_at', { ascending: false });

      if (profiles) setUsersList(profiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    setActionLoading(true);
    const newRole = currentRole === 'candidate' ? 'recruiter' : 'candidate';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      setUsersList(
        usersList.map(u => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      toast.success('Rôle mis à jour avec succès');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du changement de rôle');
    } finally {
      setActionLoading(false);
    }
  };

  const requestDelete = (user, displayName) => {
    setConfirmModal({ isOpen: true, user: { id: user.id, name: displayName } });
  };

  const executeDelete = async () => {
    const { id: userId, name } = confirmModal.user;
    setConfirmModal({ isOpen: false, user: null });

    setActionLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsersList(usersList.filter(u => u.id !== userId));
        toast.success(`Le compte de ${name} a été supprimé`);
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDocument = async path => {
    try {
      const { data, error } = await supabase.storage
        .from('candidate-documents')
        .createSignedUrl(path, 60);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la récupération du document.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Chargement des profils d'utilisateurs...
        </p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(usr => {
    const term = searchTerm.toLowerCase();
    let name = '';
    if (usr.role === 'candidate' && usr.candidates)
      name = usr.candidates.full_name || '';
    if (usr.role === 'recruiter' && usr.companies)
      name = usr.companies.name || '';
    if (usr.role === 'admin') name = 'admin';

    return (
      name.toLowerCase().includes(term) ||
      usr.id.includes(term) ||
      usr.role.includes(term)
    );
  });

  const groupedUsers = {
    recruiter: filteredUsers.filter(u => u.role === 'recruiter'),
    candidate: filteredUsers.filter(u => u.role === 'candidate'),
    admin: filteredUsers.filter(u => u.role === 'admin'),
  };

  const renderTable = (users, title, badgeColor) => {
    if (users.length === 0) return null;

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>{title}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
              {users.length}
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Identifiant & Nom</th>
                <th className="py-3 px-3">Date d'inscription</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(usr => {
                let displayName = 'Admin / Inconnu';
                if (usr.role === 'candidate' && usr.candidates) {
                  displayName = usr.candidates.full_name || 'Candidat sans nom';
                } else if (usr.role === 'recruiter' && usr.companies) {
                  displayName = usr.companies.name;
                }

                return (
                  <tr key={usr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-900 text-sm">{displayName}</div>
                      <div className="font-mono text-[10px] text-slate-600 mt-0.5">{usr.id}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {new Date(usr.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {usr.role === 'candidate' &&
                          usr.candidates?.documents &&
                          Object.keys(usr.candidates.documents).length > 0 && (
                            <button
                              onClick={() => setSelectedDocsUser(usr)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-[#FF7A00] hover:bg-orange-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Voir les documents"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Docs</span>
                            </button>
                          )}
                        {usr.role !== 'admin' && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleToggleRole(usr.id, usr.role)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              Basculer rôle
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => requestDelete(usr, displayName)}
                              className="p-1.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. HEADER HERO UTILISATEURS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider border border-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Répertoire Global des Comptes
            </span>
            <span className="text-xs font-bold text-slate-600">• Auth & Droits d'accès</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gestion des Utilisateurs & Rôles
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Supervision de tous les comptes authentifiés (Chauffeurs, Entreprises et Administrateurs) avec bascule de rôle en direct.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. RECHERCHE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          <input
            type="text"
            placeholder="Rechercher par nom, UUID ou rôle..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
          />
        </div>
      </div>

      {/* 3. GROUPES */}
      <div className="space-y-6">
        {renderTable(groupedUsers.admin, 'Administrateurs', 'bg-purple-100 text-purple-800')}
        {renderTable(groupedUsers.recruiter, 'Comptes Recruteurs', 'bg-blue-100 text-blue-800')}
        {renderTable(groupedUsers.candidate, 'Comptes Chauffeurs', 'bg-orange-100 text-[#FF7A00]')}
      </div>

      {/* MODAL PIÈCES DU CANDIDAT */}
      {selectedDocsUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Documents de {selectedDocsUser.candidates?.full_name}
              </h3>
              <button onClick={() => setSelectedDocsUser(null)} className="p-1 rounded-lg text-slate-600 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {Object.entries(selectedDocsUser.candidates?.documents || {}).map(([key, doc]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{doc.name || key}</span>
                    <span className="text-[10px] text-slate-600 font-mono">{key}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadDocument(doc.path)}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Supprimer cet utilisateur ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${confirmModal.user?.name} ? Toutes ses données seront effacées.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, user: null })}
      />

    </div>
  );
}
