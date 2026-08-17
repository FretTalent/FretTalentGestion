'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Truck, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isConfirmed = searchParams.get('confirmed') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRedirecting, setAutoRedirecting] = useState(false);
  const [redirectDestination, setRedirectDestination] = useState('');

  // Vérification automatique de la session (notamment après clic sur le lien de confirmation par e-mail)
  useEffect(() => {
    let isMounted = true;

    const redirectUserByRole = async (user) => {
      if (!user || !isMounted) return;
      try {
        setAutoRedirecting(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        let target = '/dashboard/candidate';
        if (profile?.role === 'candidate') {
          target = '/dashboard/candidate';
          setRedirectDestination('votre Espace Candidat');
        } else if (profile?.role === 'recruiter') {
          target = '/dashboard/recruiter';
          setRedirectDestination('votre Espace Recruteur');
        } else if (profile?.role === 'admin') {
          target = '/dashboard/admin';
          setRedirectDestination("l'Espace Administrateur");
        }

        setTimeout(() => {
          if (isMounted) router.push(target);
        }, 1200);
      } catch (e) {
        console.error('Erreur redirection auto:', e);
        setAutoRedirecting(false);
      }
    };

    // 1. Vérifier si une session est déjà active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectUserByRole(session.user);
      }
    });

    // 2. Écouter l'événement de signature (lorsque Supabase résout le hash du lien de confirmation)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        redirectUserByRole(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogin = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Récupérer le rôle pour rediriger correctement
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role === 'candidate') {
        router.push('/dashboard/candidate');
      } else if (profile.role === 'recruiter') {
        router.push('/dashboard/recruiter');
      } else if (profile.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(
        err.message ||
          'Erreur de connexion. Veuillez vérifier vos identifiants.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (autoRedirecting) {
    return (
      <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-950">
            {isConfirmed ? 'E-mail validé avec succès !' : 'Connexion réussie !'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Redirection automatique vers {redirectDestination || 'votre espace'}...
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group justify-center"
        >
          <img src="/logo.png" alt="FretTalent" className="h-16 md:h-20 w-auto object-contain" />
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Connexion à votre espace
        </h2>
        <p className="text-sm text-slate-500">
          Saisissez vos identifiants pour accéder à votre espace personnalisé.
        </p>
      </div>

      {isConfirmed && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold text-emerald-950">Adresse e-mail confirmée avec succès !</p>
            <p className="text-emerald-700 mt-0.5">Votre compte est activé. Vous pouvez vous connecter ci-dessous.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-xs font-bold text-slate-700 uppercase"
          >
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="nom@entreprise.fr"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-xs font-bold text-slate-700 uppercase"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 transition-colors shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Nouveau sur FretTalent ?{' '}
        <Link
          href="/register"
          className="font-bold text-orange-500 hover:underline"
        >
          Créer un compte
        </Link>
      </div>
    </>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
