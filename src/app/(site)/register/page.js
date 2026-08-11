'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Truck, AlertCircle, ShieldAlert } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState('candidate'); // 'candidate' ou 'recruiter'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Champs entreprise
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');

  // Champs candidat
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');

  const [rgpdConsent, setRgpdConsent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // États pour la validation de SIRET
  const [siretLoading, setSiretLoading] = useState(false);
  const [siretValid, setSiretValid] = useState(null); // null, true, false
  const [siretCompanyInfo, setSiretCompanyInfo] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'candidate' || roleParam === 'recruiter') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Hook de validation SIRET en direct
  useEffect(() => {
    const validateSiret = async () => {
      const cleanSiret = siret.replace(/\s+/g, ''); // Nettoyer les espaces
      if (cleanSiret.length !== 14) {
        setSiretValid(null);
        setSiretCompanyInfo('');
        return;
      }

      setSiretLoading(true);
      setSiretValid(null);

      try {
        const res = await fetch(
          `https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const info = data.results[0];
          setSiretValid(true);
          setSiretCompanyInfo(info.nom_complet);
          // Préremplir le nom de l'entreprise s'il est vide
          if (!companyName) {
            setCompanyName(info.nom_complet);
          }
        } else {
          setSiretValid(false);
          setSiretCompanyInfo('Aucune entreprise trouvée pour ce SIRET.');
        }
      } catch (err) {
        setSiretValid(false);
        setSiretCompanyInfo('Impossible de valider le SIRET pour le moment.');
      } finally {
        setSiretLoading(false);
      }
    };

    validateSiret();
  }, [siret]);

  const handleRegister = async e => {
    e.preventDefault();
    setError(null);

    if (!rgpdConsent) {
      setError(
        'Vous devez accepter la politique de confidentialité RGPD pour continuer.',
      );
      return;
    }

    if (role === 'recruiter' && siretValid !== true) {
      setError(
        'Veuillez saisir un numéro SIRET valide avant de finaliser votre inscription.',
      );
      return;
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
        const { error: candidateError } = await supabase
          .from('candidates')
          .insert([
            {
              id: user.id,
              full_name: fullName,
              email: email,
              phone: phone,
              postal_code: postalCode,
              city: city,
              is_active: true,
            },
          ]);
        if (candidateError) throw candidateError;
        router.push('/dashboard/candidate');
      } else if (role === 'recruiter') {
        const { error: companyError } = await supabase
          .from('companies')
          .insert([
            {
              id: user.id,
              name: companyName,
              siret: siret,
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
    <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group justify-center"
        >
          <div className="bg-orange-500 text-white p-2 rounded-lg">
            <Truck className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fret<span className="text-orange-500">Talent</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Créer mon compte
        </h2>
        <p className="text-sm text-slate-500">
          Rejoignez la plateforme FretTalent dès maintenant.
        </p>
      </div>

      {/* Choix du Rôle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setRole('candidate');
            setError(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
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
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
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
            placeholder="nom@exemple.fr"
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
              <label className="text-xs font-bold text-slate-700 uppercase">
                Nom complet
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Code postal
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="69001"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Ville
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Lyon"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
            <div className="bg-orange-50 text-orange-800 p-3 rounded-xl flex items-start gap-2.5 text-xs">
              <ShieldAlert className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <span>
                <strong>Anonymat Garanti :</strong> Vos coordonnées (nom,
                téléphone, e-mail) sont masquées et visibles uniquement après
                paiement du déblocage par le recruteur de votre choix.
              </span>
            </div>
          </div>
        )}

        {/* Champs spécifiques Recruteur */}
        {role === 'recruiter' && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Logistique Fret SAS"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Numéro SIRET
              </label>
              <input
                type="text"
                required
                maxLength={14}
                value={siret}
                onChange={e => setSiret(e.target.value.replace(/\D/g, ''))}
                placeholder="14 chiffres"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  siretValid === true
                    ? 'border-green-500 focus:ring-green-500/20 focus:border-green-500'
                    : siretValid === false
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
              {/* États de chargement et de validation */}
              {siretLoading && (
                <p className="text-[10px] text-slate-500 font-semibold animate-pulse pt-1">
                  🔍 Vérification du SIRET en direct...
                </p>
              )}
              {siretValid === true && (
                <p className="text-[10px] text-green-600 font-bold pt-1">
                  ✅ Entreprise identifiée :{' '}
                  <span className="underline">{siretCompanyInfo}</span>
                </p>
              )}
              {siretValid === false && (
                <p className="text-[10px] text-red-600 font-bold pt-1">
                  ❌ Aucun établissement actif trouvé : {siretCompanyInfo}
                </p>
              )}
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
            (role === 'recruiter' && siretValid !== true) ||
            (role === 'recruiter' && siretLoading)
          }
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-450 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-500/20"
        >
          {loading
            ? 'Création du compte...'
            : role === 'recruiter' && siretLoading
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
            <div className="text-center p-8">Chargement de la page...</div>
          }
        >
          <RegisterContent />
        </Suspense>
      </main>
    </div>
  );
}
