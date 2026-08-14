'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  Truck,
  Building2,
  ShieldCheck,
  CreditCard,
  Search,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'Chauffeurs & Candidats',
    icon: Truck,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    questions: [
      {
        q: "L'inscription sur FretTalent est-elle gratuite pour les chauffeurs ?",
        a: "Oui, à 100% ! FretTalent est un service entièrement gratuit pour les chauffeurs et candidats du secteur du transport routier. Vous pouvez créer votre profil, déposer votre CV et vos documents sans débourser un centime."
      },
      {
        q: "Quels sont les permis et habilitations acceptés sur la plateforme ?",
        a: "Nous acceptons tous les permis et certifications de la filière transport : Permis B, C, CE, PL, SPL, ainsi que les habilitations FIMO, FCO, Carte Chronotachygraphe numérique, ADR de base, ADR Citerne et ADR Explosifs."
      },
      {
        q: "Comment fonctionne la protection de mes données personnelles ?",
        a: "Vos coordonnées directes (Nom, Prénom, Téléphone, E-mail, Adresse exacte) restent strictement masquées et anonymes sur la carte et dans les résultats de recherche. Seules les entreprises enregistrées qui choisissent de débloquer votre profil accèdent à vos informations de contact."
      },
      {
        q: "Puis-je masquer mon profil si je suis déjà en poste ?",
        a: "Absolument. Depuis votre tableau de bord candidat, un simple bouton vous permet de masquer votre profil. Dès lors, plus aucune entreprise ne peut vous trouver sur la carte ou initier un nouveau déblocage."
      },
      {
        q: "Quels types de contrats puis-je trouver sur FretTalent ?",
        a: "La plateforme propose tous types de contrats : CDI, CDD, Intérim et Missions indépendantes. Vous pouvez indiquer vos préférences directement sur votre profil."
      },
      {
        q: "Comment obtenir le badge 'Chauffeur Vérifié ✓' ?",
        a: "Il vous suffit de télécharger vos pièces justificatives (Permis recto/verso, Carte Chrono, FIMO/FCO) dans votre espace candidat. Notre équipe valide vos documents sous 24h à 48h pour vous attribuer le badge de certification."
      }
    ]
  },
  {
    category: 'Entreprises & Recruteurs',
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    questions: [
      {
        q: "Comment contacter directement un chauffeur qui m'intéresse ?",
        a: "Vous pouvez rechercher les chauffeurs par localisation, permis, habilitations (ADR, FIMO) ou spécialités. Lorsque vous trouvez un profil correspondant à vos besoins, vous débloquez immédiatement ses coordonnées complètes (nom, prénom, téléphone, e-mail, documents) pour le contacter en direct."
      },
      {
        q: "Puis-je publier des offres d'emploi sur la plateforme ?",
        a: "Oui, en tant que recruteur ou entreprise de transport, vous pouvez déposer vos offres d'emploi depuis votre tableau de bord. Après une rapide modération par notre équipe, vos offres sont publiées et visibles par l'ensemble des chauffeurs."
      },
      {
        q: "Dans quels pays FretTalent est-il disponible ?",
        a: "FretTalent couvre 4 pays : la France (SIRET), la Belgique (BCE), le Luxembourg (RCS/TVA) et la Suisse (IDE). Les chauffeurs et entreprises de transport de ces 4 pays peuvent s'inscrire, publier et recruter en direct avec vérification automatique de leurs identifiants officiels."
      },
      {
        q: "Puis-je consulter les CV et documents des chauffeurs avant de les débloquer ?",
        a: "Avant le déblocage, vous avez accès à l'ensemble des informations anonymisées : années d'expérience, permis détenus, certifications (FIMO, ADR), spécialités recherchées (Frigo, Benne, Citerne), rayon de mobilité et ville. Les coordonnées précises et documents originaux sont accessibles dès le déblocage."
      },
      {
        q: "Comment fonctionne la recherche géographique ?",
        a: "Notre outil intègre la géolocalisation et l'autocomplétion des adresses. Vous pouvez rechercher des chauffeurs par ville ou par code postal avec filtrage par rayon de mobilité."
      }
    ]
  },
  {
    category: 'Tarifs & Facturation',
    icon: CreditCard,
    color: 'text-green-600',
    bg: 'bg-green-50',
    questions: [
      {
        q: "Quel est le modèle tarifaire pour les entreprises ?",
        a: "Nous proposons une formule souple sans engagement : le déblocage à l'unité (à partir de 2€ par contact débloqué). Des formules d'abonnement ou des packs de déblocages sont également disponibles sur notre page Tarifs."
      },
      {
        q: "Les paiements sont-ils sécurisés ?",
        a: "Tous les paiements et enregistrements de cartes sont entièrement sécurisés et gérés par notre partenaire certifié Stripe. FretTalent ne conserve aucune donnée bancaire sur ses serveurs."
      },
      {
        q: "Obtiens-je une facture après chaque achat ?",
        a: "Oui, une facture détaillée au format PDF incluant la TVA est automatiquement générée et téléchargeable depuis votre espace client/finance entreprise."
      },
      {
        q: "Y a-t-il des frais cachés ou de commission au recrutement ?",
        a: "Aucun ! Contrairement aux agences d'intérim ou aux cabinets de recrutement classiques, FretTalent ne prend aucune commission sur le salaire du chauffeur ou sur l'embauche. Vous ne payez que le déblocage du contact."
      }
    ]
  },
  {
    category: 'Sécurité, Modération & Général',
    icon: ShieldCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    questions: [
      {
        q: "Comment les profils et offres d'emploi sont-ils modérés ?",
        a: "Afin de garantir un réseau de haute qualité, chaque profil d'entreprise et chaque annonce d'emploi est relue et validée manuellement par notre équipe avant publication."
      },
      {
        q: "Que faire si j'ai oublié mon mot de passe ?",
        a: "Sur la page de connexion, cliquez sur 'Mot de passe oublié ?'. Saisissez votre adresse e-mail pour recevoir instantanément un lien de réinitialisation sécurisé."
      },
      {
        q: "Puis-je supprimer mon compte et mes données à tout moment ?",
        a: "Oui, conformément au RGPD, vous disposez d'un contrôle total sur vos données. Un bouton de suppression définitive de compte est disponible dans les paramètres de votre profil candidat ou recruteur."
      },
      {
        q: "Comment contacter le support client en cas de besoin ?",
        a: "Notre équipe support est disponible du lundi au vendredi par e-mail à l'adresse support@frettalent.fr ou directement via notre formulaire de contact."
      },
      {
        q: "FretTalent remplace-t-il les agences d'intérim ?",
        a: "FretTalent offre une alternative directe, moderne et beaucoup plus économique. Il permet aux entreprises d'échanger directement avec les professionnels du transport sans intermédiaire et sans marge appliquée sur les heures."
      }
    ]
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleQuestion = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFaq = FAQ_DATA.map(cat => {
    const matchingQuestions = cat.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, questions: matchingQuestions };
  }).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> Centre d&apos;aide & FAQ
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Foire Aux Questions
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Retrouvez toutes les réponses à vos questions concernant l&apos;utilisation de FretTalent, le recrutement et la recherche d&apos;emploi transport.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Rechercher une question (ex: inscription, paiement, permis, entreprise...)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
        </div>

        {/* FAQ Sections */}
        {filteredFaq.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">Aucune question ne correspond à votre recherche</p>
            <p className="text-xs text-slate-500">Essayez avec d&apos;autres mots-clés ou consultez le support.</p>
          </div>
        ) : (
          filteredFaq.map((cat, catIdx) => {
            const Icon = cat.icon;
            return (
              <div key={catIdx} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${cat.bg}`}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">{cat.category}</h2>
                </div>

                <div className="space-y-3">
                  {cat.questions.map((item, qIdx) => {
                    const isOpen = !!openItems[`${catIdx}-${qIdx}`];
                    return (
                      <div
                        key={qIdx}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                      >
                        <button
                          onClick={() => toggleQuestion(catIdx, qIdx)}
                          className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-orange-500 transition-colors"
                        >
                          <span>{item.q}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                              isOpen ? 'transform rotate-180 text-orange-500' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/50">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-orange-400 text-xs font-bold uppercase tracking-wide">
              <MessageSquare className="w-4 h-4" /> Une autre question ?
            </div>
            <h3 className="text-xl md:text-2xl font-black">Notre équipe est là pour vous aider</h3>
            <p className="text-sm text-slate-400">
              Vous n&apos;avez pas trouvé la réponse à votre question ? Contactez-nous directement.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <a
              href="https://www.facebook.com/profile.php?id=61593021909293"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold px-5 py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Page Facebook
            </a>
            <a
              href="mailto:support@frettalent.fr"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              Contacter le support <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
