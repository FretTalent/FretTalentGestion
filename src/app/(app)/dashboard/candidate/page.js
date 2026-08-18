'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  FileText,
  Camera,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { validatePhoneNumber, validateAddress, COUNTRIES, calculateAge } from '@/lib/country';

export default function CandidateDashboard() {
  const router = useRouter();

  // États de profil
  const [profile, setProfile] = useState(null);
  const [candidate, setCandidate] = useState(null);

  // Formulaire d'édition de profil
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [addressInfo, setAddressInfo] = useState({ address: '', city: '', postalCode: '' });
  const [mobilityRadius, setMobilityRadius] = useState(50);
  const [experienceYears, setExperienceYears] = useState(0);
  const [availability, setAvailability] = useState('immediate');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [documents, setDocuments] = useState({});

  // Mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Listes multi-sélection
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState([]);
  const [selectedJobPreferences, setSelectedJobPreferences] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [country, setCountry] = useState('FR');
  const [bio, setBio] = useState('');

  // Historique des déblocages et Auto-Candidatures
  const [unlocks, setUnlocks] = useState([]);
  const [myCandidatures, setMyCandidatures] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);
  const [purchasingPremium, setPurchasingPremium] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  // Modal bloquante de date de naissance pour les comptes non complétés
  const [modalBirthDate, setModalBirthDate] = useState('');
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  const licensesOptions = ['B', 'C', 'CE', 'PL', 'SPL'];
  const certificationsOptions = [
    'FIMO',
    'FCO',
    'ADR de base',
    'ADR Citerne',
    'ADR Explosifs',
    'Carte Chrono',
  ];
  const contractOptions = ['CDI', 'CDD', 'Intérim', 'Temps partiel'];
  const jobPreferencesOptions = [
    'Benne',
    'Tautliner',
    'Citerne',
    'Citerne ADR',
    'Frigo',
    'Plateau',
    'Porte-char',
    'Porte-voiture',
    'Convoi exceptionnel',
    'Ampiroll',
    'Messagerie',
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
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

      // Charger le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData?.role === 'recruiter') {
        router.push('/dashboard/recruiter');
        return;
      }
      if (profileData?.role === 'admin') {
        router.push('/dashboard/admin');
        return;
      }

      setProfile(profileData || { id: user.id, role: 'candidate' });

      // Charger les détails du candidat
      let { data: candidateData } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Si la ligne candidat n'existe pas encore, la créer automatiquement
      if (!candidateData) {
        const newCandidate = {
          id: user.id,
          full_name: user.email?.split('@')[0] || '',
          email: user.email,
          phone: '',
          country: 'FR',
          is_active: true,
        };
        const { data: createdCandidate } = await supabase
          .from('candidates')
          .insert([newCandidate])
          .select()
          .single();

        candidateData = createdCandidate || newCandidate;
      }

      if (candidateData) {
        setCandidate(candidateData);
        setFullName(candidateData.full_name || '');
        setPhone(candidateData.phone || '');
        setBirthDate(candidateData.birth_date || '');
        setAddressInfo({
          address: candidateData.address || '',
          postalCode: candidateData.postal_code || '',
          city: candidateData.city || '',
          fullLabel: candidateData.address ? `${candidateData.address} ${candidateData.postal_code} ${candidateData.city}` : `${candidateData.postal_code || ''} ${candidateData.city || ''}`
        });
        setMobilityRadius(candidateData.mobility_radius || 50);
        setExperienceYears(candidateData.experience_years || 0);
        setAvailability(candidateData.availability || 'immediate');
        setAvailabilityDate(candidateData.availability_date || '');
        setSelectedLicenses(Array.isArray(candidateData.licenses) ? candidateData.licenses : []);
        setSelectedCertifications(Array.isArray(candidateData.certifications) ? candidateData.certifications : []);
        setSelectedContractTypes(Array.isArray(candidateData.contract_types) ? candidateData.contract_types : []);
        setSelectedJobPreferences(Array.isArray(candidateData.job_preferences) ? candidateData.job_preferences : []);
        setIsActive(candidateData.is_active ?? true);
        setCountry(candidateData.country || 'FR');
        setBio(candidateData.bio || '');
        setDocuments(typeof candidateData.documents === 'object' && candidateData.documents !== null ? candidateData.documents : {});
      }

      // Charger l'historique des déblocages de son contact
      const { data: unlocksData, error: unlocksError } = await supabase
        .from('unlocks')
        .select('unlocked_at, company_id, companies (name)')
        .eq('candidate_id', user.id);

      if (!unlocksError && unlocksData) {
        setUnlocks(unlocksData);
      }

      // Charger les sessions d'Auto-Candidature Premium
      try {
        const { data: candsData } = await supabase
          .from('candidatures')
          .select('*')
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false });
        if (candsData) setMyCandidatures(candsData);

        const { data: badgeData } = await supabase
          .from('premium_badges')
          .select('*')
          .eq('candidate_id', user.id)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();
        if (badgeData) setActiveBadge(badgeData);
      } catch (candErr) {
        console.warn('Erreur chargement candidatures premium:', candErr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePremium = async () => {
    setPurchasingPremium(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch('/api/premium/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’initialisation du paiement');

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Lien de paiement indisponible');
      }
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la redirection vers le paiement sécurisé');
    } finally {
      setPurchasingPremium(false);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    setMessage(null);

    // Validation stricte du téléphone
    const phoneCheck = validatePhoneNumber(phone, country);
    if (!phoneCheck.valid) {
      setMessage({ type: 'error', text: phoneCheck.message });
      return;
    }

    // Validation stricte de l'adresse
    const addrCheck = validateAddress(addressInfo, country);
    if (!addrCheck.valid) {
      setMessage({ type: 'error', text: addrCheck.message });
      return;
    }

    setSaving(true);

    try {
      const cleanPhone = phoneCheck.formatted || phone.trim();
      const updatePayload = {
        full_name: fullName,
        phone: cleanPhone,
        address: addressInfo.address,
        postal_code: addressInfo.postalCode,
        city: addressInfo.city,
        mobility_radius: parseInt(mobilityRadius),
        experience_years: parseInt(experienceYears),
        availability,
        availability_date:
          availability === 'specific_date' ? availabilityDate : null,
        licenses: selectedLicenses,
        certifications: selectedCertifications,
        contract_types: selectedContractTypes,
        job_preferences: selectedJobPreferences,
        is_active: isActive,
        country: country,
        bio: bio,
        updated_at: new Date(),
      };

      // Si la date de naissance n'était pas encore définie et que le candidat la renseigne
      if (!candidate?.birth_date && birthDate) {
        updatePayload.birth_date = birthDate;
      }

      const { error } = await supabase
        .from('candidates')
        .update(updatePayload)
        .eq('id', profile?.id || candidate?.id);

      if (error) throw error;
      if (updatePayload.birth_date) {
        setCandidate(prev => ({ ...prev, birth_date: updatePayload.birth_date }));
      }
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Erreur de mise à jour du profil.',
      });
    } finally {
      setSaving(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleMultiSelect = (item, currentList, setList) => {
    const list = Array.isArray(currentList) ? currentList : [];
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleExecuteDeleteAccount = async () => {
    setIsDeleting(true);
    setShowDeleteModal(false);
    try {
      const res = await fetch('/api/candidate/delete-account', {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Votre compte a été supprimé avec succès.');
        await supabase.auth.signOut();
        router.push('/');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Erreur lors de la suppression du compte.');
        setMessage({
          type: 'error',
          text: errorData.error || 'Erreur lors de la suppression du compte.',
        });
      }
    } catch (err) {
      toast.error('Erreur de connexion au serveur.');
      setMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMessage({ type: 'success', text: 'Votre mot de passe a été modifié avec succès !' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Erreur lors du changement de mot de passe.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Enregistrer la date de naissance depuis la modal bloquante
  const handleSaveModalBirthDate = async e => {
    e.preventDefault();
    setModalError(null);
    if (!modalBirthDate) {
      setModalError('Veuillez renseigner votre date de naissance.');
      return;
    }
    const age = calculateAge(modalBirthDate);
    if (age === null || age < 18) {
      setModalError('Vous devez avoir au moins 18 ans pour exercer le métier de conducteur routier.');
      return;
    }
    if (age > 99) {
      setModalError('Veuillez saisir une date de naissance valide.');
      return;
    }

    setModalSaving(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          birth_date: modalBirthDate,
          updated_at: new Date(),
        })
        .eq('id', profile?.id || candidate?.id);

      if (error) throw error;

      setCandidate(prev => ({ ...prev, birth_date: modalBirthDate }));
      setBirthDate(modalBirthDate);
      setMessage({
        type: 'success',
        text: 'Date de naissance enregistrée et validée avec succès !',
      });
    } catch (err) {
      setModalError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setModalSaving(false);
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
      {/* Message Status */}
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

      {/* NOTIFICATION IN-APP LORS D'UN DÉBLOCAGE PAR UNE ENTREPRISE */}
      {unlocks && unlocks.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
              🎉
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider text-white">
                <span>Opportunité d&apos;embauche</span>
                <span>•</span>
                <span>{unlocks.length} transporteur{unlocks.length > 1 ? 's' : ''} intéressé{unlocks.length > 1 ? 's' : ''}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                {unlocks[0]?.companies?.name
                  ? `L'entreprise « ${unlocks[0].companies.name} » a débloqué votre contact !`
                  : 'Un transporteur partenaire a débloqué votre profil complet !'}
              </h3>
              <p className="text-xs text-orange-100 mt-0.5">
                Tenez-vous prêt à recevoir un appel téléphonique ou un e-mail pour fixer un premier entretien.
              </p>
            </div>
          </div>
          <div className="shrink-0 bg-white/15 px-4 py-2 rounded-2xl border border-white/20 text-center w-full sm:w-auto">
            <span className="text-[11px] text-orange-100 font-medium block">Dernier déblocage</span>
            <span className="text-xs font-black text-white">
              {new Date(unlocks[0]?.unlocked_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      )}

      {/* BANNIÈRE DE COMPLÉTION DU PROFIL & DÉPÔT DE DOCUMENTS SANS CONTRAINTE */}
      {(() => {
        const hasDocs = documents && typeof documents === 'object' && Object.keys(documents).length > 0;
        const docCount = Object.keys(documents || {}).length;

        if (hasDocs && candidate?.validated) {
          return (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-6 rounded-3xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                      Profil 100% Vérifié 🛡️
                    </span>
                    <span className="text-xs font-bold text-emerald-700">({docCount} document{docCount > 1 ? 's' : ''} validé{docCount > 1 ? 's' : ''})</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    Votre profil est visible et prioritaire auprès des transporteurs
                  </h2>
                  <p className="text-xs text-slate-600">
                    Les recruteurs en France, Suisse, Belgique et Luxembourg peuvent consulter vos compétences et vous contacter directement.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/candidate/documents"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Gérer mes documents</span>
              </Link>
            </div>
          );
        }

        if (hasDocs && !candidate?.validated) {
          return (
            <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 p-6 rounded-3xl border border-blue-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                      Vérification en cours ⏳
                    </span>
                    <span className="text-xs font-bold text-blue-700">({docCount} document{docCount > 1 ? 's' : ''} transmis)</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    Vos documents sont en cours de validation par notre équipe
                  </h2>
                  <p className="text-xs text-slate-600">
                    Votre badge « Profil Vérifié 🛡️ » sera activé dès la vérification de vos justificatifs de conduite.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/candidate/documents"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-blue-800 bg-white border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
              >
                <span>Voir mes documents</span>
              </Link>
            </div>
          );
        }

        // Cas sans document : Bannière d'incitation bienveillante
        return (
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-6 sm:p-7 rounded-3xl shadow-xl shadow-orange-500/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-3 z-10 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-white">
                  <Sparkles className="w-3.5 h-3.5" /> Profil actif
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/20 text-xs font-bold text-orange-100">
                  <Clock className="w-3 h-3" /> Déposez vos justificatifs quand vous le souhaitez
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black leading-tight">
                  Activez votre badge « Chauffeur 100% Vérifié 🛡️ »
                </h2>
                <p className="text-xs sm:text-sm text-orange-100 leading-relaxed mt-1">
                  Les transporteurs en <strong>France, Suisse, Belgique et Luxembourg</strong> contactent en priorité les profils vérifiés. 
                  Prenez simplement en photo votre <strong>Permis C/CE</strong>, <strong>Carte Chrono</strong> et <strong>FIMO</strong> avec votre téléphone (1 minute).
                </p>
              </div>

              <div className="flex items-center gap-4 pt-1 text-xs text-orange-100 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-white" /> 100% gratuit
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-white" /> 0 commission
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-white" /> Données protégées & confidentielles
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full lg:w-auto z-10">
              <Link
                href="/dashboard/candidate/documents"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-xs sm:text-sm font-black text-orange-600 bg-white hover:bg-orange-50 shadow-lg hover:scale-105 transition-all"
              >
                <Camera className="w-4 h-4 text-orange-600" />
                <span>Prendre en photo mes documents</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire principal */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-3xl border border-slate-200 shadow-sm space-y-6"
          >
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-orange-500" /> Mon Profil
              Professionnel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Date de naissance (Verrouillée / Non modifiable une fois renseignée) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                  <span>Date de naissance</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {candidate?.birth_date && calculateAge(candidate.birth_date) ? `Âge : ${calculateAge(candidate.birth_date)} ans` : 'Min. 18 ans'}
                  </span>
                </label>
                {candidate?.birth_date ? (
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-sm font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span>{new Date(candidate.birth_date).toLocaleDateString('fr-FR')}</span>
                      <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {calculateAge(candidate.birth_date)} ans
                      </span>
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs" title="Date de naissance validée lors de l'inscription — non modifiable">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Fixée</span>
                    </span>
                  </div>
                ) : (
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Téléphone portable
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                  <span>Pays de résidence</span>
                  <span className="text-[10px] text-slate-400 font-normal">Défini à l&apos;inscription</span>
                </label>
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-sm font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>{COUNTRIES[country]?.name || country}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span>🔒</span>
                    <span>Fixé</span>
                  </span>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Adresse complète
                </label>
                <AddressAutocomplete 
                  initialValue={addressInfo.fullLabel || addressInfo.city}
                  onAddressSelect={setAddressInfo}
                  country={country}
                  required={true}
                />
              </div>
            </div>

            {/* Expérience et disponibilité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Années d'expérience
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={experienceYears}
                  onChange={e => setExperienceYears(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Rayon de mobilité (km)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={10}
                    value={mobilityRadius}
                    onChange={e => setMobilityRadius(e.target.value)}
                    className="w-full accent-orange-500"
                  />
                  <span className="text-sm font-bold text-slate-900 w-16">
                    {mobilityRadius} km
                  </span>
                </div>
              </div>
            </div>

            {/* Disponibilité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Disponibilité
                </label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                >
                  <option value="immediate">Immédiate</option>
                  <option value="notice">Avec préavis</option>
                  <option value="specific_date">À une date précise</option>
                </select>
              </div>
              {availability === 'specific_date' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Date de disponibilité
                  </label>
                  <input
                    type="date"
                    value={availabilityDate}
                    onChange={e => setAvailabilityDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              )}
            </div>

            {/* Permis de conduire */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase block">
                Permis détenus
              </label>
              <div className="flex flex-wrap gap-2">
                {licensesOptions.map(license => {
                  const isSelected = Array.isArray(selectedLicenses) && selectedLicenses.includes(license);
                  return (
                    <button
                      key={license}
                      type="button"
                      onClick={() =>
                        toggleMultiSelect(
                          license,
                          selectedLicenses,
                          setSelectedLicenses,
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {license}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Certifications / Habilitations */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase block">
                Habilitations & Certifications
              </label>
              <div className="flex flex-wrap gap-2">
                {certificationsOptions.map(cert => {
                  const isSelected = Array.isArray(selectedCertifications) && selectedCertifications.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() =>
                        toggleMultiSelect(
                          cert,
                          selectedCertifications,
                          setSelectedCertifications,
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {cert}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contrats recherchés */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase block">
                Types de contrats recherchés
              </label>
              <div className="flex flex-wrap gap-2">
                {contractOptions.map(contract => {
                  const isSelected = Array.isArray(selectedContractTypes) && selectedContractTypes.includes(contract);
                  return (
                    <button
                      key={contract}
                      type="button"
                      onClick={() =>
                        toggleMultiSelect(
                          contract,
                          selectedContractTypes,
                          setSelectedContractTypes,
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {contract}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Préférences d'emploi */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase block">
                Préférences d'emploi
              </label>
              <div className="flex flex-wrap gap-2">
                {jobPreferencesOptions.map(pref => {
                  const isSelected = Array.isArray(selectedJobPreferences) && selectedJobPreferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() =>
                        toggleMultiSelect(
                          pref,
                          selectedJobPreferences,
                          setSelectedJobPreferences,
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Présentation courte */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase block">
                Présentation courte (visible par les recruteurs)
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 250))}
                placeholder="Ex: Chauffeur SPL avec 8 ans d'expérience en transport frigorifique et citerne, disponible en région lyonnaise..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
              <p className="text-[10px] text-slate-400 text-right">{bio.length}/250 caractères</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <Save className="h-4 w-4" />{' '}
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* Widgets de confidentialité & Historique */}
        <div className="space-y-6">
          {/* Complétude du profil */}
          {(() => {
            let score = 0;
            if (fullName) score += 15;
            if (phone) score += 15;
            if (addressInfo.city) score += 15;
            if (selectedLicenses.length > 0) score += 20;
            if (selectedCertifications.length > 0) score += 15;
            if (bio) score += 10;
            if (documents && Object.keys(documents).length > 0) score += 10;

            return (
              <div className="bg-white p-5 sm:p-6 rounded-[2rem] sm:rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Complétude du profil</span>
                  <span className="text-orange-500">{score}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {score < 100
                    ? "Complétez votre profil pour maximiser vos chances d'être contacté !"
                    : "Votre profil est parfaitement complété !"}
                </p>
              </div>
            );
          })()}

          {/* Statut de visibilité */}
          <div className="bg-white p-5 sm:p-6 rounded-[2rem] sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Statut de visibilité
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                {isActive ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {isActive ? 'Visible sur la carte' : 'Masqué'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isActive
                      ? 'Les recruteurs peuvent vous voir'
                      : "Vous n'apparaissez plus"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
                  isActive
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-350'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isActive ? 'Désactiver' : 'Activer'}
              </button>
            </div>
            <div className="bg-orange-50 text-orange-800 p-3 rounded-xl flex items-start gap-2 text-xs">
              <ShieldAlert className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <span>
                En masquant votre profil, aucune entreprise ne pourra initier de
                nouveau déblocage de contact.
              </span>
            </div>
          </div>

          {/* Historique des entreprises */}
          <div className="bg-white p-5 sm:p-6 rounded-[2rem] sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Entreprises intéressées ({unlocks.length})
            </h3>
            {unlocks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Aucune entreprise n'a encore débloqué votre contact.
              </p>
            ) : (
              <div className="space-y-3">
                {unlocks.map((unlock, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1"
                  >
                    <span className="text-xs font-bold text-slate-900">
                      {unlock.companies?.name || 'Entreprise Anonyme'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Débloqué le{' '}
                      {new Date(unlock.unlocked_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sécurité & Mot de passe */}
          <div className="bg-white p-5 sm:p-6 rounded-[2rem] sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-500" /> Sécurité & Mot de passe
            </h3>
            
            {passwordMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  placeholder="Retapez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{updatingPassword ? 'Modification...' : 'Modifier mon mot de passe'}</span>
              </button>
            </form>
          </div>

          {/* Zone Danger : Supprimer le compte */}
          <div className="bg-red-50 p-5 sm:p-6 rounded-[2rem] sm:rounded-3xl border border-red-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-red-900">Zone Danger</h3>
            <p className="text-xs text-red-700">
              La suppression de votre compte est définitive. Toutes vos données seront effacées.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? 'Suppression en cours...' : 'Supprimer mon compte'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CONFIRMATION SUPPRESSION COMPTE */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Suppression définitive du compte"
        message="Êtes-vous sûr de vouloir supprimer définitivement votre compte FretTalent ?&#10;&#10;Cette action est irréversible et toutes vos données (CV, pièces justificatives, coordonnées) seront immédiatement effacées."
        variant="danger"
        confirmText="Supprimer mon compte"
        cancelText="Conserver mon compte"
        loading={isDeleting}
        onConfirm={handleExecuteDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* MODAL BLOQUANTE DATE DE NAISSANCE POUR TOUT CANDIDAT SANS DATE */}
      {!loading && candidate && !candidate.birth_date && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">Action requise</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pour garantir la conformité de votre profil auprès des transporteurs, veuillez renseigner votre date de naissance.
                </p>
              </div>
            </div>

            <form onSubmit={handleModalSubmitBirthDate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Votre date de naissance *
                </label>
                <input
                  type="date"
                  required
                  value={modalBirthDate}
                  onChange={(e) => setModalBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>

              {modalError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 text-center">
                  {modalError}
                </p>
              )}

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Cette donnée est protégée et sera définitivement verrouillée après validation.</span>
              </div>

              <button
                type="submit"
                disabled={modalSaving || !modalBirthDate}
                className="w-full py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                {modalSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider et débloquer mon espace</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
