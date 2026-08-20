'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Unlock,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Filter,
  UserCheck,
  FileText,
  Download,
  Star,
  Globe,
  Clock,
  Truck,
  X,
  Bell,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateAge } from '@/lib/country';

export default function RecruiterDashboard() {
  const router = useRouter();

  // Profil et entreprise
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);

  // Moteur de recherche et filtres
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [selectedCert, setSelectedCert] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Favoris (persistés en localStorage)
  const [favorites, setFavorites] = useState([]);

  // Historique des déblocages effectués
  const [myUnlocks, setMyUnlocks] = useState([]);

  // Onglet de vue active ('all' | 'unlocked' | 'favorites')
  const [activeViewTab, setActiveViewTab] = useState('all');

  // États UI
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [message, setMessage] = useState(null);

  // État Alerte Chauffeurs Automatique
  const [jobAlertActive, setJobAlertActive] = useState(false);

  // Fonction d'exportation Excel / CSV des déblocages effectués
  const exportUnlockedToCSV = () => {
    if (!candidates || candidates.length === 0) return;
    const isSubscribed = company?.subscription_plan === 'premium_monthly' || company?.subscription_plan === 'premium_plus_monthly';
    const unlockedList = candidates.filter(cand => isSubscribed || myUnlocks.includes(cand.id));

    if (unlockedList.length === 0) {
      toast.error('Aucun chauffeur débloqué à exporter.');
      return;
    }

    const headers = ['Nom & Prénom', 'E-mail', 'Téléphone', 'Ville', 'Code Postal', 'Pays', 'Permis', 'Expérience (ans)', 'Disponibilité', 'Statut Vérification'];
    const rows = unlockedList.map(c => [
      `"${(c.full_name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.postal_code || '').replace(/"/g, '""')}"`,
      `"${(c.country || 'FR').replace(/"/g, '""')}"`,
      `"${(c.licenses || []).join(', ')}"`,
      `"${c.experience_years || 0}"`,
      `"${c.availability || 'Immédiate'}"`,
      `"${c.validated ? '100% Vérifié' : 'Déclaratif'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FretTalent_Chauffeurs_Debloques_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`📊 ${unlockedList.length} chauffeur(s) débloqué(s) exporté(s) avec succès !`);
  };

  useEffect(() => {
    fetchRecruiterData();
    // Charger les favoris depuis localStorage
    try {
      const saved = localStorage.getItem('frettalent_favorites');
      if (saved) setFavorites(JSON.parse(saved));
      const alertSaved = localStorage.getItem('frettalent_job_alert');
      if (alertSaved) setJobAlertActive(JSON.parse(alertSaved));
    } catch {}
  }, []);

  const fetchRecruiterData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Charger le profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData?.role !== 'recruiter') {
        router.push('/');
        return;
      }
      setProfile(profileData);

      // Charger l'entreprise
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.id)
        .single();
      setCompany(companyData);

      // Charger tous les chauffeurs actifs via l'API sécurisée
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const searchRes = await fetch('/api/candidates/search', { headers });
      if (searchRes.ok) {
        const { candidates: candidatesData } = await searchRes.json();
        if (candidatesData) {
          setCandidates(candidatesData);
          setFilteredCandidates(candidatesData);
        }
      }

      // Charger l'historique de mes déblocages
      const { data: unlocksData } = await supabase
        .from('unlocks')
        .select('candidate_id')
        .eq('company_id', user.id);

      if (unlocksData) {
        setMyUnlocks(unlocksData.map(u => u.candidate_id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage local interactif avec null guards complets
  useEffect(() => {
    let result = candidates;

    if (searchLocation) {
      result = result.filter(
        c =>
          (c.city?.toLowerCase() || '').includes(searchLocation.toLowerCase()) ||
          (c.postal_code || '').includes(searchLocation),
      );
    }

    if (selectedLicense) {
      result = result.filter(
        c => Array.isArray(c.licenses) && c.licenses.includes(selectedLicense),
      );
    }

    if (selectedCert) {
      result = result.filter(
        c =>
          Array.isArray(c.certifications) &&
          c.certifications.includes(selectedCert),
      );
    }

    if (selectedCountry) {
      result = result.filter(c => (c.country || 'FR') === selectedCountry);
    }

    if (selectedAvailability) {
      result = result.filter(c => c.availability === selectedAvailability);
    }

    if (selectedSpecialty) {
      result = result.filter(
        c =>
          Array.isArray(c.job_preferences) &&
          c.job_preferences.includes(selectedSpecialty),
      );
    }

    if (activeViewTab === 'unlocked') {
      result = result.filter(c => myUnlocks.includes(c.id));
    } else if (activeViewTab === 'favorites') {
      result = result.filter(c => favorites.includes(c.id));
    }

    setFilteredCandidates(result);
  }, [
    searchLocation,
    selectedLicense,
    selectedCert,
    selectedCountry,
    selectedAvailability,
    selectedSpecialty,
    activeViewTab,
    myUnlocks,
    favorites,
    candidates,
  ]);

  const toggleFavorite = candidateId => {
    const updated = favorites.includes(candidateId)
      ? favorites.filter(id => id !== candidateId)
      : [...favorites, candidateId];
    setFavorites(updated);
    try {
      localStorage.setItem('frettalent_favorites', JSON.stringify(updated));
    } catch {}
  };

  const clearFilters = () => {
    setSearchLocation('');
    setSelectedLicense('');
    setSelectedCert('');
    setSelectedCountry('');
    setSelectedAvailability('');
    setSelectedSpecialty('');
  };

  const hasActiveFilters =
    searchLocation ||
    selectedLicense ||
    selectedCert ||
    selectedCountry ||
    selectedAvailability ||
    selectedSpecialty;

  // Débloquer un chauffeur via l'API sécurisée
  const handleUnlockCandidate = async candidateId => {
    if (!company?.has_payment_method) {
      router.push('/tarifs');
      return;
    }

    setUnlocking(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers,
        body: JSON.stringify({ candidateId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erreur de déblocage');
      }

      setMyUnlocks(prev => [...prev, candidateId]);
      await fetchRecruiterData();
      setMessage({ type: 'success', text: 'Coordonnées débloquées avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erreur de déblocage.' });
    } finally {
      setUnlocking(false);
    }
  };

  const handleGoToStripe = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push('/tarifs');
      }
    } catch {
      router.push('/tarifs');
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
      toast.error("Erreur: Impossible d'accéder à ce document.");
    }
  };

  const availabilityLabel = val => {
    if (val === 'immediate') return 'Immédiate';
    if (val === 'notice') return 'Avec préavis';
    if (val === 'specific_date') return 'Date précise';
    return val || '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">
            Recherche de Chauffeurs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredCandidates.length} profil
            {filteredCandidates.length > 1 ? 's' : ''} disponible
            {filteredCandidates.length > 1 ? 's' : ''}
            {favorites.length > 0 && (
              <span className="ml-2 text-orange-500 font-bold">
                · {favorites.length} favori{favorites.length > 1 ? 's' : ''} ⭐
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              const nextState = !jobAlertActive;
              setJobAlertActive(nextState);
              localStorage.setItem('frettalent_job_alert', JSON.stringify(nextState));
              if (nextState) {
                toast.success('🔔 Alerte Nouveaux Chauffeurs activée ! Vous serez prévenu dès qu\'un profil s\'inscrit.');
              } else {
                toast.success('Alerte désactivée.');
              }
            }}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              jobAlertActive
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{jobAlertActive ? '🔔 Alerte Chauffeurs Active' : '🔔 Activer Alerte Chauffeurs'}</span>
          </button>

          <button
            onClick={exportUnlockedToCSV}
            className="px-4 py-2.5 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📊 Exporter mes Déblocages (CSV)</span>
          </button>

          {!company?.has_payment_method ? (
            <button
              onClick={handleGoToStripe}
              className="px-4 py-2.5 rounded-2xl text-xs font-black bg-orange-500 hover:bg-orange-600 text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <CreditCard className="h-4 w-4" /> Activer mon accès
            </button>
          ) : (
            <span className="px-3.5 py-2.5 rounded-2xl text-xs font-black bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Accès actif
            </span>
          )}
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm font-semibold text-center">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche: filtres + liste */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtres */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-orange-500" /> Critères de
                recherche
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                >
                  <X className="h-3 w-3" /> Effacer les filtres
                </button>
              )}
            </div>

            {/* Row 1 — Filtres de base */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Localisation
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ville ou code postal"
                    value={searchLocation}
                    onChange={e => setSearchLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Permis requis
                </label>
                <select
                  value={selectedLicense}
                  onChange={e => setSelectedLicense(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                >
                  <option value="">Tous les permis</option>
                  <option value="B">Permis B</option>
                  <option value="C">Permis C (PL)</option>
                  <option value="CE">Permis CE (SPL)</option>
                  <option value="PL">PL</option>
                  <option value="SPL">SPL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Habilitation
                </label>
                <select
                  value={selectedCert}
                  onChange={e => setSelectedCert(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                >
                  <option value="">Toutes</option>
                  <option value="FIMO">FIMO</option>
                  <option value="FCO">FCO</option>
                  <option value="Carte Chrono">Carte Chrono</option>
                  <option value="ADR de base">ADR de base</option>
                  <option value="ADR Citerne">ADR Citerne</option>
                  <option value="ADR Explosifs">ADR Explosifs</option>
                </select>
              </div>
            </div>

            {/* Row 2 — Nouveaux filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Pays
                </label>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                >
                  <option value="">Tous les pays</option>
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="LU">Luxembourg</option>
                  <option value="CH">Suisse</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Disponibilité
                </label>
                <select
                  value={selectedAvailability}
                  onChange={e => setSelectedAvailability(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                >
                  <option value="">Toutes</option>
                  <option value="immediate">Immédiate</option>
                  <option value="notice">Avec préavis</option>
                  <option value="specific_date">Date précise</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Spécialité
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={e => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                >
                  <option value="">Toutes</option>
                  <option value="Benne">Benne</option>
                  <option value="Tautliner">Tautliner</option>
                  <option value="Citerne">Citerne</option>
                  <option value="Citerne ADR">Citerne ADR</option>
                  <option value="Frigo">Frigo</option>
                  <option value="Plateau">Plateau</option>
                  <option value="Porte-char">Porte-char</option>
                  <option value="Porte-voiture">Porte-voiture</option>
                  <option value="Convoi exceptionnel">Convoi exceptionnel</option>
                  <option value="Ampiroll">Ampiroll</option>
                  <option value="Messagerie">Messagerie</option>
                </select>
              </div>
            </div>
          </div>

          {/* Onglets de filtrage rapide (Tous, Débloqués, Favoris) */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveViewTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeViewTab === 'all'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Tous les chauffeurs ({candidates.length})
            </button>
            <button
              onClick={() => setActiveViewTab('unlocked')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewTab === 'unlocked'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'text-orange-700 bg-orange-100/60 hover:bg-orange-100'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Mes déblocages ({myUnlocks.length})</span>
            </button>
            <button
              onClick={() => setActiveViewTab('favorites')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewTab === 'favorites'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'text-amber-800 bg-amber-100/60 hover:bg-amber-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Favoris ({favorites.length})</span>
            </button>
          </div>

          {/* Liste des chauffeurs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {activeViewTab === 'unlocked'
                  ? `Chauffeurs débloqués (${filteredCandidates.length})`
                  : activeViewTab === 'favorites'
                  ? `Chauffeurs favoris (${filteredCandidates.length})`
                  : `Résultats de la recherche (${filteredCandidates.length})`}
              </h3>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">
                Aucun chauffeur ne correspond à vos critères.
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="block mx-auto mt-3 text-orange-500 text-sm font-bold hover:underline"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map(cand => {
                  const isSubscribed = company?.subscription_plan === 'premium_monthly' || company?.subscription_plan === 'premium_plus_monthly';
                  const isUnlocked = isSubscribed || myUnlocks.includes(cand.id);
                  const isFavorite = favorites.includes(cand.id);
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-md relative ${
                        selectedCandidate?.id === cand.id
                          ? 'border-orange-500 shadow-sm'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Bouton Favori */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(cand.id);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors z-10"
                        title={
                          isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'
                        }
                      >
                        <Star
                          className={`h-4 w-4 transition-colors ${
                            isFavorite
                              ? 'text-orange-400 fill-orange-400'
                              : 'text-slate-300 hover:text-orange-300'
                          }`}
                        />
                      </button>

                      <div className="flex items-start justify-between pr-8">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-orange-500 uppercase">
                              {isUnlocked ? cand.full_name : 'Chauffeur Anonyme'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {cand.country === 'BE' ? 'Belgique' : cand.country === 'LU' ? 'Luxembourg' : cand.country === 'CH' ? 'Suisse' : 'France'}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900">
                            {cand.city || '—'}{' '}
                            {cand.postal_code ? `(${cand.postal_code})` : ''}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            {cand.birth_date && calculateAge(cand.birth_date) && (
                              <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                {calculateAge(cand.birth_date)} ans
                              </span>
                            )}
                            <span>
                              {cand.experience_years
                                ? `${cand.experience_years} an${cand.experience_years > 1 ? 's' : ''} d'expérience`
                                : 'Expérience non renseignée'}
                            </span>
                          </div>
                          {cand.availability === 'immediate' && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                              Disponible immédiatement
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isUnlocked
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isUnlocked ? '✓ Débloqué' : 'Anonyme'}
                          </span>
                          {cand.validated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                              ✓ Vérifié
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(Array.isArray(cand.licenses) ? cand.licenses : []).map(
                          lic => (
                            <span
                              key={lic}
                              className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600"
                            >
                              {lic}
                            </span>
                          ),
                        )}
                        {(Array.isArray(cand.job_preferences)
                          ? cand.job_preferences
                          : []
                        ).map(pref => (
                          <span
                            key={pref}
                            className="bg-orange-50 px-2 py-0.5 rounded text-[10px] font-medium text-orange-600 border border-orange-100"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Volet Détail du Candidat sélectionné */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-orange-500" /> Détails du profil
            </h2>

            {selectedCandidate ? (
              <div className="space-y-5">
                {/* Coordonnées */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Coordonnées
                  </span>
                  {(company?.subscription_plan === 'premium_monthly' || company?.subscription_plan === 'premium_plus_monthly' || myUnlocks.includes(selectedCandidate.id)) ? (
                    <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl space-y-2">
                      <div className="text-sm font-bold text-slate-900">
                        {selectedCandidate.full_name}
                      </div>
                      <div className="text-xs text-slate-600">
                        <strong>Tél:</strong> {selectedCandidate.phone || '—'}
                      </div>
                      <div className="text-xs text-slate-600">
                        <strong>E-mail:</strong> {selectedCandidate.email || '—'}
                      </div>
                      {selectedCandidate.address && (
                        <div className="text-xs text-slate-600 pt-2 mt-2 border-t border-green-100">
                          <strong>Adresse:</strong>
                          <br />
                          {selectedCandidate.address}
                          <br />
                          {selectedCandidate.postal_code} {selectedCandidate.city}
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-4 h-4 text-orange-400" />
                        <span>📄 Imprimer / Imprimer Fiche PDF</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      <div className="text-xs text-slate-400">
                        Coordonnées masquées — déblocage requis
                      </div>
                      <button
                        onClick={() =>
                          handleUnlockCandidate(selectedCandidate.id)
                        }
                        disabled={unlocking}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Unlock className="h-4 w-4" />
                        {unlocking
                          ? 'Déblocage...'
                          : 'Débloquer le contact (4,99€)'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Bio / Présentation */}
                {selectedCandidate.bio && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Présentation
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl italic">
                      &ldquo;{selectedCandidate.bio}&rdquo;
                    </p>
                  </div>
                )}

                {/* Documents (si débloqué ou abonné) */}
                {(company?.subscription_plan === 'premium_monthly' || company?.subscription_plan === 'premium_plus_monthly' || myUnlocks.includes(selectedCandidate.id)) &&
                  selectedCandidate.documents &&
                  Object.keys(selectedCandidate.documents).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Pièces justificatives
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(selectedCandidate.documents).map(
                          ([key, doc]) => (
                            <button
                              key={key}
                              onClick={() => handleDownloadDocument(doc.path)}
                              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-orange-500 hover:shadow-sm transition-all text-left group"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                <div className="truncate">
                                  <span className="text-xs font-bold text-slate-700 block truncate uppercase">
                                    {key}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {doc.name}
                                  </span>
                                </div>
                              </div>
                              <Download className="h-4 w-4 text-slate-300 group-hover:text-orange-500 flex-shrink-0" />
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Informations professionnelles */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Informations professionnelles
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="text-slate-400 font-medium">Âge</div>
                      <div className="font-bold text-slate-900 mt-1">
                        {selectedCandidate.birth_date && calculateAge(selectedCandidate.birth_date)
                          ? `${calculateAge(selectedCandidate.birth_date)} ans`
                          : '—'}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="text-slate-400 font-medium">Expérience</div>
                      <div className="font-bold text-slate-900 mt-1">
                        {selectedCandidate.experience_years ?? '—'} an
                        {selectedCandidate.experience_years > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="text-slate-400 font-medium">Disponibilité</div>
                      <div className="font-bold text-slate-900 mt-1 text-xs">
                        {availabilityLabel(selectedCandidate.availability)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="text-slate-400 font-medium">Mobilité</div>
                      <div className="font-bold text-slate-900 mt-1">
                        {selectedCandidate.mobility_radius ?? '—'} km
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="text-slate-400 font-medium">Pays</div>
                      <div className="font-bold text-slate-900 mt-1">
                        {selectedCandidate.country === 'BE'
                          ? 'Belgique'
                          : selectedCandidate.country === 'LU'
                          ? 'Luxembourg'
                          : selectedCandidate.country === 'CH'
                          ? 'Suisse'
                          : 'France'}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="text-slate-400 font-medium">Localisation</div>
                      <div className="font-bold text-slate-900 mt-1 truncate">
                        {selectedCandidate.city || '—'} ({selectedCandidate.postal_code || '—'})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permis */}
                {Array.isArray(selectedCandidate.licenses) &&
                  selectedCandidate.licenses.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block">
                        Permis
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.licenses.map(lic => (
                          <span
                            key={lic}
                            className="bg-slate-100 px-2.5 py-1 rounded text-xs font-medium text-slate-700"
                          >
                            {lic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Certifications */}
                {Array.isArray(selectedCandidate.certifications) &&
                  selectedCandidate.certifications.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block">
                        Certifications
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.certifications.map(cert => (
                          <span
                            key={cert}
                            className="bg-slate-100 px-2.5 py-1 rounded text-xs font-medium text-slate-700"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Préférences */}
                {Array.isArray(selectedCandidate.job_preferences) &&
                  selectedCandidate.job_preferences.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block">
                        Spécialités
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.job_preferences.map(pref => (
                          <span
                            key={pref}
                            className="bg-orange-50 px-2.5 py-1 rounded text-xs font-medium text-orange-700 border border-orange-100"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">
                Sélectionnez un candidat pour afficher son profil détaillé.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
