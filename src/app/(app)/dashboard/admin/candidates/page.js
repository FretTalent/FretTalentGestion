'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  AlertTriangle,
  FileText,
  Mail,
  ChevronRight,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { calculateAge } from '@/lib/country';

function AdminCandidatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all'); // 'all' | 'FR' | 'BE' | 'LU' | 'CH'
  const [filterPreference, setFilterPreference] = useState('all');
  const [filterStatus, setFilterStatus] = useState(initialStatus); // 'all' | 'validated' | 'pending' | 'incomplete'

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
  }, [router]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setCandidates([]);
        return;
      }

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

  const handleQuickValidate = async (candidateId, name) => {
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

      setCandidates(prev =>
        prev.map(c => (c.id === candidateId ? { ...c, validated: true } : c))
      );
      toast.success(`✅ ${name || 'Chauffeur'} validé et certifié 100% Vérifié !`);
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la validation');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper pour calculer les documents d'un candidat
  const getCandidateDocStats = candidate => {
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
    const uploadedCount = requiredDocs.filter(Boolean).length;
    const isComplete = uploadedCount === 7;
    return { uploadedCount, total: 7, isComplete };
  };

  // Filtrage combiné
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const docStats = getCandidateDocStats(c);

      // Filtre statut
      if (filterStatus === 'validated' && !c.validated) return false;
      if (filterStatus === 'pending' && c.validated) return false;
      if (filterStatus === 'incomplete' && docStats.isComplete) return false;

      // Filtre pays
      if (filterCountry !== 'all' && (c.country || 'FR') !== filterCountry) return false;

      // Filtre préférence métier
      if (
        filterPreference !== 'all' &&
        (!Array.isArray(c.job_preferences) || !c.job_preferences.includes(filterPreference))
      ) {
        return false;
      }

      // Filtre recherche textuelle
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const nameMatch = (c.full_name || '').toLowerCase().includes(q);
        const emailMatch = (c.email || '').toLowerCase().includes(q);
        const phoneMatch = (c.phone || '').includes(q);
        const cityMatch = (c.city || '').toLowerCase().includes(q);
        const postalMatch = (c.postal_code || '').includes(q);

        if (!nameMatch && !emailMatch && !phoneMatch && !cityMatch && !postalMatch) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, filterStatus, filterCountry, filterPreference, searchTerm]);

  // Compteurs
  const validatedCount = candidates.filter(c => c.validated).length;
  const pendingCount = candidates.filter(c => !c.validated).length;
  const incompleteDocsCount = candidates.filter(c => !getCandidateDocStats(c).isComplete).length;

  const exportToCSV = () => {
    if (filteredCandidates.length === 0) return;
    const headers = [
      'ID',
      'Nom Complet',
      'Email',
      'Téléphone',
      'Ville',
      'Code Postal',
      'Pays',
      'Permis',
      'Préférences Emploi',
      'Statut Validation',
      'Date Inscription',
    ];
    const rows = filteredCandidates.map(c => [
      c.id,
      `"${c.full_name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.city || ''}"`,
      `"${c.postal_code || ''}"`,
      c.country || 'FR',
      `"${(c.licenses || []).join(', ')}"`,
      `"${(c.job_preferences || []).join(', ')}"`,
      c.validated ? 'Validé' : 'En attente',
      c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `candidats-frettalent-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
          Chargement de la base chauffeurs...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* HEADER DE GESTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-orange-200">
            <Users className="h-3.5 w-3.5" />
            <span>Gestion Chauffeurs & Justificatifs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Base Candidats Conducteurs
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Modération des pièces administratives (Permis C/CE, FIMO, Chrono, ADR) et relances e-mail.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
          >
            <Download className="h-4 w-4" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={fetchCandidates}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* STATS RAPIDES & ONGLETS D'ACCÈS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterStatus('all')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer card-hover-effect ${
            filterStatus === 'all'
              ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-md'
              : 'border-slate-200/80 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Tous les chauffeurs</span>
            <Users className="h-4 w-4 text-slate-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-2">
            {candidates.length}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Inscrits au total</p>
        </div>

        <div
          onClick={() => setFilterStatus('pending')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer card-hover-effect ${
            filterStatus === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md bg-amber-50/20'
              : 'border-slate-200/80 shadow-2xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase tracking-wider">
            <span>À Valider</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
            {pendingCount}
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Nécessite votre contrôle</p>
        </div>

        <div
          onClick={() => setFilterStatus('validated')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer card-hover-effect ${
            filterStatus === 'validated'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
              : 'border-slate-200/80 shadow-2xs hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span>100% Validés</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {validatedCount}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Dossiers approuvés</p>
        </div>

        <div
          onClick={() => setFilterStatus('incomplete')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer card-hover-effect ${
            filterStatus === 'incomplete'
              ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md bg-orange-50/20'
              : 'border-slate-200/80 shadow-2xs hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between text-orange-700 text-xs font-bold uppercase tracking-wider">
            <span>Docs Incomplets</span>
            <FileText className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-700 mt-2">
            {incompleteDocsCount}
          </div>
          <p className="text-[11px] text-orange-700 font-semibold mt-1">À relancer par e-mail</p>
        </div>
      </div>

      {/* RECHERCHE ET FILTRES DÉTAILLÉS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, e-mail, téléphone, ville, code postal..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtre Pays */}
            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="all">🌍 Tous les Pays</option>
              <option value="FR">🇫🇷 France</option>
              <option value="BE">🇧🇪 Belgique</option>
              <option value="CH">🇨🇭 Suisse</option>
              <option value="LU">🇱🇺 Luxembourg</option>
            </select>

            {/* Filtre Spécialité */}
            <select
              value={filterPreference}
              onChange={e => setFilterPreference(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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

        {/* Badges de filtrage de statut */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1">Statut :</span>
          {[
            { key: 'all', label: 'Tous', count: candidates.length },
            { key: 'pending', label: '⚠️ À Valider', count: pendingCount },
            { key: 'validated', label: '✅ Validés', count: validatedCount },
            { key: 'incomplete', label: '📄 Docs Incomplets', count: incompleteDocsCount },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterStatus === f.key
                  ? 'bg-slate-900 text-white shadow-sm scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  filterStatus === f.key ? 'bg-orange-500 text-white' : 'bg-white text-slate-700'
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TABLEAU DES CANDIDATS */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center space-y-3">
          <Users className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-sm">Aucun chauffeur ne correspond à vos critères.</p>
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterCountry('all');
              setFilterPreference('all');
              setSearchTerm('');
            }}
            className="text-xs text-orange-600 font-bold hover:underline"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                  <th className="py-4 px-5 border-r border-slate-800">Candidat</th>
                  <th className="py-4 px-5 border-r border-slate-800">Contact</th>
                  <th className="py-4 px-5 border-r border-slate-800">Localisation</th>
                  <th className="py-4 px-5 border-r border-slate-800 text-center">Permis & Spécialité</th>
                  <th className="py-4 px-5 border-r border-slate-800 text-center">Pièces Justificatives</th>
                  <th className="py-4 px-5 border-r border-slate-800 text-center">Statut</th>
                  <th className="py-4 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCandidates.map((candidate, idx) => {
                  const docStats = getCandidateDocStats(candidate);
                  const progressPct = Math.round((docStats.uploadedCount / docStats.total) * 100);
                  const flag = candidate.country === 'BE' ? '🇧🇪' : candidate.country === 'LU' ? '🇱🇺' : candidate.country === 'CH' ? '🇨🇭' : '🇫🇷';

                  return (
                    <tr
                      key={candidate.id}
                      className={`hover:bg-orange-50/30 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      {/* CANDIDAT */}
                      <td className="py-4 px-5 border-r border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-2xs shrink-0">
                            {candidate.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-slate-900 text-sm">
                                {candidate.full_name || 'Nom non spécifié'}
                              </p>
                              {candidate.birth_date && calculateAge(candidate.birth_date) && (
                                <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                  {calculateAge(candidate.birth_date)} ans
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Inscrit le {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('fr-FR') : '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td className="py-4 px-5 border-r border-slate-100">
                        <p className="font-semibold text-slate-900">{candidate.email || '—'}</p>
                        <p className="text-slate-500 text-[11px] font-mono mt-0.5">{candidate.phone || '—'}</p>
                      </td>

                      {/* LOCALISATION */}
                      <td className="py-4 px-5 border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{flag}</span>
                          <span className="font-bold text-slate-900">{candidate.city || '—'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{candidate.postal_code || ''}</p>
                      </td>

                      {/* PERMIS & SPÉCIALITÉS */}
                      <td className="py-4 px-5 border-r border-slate-100 text-center">
                        <span className="inline-block bg-slate-100 font-bold text-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {candidate.licenses?.length > 0 ? candidate.licenses.join(', ') : 'Permis C/CE'}
                        </span>
                        {candidate.job_preferences?.length > 0 && (
                          <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[140px] mx-auto">
                            {candidate.job_preferences.join(', ')}
                          </p>
                        )}
                      </td>

                      {/* PIÈCES JUSTIFICATIVES */}
                      <td className="py-4 px-5 border-r border-slate-100 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                docStats.isComplete ? 'bg-emerald-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600">
                            {docStats.uploadedCount}/{docStats.total} documents
                          </span>
                        </div>
                      </td>

                      {/* STATUT */}
                      <td className="py-4 px-5 border-r border-slate-100 text-center">
                        {candidate.validated ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-black text-[10px]">
                            <ShieldCheck className="h-3 w-3" />
                            100% Validé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-black text-[10px]">
                            <Clock className="h-3 w-3" />
                            À Vérifier
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => router.push(`/dashboard/admin/candidates/${candidate.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Dossier</span>
                          </button>
                          {!candidate.validated && (
                            <button
                              onClick={() => handleQuickValidate(candidate.id, candidate.full_name)}
                              disabled={actionLoading === candidate.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                              title="Valider immédiatement ce profil chauffeur"
                            >
                              {actionLoading === candidate.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="h-3 w-3" />
                              )}
                              <span>Valider</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Affichage de <strong>{filteredCandidates.length}</strong> candidat(s) sur un total de <strong>{candidates.length}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Mise à jour en temps réel Supabase
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminCandidates() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      }
    >
      <AdminCandidatesContent />
    </Suspense>
  );
}
