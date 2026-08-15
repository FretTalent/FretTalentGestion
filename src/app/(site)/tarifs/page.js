'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  DollarSign,
  Briefcase,
  Clock,
  Bell,
  FileText,
  ShieldCheck,
  TrendingDown,
  Check,
  Sparkles,
  Zap,
  Calculator,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  Lock,
  Award,
} from 'lucide-react';

export default function TarifsPage() {
  // Simulateur d'économies interactif
  const [recruitCount, setRecruitCount] = useState(3);
  
  // FAQ interactive
  const [openFaq, setOpenFaq] = useState(null);

  // Calculateur d'économies
  const interimCostPerDriverPerMonth = 1400; // Marge moyenne agence interim / mois / chauffeur
  const jobboardCostPerYear = 7200; // 600€ / mois sur Indeed / Leboncoin
  const frettalentProCostPerYear = 39.99 * 12; // 479.88 € / an
  const interimAnnualCost = recruitCount * interimCostPerDriverPerMonth * 3; // Estimé sur 3 mois de mission
  const savingsVsInterim = Math.max(0, Math.round(interimAnnualCost - frettalentProCostPerYear));
  const savingsVsJobboards = Math.max(0, Math.round(jobboardCostPerYear - frettalentProCostPerYear));

  const faqs = [
    {
      q: "Comment fonctionne le paiement à l'acte (2 € par contact) ?",
      a: "Avec la formule à la performance, vous n'avez aucun abonnement. Vous parcourez la carte et les compétences des chauffeurs gratuitement. Vous ne payez que 2 € lorsque vous décidez de débloquer le numéro de téléphone, l'e-mail et les documents officiels d'un candidat précis.",
    },
    {
      q: "Le Forfait Illimité Pro à 39,99 € est-il sans engagement ?",
      a: "Oui, à 100% sans engagement ! Vous pouvez activer votre forfait pour 1 mois, recruter vos chauffeurs, puis résilier ou mettre en pause en 1 clic depuis votre espace recruteur sans frais ni préavis.",
    },
    {
      q: "Quels documents des chauffeurs puis-je consulter et télécharger ?",
      a: "Dès qu'un contact est débloqué (ou en illimité avec le Forfait Pro), vous accédez en haute définition au Permis C / CE (recto/verso), à la Carte Conducteur Chronotachygraphe, à l'attestation FIMO / FCO et aux spécialisations ADR.",
    },
    {
      q: "Pourquoi FretTalent est-il tellement moins cher qu'une agence d'intérim ?",
      a: "Les agences d'intérim prélèvent des commissions continues sur chaque heure travaillée (taux coefficient 1.8 à 2.2). FretTalent est une plateforme numérique directe : nous supprimons l'intermédiaire pour vous permettre d'embaucher directement en CDI, CDD ou contrat de votre choix.",
    },
    {
      q: "Comment les entreprises sont-elles vérifiées avant de pouvoir recruter ?",
      a: "Notre système valide automatiquement les numéros légaux : SIRET pour la France, BCE pour la Belgique, RCS / TVA pour le Luxembourg et IDE pour la Suisse afin de garantir un réseau d'employeurs 100% authentiques.",
    },
  ];

  const jobboards = [
    {
      name: 'FretTalent (Forfait Pro)',
      cost: '39,99 € / mois',
      ads: 'Illimitées',
      docs: 'Vérifiés & Téléchargeables',
      specialization: '100% Transport Routier (SPL / PL)',
      commitment: 'Sans engagement (1 clic)',
      highlight: true,
    },
    {
      name: 'Indeed',
      cost: '150 € à 1 200 € / mois',
      ads: 'Limité / Payant CPC',
      docs: 'Non vérifiés',
      specialization: 'Généraliste',
      commitment: 'Frais au clic variables',
      highlight: false,
    },
    {
      name: 'Leboncoin Emploi',
      cost: '276 € à 1 500 € / mois',
      ads: "Payant à l'unité",
      docs: 'Indisponibles',
      specialization: 'Généraliste',
      commitment: "Facturation à la durée d'annonce",
      highlight: false,
    },
    {
      name: 'Agences d\'intérim traditionnelles',
      cost: '1 200 € à 2 500 € / mois / chauffeur',
      ads: 'Incluses dans la marge',
      docs: 'Gérés par l\'agence',
      specialization: 'Généraliste ou BTP',
      commitment: 'Contrat commercial lourd',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* HERO SECTION DYNAMIQUE */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-orange-50/40 via-white to-white border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider shadow-2xs animate-float">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span>Tarifs Transparents • Sans Engagement • 0% de Commission</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
            Recrutez vos chauffeurs routiers{' '}
            <span className="text-orange-500 relative">
              au juste prix
              <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-200/60 -z-10 rounded-full" />
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Fini les commissions exorbitantes d&apos;intérim et les abonnements rigides. Choisissez la liberté d&apos;un paiement à l&apos;acte ou d&apos;un forfait illimité résiliable en 1 clic.
          </p>

          {/* Badges de réassurance */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              100% Gratuit pour les Chauffeurs
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              Paiement Sécurisé Stripe
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-2xs">
              <Zap className="h-4 w-4 text-orange-500" />
              Résiliable en 1 Clic
            </span>
          </div>

        </div>
      </section>

      {/* GRILLE TARIFAIRE 3 COLONNES HAUT DE GAMME */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* CARTE 1 : À LA PERFORMANCE (2€) */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-xl relative card-hover-effect">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                  Usage Ponctuel
                </span>
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">0 € d&apos;abonnement</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-950">
                  À la performance
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Idéal pour combler des besoins occasionnels ou tester la plateforme sans risque.
                </p>
              </div>

              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight whitespace-nowrap">
                    2&nbsp;€
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    / contact débloqué
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  Paiement à l&apos;acte uniquement • Zéro engagement
                </p>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    Accès complet aux <strong>coordonnées directes</strong> (Téléphone, E-mail, Nom)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Téléchargement des justificatifs officiels</strong> (Permis C/CE, FIMO, Chrono, ADR)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>Consultation libre et gratuite de la carte interactive</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>Zéro abonnement et aucun engagement mensuel</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/register?role=recruiter"
                className="w-full inline-flex items-center justify-center py-4 rounded-2xl text-xs font-bold text-slate-900 border-2 border-slate-200 hover:border-slate-950 hover:bg-slate-50 transition-all text-center"
              >
                <span>Commencer à la performance</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* CARTE 2 : FORFAIT ILLIMITÉ PRO (39,99€) - VEDETTE */}
          <div className="bg-white border-2 border-orange-500 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-orange-500/15 relative lg:-translate-y-4 z-10 ring-4 ring-orange-500/10 card-hover-effect">
            
            {/* Badge Recommandé Flottant */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[10px] uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Le Choix N°1 des Transporteurs</span>
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-orange-700 uppercase tracking-wider bg-orange-100 px-3 py-1 rounded-full whitespace-nowrap">
                  Recrutement Illimité
                </span>
                <span className="text-[11px] font-bold text-emerald-600 whitespace-nowrap">Rentabilisé dès 20 contacts</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-950">
                  Forfait Illimité Pro
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pour les flottes et transporteurs qui recrutent activement tout au long de l&apos;année.
                </p>
              </div>

              <div className="border-b border-orange-100 pb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight whitespace-nowrap">
                    39,99&nbsp;€
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    / mois
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-orange-600 mt-1">
                  Sans aucun engagement • Résiliable en 1 clic
                </p>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-800">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Déblocages & coordonnées candidats 100% ILLIMITÉS</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Accès illimité aux documents officiels</strong> (Permis, FIMO, Chrono, ADR...)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Publication d&apos;offres d&apos;emploi illimitée</strong> sur FretTalent
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Alertes e-mail prioritaires</strong> dès qu&apos;un nouveau chauffeur s&apos;inscrit
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-bold text-emerald-700">
                    Sans engagement, résiliable en 1 clic sans frais
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/register?role=recruiter"
                className="w-full inline-flex items-center justify-center py-4 rounded-2xl text-xs font-black text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 transition-all text-center animate-glow hover:scale-105"
              >
                <span>Activer le Forfait Illimité Pro</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* CARTE 3 : FORFAIT PREMIUM PLUS (54,99€) */}
          <div className="bg-slate-950 text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative border border-slate-800 card-hover-effect">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-full whitespace-nowrap">
                  Visibilité VIP
                </span>
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Marque Employeur</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  Forfait Premium Plus
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pour dominer le recrutement dans votre région et valoriser votre flotte.
                </p>
              </div>

              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight whitespace-nowrap">
                    54,99&nbsp;€
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    / mois
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-amber-400/90 mt-1">
                  Sans aucun engagement • Résiliable en 1 clic
                </p>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Toutes les fonctionnalités du Forfait Pro</strong> (Illimité)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Mise en avant VIP de votre logo</strong> sur la page d&apos;accueil
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Article de présentation dédié</strong> (flotte, matériels, avantages)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Offres d&apos;emploi épinglées en tête</strong> des recherches
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Support téléphonique & WhatsApp dédié</strong> 7j/7
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/register?role=recruiter"
                className="w-full inline-flex items-center justify-center py-4 rounded-2xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 transition-all text-center shadow-lg"
              >
                <span>Activer le Forfait Premium Plus</span>
                <ArrowRight className="ml-2 h-4 w-4 text-slate-950" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* SIMULATEUR D'ÉCONOMIES INTERACTIF */}
      <section className="py-20 bg-gradient-to-b from-slate-50 via-slate-50 to-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
              <Calculator className="h-3.5 w-3.5" />
              <span>Simulateur de Rentabilité en Direct</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Calculez vos économies réelles vs l&apos;intérim
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Glissez le curseur ci-dessous selon votre volume de recrutement pour estimer vos gains annuels.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-8">
            
            {/* Slider de recrutement */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Nombre de chauffeurs recrutés par an :
                </label>
                <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-1.5 rounded-2xl">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-xl font-black text-orange-600">{recruitCount} conducteur{recruitCount > 1 ? 's' : ''}</span>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={recruitCount}
                onChange={(e) => setRecruitCount(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>1 chauffeur</span>
                <span>5 chauffeurs</span>
                <span>10 chauffeurs</span>
                <span>15+ chauffeurs</span>
              </div>
            </div>

            {/* Comparatif 3 Cartes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              <div className="bg-red-50/60 p-6 rounded-2xl border border-red-200/80 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Agence d&apos;intérim classique</span>
                <div className="text-2xl sm:text-3xl font-black text-red-900">
                  {interimAnnualCost.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-red-700">/ an</span>
                </div>
                <p className="text-[11px] text-red-600">Basé sur une marge moyenne de ~1 400€/mois par conducteur.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Jobboards classiques</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {jobboardCostPerYear.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-600">/ an</span>
                </div>
                <p className="text-[11px] text-slate-500">Abonnements annuels et dépenses CPC sans garantie de résultat.</p>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-300 space-y-2 shadow-sm">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  FretTalent Illimité
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-900">
                  {Math.round(frettalentProCostPerYear)} € <span className="text-xs font-normal text-emerald-700">/ an</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold">Forfait fixe à 39,99€/mois, déblocages et publications illimités.</p>
              </div>

            </div>

            {/* Résultat Économie annuelle */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Votre gain estimé</span>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  + {savingsVsInterim.toLocaleString('fr-FR')} € d&apos;économies / an
                </div>
                <p className="text-xs text-slate-300">
                  Économisez jusqu&apos;à <strong>{savingsVsJobboards.toLocaleString('fr-FR')} €</strong> par rapport aux plateformes classiques.
                </p>
              </div>

              <Link
                href="/register?role=recruiter"
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-full text-xs transition-all shadow-xl shadow-orange-500/25 hover:scale-105"
              >
                Profiter de ces économies dès aujourd&apos;hui
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* TABLEAU COMPARATIF INTERACTIF */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Comparatif Détaillé
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Pourquoi FretTalent surpasse les solutions traditionnelles ?
            </h2>
            <p className="text-slate-600 text-sm">
              Visualisez les différences concrètes entre notre réseau dédié aux métiers de la route et les acteurs généralistes.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 border-r border-slate-800">Plateforme</th>
                    <th className="p-4 border-r border-slate-800">Coût Mensuel</th>
                    <th className="p-4 border-r border-slate-800">Offres d&apos;emploi</th>
                    <th className="p-4 border-r border-slate-800">Documents Candidats</th>
                    <th className="p-4 border-r border-slate-800">Spécialisation Transport</th>
                    <th className="p-4">Engagement</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {jobboards.map((board, idx) => (
                    <tr
                      key={idx}
                      className={
                        board.highlight
                          ? 'bg-orange-50/60 font-semibold text-slate-900'
                          : 'hover:bg-slate-50/50 text-slate-650'
                      }
                    >
                      <td className="p-4 border-r border-slate-100 font-bold text-slate-900 flex items-center gap-2">
                        {board.highlight && <Sparkles className="h-4 w-4 text-orange-500" />}
                        {board.name}
                      </td>
                      <td className={`p-4 border-r border-slate-100 ${board.highlight ? 'font-black text-orange-600 text-sm' : ''}`}>
                        {board.cost}
                      </td>
                      <td className="p-4 border-r border-slate-100">{board.ads}</td>
                      <td className="p-4 border-r border-slate-100">{board.docs}</td>
                      <td className="p-4 border-r border-slate-100">{board.specialization}</td>
                      <td className="p-4">{board.commitment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ INTERACTIVE ACCORDÉON */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Questions Fréquentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Tout savoir sur nos offres et forfaits
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 transition-all duration-200 cursor-pointer hover:border-orange-300 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      {faq.q}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  {isOpen && (
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* BANNIÈRE FINALE CONVERSION */}
      <section className="py-16 bg-slate-950 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Prêt à recruter vos prochains chauffeurs routiers ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Rejoignez des centaines d&apos;entreprises de transport en France, Suisse, Belgique et Luxembourg.
            </p>
          </div>
          <Link
            href="/register?role=recruiter"
            className="shrink-0 inline-flex items-center justify-center px-8 py-4 rounded-full text-xs font-black text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 transition-all hover:scale-105"
          >
            <span>Créer mon compte entreprise</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="text-center py-6 text-xs text-slate-400">
        * Les tarifs affichés sont des prix nets. TVA non applicable, art. 293 B du CGI.
      </div>

    </div>
  );
}
