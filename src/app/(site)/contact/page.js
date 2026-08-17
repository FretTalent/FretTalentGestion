'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Truck,
  Building2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  MessageSquare,
  Bot,
  ExternalLink,
  ChevronRight,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'recruiter', // 'recruiter' | 'candidate' | 'other'
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // État du Robot Diagnostic Virtuel Interactif
  const [botStep, setBotStep] = useState('start'); // 'start' | 'carrier' | 'driver' | 'pricing' | 'other'
  const [botActiveAnswer, setBotActiveAnswer] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickQuestionSelect = (role, subjectText, templateMessage) => {
    setFormData((prev) => ({
      ...prev,
      role: role,
      subject: subjectText,
      message: templateMessage || prev.message,
    }));
    toast.success('Formulaire pré-rempli avec votre question !', { icon: '🤖' });
    const formElement = document.getElementById('contact-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setSubmitted(true);
      toast.success('Message envoyé avec succès !');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Impossible d\'envoyer le message. Écrivez à support@frettalent.fr');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-orange-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-12">
        
        {/* 1. HEADER & HERO */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Support Client & Service Commercial Ouvert 7j/7</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Besoin d&apos;aide ou d&apos;une information ? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">
              Nous sommes là pour vous.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Une question sur nos <strong>chauffeurs qualifiés</strong>, notre tarification à <strong>4,99€ / 39,99€</strong> ou la validation de vos documents ? Contactez directement nos équipes.
          </p>
        </div>

        {/* 2. LES 3 CANAUX DE CONTACT OFFICIELS (CARTES CLIQUABLES) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Canal 1 : E-mail direct */}
          <a
            href="mailto:support@frettalent.fr"
            className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900 transition-all duration-300 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                  E-mail Officiel
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Réponse &lt; 2h
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Pour toute demande commerciale, recrutement d&apos;urgence ou validation de compte.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 font-mono text-sm font-bold text-orange-300">
                support@frettalent.fr
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>Écrire un e-mail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Canal 2 : Telegram Officiel */}
          <a
            href="https://t.me/Frettalent"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#229ED9]/50 hover:bg-slate-900 transition-all duration-300 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/20 flex items-center justify-center text-[#229ED9] group-hover:scale-110 transition-transform mb-4">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.847-1.077 4.708-1.564 6.782-.206.879-.537 1.173-.858 1.202-.699.064-1.23-.462-1.907-.905-.884-.578-1.383-.938-2.241-1.503-.993-.654-.35-1.014.217-1.602.148-.153 2.723-2.496 2.773-2.708.006-.027.012-.127-.048-.18-.06-.054-.148-.035-.212-.021-.09.02-1.528.971-4.312 2.851-.408.281-.778.419-1.109.412-.365-.008-1.068-.207-1.591-.377-.642-.208-1.152-.319-1.108-.673.023-.184.278-.373.766-.567 3.003-1.307 5.006-2.17 6.009-2.589 2.864-1.196 3.458-1.404 3.847-1.41.085-.001.277.021.401.122.105.085.134.199.148.279.014.079.03.261.016.402z"/>
                </svg>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-[#229ED9] transition-colors">
                  Telegram Officiel
                </h3>
                <span className="text-[10px] font-bold text-[#229ED9] bg-[#229ED9]/10 border border-[#229ED9]/30 px-2 py-0.5 rounded-full">
                  Assistance 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Robot d&apos;assistance interactif et discussion instantanée avec un conseiller FretTalent.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 font-mono text-sm font-bold text-[#229ED9]">
                @Frettalent
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#229ED9] group-hover:translate-x-1 transition-transform">
              <span>Ouvrir sur Telegram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Canal 3 : Facebook Officiel */}
          <a
            href="https://www.facebook.com/profile.php?id=61593021909293"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#1877F2]/50 hover:bg-slate-900 transition-all duration-300 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform mb-4">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-[#1877F2] transition-colors">
                  Page Facebook
                </h3>
                <span className="text-[10px] font-bold text-[#1877F2] bg-[#1877F2]/10 border border-[#1877F2]/30 px-2 py-0.5 rounded-full">
                  Communauté
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Suivez nos actualités, les nouveaux postes de chauffeurs et échangez avec nous sur Messenger.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 font-mono text-sm font-bold text-[#1877F2] truncate">
                Fret Talent Officiel
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#1877F2] group-hover:translate-x-1 transition-transform">
              <span>Voir la page Facebook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>

        </div>

        {/* 3. ASSISTANT ROBOT VIRTUEL INTERACTIF (QUALIFICATION ET AUDIT INSTANTANÉ) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Assistant Virtuel FretTalent</span>
                  <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                    Audit &amp; Réponse Instantanée
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Trouvez votre réponse immédiatement ou laissez le robot préparer votre message.
                </p>
              </div>
            </div>

            {/* Réinitialiser le bot */}
            {botStep !== 'start' && (
              <button
                type="button"
                onClick={() => {
                  setBotStep('start');
                  setBotActiveAnswer(null);
                }}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer self-start sm:self-auto"
              >
                Recommencer le diagnostic ↺
              </button>
            )}
          </div>

          {/* ÉTAPE 1 : CHOIX DU PROFIL */}
          {botStep === 'start' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-bold text-slate-300">
                🤖 <strong>Robot FretTalent :</strong> &laquo; Bonjour ! Pour vous orienter au mieux, sélectionnez votre profil : &raquo;
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBotStep('carrier')}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900/90 text-left transition-all cursor-pointer group"
                >
                  <Building2 className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-bold text-white">🏢 Je suis une Entreprise</p>
                  <p className="text-xs text-slate-400 mt-1">Recrutement de chauffeurs, tarifs 4,99€ / 39,99€, offres d&apos;emploi</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBotStep('driver')}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900/90 text-left transition-all cursor-pointer group"
                >
                  <Truck className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-bold text-white">🚚 Je suis un Chauffeur</p>
                  <p className="text-xs text-slate-400 mt-1">Inscription gratuite, documents requis (FIMO, chrono), badge certifié</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBotStep('other')}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900/90 text-left transition-all cursor-pointer group"
                >
                  <HelpCircle className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-bold text-white">🤝 Autre / Partenariat</p>
                  <p className="text-xs text-slate-400 mt-1">Facturation, support technique, demande spécifique</p>
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2A : QUESTIONS ENTREPRISES */}
          {botStep === 'carrier' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-bold text-slate-300">
                🏢 <strong>Espace Transporteur :</strong> Quel est votre besoin principal ?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Déblocage de Chauffeur à 4,99 € TTC',
                    text: 'Sur FretTalent, vous pouvez consulter la liste des chauffeurs gratuitement. Le déblocage des coordonnées complètes (téléphone direct, email, pièces justificatives contrôlées) coûte seulement 4,99 € TTC à l\'acte, sans aucun engagement ni abonnement forcé.',
                    ctaText: 'Explorer les Chauffeurs',
                    ctaLink: '/candidats-disponibles',
                    role: 'recruiter',
                    subject: 'Question sur le déblocage à l\'acte (4,99€)',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  💰 Comment débloquer un chauffeur à 4,99 € ?
                </button>

                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Abonnement Pro Illimité (39,99 € HT/mois)',
                    text: 'Notre forfait Pro Illimité à 39,99 € HT / mois vous permet de débloquer autant de chauffeurs que vous le souhaitez sans surcoût, et de publier vos offres d\'emploi en priorité. Vous économisez plus de 90% par rapport aux agences d\'intérim.',
                    ctaText: 'Voir la Grille Tarifaire',
                    ctaLink: '/tarifs',
                    role: 'recruiter',
                    subject: 'Demande d\'information Abonnement Pro (39,99€)',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  🚀 Comment fonctionne l&apos;Abonnement Pro ?
                </button>

                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Contrôle & Fiabilité des Profils',
                    text: '100% des documents officiels (Permis C/CE/SPL, attestation FIMO/FCO, Carte Conducteur Chronotachygraphe, ADR) sont contrôlés par nos équipes de modération avant d\'attribuer le badge "Chauffeur Vérifié ✓".',
                    ctaText: 'En savoir plus sur nos garanties',
                    ctaLink: '/comment-ca-marche',
                    role: 'recruiter',
                    subject: 'Question sur la vérification des chauffeurs',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  🛡️ Comment sont vérifiés les chauffeurs ?
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2B : QUESTIONS CHAUFFEURS */}
          {botStep === 'driver' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-bold text-slate-300">
                🚚 <strong>Espace Chauffeur Routier :</strong> Quelle est votre question ?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Inscription 100% Gratuite',
                    text: 'L\'inscription et l\'utilisation de FretTalent sont totalement gratuites pour tous les chauffeurs et conducteurs routiers. Aucun frais ne vous sera jamais demandé.',
                    ctaText: 'Créer mon Profil Gratuit',
                    ctaLink: '/register',
                    role: 'candidate',
                    subject: 'Question sur la gratuité candidat',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  🆓 Est-ce vraiment gratuit pour les chauffeurs ?
                </button>

                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Documents Obligatoires pour être certifié',
                    text: 'Pour être visible en priorité par les transporteurs de votre région, vous devez déposer : votre Permis de conduire (C, CE), votre attestation FIMO / FCO en cours de validité, votre Carte Conducteur Chronotachygraphe et facultativement votre ADR ou CV.',
                    ctaText: 'Déposer mes documents',
                    ctaLink: '/dashboard/candidate',
                    role: 'candidate',
                    subject: 'Assistance sur mes documents obligatoires',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  📄 Quels documents dois-je fournir ?
                </button>

                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Mise en relation directe avec les recruteurs',
                    text: 'Dès que vos justificatifs sont validés par nos équipes, votre profil apparaît dans la CVthèque. Les entreprises de transport de France, Belgique, Luxembourg et Suisse peuvent vous contacter directement par téléphone ou e-mail sans intermédiaire.',
                    ctaText: 'Voir les offres disponibles',
                    ctaLink: '/offres',
                    role: 'candidate',
                    subject: 'Mise en relation avec les recruteurs',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  📞 Comment les entreprises me contactent ?
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2C : QUESTIONS DIVERSES / AUTRES */}
          {botStep === 'other' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-bold text-slate-300">
                🤝 <strong>Support Général &amp; Partenariats :</strong> Choisissez un thème :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Factures & Reçus Stripe',
                    text: 'Toutes vos factures et reçus de paiement sont disponibles instantanément dans votre espace entreprise rubrique "Facturation". Pour toute modification de numéro TVA ou SIRET, écrivez-nous ci-dessous.',
                    ctaText: 'Accéder à mon espace',
                    ctaLink: '/dashboard/recruiter/settings',
                    role: 'other',
                    subject: 'Demande concernant une facture / TVA',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  🧾 Facturation &amp; Numéro TVA
                </button>

                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Partenariats & Réseaux Transport',
                    text: 'Vous êtes un centre de formation (FIMO/FCO), un syndicat de transporteurs ou un jobboard partenaire ? Nous collaborons activement avec les acteurs de la filière transport routier.',
                    role: 'other',
                    subject: 'Proposition de Partenariat Professionnel',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  🤝 Proposer un Partenariat
                </button>

                <button
                  type="button"
                  onClick={() => setBotActiveAnswer({
                    title: 'Problème de Connexion ou Compte',
                    text: 'Si vous avez oublié votre mot de passe ou rencontrez une difficulté pour vous connecter, vous pouvez réinitialiser vos identifiants ou nous décrire votre problème ci-dessous.',
                    ctaText: 'Réinitialiser mon mot de passe',
                    ctaLink: '/login',
                    role: 'other',
                    subject: 'Problème technique de connexion',
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-left transition-all text-xs font-bold cursor-pointer text-slate-200"
                >
                  🔑 Problème de Connexion
                </button>
              </div>
            </div>
          )}

          {/* RÉPONSE DU ROBOT AVEC ACTION 1-CLIC */}
          {botActiveAnswer && (
            <div className="p-5 rounded-xl bg-slate-950 border border-orange-500/40 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{botActiveAnswer.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {botActiveAnswer.text}
              </p>

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                {botActiveAnswer.ctaLink && (
                  <Link
                    href={botActiveAnswer.ctaLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
                  >
                    <span>{botActiveAnswer.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => handleQuickQuestionSelect(
                    botActiveAnswer.role,
                    botActiveAnswer.subject,
                    `Bonjour, je souhaiterais obtenir des précisions concernant : ${botActiveAnswer.title}.`
                  )}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                  <span>Contacter un humain sur ce sujet ✍️</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. FORMULAIRE DE CONTACT PRINCIPAL */}
        <div id="contact-form-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="border-b border-slate-800 pb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Envoyer un Message à l&apos;Équipe FretTalent
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Remplissez ce formulaire pour être recontacté directement par e-mail ou téléphone par notre équipe.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-12 space-y-4 max-w-md mx-auto animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Message Reçu avec Succès !</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Un accusé de réception a été envoyé à <strong>{formData.email}</strong>. Notre équipe vous répondra dans un délai moyen de moins de 2 heures.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'recruiter',
                      subject: '',
                      message: '',
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Envoyer un autre message
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
                >
                  Retour à l&apos;accueil
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Sélecteur de profil */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Vous êtes : <span className="text-orange-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'recruiter', label: '🏢 Entreprise / Transporteur', desc: 'Recrutement & Déblocages' },
                    { id: 'candidate', label: '🚚 Chauffeur Routier', desc: 'Recherche d\'emploi' },
                    { id: 'other', label: '🤝 Partenaire / Autre', desc: 'Support & Facturation' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: r.id }))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.role === r.id
                          ? 'border-orange-500 bg-orange-500/10 text-white ring-1 ring-orange-500/30'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <p className="text-xs font-bold">{r.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ligne 1 : Nom & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nom &amp; Prénom / Société <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Ex: Jean Dupont (Transports Dupont)"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Adresse E-mail <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jean.dupont@transport.fr"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Ligne 2 : Téléphone & Sujet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Numéro de Téléphone <span className="text-slate-500 font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Sujet de votre demande <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Ex: Recrutement urgent 2 chauffeurs SPL"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Ligne 3 : Message */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Votre Message Détaillé <span className="text-orange-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Détaillez votre demande, vos besoins en chauffeurs, vos questions sur la plateforme ou votre compte..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                />
              </div>

              {/* Bouton de Soumission */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vos données sont sécurisées et traitées selon notre politique de confidentialité.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-black shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Envoyer mon Message</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
