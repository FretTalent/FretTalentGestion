'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Truck, AlertCircle, ShieldAlert, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { COUNTRIES, COUNTRY_LIST, detectCountryFromId, validateCompanyIdFormat, formatCompanyIdentifier } from '@/lib/country';

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
  const [phone, setPhone] = useState('');
  
  // Champ Adresse Globale
  const [addressInfo, setAddressInfo] = useState({ address: '', city: '', postalCode: '' });

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
    }

    if (role === 'candidate') {
      if (!lastName.trim() || !firstName.trim()) {
        setError('Veuillez renseigner votre nom et votre prénom.');
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Création de l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      const user = authData.user;

      if (!user) {
        throw new Error(
          "Une erreur s'est produite lors de l'authentification.",
        );
      }

      // 2. Insérer le profil d'utilisateur
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, role }]);

      if (profileError) throw profileError;

      // 3. Insérer les détails spécifiques de l'espace
      if (role === 'candidate') {
        const fullCandidateName = `${lastName.trim().toUpperCase()} ${firstName.trim()}`;
        const { error: candidateError } = await supabase
          .from('candidates')
          .insert([
            {
              id: user.id,
              full_name: fullCandidateName,
              email: email,
              phone: phone,
              postal_code: addressInfo.postalCode || '00000',
              city: addressInfo.city || 'Non renseigné',
              address: addressInfo.address || '',
              country: candidateCountry,
              is_active: true,
            },
          ]);
        if (candidateError) {
          console.error('Erreur insertion candidat:', candidateError);
          throw candidateError;
        }
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
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Je suis chauffeur
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
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Recruteur / Entreprise
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Champs communs */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">
            Adresse e-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="contact@exemple.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">
            Mot de passe
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
                      setAddressInfo({ address: '', city: '', postalCode: '' });
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Téléphone portable
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={COUNTRIES[candidateCountry]?.phonePrefix ? `${COUNTRIES[candidateCountry].phonePrefix} 6...` : '06 12 34 56 78'}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Adresse complète ({COUNTRIES[candidateCountry]?.name}) *
              </label>
              <AddressAutocomplete 
                onAddressSelect={setAddressInfo}
                required={true}
                country={candidateCountry}
                placeholder={`Rechercher une adresse en ${COUNTRIES[candidateCountry]?.name}...`}
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
