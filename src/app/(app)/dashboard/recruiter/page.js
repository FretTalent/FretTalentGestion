'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search,
  MapPin,
  Unlock,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Filter,
  UserCheck,
  FileText,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecruiterDashboard() {
  const router = useRouter();
  const activeTab = 'search';

  // Profil et entreprise
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);

  // Moteur de recherche et filtres
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [selectedCert, setSelectedCert] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Historique des déblocages effectués
  const [myUnlocks, setMyUnlocks] = useState([]);

  // Offres d'emploi
  const [myJobs, setMyJobs] = useState([]);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobContract, setNewJobContract] = useState('CDI');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobSalary, setNewJobSalary] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [jobPosting, setJobPosting] = useState(false);

  // États UI
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Éléments Stripe temporaires/simulés pour déblocage direct
  const [showBillingModal, setShowBillingModal] = useState(false);

  useEffect(() => {
    fetchRecruiterData();
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

      // Charger tous les chauffeurs actifs
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .eq('is_active', true);

      if (candidatesData) {
        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
      }

      // Charger l'historique de mes déblocages
      const { data: unlocksData } = await supabase
        .from('unlocks')
        .select('candidate_id')
        .eq('company_id', user.id);

      if (unlocksData) {
        setMyUnlocks(unlocksData.map(u => u.candidate_id));
      }

      // Charger mes offres d'emploi
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (jobsData) {
        setMyJobs(jobsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage local interactif
  useEffect(() => {
    let result = candidates;

    if (searchLocation) {
      result = result.filter(
        c =>
          c.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
          c.postal_code.includes(searchLocation),
      );
    }

    if (selectedLicense) {
      result = result.filter(c => c.licenses.includes(selectedLicense));
    }

    if (selectedCert) {
      result = result.filter(c => c.certifications.includes(selectedCert));
    }

    setFilteredCandidates(result);
  }, [searchLocation, selectedLicense, selectedCert, candidates]);

  // Simuler l'enregistrement d'une carte via Stripe Setup Intent
  const handleSaveCardSimulated = async () => {
    setPaymentLoading(true);
    try {
      // Mettre à jour l'état de paiement dans Supabase
      const { error } = await supabase
        .from('companies')
        .update({ has_payment_method: true })
        .eq('id', company.id);

      if (error) throw error;

      setCompany({ ...company, has_payment_method: true });
      setShowBillingModal(false);
      setMessage({
        type: 'success',
        text: 'Moyen de paiement enregistré avec succès via Stripe !',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: "Erreur lors de l'enregistrement bancaire.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Débloquer un chauffeur via l'API sécurisée
  const handleUnlockCandidate = async candidateId => {
    if (!company.has_payment_method) {
      setShowBillingModal(true);
      return;
    }

    setUnlocking(true);
    try {
      // Récupérer le token d'accès Supabase actif
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = {
        'Content-Type': 'application/json',
      };

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

      // Mettre à jour la liste locale des déblocages
      setMyUnlocks([...myUnlocks, candidateId]);

      // Recharger les données pour récupérer le nom, l'email et le téléphone désormais accessibles
      // en faisant un select car les coordonnées sont maintenant visibles via les policies RLS.
      const { data: updatedCand } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      setSelectedCandidate(updatedCand);
      setMessage({
        type: 'success',
        text: 'Coordonnées débloquées avec succès !',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Erreur de déblocage.',
      });
    } finally {
      setUnlocking(false);
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
      toast.error(
        "Erreur: Impossible d'accéder à ce document (Vérifiez vos droits).",
      );
    }
  };

  // Publier une offre d'emploi
  const handleCreateJob = async e => {
    e.preventDefault();
    if (!newJobTitle || !newJobLocation || !newJobDesc) {
      setMessage({
        type: 'error',
        text: 'Veuillez remplir tous les champs obligatoires.',
      });
      return;
    }

    setJobPosting(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            company_id: company.id,
            title: newJobTitle,
            contract_type: newJobContract,
            location: newJobLocation,
            salary: newJobSalary || null,
            description: newJobDesc,
            status: 'pending',
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        setMyJobs([data[0], ...myJobs]);
      }

      setNewJobTitle('');
      setNewJobLocation('');
      setNewJobSalary('');
      setNewJobDesc('');
      setMessage({
        type: 'success',
        text: "Votre annonce a été soumise à validation et sera en ligne d'ici quelques minutes !",
      });
    } catch (err) {
      setMessage({ type: 'error', text: "Erreur lors du dépôt de l'annonce." });
    } finally {
      setJobPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Badge paiement */}
      <div className="flex justify-end">
        {!company?.has_payment_method ? (
          <button
            onClick={() => setShowBillingModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-100 hover:bg-orange-200 text-orange-600 border border-orange-200 transition-colors flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" /> Enregistrer ma carte bancaire
          </button>
        ) : (
          <span className="px-4 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Carte enregistrée (Stripe)
          </span>
        )}
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

      {activeTab === 'search' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Moteur de recherche et filtres */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-orange-500" /> Critères de
                recherche
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Localisation
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ville ou CP"
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
                  </select>
                </div>
              </div>
            </div>

            {/* Liste des Chauffeurs */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Résultats de la recherche ({filteredCandidates.length})
              </h3>

              {filteredCandidates.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">
                  Aucun chauffeur ne correspond à vos critères actuels.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCandidates.map(cand => {
                    const isUnlocked = myUnlocks.includes(cand.id);
                    return (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-md ${
                          selectedCandidate?.id === cand.id
                            ? 'border-orange-500 shadow-sm'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-black text-orange-500 uppercase">
                              Chauffeur Anonyme
                            </span>
                            <h4 className="font-bold text-slate-900">
                              {cand.city} ({cand.postal_code})
                            </h4>
                            <p className="text-xs text-slate-500">
                              {cand.experience_years} ans d'expérience
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isUnlocked
                                ? 'bg-green-150 text-green-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isUnlocked ? 'Débloqué' : 'Anonyme'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {cand.licenses?.map(lic => (
                            <span
                              key={lic}
                              className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600"
                            >
                              {lic}
                            </span>
                          ))}
                          {cand.job_preferences?.map(pref => (
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
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-500" /> Détails du
                profil
              </h2>

              {selectedCandidate ? (
                <div className="space-y-6">
                  {/* Identité / Contact */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Coordonnées
                    </span>
                    {myUnlocks.includes(selectedCandidate.id) ? (
                      <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl space-y-2">
                        <div className="text-sm font-bold text-slate-900">
                          {selectedCandidate.full_name}
                        </div>
                        <div className="text-xs text-slate-600">
                          <strong>Tél:</strong> {selectedCandidate.phone}
                        </div>
                        <div className="text-xs text-slate-600">
                          <strong>E-mail:</strong> {selectedCandidate.email}
                        </div>
                        {selectedCandidate.address && (
                          <div className="text-xs text-slate-600 pt-2 mt-2 border-t border-green-100">
                            <strong>Adresse complète:</strong><br/>
                            {selectedCandidate.address}<br/>
                            {selectedCandidate.postal_code} {selectedCandidate.city}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                        <div className="text-xs text-slate-400">
                          Coordonnées masquées
                        </div>
                        <button
                          onClick={() =>
                            handleUnlockCandidate(selectedCandidate.id)
                          }
                          disabled={unlocking}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Unlock className="h-4 w-4" />{' '}
                          {unlocking
                            ? 'Déblocage...'
                            : 'Débloquer le contact (2€)'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Documents justificatifs (si débloqué) */}
                  {myUnlocks.includes(selectedCandidate.id) &&
                    selectedCandidate.documents &&
                    Object.keys(selectedCandidate.documents).length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Pièces justificatives
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

                  {/* Profil pro */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Informations professionnelles
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <div className="text-slate-400 font-medium">
                          Expérience
                        </div>
                        <div className="font-bold text-slate-900 mt-1">
                          {selectedCandidate.experience_years} ans
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <div className="text-slate-400 font-medium">
                          Disponibilité
                        </div>
                        <div className="font-bold text-slate-900 mt-1 uppercase">
                          {selectedCandidate.availability}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <div className="text-slate-400 font-medium">
                          Zone de mobilité
                        </div>
                        <div className="font-bold text-slate-900 mt-1">
                          {selectedCandidate.mobility_radius} km
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <div className="text-slate-400 font-medium">
                          Localisation
                        </div>
                        <div className="font-bold text-slate-900 mt-1">
                          {selectedCandidate.city}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permis et habilitations */}
                  <div className="space-y-4">
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
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block">
                        Certifications
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.certifications?.map(cert => (
                          <span
                            key={cert}
                            className="bg-slate-100 px-2.5 py-1 rounded text-xs font-medium text-slate-700"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedCandidate.job_preferences?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase block">
                          Préférences d'emploi
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
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-12">
                  Sélectionnez un candidat pour afficher son profil détaillé.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de dépôt d'offre */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                💼 Déposer une offre d'emploi
              </h2>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Intitulé du poste *
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Chauffeur SPL de nuit (F/H)"
                    value={newJobTitle}
                    onChange={e => setNewJobTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Contrat *
                    </label>
                    <select
                      value={newJobContract}
                      onChange={e => setNewJobContract(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Intérim">Intérim</option>
                      <option value="Indépendant">Indépendant</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Localisation *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Lyon (69)"
                      value={newJobLocation}
                      onChange={e => setNewJobLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Salaire mensuel (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 2800 € brut"
                    value={newJobSalary}
                    onChange={e => setNewJobSalary(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Description du poste *
                  </label>
                  <textarea
                    placeholder="Décrivez les horaires, le matériel, le type de trajets et les compétences recherchées..."
                    rows={5}
                    value={newJobDesc}
                    onChange={e => setNewJobDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={jobPosting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {jobPosting ? 'Envoi...' : 'Soumettre à la modération'}
                </button>
              </form>
            </div>
          </div>

          {/* Historique des offres déposées */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                💼 Historique de mes offres
              </h2>

              {myJobs.length === 0 ? (
                <p className="text-slate-400 text-sm py-8 text-center">
                  Vous n'avez pas encore déposé d'offres d'emploi.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myJobs.map(job => (
                    <div
                      key={job.id}
                      className="py-4 first:pt-0 last:pb-0 flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-base">
                          {job.title}
                        </h4>
                        <div className="flex gap-3 text-xs text-slate-500">
                          <span>📍 {job.location}</span>
                          <span>📄 {job.contract_type}</span>
                          {job.salary && <span>💶 {job.salary}</span>}
                        </div>
                      </div>

                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            job.status === 'approved'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : job.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}
                        >
                          {job.status === 'approved'
                            ? 'Publiée'
                            : job.status === 'rejected'
                              ? 'Refusée'
                              : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'enregistrement Stripe simulé */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <CreditCard className="h-8 w-8 text-orange-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">
                Enregistrer une carte bancaire
              </h3>
              <p className="text-xs text-slate-500">
                Conformément aux CGV, aucun débit immédiat ne sera effectué. Vos
                coordonnées bancaires sont gérées de façon cryptée par Stripe.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-750 uppercase block">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  disabled={paymentLoading}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-750 block">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    disabled={paymentLoading}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-750 block">
                    Code CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    disabled={paymentLoading}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBillingModal(false)}
                disabled={paymentLoading}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCardSimulated}
                disabled={paymentLoading}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                {paymentLoading ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
