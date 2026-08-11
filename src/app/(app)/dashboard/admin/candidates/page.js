'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Users,
  ShieldCheck,
  Clock,
  Filter,
  X,
} from 'lucide-react';

export default function AdminCandidates() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'validated' | 'pending'

  useEffect(() => {
    const checkPermissions = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profileError || profile?.role !== 'admin') {
        router.push('/');
      }
    };
    checkPermissions();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Erreur lors de la récupération des candidats:', error);
        setCandidates([]);
      } else {
        setCandidates(data || []);
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'validated' && c.validated) ||
      (filterStatus === 'pending' && !c.validated);
    return matchesSearch && matchesFilter;
  });

  const validatedCount = candidates.filter(c => c.validated).length;
  const pendingCount = candidates.filter(c => !c.validated).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Chargement des candidats...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Candidats</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {candidates.length} chauffeur{candidates.length > 1 ? 's' : ''} inscrit{candidates.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchCandidates}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="bg-slate-100 p-2.5 rounded-xl">
            <Users className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-950">{candidates.length}</p>
            <p className="text-xs text-slate-500 font-medium">Total</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-green-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="bg-green-50 p-2.5 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-green-700">{validatedCount}</p>
            <p className="text-xs text-green-600 font-medium">Validés</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-orange-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="bg-orange-50 p-2.5 rounded-xl">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-orange-600">{pendingCount}</p>
            <p className="text-xs text-orange-500 font-medium">En attente</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, ville..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-slate-50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'validated', label: 'Validés' },
            { key: 'pending', label: 'En attente' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filterStatus === f.key
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Aucun candidat trouvé</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 text-sm text-orange-500 hover:underline"
            >
              Réinitialiser la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3.5 px-5 font-bold text-slate-600 text-xs uppercase tracking-wider">
                    Candidat
                  </th>
                  <th className="text-left py-3.5 px-5 font-bold text-slate-600 text-xs uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3.5 px-5 font-bold text-slate-600 text-xs uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="text-center py-3.5 px-5 font-bold text-slate-600 text-xs uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="text-center py-3.5 px-5 font-bold text-slate-600 text-xs uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-center py-3.5 px-5 font-bold text-slate-600 text-xs uppercase tracking-wider">
                    Fiche
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, idx) => {
                  const docs = candidate.documents || {};
                  const REQUIRED_KEYS = ['cv', 'permis', 'chrono', 'fimo'];
                  const uploadedRequired = REQUIRED_KEYS.filter(k => docs[k]).length;
                  const totalRequired = REQUIRED_KEYS.length;
                  const docsProgress = Math.round((uploadedRequired / totalRequired) * 100);

                  return (
                    <tr
                      key={candidate.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                            {candidate.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {candidate.full_name || '—'}
                            </p>
                            <p className="text-xs text-slate-400">
                              Inscrit le{' '}
                              {candidate.created_at
                                ? new Date(candidate.created_at).toLocaleDateString('fr-FR')
                                : '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm text-slate-700">{candidate.email || '—'}</p>
                        <p className="text-xs text-slate-400">{candidate.phone || '—'}</p>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm text-slate-700">{candidate.city || '—'}</p>
                        <p className="text-xs text-slate-400">{candidate.postal_code || ''}</p>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-24 bg-slate-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                docsProgress === 100 ? 'bg-green-500' : 'bg-orange-400'
                              }`}
                              style={{ width: `${docsProgress}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {uploadedRequired}/{totalRequired} docs
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        {candidate.validated ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold">
                            <Clock className="h-3.5 w-3.5" />
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/admin/candidates/${candidate.id}`)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all"
                          title="Voir la fiche"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium">
            {filteredCandidates.length} résultat{filteredCandidates.length > 1 ? 's' : ''} affiché
            {filteredCandidates.length > 1 ? 's' : ''} sur {candidates.length}
          </div>
        </div>
      )}
    </div>
  );
}
