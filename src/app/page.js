"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  ChevronDown, 
  Star 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { value: "100%", label: "Gratuit pour les chauffeurs" },
    { value: "2 €", label: "Par contact débloqué" },
    { value: "0 €", label: "Frais cachés" },
  ];

  const steps = [
    {
      title: "1. Profil anonyme",
      desc: "Le chauffeur crée son profil en quelques clics : permis, habilitations, zone de mobilité. Ses coordonnées (nom, prénom, e-mail, téléphone) restent masquées."
    },
    {
      title: "2. Recherche sur carte",
      desc: "L'entreprise localise les chauffeurs disponibles autour d'elle sur notre carte interactive à l'aide de filtres avancés (permis, expérience, distance)."
    },
    {
      title: "3. Contact débloqué",
      desc: "L'entreprise débloque l'accès aux coordonnées complètes du chauffeur en un clic. Facturation à l'usage, uniquement après validation de son empreinte de carte."
    }
  ];

  const faqData = [
    {
      q: "Est-ce vraiment gratuit pour les chauffeurs ?",
      a: "Oui, c'est totalement gratuit. Conformément à l'article L5321-3 du Code du travail, il est strictement interdit de faire payer les candidats pour des services de placement ou de mise en relation pour un emploi. FretTalent respecte scrupuleusement la loi."
    },
    {
      q: "Comment sont vérifiés les profils ?",
      a: "Nous validons la cohérence des permis de conduire renseignés et l'authenticité des numéros de carte chronotachygraphe ou habilitations professionnelles déclarés lors de l'onboarding pour garantir un haut niveau de confiance."
    },
    {
      q: "Que se passe-t-il si le contact débloqué ne correspond pas ?",
      a: "Si les informations affichées s'avéraient fausses ou obsolètes, notre service de modération examine votre réclamation dans les 48h. Si le problème est vérifié, le contact ne vous est pas facturé."
    },
    {
      q: "Comment fonctionne la facturation ?",
      a: "Lors de votre onboarding d'entreprise, vous renseignez votre carte bancaire via Stripe Setup Intent (sans aucun débit immédiat). À la fin du mois, vous êtes facturé de votre consommation réelle (2€ par contact débloqué)."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Header />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-24 md:py-32 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text side */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold">
                  <ShieldCheck className="h-4 w-4" /> Plateforme conforme 100% anonyme
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-none">
                  Recrutez vos chauffeurs routiers <span className="text-orange-500 relative">en 1 clic<span className="absolute bottom-1 left-0 w-full h-2 bg-orange-200/50 -z-10 rounded"></span></span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  FretTalent connecte les entreprises de transport aux chauffeurs disponibles près de chez elles, sans intermédiaire ni frais caché pour les candidats.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link 
                    href="/register?role=recruiter" 
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Je cherche un chauffeur
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link 
                    href="/register?role=candidate" 
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-slate-900 border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Je suis chauffeur
                  </Link>
                </div>

                {/* Badges de réassurance */}
                <div className="pt-4 grid grid-cols-3 gap-2 border-t border-slate-100">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center lg:text-left">
                      <div className="text-2xl font-black text-slate-950">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map side */}
              <div className="lg:col-span-5 relative flex justify-center items-center">
                <div className="relative w-full max-w-md h-96 bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col justify-center items-center p-6">
                  {/* Decorative grid pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
                  
                  {/* Animated Light Pins simulating Drivers in France */}
                  <div className="absolute top-1/4 left-1/3 animate-ping w-4 h-4 bg-orange-500 rounded-full opacity-75"></div>
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-orange-500 rounded-full"></div>

                  <div className="absolute top-1/2 left-2/3 animate-ping w-4 h-4 bg-orange-500 rounded-full opacity-75 [animation-delay:0.5s]"></div>
                  <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-orange-500 rounded-full"></div>

                  <div className="absolute top-2/3 left-1/4 animate-ping w-4 h-4 bg-orange-500 rounded-full opacity-75 [animation-delay:1s]"></div>
                  <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-orange-500 rounded-full"></div>

                  <div className="relative bg-white/90 backdrop-blur-md border border-slate-250/50 p-5 rounded-2xl shadow-lg w-full max-w-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950">Chauffeur SPL Anonyme</h4>
                        <p className="text-xs text-slate-500">Localisé à Lyon (69)</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-center">Permis CE (SPL)</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-center">FIMO / FCO</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-center">Expérience: 5 ans</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-center">Dispo: Immédiate</span>
                    </div>

                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all">
                      Débloquer le contact (2€)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMMENT CA MARCHE */}
        <section id="comment-ca-marche" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
                Comment ça marche ?
              </h2>
              <p className="text-slate-600">
                Une mise en relation directe, éthique et performante en 3 étapes simples.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-150 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-slate-950">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POUR LES ENTREPRISES */}
        <section id="pour-les-entreprises" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
                  Trouvez le bon chauffeur, sans perdre de temps
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Filtrez les candidats selon vos critères objectifs : permis de conduire (PL/SPL), habilitations à jour (FIMO, ADR), type de contrat, localisation et rayon de mobilité. Payez uniquement à la performance ou via notre forfait mensuel illimité.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700">Recherche locale géolocalisée</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700">Paiement post-payé ultra-sécurisé via Stripe</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700">Aucun frais d'inscription ou d'installation</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link 
                    href="/register?role=recruiter" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all"
                  >
                    Je crée mon compte entreprise
                  </Link>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6 shadow-inner">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-lg text-slate-700">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Recherche rapide</div>
                      <div className="text-sm font-bold text-slate-900">Permis CE + FIMO</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    84 disponibles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* POUR LES CHAUFFEURS */}
        <section id="pour-les-chauffeurs" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-center font-bold text-slate-800 text-sm border-b border-slate-100 pb-4">
                    Garantie d'anonymat FretTalent
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Nom & Prénom masqués
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Numéro de téléphone masqué
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Adresse e-mail masquée
                    </p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
                  Votre profil, vos règles
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  L'inscription est 100% gratuite et prend moins de 2 minutes. Vos données personnelles restent strictement anonymes. Seule l'entreprise de votre choix peut accéder à vos informations une fois le déblocage validé.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700">100% gratuit, sans aucun abonnement candidat</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700">Visibilité contrôlable et désactivable en 1 clic</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700">Données protégées et non revendues (conforme RGPD)</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link 
                    href="/register?role=candidate" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-slate-900 hover:bg-slate-950 shadow-lg transition-all"
                  >
                    Je crée mon profil chauffeur
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section id="tarifs" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
                Nos Tarifs Entreprise
              </h2>
              <p className="text-slate-600">
                Choisissez le modèle adapté à vos besoins en recrutement, sans engagement de durée.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Carte 1 */}
              <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 relative space-y-6 shadow-sm hover:border-slate-200 transition-colors">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Paiement à l'usage</h3>
                  <p className="text-sm text-slate-500">Idéal pour les recrutements ponctuels</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-950">2 €</span>
                  <span className="text-sm text-slate-500">/ contact débloqué</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    Zéro frais d'inscription
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    Pas d'abonnement mensuel requis
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    Payé en fin de mois par Stripe
                  </li>
                </ul>
              </div>

              {/* Carte 2 */}
              <div className="bg-white border-2 border-orange-500 rounded-3xl p-8 relative space-y-6 shadow-md">
                <span className="absolute -top-3 right-6 bg-orange-500 text-white font-bold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full">
                  Recommandé
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Forfait Pro</h3>
                  <p className="text-sm text-slate-500">Idéal pour les recruteurs actifs</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-950">149 €</span>
                  <span className="text-sm text-slate-500">/ mois</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    Déblocages de profils illimités
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    Support dédié prioritaire
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    Sans engagement, résiliable en ligne
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl text-center mb-16">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {faqData.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 hover:text-orange-500 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-350 ${
                      activeFaq === idx ? "rotate-180 text-orange-500" : ""
                    }`} />
                  </button>
                  <div className={`transition-all duration-350 overflow-hidden ${
                    activeFaq === idx ? "max-h-96 border-t border-slate-100" : "max-h-0"
                  }`}>
                    <p className="p-6 text-sm text-slate-600 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}
