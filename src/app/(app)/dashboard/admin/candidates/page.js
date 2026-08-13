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
  Download,
} from 'lucide-react';

export default function AdminCandidates() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all'); // 'all' | 'FR' | 'BE'
  const [filterPreference, setFilterPreference] = useState('all'); // 'all' | preference string
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'validated' | 'pending'

  const exportToCSV = () => {
    if (filteredCandidates.length === 0) return;
    const headers = ['ID', 'Nom Complet', 'Email', 'Téléphone', 'Ville', 'Code Postal', 'Pays', 'Préférences Emploi', 'Statut Validation', 'Date Inscription'];
    const rows = filteredCandidates.map(c => [
      c.id,
      `"${c.full_name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.city || ''}"`,
      `"${c.postal_code || ''}"`,
      c.country || 'FR',
      `"${(c.job_preferences || []).join(', ')}"`,
      c.validated ? 'Validé' : 'En attente',
      c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `candidats-frettalent-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      // Récupérer le token de la session pour l'envoyer à l'API admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('Pas de session active');
        setCandidates([]);
        return;
      }

      // Appel à l'API admin qui bypass le RLS via la service role key
      const response = await fetch('/api/admin/candidates', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erreur API:', result.error);
        setCandidates([]);
      } else {
        setCandidates(result.candidates || []);
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
    const matchesCountry =
      filterCountry === 'all' || (c.country || 'FR') === filterCountry;
    const matchesPreference =
      filterPreference === 'all' ||
      (Array.isArray(c.job_preferences) && c.job_preferences.includes(filterPreference));
    return matchesSearch && matchesFilter && matchesCountry && matchesPreference;
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
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Exporter (CSV)
          </button>
          <button
            onClick={fetchCandidates}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
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

          <div className="flex flex-wrap gap-2">
            {/* Filter Country */}
            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les Pays</option>
              <option value="FR">🇫🇷 France</option>
              <option value="BE">🇧🇪 Belgique</option>
              <option value="LU">🇱🇺 Luxembourg</option>
              <option value="CH">🇨🇭 Suisse</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="validated">Validés</option>
              <option value="pending">En attente</option>
            </select>

            {/* Filter Preference */}
            <select
              value={filterPreference}
              onChange={e => setFilterPreference(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Toutes Spécialités</option>
              <option value="Benne">Benne</option>
              <option value="Taut">Tautliner</option>
              <option value="Citerne">Citerne</option>
              <option value="Citerne ADR">Citerne ADR</option>
              <option value="Frigo">Frigo</option>
              <option value="Plateau">Plateau</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {[
            { key: 'all', label: 'Tous les statuts' },
            { key: 'validated', label: 'Validés' },
            { key: 'pending', label: 'En attente' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
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
                  const isDocPresent = (key, legacyKey) => !!docs[key] || (legacyKey && !!docs[legacyKey]);
                  const hasCv = isDocPresent('cv');
                  const hasPermisRecto = isDocPresent('permis_recto', 'permis');
                  const hasPermisVerso = isDocPresent('permis_verso', 'permis');
                  const hasChronoRecto = isDocPresent('chrono_recto', 'chrono');
                  const hasChronoVerso = isDocPresent('chrono_verso', 'chrono');
                  const hasFimoRecto = isDocPresent('fimo_recto', 'fimo');
                  const hasFimoVerso = isDocPresent('fimo_verso', 'fimo');
                  
                  const requiredDocs = [
                    hasCv,
                    hasPermisRecto,
                    hasPermisVerso,
                    hasChronoRecto,
                    hasChronoVerso,
                    hasFimoRecto,
                    hasFimoVerso,
                  ];
                  
                  const uploadedRequired = requiredDocs.filter(Boolean).length;
                  const totalRequired = 7;
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
                        <div className="flex items-center gap-1.5">
                          <span>{candidate.country === 'BE' ? '🇧🇪' : candidate.country === 'LU' ? '🇱🇺' : candidate.country === 'CH' ? '🇨🇭' : '🇫🇷'}</span>
                          <span className="text-sm text-slate-700 font-medium">{candidate.city || '—'}</span>
                        </div>
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
