'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  Search,
  Eye,
  Users,
  ShieldCheck,
  Clock,
  Filter,
  X,
  Download,
  FileText,
  Mail,
  ChevronRight,
  Sparkles,
  MapPin,
  ExternalLink,
  Phone,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
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

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const docStats = getCandidateDocStats(c);

      if (filterStatus === 'validated' && !c.validated) return false;
      if (filterStatus === 'pending' && c.validated) return false;
      if (filterStatus === 'incomplete' && docStats.isComplete) return false;

      if (filterCountry !== 'all' && (c.country || 'FR') !== filterCountry) return false;

      if (
        filterPreference !== 'all' &&
        (!Array.isArray(c.job_preferences) || !c.job_preferences.includes(filterPreference))
      ) {
        return false;
      }

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

  const validatedCount = candidates.filter(c => c.validated).length;
  const pendingCount = candidates.filter(c => !c.validated).length;
  const incompleteDocsCount = candidates.filter(c => !getCandidateDocStats(c).isComplete).length;

  const exportToCSV = () => {
    if (filteredCandidates.length === 0) {
      toast.error('Aucune donnée à exporter.');
      return;
    }
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
    toast.success('Export CSV téléchargé !');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Chargement de la base chauffeurs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. HEADER HERO CANDIDATS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#FF7A00] text-[11px] font-black uppercase tracking-wider border border-orange-200/60 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Répertoire National des Chauffeurs
            </span>
            <span className="text-xs font-bold text-slate-600">• Profils Chauffeurs Lourds & SPL</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gestion & Certification des Candidats
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Contrôle des 7 pièces justificatives indispensables, validation en 1 clic et modération des coordonnées.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={fetchCandidates}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* 2. KPI CARDS CLICQUABLES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Chauffeurs */}
        <div
          onClick={() => setFilterStatus('all')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            filterStatus === 'all'
              ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-75">
              Total Chauffeurs
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${filterStatus === 'all' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {candidates.length}
            </div>
            <p className="text-xs mt-2 opacity-75 font-semibold">
              Tous pays confondus
            </p>
          </div>
        </div>

        {/* À Valider (Rouge alertes) */}
        <div
          onClick={() => setFilterStatus('pending')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            filterStatus === 'pending'
              ? 'bg-[#E53935] text-white border-[#E53935] shadow-md ring-2 ring-red-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#E53935]">
              À Certifier (1 Clic)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E53935] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight text-[#E53935]">
              {pendingCount}
            </div>
            <p className="text-xs mt-2 text-red-600 font-bold">
              En attente de vérification
            </p>
          </div>
        </div>

        {/* 100% Validés (Vert conformité) */}
        <div
          onClick={() => setFilterStatus('validated')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            filterStatus === 'validated'
              ? 'bg-[#43A047] text-white border-[#43A047] shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#43A047]">
              Certifiés Conformes
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#43A047] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight text-[#43A047]">
              {validatedCount}
            </div>
            <p className="text-xs mt-2 text-emerald-700 font-bold">
              {candidates.length > 0 ? Math.round((validatedCount / candidates.length) * 100) : 0}% des profils
            </p>
          </div>
        </div>

        {/* Docs Incomplets (Orange) */}
        <div
          onClick={() => setFilterStatus('incomplete')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            filterStatus === 'incomplete'
              ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-md ring-2 ring-orange-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF7A00]">
              Dossiers Incomplets
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight text-[#FF7A00]">
              {incompleteDocsCount}
            </div>
            <p className="text-xs mt-2 text-orange-600 font-bold">
              Moins de 7/7 pièces
            </p>
          </div>
        </div>

      </div>

      {/* 3. BARRE DE RECHERCHE ET TABLEAU MODERNE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="Rechercher par nom, e-mail, téléphone, ville, code postal..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none cursor-pointer"
            >
              <option value="all">🌍 Tous les Pays</option>
              <option value="FR">🇫🇷 France</option>
              <option value="BE">🇧🇪 Belgique</option>
              <option value="LU">🇱🇺 Luxembourg</option>
              <option value="CH">🇨🇭 Suisse</option>
            </select>

            <select
              value={filterPreference}
              onChange={e => setFilterPreference(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none cursor-pointer"
            >
              <option value="all">Toutes Spécialités</option>
              <option value="Benne">Benne</option>
              <option value="Tautliner">Tautliner</option>
              <option value="Citerne">Citerne</option>
              <option value="Citerne ADR">Citerne ADR</option>
              <option value="Frigo">Frigo</option>
              <option value="Plateau">Plateau</option>
              <option value="Porte-char">Porte-char</option>
              <option value="Messagerie">Messagerie</option>
            </select>
          </div>
        </div>

        {/* Table des chauffeurs */}
        {filteredCandidates.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-600">
            Aucun chauffeur ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Candidat</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Localisation</th>
                  <th className="py-3 px-3 text-center">Permis & Spécialités</th>
                  <th className="py-3 px-3 text-center">Justificatifs</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCandidates.map(candidate => {
                  const docStats = getCandidateDocStats(candidate);
                  const flag = candidate.country === 'BE' ? '🇧🇪' : candidate.country === 'LU' ? '🇱🇺' : candidate.country === 'CH' ? '🇨🇭' : '🇫🇷';

                  return (
                    <tr key={candidate.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#E56700] text-white flex items-center justify-center font-black text-xs shrink-0">
                            {candidate.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/dashboard/admin/candidates/${candidate.id}`}
                                className="font-black text-slate-900 hover:text-[#FF7A00] text-xs truncate max-w-[160px]"
                              >
                                {candidate.full_name || 'Nom non spécifié'}
                              </Link>
                              {candidate.birth_date && calculateAge(candidate.birth_date) && (
                                <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                  {calculateAge(candidate.birth_date)} ans
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-600">
                              Inscrit le {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('fr-FR') : '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800 truncate max-w-[170px]">{candidate.email || '—'}</p>
                        <p className="text-slate-600 text-[10px] font-mono">{candidate.phone || '—'}</p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span>{flag}</span>
                          <span className="font-bold text-slate-900">{candidate.city || '—'}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-mono">{candidate.postal_code || ''}</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="font-bold text-slate-900">
                          {Array.isArray(candidate.licenses) && candidate.licenses.length > 0 ? candidate.licenses.join(', ') : 'SPL'}
                        </div>
                        <p className="text-[10px] text-slate-600 truncate max-w-[140px] mx-auto">
                          {Array.isArray(candidate.job_preferences) && candidate.job_preferences.length > 0 ? candidate.job_preferences.slice(0, 2).join(', ') : 'Polyvalent'}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          docStats.isComplete ? 'bg-emerald-50 text-[#43A047]' : 'bg-orange-50 text-[#FF7A00]'
                        }`}>
                          {docStats.uploadedCount}/7 pièces
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {candidate.validated ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#43A047] border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Validé 🛡️
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-[#E53935] border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> En attente
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/admin/candidates/${candidate.id}`}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Détails</span>
                          </Link>

                          {!candidate.validated && (
                            <button
                              onClick={() => handleQuickValidate(candidate.id, candidate.full_name)}
                              disabled={actionLoading === candidate.id}
                              className="px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{actionLoading === candidate.id ? '...' : 'Valider'}</span>
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
        )}
      </div>

    </div>
  );
}

export default function AdminCandidatesPage() {
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
