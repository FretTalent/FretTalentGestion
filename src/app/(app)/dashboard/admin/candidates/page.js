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
  HelpCircle,
  Phone,
  CheckCircle2,
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
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 bg-slate-100/60 rounded-xl p-8">
        <RefreshCw className="h-8 w-8 text-slate-700 animate-spin" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
          Chargement de la base chauffeurs...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden box-border">
      
      {/* 1. EN-TÊTE SUPÉRIEURE DE PILOTAGE CHAUFFEURS */}
      <div className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md min-w-0">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-[11px] text-white">
              CH
            </div>
            <span className="font-bold text-xs text-slate-200">
              Gestion Chauffeurs & Candidats
            </span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-none">
            Modération des Pièces Administratives & Profils
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En Direct Supabase
          </span>
        </div>

        {/* Barre d'outils rapides */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={fetchCandidates}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Actualiser la liste"
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
            Contrôle des 7 pièces justificatives (Permis C/CE, FIMO/FCO, Chrono, ADR), validation immédiate et relances.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-mono text-[11px]">
          <strong>{filteredCandidates.length}</strong> affichés / <strong>{candidates.length}</strong> total
        </div>
      </div>

      {/* 3. HERO SCORECARDS KPI (4 COLONNES ÉQUILIBRÉES CLICQUABLES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
        
        {/* KPI 1 : Tous les chauffeurs */}
        <div
          onClick={() => setFilterStatus('all')}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            filterStatus === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-80">
            <span className="truncate">Total Chauffeurs</span>
            <Users className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-2 tracking-tight font-mono">
            {candidates.length}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-current/10 flex items-center justify-between text-xs opacity-80">
            <span className="text-[11px]">Inscrits plateforme</span>
            <span className="font-bold text-[10px]">100%</span>
          </div>
        </div>

        {/* KPI 2 : À Valider */}
        <div
          onClick={() => setFilterStatus('pending')}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-600 group-hover:text-amber-700">
            <span className="truncate">À Valider</span>
            <Clock className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 mt-2 tracking-tight font-mono">
            {pendingCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Dossiers en attente :</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
              À vérifier
            </span>
          </div>
        </div>

        {/* KPI 3 : 100% Validés */}
        <div
          onClick={() => setFilterStatus('validated')}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            filterStatus === 'validated'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-600/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            <span className="truncate">100% Validés</span>
            <ShieldCheck className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 mt-2 tracking-tight font-mono">
            {validatedCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Certifiés conformes :</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              {candidates.length > 0 ? Math.round((validatedCount / candidates.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* KPI 4 : Pièces Incomplètes */}
        <div
          onClick={() => setFilterStatus('incomplete')}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            filterStatus === 'incomplete'
              ? 'bg-orange-500 text-white border-orange-600 shadow-md ring-2 ring-orange-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-orange-600">
            <span className="truncate">Docs Incomplets</span>
            <FileText className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-orange-600 mt-2 tracking-tight font-mono">
            {incompleteDocsCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Moins de 7/7 pièces :</span>
            <span className="font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded text-[10px]">
              À relancer
            </span>
          </div>
        </div>

      </div>

      {/* 4. BARRE DE RECHERCHE ET FILTRES RAPIDES */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
        <div className="flex flex-col md:flex-row gap-2.5">
          
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, e-mail, téléphone, ville, code postal..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-slate-50/70"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Filtre Pays */}
            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-slate-50/70 focus:outline-none cursor-pointer"
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
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-slate-50/70 focus:outline-none cursor-pointer"
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

        {/* Badges de filtrage rapide de statut */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Statut :</span>
          {[
            { key: 'all', label: 'Tous', count: candidates.length },
            { key: 'pending', label: '⚠️ À Valider', count: pendingCount },
            { key: 'validated', label: '✅ Validés', count: validatedCount },
            { key: 'incomplete', label: '📄 Docs Incomplets', count: incompleteDocsCount },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === f.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                  filterStatus === f.key ? 'bg-orange-500 text-white' : 'bg-white text-slate-700'
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}

          {(searchTerm || filterCountry !== 'all' || filterPreference !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterCountry('all');
                setFilterPreference('all');
                setSearchTerm('');
              }}
              className="ml-auto text-[11px] text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
            >
              Réinitialiser filtres
            </button>
          )}
        </div>
      </div>

      {/* 5. DATAGRID DES CANDIDATS (STYLE POWER BI HAUTE DENSITÉ) */}
      {filteredCandidates.length === 0 ? (
        <div className="w-full bg-white rounded-xl border border-slate-200 shadow-2xs p-10 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-xs">Aucun chauffeur ne correspond à vos critères.</p>
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterCountry('all');
              setFilterPreference('all');
              setSearchTerm('');
            }}
            className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      ) : (
        <div className="w-full bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto w-full border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Candidat</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Localisation</th>
                  <th className="py-2.5 px-3 text-center">Permis & Spécialité</th>
                  <th className="py-2.5 px-3 text-center">Justificatifs</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCandidates.map((candidate, idx) => {
                  const docStats = getCandidateDocStats(candidate);
                  const progressPct = Math.round((docStats.uploadedCount / docStats.total) * 100);
                  const flag = candidate.country === 'BE' ? '🇧🇪' : candidate.country === 'LU' ? '🇱🇺' : candidate.country === 'CH' ? '🇨🇭' : '🇫🇷';

                  return (
                    <tr
                      key={candidate.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* CANDIDAT */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                            {candidate.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                                {candidate.full_name || 'Nom non spécifié'}
                              </p>
                              {candidate.birth_date && calculateAge(candidate.birth_date) && (
                                <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded text-[10px] shrink-0">
                                  {calculateAge(candidate.birth_date)} ans
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Inscrit le {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('fr-FR') : '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-slate-800 truncate max-w-[180px]">{candidate.email || '—'}</p>
                        <p className="text-slate-400 text-[10px] font-mono">{candidate.phone || '—'}</p>
                      </td>

                      {/* LOCALISATION */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{flag}</span>
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[120px]">{candidate.city || '—'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{candidate.postal_code || ''}</p>
                      </td>

                      {/* PERMIS & SPÉCIALITÉS */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block bg-slate-100 font-bold text-slate-800 px-2 py-0.5 rounded text-[10px]">
                          {candidate.licenses?.length > 0 ? candidate.licenses.join(', ') : 'Permis C/CE'}
                        </span>
                        {candidate.job_preferences?.length > 0 && (
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px] mx-auto">
                            {candidate.job_preferences.join(', ')}
                          </p>
                        )}
                      </td>

                      {/* PIÈCES JUSTIFICATIVES */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                docStats.isComplete ? 'bg-emerald-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-600 font-mono">
                              {docStats.uploadedCount}/{docStats.total} docs
                            </span>
                            {(candidate.reminders_count || 0) > 0 && (
                              <span
                                title={
                                  candidate.last_reminded_at
                                    ? `Dernière relance le ${new Date(candidate.last_reminded_at).toLocaleString('fr-FR')}`
                                    : `${candidate.reminders_count} relance(s)`
                                }
                                className="bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full"
                              >
                                🔔 {candidate.reminders_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* STATUT */}
                      <td className="py-2.5 px-3 text-center">
                        {candidate.validated ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-black text-[10px]">
                            <ShieldCheck className="h-3 w-3" />
                            100% Validé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-black text-[10px]">
                            <Clock className="h-3 w-3" />
                            À Vérifier
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => router.push(`/dashboard/admin/candidates/${candidate.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Dossier</span>
                          </button>
                          {!candidate.validated && (
                            <button
                              onClick={() => handleQuickValidate(candidate.id, candidate.full_name)}
                              disabled={actionLoading === candidate.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
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

          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Affichage de <strong>{filteredCandidates.length}</strong> candidat(s) sur un total de <strong>{candidates.length}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Synchronisation temps réel Supabase
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
