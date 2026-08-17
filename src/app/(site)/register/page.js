'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Truck, AlertCircle, ShieldAlert, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { COUNTRIES, COUNTRY_LIST, detectCountryFromId, validateCompanyIdFormat, formatCompanyIdentifier, validatePhoneNumber, validateAddress, calculateAge } from '@/lib/country';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState('candidate'); // 'candidate' ou 'recruiter'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Champs entreprise
  const [country, setCountry] = useState('FR'); // 'FR' | 'BE' | 'LU' | 'CH'
  const [companyName, setCompanyName] = useState('');
  const [companyIdInput, setCompanyIdInput] = useState('');
  
  // Champs candidat
  const [candidateCountry, setCandidateCountry] = useState('FR'); // 'FR' | 'BE' | 'LU' | 'CH'
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneFeedback, setPhoneFeedback] = useState(null); // { valid: boolean, message: string }
  
  // Champ Adresse Globale
  const [addressInfo, setAddressInfo] = useState({ address: '', city: '', postalCode: '', isVerified: false });

  const [rgpdConsent, setRgpdConsent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // États pour la validation de l'entreprise
  const [idLoading, setIdLoading] = useState(false);
  const [idValid, setIdValid] = useState(null); // null | true | false
  const [idFeedback, setIdFeedback] = useState('');
  const verifyTimerRef = useRef(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'candidate' || roleParam === 'recruiter') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Validation en direct du numéro de téléphone
  const handlePhoneChange = (val) => {
    setPhone(val);
    if (!val.trim()) {
      setPhoneFeedback(null);
      return;
    }
    const check = validatePhoneNumber(val, candidateCountry);
    setPhoneFeedback(check);
  };

  // Hook de validation en direct de l'identifiant d'entreprise
  useEffect(() => {
    if (role !== 'recruiter') return;

    if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);

    if (!companyIdInput.trim()) {
      setIdValid(null);
      setIdFeedback('');
      setIdLoading(false);
      return;
    }

    // Détection automatique du pays selon le format saisi
    const autoDetected = detectCountryFromId(companyIdInput);
    if (autoDetected && autoDetected !== country) {
      setCountry(autoDetected);
    }

    const currentCountry = autoDetected || country;
    const formatCheck = validateCompanyIdFormat(currentCountry, companyIdInput);

    if (!formatCheck.valid) {
      setIdValid(false);
      setIdFeedback(formatCheck.message);
      setIdLoading(false);
      return;
    }

    // Lancer la vérification officielle après debounce
    setIdLoading(true);
    setIdValid(null);
    setIdFeedback('');

    verifyTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/companies/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: currentCountry,
            identifier: companyIdInput,
          }),
        });

        const data = await res.json();

        if (data.valid) {
          setIdValid(true);
          if (data.companyName) {
            setIdFeedback(`Entreprise certifiée : ${data.companyName}`);
            if (!companyName.trim()) {
              setCompanyName(data.companyName);
            }
          } else {
            setIdFeedback('Format d\'identifiant officiel valide.');
          }

          // Préremplissage adresse si renvoyée
          if (data.address && (!addressInfo.address || !addressInfo.city)) {
            setAddressInfo({
              address: data.address,
              city: data.city || '',
              postalCode: data.postalCode || '',
              isVerified: true,
            });
          }
        } else {
          setIdValid(false);
          setIdFeedback(data.message || 'Numéro non valide.');
        }
      } catch (err) {
        console.error('Erreur vérification:', err);
        setIdValid(true); // Tolérance si indisponibilité réseau
        setIdFeedback('Format validé.');
      } finally {
        setIdLoading(false);
      }
    }, 450);

    return () => {
      if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
    };
  }, [companyIdInput, country, role]);

  const handleRegister = async e => {
    e.preventDefault();
    setError(null);

    if (!rgpdConsent) {
      setError(
        'Vous devez accepter la politique de confidentialité RGPD pour continuer.',
      );
      return;
    }

    if (role === 'recruiter') {
      const formatCheck = validateCompanyIdFormat(country, companyIdInput);
      if (!formatCheck.valid || idValid === false) {
        setError(
          `Veuillez saisir un identifiant d'entreprise valide pour ${COUNTRIES[country]?.name || 'le pays sélectionné'}.`,
        );
        return;
      }
      if (!companyName.trim()) {
        setError("Le nom de l'entreprise est obligatoire.");
        return;
      }

      // Validation stricte de l'adresse de l'entreprise
      const addrCheck = validateAddress(addressInfo, country);
      if (!addrCheck.valid) {
        setError(addrCheck.message);
        return;
      }
    }

    if (role === 'candidate') {
      if (!lastName.trim() || !firstName.trim()) {
        setError('Veuillez renseigner votre nom et votre prénom.');
        return;
      }

      if (!birthDate) {
        setError('Veuillez renseigner votre date de naissance.');
        return;
      }

      const age = calculateAge(birthDate);
      if (age === null || age < 18) {
        setError('Vous devez avoir au moins 18 ans pour vous inscrire en tant que conducteur routier.');
        return;
      }

      if (age > 99) {
        setError('Veuillez vérifier votre date de naissance.');
        return;
      }

      // Validation stricte du numéro de téléphone réel
      const phoneCheck = validatePhoneNumber(phone, candidateCountry);
      if (!phoneCheck.valid) {
        setError(phoneCheck.message);
        return;
      }

      // Validation stricte de l'adresse du candidat
      const addrCheck = validateAddress(addressInfo, candidateCountry);
      if (!addrCheck.valid) {
        setError(addrCheck.message);
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Création de l'utilisateur dans Supabase Auth
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.frettalent.fr';
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/login?confirmed=true`,
        },
      });

      if (authError) throw authError;
      const user = authData.user;

      if (!user) {
        throw new Error(
          "Une erreur s'est produite lors de l'authentification.",
        );
      }

      // Envoi du mail de confirmation personnalisé via Resend (support@frettalent.fr) pour 100% de délivrabilité
      fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(e => console.warn('Erreur envoi email verification direct:', e));

      // 2. Insérer le profil d'utilisateur
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, role }]);

      if (profileError) throw profileError;

      // 3. Insérer les détails spécifiques de l'espace
      if (role === 'candidate') {
        const fullCandidateName = `${lastName.trim().toUpperCase()} ${firstName.trim()}`;
        const cleanPhone = validatePhoneNumber(phone, candidateCountry).formatted || phone.trim();
        const { error: candidateError } = await supabase
          .from('candidates')
          .insert([
            {
              id: user.id,
              full_name: fullCandidateName,
              email: email,
              phone: cleanPhone,
              birth_date: birthDate,
              postal_code: addressInfo.postalCode,
              city: addressInfo.city,
              address: addressInfo.address || '',
              country: candidateCountry,
              is_active: true,
            },
          ]);
        if (candidateError) {
          console.error('Erreur insertion candidat:', candidateError);
          throw candidateError;
        }

        // Notification Telegram Admin
        fetch('/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'candidate_registered',
            data: {
              candidateName: fullCandidateName,
              email: email,
              phone: cleanPhone,
              age: calculateAge(birthDate) ? `${calculateAge(birthDate)} ans` : 'Non renseigné',
              city: addressInfo.city,
              postalCode: addressInfo.postalCode,
              country: candidateCountry,
            },
          }),
        }).catch(e => console.error('Telegram notification error:', e));

        router.push('/dashboard/candidate');
      } else if (role === 'recruiter') {
        const cleanId = companyIdInput.trim();
        const { error: companyError } = await supabase
          .from('companies')
          .insert([
            {
              id: user.id,
              name: companyName,
              siret: country === 'FR' ? cleanId.replace(/\D/g, '') : null,
              bce: country === 'BE' ? cleanId.replace(/\D/g, '') : null,
              country: country,
              address: addressInfo.address || '',
              postal_code: addressInfo.postalCode || '',
              city: addressInfo.city || '',
              has_payment_method: false,
            },
          ]);
        if (companyError) throw companyError;

        // Notification Telegram Admin
        fetch('/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'company_registered',
            data: {
              companyName: companyName,
              email: email,
              country: country,
              identifier: cleanId,
              city: addressInfo.city,
              postalCode: addressInfo.postalCode,
            },
          }),
        }).catch(e => console.error('Telegram notification error:', e));

        router.push('/dashboard/recruiter');
      }
    } catch (err) {
      setError(
        err.message || 'Une erreur est survenue lors de la création du compte.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-3xl border border-slate-200 shadow-xl space-y-5 sm:space-y-6">
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group justify-center"
        >
          <img src="/logo.png" alt="FretTalent" className="h-14 sm:h-16 md:h-20 w-auto object-contain" />
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Créer mon compte
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Rejoignez le réseau FretTalent en France, Belgique, Luxembourg et Suisse.
        </p>
      </div>

      {/* Choix du Rôle */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 bg-slate-100 p-1.5 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setRole('candidate');
            setError(null);
          }}
          className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
            role === 'candidate'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Je suis Chauffeur
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('recruiter');
            setError(null);
          }}
          className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
            role === 'recruiter'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Je suis Recruteur
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-start gap-2 text-xs border border-red-100">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">
            Adresse e-mail *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jean.dupont@email.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">
            Mot de passe *
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 6 caractères"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Champs spécifiques Chauffeur */}
        {role === 'candidate' && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                <span>Pays de résidence *</span>
                <span className="text-[10px] text-slate-400 font-normal">Zone de travail</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COUNTRY_LIST.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCandidateCountry(c.code);
                      setAddressInfo({ address: '', city: '', postalCode: '', isVerified: false });
                      if (phone) {
                        setPhoneFeedback(validatePhoneNumber(phone, c.code));
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                      candidateCountry === c.code
                        ? 'border-orange-500 bg-orange-50/80 text-orange-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                  <span>Date de naissance *</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {birthDate && calculateAge(birthDate) ? `${calculateAge(birthDate)} ans` : 'Min. 18 ans'}
                  </span>
                </label>
                <input
                  type="date"
                  required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                  <span>Téléphone réel *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Recrutement</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    placeholder={COUNTRIES[candidateCountry]?.phonePrefix ? `${COUNTRIES[candidateCountry].phonePrefix} 6 12 34 56 78` : '06 12 34 56 78'}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                      phoneFeedback && phoneFeedback.valid === true
                        ? 'border-green-500 bg-green-50/20 focus:ring-green-500/20 focus:border-green-500 text-slate-900'
                        : phoneFeedback && phoneFeedback.valid === false
                        ? 'border-red-400 bg-red-50/20 focus:ring-red-500/20 focus:border-red-500 text-slate-900'
                        : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900'
                    }`}
                  />
                  {phoneFeedback && phoneFeedback.valid === true && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {phoneFeedback && phoneFeedback.valid === false && (
                  <p className="text-[11px] font-semibold text-red-500 mt-1">
                    {phoneFeedback.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                <span>Adresse complète réelle ({COUNTRIES[candidateCountry]?.name}) *</span>
                <span className="text-[10px] text-slate-400 font-normal">Sélection requise</span>
              </label>
              <AddressAutocomplete 
                onAddressSelect={setAddressInfo}
                required={true}
                country={candidateCountry}
                placeholder={`Rechercher votre adresse exacte en ${COUNTRIES[candidateCountry]?.name}...`}
              />
            </div>

            <div className="bg-orange-50 text-orange-800 p-3 rounded-xl flex items-start gap-2.5 text-xs">
              <ShieldAlert className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <span>
                <strong>Anonymat Garanti :</strong> Vos coordonnées directes (nom,
                téléphone, e-mail) restent strictement masquées sur la carte et visibles
                uniquement après accord du recruteur.
              </span>
            </div>
          </div>
        )}

        {/* Champs spécifiques Recruteur */}
        {role === 'recruiter' && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                <span>Pays de l'entreprise *</span>
                <span className="text-[10px] text-slate-400 font-normal">Détection auto active</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COUNTRY_LIST.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountry(c.code);
                      setCompanyIdInput('');
                      setIdValid(null);
                      setIdFeedback('');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                      country === c.code
                        ? 'border-orange-500 bg-orange-50/80 text-orange-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Identifiant dynamique (SIRET / BCE / RCS-TVA / IDE) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                <span>{COUNTRIES[country]?.idLabel || "Identifiant d'entreprise"} *</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Ex: {COUNTRIES[country]?.idExample}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={companyIdInput}
                  onChange={e => setCompanyIdInput(e.target.value)}
                  placeholder={COUNTRIES[country]?.idPlaceholder}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    idValid === true
                      ? 'border-green-500 focus:ring-green-500/20 focus:border-green-500'
                      : idValid === false
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {idLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  </div>
                )}
                {idValid === true && !idLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>

              {/* Feedback validation */}
              {idFeedback && (
                <p
                  className={`text-[10px] font-bold mt-1 ${
                    idValid === true
                      ? 'text-green-600'
                      : idValid === false
                      ? 'text-red-500'
                      : 'text-slate-500'
                  }`}
                >
                  {idFeedback}
                </p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="ex: Transports & Logistique Europe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Adresse du siège ({COUNTRIES[country]?.name}) *
              </label>
              <AddressAutocomplete 
                onAddressSelect={setAddressInfo}
                required={true}
                country={country}
                placeholder={`Rechercher l'adresse du siège en ${COUNTRIES[country]?.name}...`}
              />
            </div>
          </div>
        )}

        {/* Consentement RGPD */}
        <div className="flex items-start gap-3 pt-2">
          <input
            id="rgpd"
            type="checkbox"
            checked={rgpdConsent}
            onChange={e => setRgpdConsent(e.target.checked)}
            className="mt-1 h-4 w-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
          />
          <label
            htmlFor="rgpd"
            className="text-xs text-slate-500 leading-normal"
          >
            En m'inscrivant, j'accepte que mes données soient traitées
            conformément à la{' '}
            <Link
              href="/legal/confidentialite"
              className="underline font-semibold hover:text-orange-500"
            >
              Politique de Confidentialité
            </Link>{' '}
            de FretTalent.
          </label>
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            (role === 'recruiter' && idValid === false) ||
            (role === 'recruiter' && idLoading)
          }
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
        >
          {loading
            ? 'Création du compte...'
            : role === 'recruiter' && idLoading
              ? "Vérification de l'entreprise..."
              : 'Créer mon compte'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-bold text-orange-500 hover:underline"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="text-center p-8 text-slate-500">Chargement du formulaire...</div>
          }
        >
          <RegisterContent />
        </Suspense>
      </main>
    </div>
  );
}
