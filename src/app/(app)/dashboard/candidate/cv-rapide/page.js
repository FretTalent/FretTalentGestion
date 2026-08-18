'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Zap,
  Send,
  Star,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Eye,
  CreditCard,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  Sparkles,
  PhoneCall,
  FileCheck,
  MailCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateCvRapidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [myCandidatures, setMyCandidatures] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Profil candidat
      const { data: candData, error: candError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (candError || !candData) {
        router.push('/dashboard/candidate');
        return;
      }
      setCandidate(candData);

      // Historique candidatures
      const { data: cands } = await supabase
        .from('candidatures')
        .select('*')
        .eq('candidate_id', user.id)
        .order('created_at', { ascending: false });
      setMyCandidatures(cands || []);

      // Badge étoile 7 jours actif
      const { data: badge } = await supabase
        .from('premium_badges')
        .select('*')
        .eq('candidate_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      setActiveBadge(badge);
    } catch (err) {
      console.error('Erreur chargement CV Rapide:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
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
      toast.error(err.message || 'Erreur lors de la redirection');
      setPurchasing(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Chargement de l&apos;option CV Rapide...
        </p>
      </div>
    );
  }

  const hasPurchasedBefore = myCandidatures.length > 0;
  const daysLeftBadge = activeBadge
    ? Math.max(1, Math.ceil((new Date(activeBadge.expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* 1. HERO SECTION ULTRA-VALORISANTE */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
        {/* Glow décoratif */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg shadow-orange-500/30">
              <Zap className="h-3.5 w-3.5 fill-white" />
              <span>Service Premium Chauffeur</span>
            </span>

            {activeBadge ? (
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
                <span>Étoile active sur la carte ({daysLeftBadge} jour{daysLeftBadge > 1 ? 's' : ''} restant{daysLeftBadge > 1 ? 's' : ''})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-white/10 text-slate-300 text-[11px] font-semibold px-3 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>Étoile dorée sur la carte pendant 1 semaine</span>
              </span>
            )}
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Option CV Rapide : Diffusez votre profil à tous les transporteurs dans un rayon de 50 km
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Ne perdez plus de temps à postuler une par une. Notre algorithme identifie l&apos;ensemble des entreprises de transport autour de votre domicile ({candidate?.postal_code} {candidate?.city}) et leur transmet directement votre dossier complet certifié.
            </p>
          </div>

          {/* CTA & Prix Hero */}
          <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3"
            >
              {purchasing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Redirection vers le paiement sécurisé...</span>
                </>
              ) : (
                <>
                  <span>🚀 Activer mon CV Rapide</span>
                  <span className="bg-black/25 px-2.5 py-0.5 rounded-lg font-mono text-sm">19,99 €</span>
                </>
              )}
            </button>

            <div className="text-xs text-slate-400 space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Paiement unique sans aucun abonnement caché</span>
              </div>
              <span className="text-[11px] text-slate-400 block pl-5">
                Activation et diffusion immédiates après règlement Stripe.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUIVI EN DIRECT (SI LE CHAUFFEUR A DÉJÀ COMMANDÉ) */}
      {hasPurchasedBefore && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-orange-500" />
              <h2 className="text-base font-black text-slate-900">
                Suivi de vos diffusions CV Rapide
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Dernière activation le {new Date(myCandidatures[0].created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entreprises Contactées</span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {myCandidatures[0].target_companies_count || myCandidatures[0].sent_count || 0}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Dans un rayon de 50 km</span>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200/60">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Candidatures Ouvertes</span>
              <div className="text-2xl font-black text-emerald-800 mt-1 font-mono">
                {myCandidatures[0].opened_count || 0}
              </div>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">Transporteurs ayant consulté votre CV</span>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/60">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Étoile sur la Carte</span>
              <div className="text-sm font-black text-amber-900 mt-2 flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{activeBadge ? `Active (${daysLeftBadge}j restants)` : 'Terminée'}</span>
              </div>
              <span className="text-[11px] text-amber-700 mt-0.5 block">Mise en avant 1 semaine</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. LES 4 AVANTAGES CLÉS DU FORFAIT 19,99 € */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">Tout ce qui est inclus</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Pourquoi activer l&apos;option CV Rapide ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Un accélérateur conçu spécialement pour les chauffeurs routiers à la recherche d&apos;un poste rapide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Avantage 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-orange-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-lg">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              1. Diffusion Ciblée dans un Rayon de 50 km
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vos coordonnées, permis ({candidate?.licenses?.join(', ') || 'SPL'}), certifications et documents validés sont transmis par email professionnel directement aux directeurs et responsables recrutement des transporteurs de votre zone.
            </p>
          </div>

          {/* Avantage 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
              <Star className="h-6 w-6 fill-amber-500" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              2. Étoile Dorée ⭐ sur la Carte pendant 1 Semaine (7 jours)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pendant <strong>7 jours entiers</strong>, votre profil apparaît en tête de liste et avec une étoile dorée sur la carte interactive des chauffeurs disponibles consultée chaque jour par les recruteurs.
            </p>
          </div>

          {/* Avantage 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-lg">
              <MailCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              3. Accusé d&apos;Ouverture Instantané par Email
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Grâce à notre système de tracking sécurisé, dès qu&apos;une entreprise ouvre et lit votre candidature, vous recevez une notification par email avec le nom de l&apos;entreprise pour vous préparer à leur appel !
            </p>
          </div>

          {/* Avantage 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              4. Relance Automatique Programmée à J+7
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Une relance automatique de rappel est programmée à 7 jours auprès de l&apos;ensemble des entreprises contactées pour leur rappeler votre disponibilité immédiate si votre profil n&apos;a pas encore été embauché.
            </p>
          </div>

        </div>
      </div>

      {/* 4. COMMENT ÇA MARCHE (INSTRUCTIONS CLAIRES ÉTAPE PAR ÉTAPE) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Processus 100% automatisé</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Comment se déroule votre diffusion ?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-white">Validation du Profil</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Vos permis, certifications et coordonnées enregistrés sur FretTalent sont préparés pour l&apos;envoi.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-white">Règlement 19,99 €</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Paiement unique sécurisé par carte via Stripe. Aucune reconduction automatique.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-white">Envoi Immédiat 50 km</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Notre serveur géocode votre adresse et envoie votre dossier aux entreprises ciblées.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="text-xs font-bold text-white">Contacts & Embauche</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Les recruteurs consultent votre CV et vous contactent directement par téléphone ou email.
            </p>
          </div>

        </div>
      </div>

      {/* 5. CARTE DE COMMANDE FINALE */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-500/20">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">
            Prêt à démarrer ?
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            Activez votre option CV Rapide pour 19,99 €
          </h3>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
            Profitez de la puissance du réseau FretTalent pour trouver votre prochain poste de chauffeur sans attendre.
          </p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={purchasing}
          className="w-full md:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-sm rounded-2xl shadow-xl transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
        >
          {purchasing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Chargement...</span>
            </>
          ) : (
            <>
              <span>Activer maintenant</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* 6. FAQ INTERACTIVE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Questions fréquentes</span>
          <h3 className="text-lg font-black text-slate-900">
            Foire aux questions — Option CV Rapide
          </h3>
        </div>

        <div className="space-y-2.5 pt-2">
          
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleFaq(1)}
              className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 bg-slate-50/70 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <span>Comment est calculé le rayon de 50 km ?</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === 1 ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === 1 && (
              <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-200/60 leading-relaxed">
                Notre algorithme utilise les coordonnées GPS officielles calculées à partir de votre code postal et de votre ville pour sélectionner toutes les entreprises de transport et logistique situées à moins de 50 kilomètres à vol d&apos;oiseau de votre domicile.
              </div>
            )}
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleFaq(2)}
              className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 bg-slate-50/70 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <span>Combien de temps mon profil reste-t-il mis en avant sur la carte ?</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === 2 ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === 2 && (
              <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-200/60 leading-relaxed">
                Votre profil bénéficie d&apos;une <strong>Étoile Dorée ⭐</strong> et d&apos;un classement prioritaire en tête de liste sur la carte interactive des candidats pendant <strong>1 semaine entière (7 jours)</strong> à compter de votre paiement.
              </div>
            )}
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleFaq(3)}
              className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 bg-slate-50/70 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <span>Les entreprises reçoivent-elles directement mon numéro de téléphone ?</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === 3 ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === 3 && (
              <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-200/60 leading-relaxed">
                Oui ! L&apos;email reçu par le recruteur contient vos permis, votre expérience, un bouton d&apos;appel téléphonique direct et votre adresse email pour qu&apos;il puisse vous joindre immédiatement sans intermédiaire.
              </div>
            )}
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleFaq(4)}
              className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 bg-slate-50/70 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <span>Y a-t-il un abonnement ou des frais supplémentaires ?</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === 4 ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === 4 && (
              <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-200/60 leading-relaxed">
                Non, absolument aucun abonnement ni renouvellement automatique. Il s&apos;agit d&apos;un paiement unique de 19,99 € TTC pour la diffusion de votre candidature, l&apos;étoile 1 semaine sur la carte et la relance automatique à J+7.
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
