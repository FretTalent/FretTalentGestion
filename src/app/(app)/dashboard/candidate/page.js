'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { validatePhoneNumber, validateAddress, COUNTRIES } from '@/lib/country';

export default function CandidateDashboard() {
  const router = useRouter();

  // États de profil
  const [profile, setProfile] = useState(null);
  const [candidate, setCandidate] = useState(null);

  // Formulaire d'édition de profil
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressInfo, setAddressInfo] = useState({ address: '', city: '', postalCode: '' });
  const [mobilityRadius, setMobilityRadius] = useState(50);
  const [experienceYears, setExperienceYears] = useState(0);
  const [availability, setAvailability] = useState('immediate');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [documents, setDocuments] = useState({});

  // Listes multi-sélection
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState([]);
  const [selectedJobPreferences, setSelectedJobPreferences] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [country, setCountry] = useState('FR');
  const [bio, setBio] = useState('');

  // Historique des déblocages
  const [unlocks, setUnlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState(null);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      const { error } = await supabase
        .from('candidates')
        .update({
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
        })
        .eq('id', profile?.id || candidate?.id);

      if (error) throw error;
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

  const toggleMultiSelect = (item, currentList, setList) => {
    const list = Array.isArray(currentList) ? currentList : [];
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et toutes vos données (CV, profil, candidatures) seront effacées.'
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/candidate/delete-account', {
        method: 'POST',
      });
      if (res.ok) {
        await supabase.auth.signOut();
        router.push('/');
      } else {
        const errorData = await res.json();
        setMessage({
          type: 'error',
          text: errorData.error || 'Erreur lors de la suppression du compte.',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsDeleting(false);
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                  <span>Pays de résidence</span>
                  <span className="text-[10px] text-slate-400 font-normal">Défini à l&apos;inscription</span>
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-100/90 border border-slate-200 rounded-xl text-sm font-bold text-slate-800">
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

          {/* Zone Danger : Supprimer le compte */}
          <div className="bg-red-50 p-5 sm:p-6 rounded-[2rem] sm:rounded-3xl border border-red-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-red-900">Zone Danger</h3>
            <p className="text-xs text-red-700">
              La suppression de votre compte est définitive. Toutes vos données seront effacées.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Suppression en cours...' : 'Supprimer mon compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
