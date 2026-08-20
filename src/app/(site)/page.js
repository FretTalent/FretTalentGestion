'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  ArrowRight,
  Truck,
  CheckCircle2,
  Search,
  Users,
  Globe,
  Building2,
  Award,
  Sparkles,
  Check,
  FileCheck,
  Lock,
  Zap,
} from 'lucide-react';

export default function Home() {
  const stats = [
    { value: '100%', label: 'Gratuit pour les chauffeurs' },
    { value: '4,99 €', label: 'Par contact débloqué' },
    { value: '0 €', label: 'Frais cachés' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <main className="flex-grow flex flex-col">
        {/* HERO SECTION UNIQUE */}
        <section className="hero-section">
          {/* Pattern orange unifié */}
          <div className="hero-pattern" />
          {/* Halo orange subtil derrière le texte */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text side */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                <div className="hero-badge">
                  <ShieldCheck className="h-4 w-4 text-orange-500" />
                  <span>Réseau N°1 du Recrutement Transport • France, Belgique, Luxembourg & Suisse</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-none">
                  Trouvez vos chauffeurs ou votre prochain job{' '}
                  <span className="text-orange-500 relative">
                    en France, Belgique, Luxembourg & Suisse
                    <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-200/50 -z-10 rounded"></span>
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  FretTalent connecte directement les entreprises de transport et les chauffeurs routiers (SPL, PL, Benne, Frigo, Citerne ADR). Simple, rapide et 100% gratuit pour les candidats.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/register?role=recruiter"
                    className="btn-primary w-full sm:w-auto"
                  >
                    Je cherche un chauffeur
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/register?role=candidate"
                    className="btn-secondary w-full sm:w-auto"
                  >
                    Je suis chauffeur
                  </Link>
                </div>

                {/* Badges de réassurance — Stat Cards */}
                <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-100">
                  {stats.map((stat, i) => (
                    <div key={i} className="stat-card">
                      <span className="stat-value">{stat.value}</span>
                      <span className="stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Image side (Grand format & stylisé) */}
              <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-6 lg:pt-0">
                <div className="relative w-full flex items-center justify-center">
                  
                  {/* Aura lumineuse d'arrière-plan */}
                  <div className="absolute w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] bg-gradient-to-tr from-orange-500/25 via-amber-400/20 to-orange-400/15 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 w-full max-w-[460px] sm:max-w-[520px] lg:max-w-[580px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Badge flottant supérieur gauche */}
                    <div className="hidden sm:flex absolute -top-2 -left-4 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg px-3.5 py-1.5 rounded-2xl items-center gap-2 z-20 hover:scale-105 transition-transform animate-float">
                      <span className="text-orange-500 text-sm">🔒</span>
                      <span className="text-[11px] font-bold text-slate-800">100% Anonyme</span>
                    </div>

                    {/* Badge flottant supérieur droit */}
                    <div className="hidden sm:flex absolute top-6 -right-4 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg px-3.5 py-1.5 rounded-2xl items-center gap-2 z-20 hover:scale-105 transition-transform animate-float-reverse">
                      <span className="text-emerald-500 text-sm">⚡</span>
                      <span className="text-[11px] font-bold text-slate-800">Embauche Directe</span>
                    </div>

                    {/* Image grand format */}
                    <img
                      src="/images/chauffeur-fingers-crossed.png"
                      alt="Recrutement Chauffeur SPL FretTalent sans agence interim"
                      className="w-full h-auto max-h-[500px] sm:max-h-[580px] object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-300"
                    />
                    
                    {/* Badge flottant principal "Plus besoin de croiser les doigts" */}
                    <div className="relative -mt-6 sm:-mt-8 bg-white/95 backdrop-blur-md border border-orange-200/80 shadow-2xl px-5 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-3 whitespace-nowrap z-20 ring-4 ring-orange-500/10 animate-float">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Plus besoin de croiser les doigts !
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bannière Défilante "Ils nous font confiance" */}
            <div className="mt-16 pt-10 border-t border-slate-100 overflow-hidden w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Ils nous font déjà confiance
                </p>
              </div>
              <div className="relative w-full flex items-center bg-white py-6 rounded-2xl border border-slate-200/60">
                {/* Gradients pour effet fondu sur les côtés */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

                <div className="flex overflow-hidden w-full">
                  {/* Premier set d'images pour le défilement infini */}
                  <div className="animate-marquee flex items-center">
                    <img
                      src="https://get-picto.com/wp-content/uploads/2023/07/amazon-logo-png.webp"
                      alt="Amazon"
                      className="partner-logo"
                    />
                    <img
                      src="https://koerber-supplychain.com/fileadmin/_processed_/a/b/csm_reference_db-schenker_logo_814c09a032.png"
                      alt="DB Schenker"
                      className="partner-logo"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/XPO_Logistics_logo.svg/1280px-XPO_Logistics_logo.svg.png"
                      alt="XPO Logistics"
                      className="partner-logo"
                    />
                    <img
                      src="https://images.seeklogo.com/logo-png/18/2/translux-logo-png_seeklogo-187301.png"
                      alt="Translux"
                      className="partner-logo"
                    />
                    <img
                      src="https://epca.eu/sites/epca.eu/files/company-logo/Geodis.png"
                      alt="Geodis"
                      className="partner-logo"
                    />
                    <img
                      src="https://i.pinimg.com/originals/27/87/7b/27877bcbab95edc899c251e48af48fc3.png"
                      alt="Logistics Carrier"
                      className="partner-logo"
                    />
                  </div>
                  {/* Deuxième set identique pour boucler à l'infini sans coupure */}
                  <div
                    className="animate-marquee flex items-center"
                    aria-hidden="true"
                  >
                    <img
                      src="https://get-picto.com/wp-content/uploads/2023/07/amazon-logo-png.webp"
                      alt="Amazon"
                      className="partner-logo"
                    />
                    <img
                      src="https://koerber-supplychain.com/fileadmin/_processed_/a/b/csm_reference_db-schenker_logo_814c09a032.png"
                      alt="DB Schenker"
                      className="partner-logo"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/XPO_Logistics_logo.svg/1280px-XPO_Logistics_logo.svg.png"
                      alt="XPO Logistics"
                      className="partner-logo"
                    />
                    <img
                      src="https://images.seeklogo.com/logo-png/18/2/translux-logo-png_seeklogo-187301.png"
                      alt="Translux"
                      className="partner-logo"
                    />
                    <img
                      src="https://epca.eu/sites/epca.eu/files/company-logo/Geodis.png"
                      alt="Geodis"
                      className="partner-logo"
                    />
                    <img
                      src="https://i.pinimg.com/originals/27/87/7b/27877bcbab95edc899c251e48af48fc3.png"
                      alt="Logistics Carrier"
                      className="partner-logo"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BANNIÈRE VITRINE : CANDIDATS DISPONIBLES EN DIRECT */}
            <div className="mt-20 pt-16 border-t border-slate-100 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="space-y-4 max-w-xl text-center lg:text-left relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Carte Interactive en Direct
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Trouvez vos chauffeurs qualifiés en temps réel
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Visualisez nos conducteurs poids lourds disponibles en <strong>France</strong>, <strong>Belgique</strong>, <strong>Luxembourg</strong> et <strong>Suisse</strong> avec filtrage par permis (C, CE), certifications (ADR, FIMO) et badge 100% vérifié.
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Profils 100% Vérifiés
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-blue-400" />
                      4 Pays Couverts
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-orange-400" />
                      PL & SPL Immédiats
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-end gap-3 flex-shrink-0 relative z-10 w-full sm:w-auto">
                  <Link
                    href="/candidats-disponibles"
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-full text-sm transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2.5 hover:scale-105"
                  >
                    <span>Explorer la Carte & les Candidats</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="text-[11px] text-slate-400">Accès direct et libre consultation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Facebook supprimée — liens sociaux disponibles dans le footer */}

        {/* Section Vitrine SEO & Valeur Ajoutée */}
        <section className="section-block relative overflow-hidden">
          {/* Glow subtil */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500/4 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
            
            {/* Carte de présentation principale avec métriques */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-lg relative overflow-hidden">
              {/* Accent décoratif coin supérieur droit */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-50 to-transparent rounded-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                
                {/* Texte gauche */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <div className="hero-badge">
                    <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                    <span>L&apos;Excellence du Recrutement Transport</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                    La plateforme de référence pour le recrutement dans le transport routier
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    <strong>FretTalent</strong> est le premier réseau spécialisé dans la mise en relation directe entre <strong>chauffeurs routiers qualifiés</strong> et <strong>entreprises de transport</strong> en France, en Belgique, au Luxembourg et en Suisse. Notre mission est de simplifier l&apos;embauche sans passer par les agences d&apos;intérim, garantissant rapidité, transparence et <strong>zéro commission sur les salaires</strong>.
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Sans agence d&apos;intérim
                    </div>
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3.5 py-2 rounded-xl text-xs font-bold text-orange-800">
                      <Check className="w-3.5 h-3.5 text-orange-600" /> 0% commission sur salaire
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-800">
                      <Check className="w-3.5 h-3.5 text-blue-600" /> Contact direct 4,99€
                    </div>
                  </div>
                </div>

                {/* Métriques droite — remplace la photo répétée */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="text-3xl font-black">4,99 €</div>
                    <div className="text-sm font-semibold text-orange-100 mt-0.5">Par contact débloqué</div>
                    <div className="text-xs text-orange-200 mt-1">Vs 800–2000 € en agence d&apos;intérim</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-slate-950">4</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">Pays couverts</div>
                    <div className="text-[10px] text-slate-400">FR • BE • LU • CH</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-slate-950">100%</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">Gratuit</div>
                    <div className="text-[10px] text-slate-400">Pour les chauffeurs</div>
                  </div>
                  <div className="col-span-2 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-emerald-900">Dossiers vérifiés manuellement</div>
                      <div className="text-xs text-emerald-700">Permis, FIMO, ADR, Carte Chrono</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 3 Pillar Feature Cards — améliorées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Carte 1 : Chauffeurs Routiers */}
              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:bg-orange-50/30 hover:border-orange-200 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    <Truck className="h-7 w-7" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-wider">Candidats Chauffeurs</span>
                    <h3 className="text-lg font-black text-slate-950">
                      Pour les Chauffeurs Routiers (PL, SPL)
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Accédez gratuitement à des opportunités de recrutement en <strong>CDI, CDD, Intérim et missions indépendantes</strong>. Valorisez vos permis (B, C, CE), certifications (FIMO, FCO, Carte Chrono) et habilitations (ADR, Citerne) auprès de centaines de transporteurs certifiés.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-100">CDI / CDD / Intérim</span>
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100">Permis B, C & CE</span>
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100">FIMO • FCO • ADR</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    href="/register?role=candidate"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition-all shadow-sm shadow-orange-500/20"
                  >
                    <span>Créer mon profil gratuit</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Carte 2 : Entreprises & Transporteurs */}
              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    <Building2 className="h-7 w-7" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Recruteurs & Transport</span>
                    <h3 className="text-lg font-black text-slate-950">
                      Pour les Entreprises & Transporteurs
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Recrutez efficacement en <strong>France</strong> (SIRET), <strong>Belgique</strong> (BCE), <strong>Luxembourg</strong> (RCS/TVA) et <strong>Suisse</strong> (IDE). Filtrez par mobilité, spécialité (Benne, Frigo, Citerne) et débloquez directement les coordonnées vérifiées.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">FR • BE • LU • CH</span>
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100">Benne / Frigo / Citerne</span>
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100">Filtre km précis</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    href="/register?role=recruiter"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all shadow-sm shadow-blue-600/20"
                  >
                    <span>Découvrir les profils</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Carte 3 : Transparence & Sécurité */}
              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:bg-emerald-50/30 hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Qualité & Contrôle</span>
                    <h3 className="text-lg font-black text-slate-950">
                      Transparence & Sécurité Garanties
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tous les documents essentiels (permis, FIMO/FCO) sont vérifiés manuellement par notre équipe. Les candidats conservent un <strong>contrôle total sur l&apos;anonymat</strong> de leurs données jusqu&apos;à la demande de déblocage.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">Vérification manuelle</span>
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100">100% Anonymat</span>
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100">Paiement Stripe</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    href="/comment-ca-marche"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full transition-all shadow-sm shadow-emerald-600/20"
                  >
                    <span>Comment ça fonctionne</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION SEO AVANCÉE : RECRUTEMENT CHAUFFEUR SPL & QUESTIONS FRÉQUENTES */}
        <section className="section-block-alt">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center space-y-3">
              <div className="hero-badge">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Guide Recrutement & FAQ Transport</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Tout savoir sur le recrutement de chauffeurs SPL & PL
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                Retrouvez les réponses aux questions clés sur l&apos;embauche directe de conducteurs routiers en France, Suisse, Belgique et Luxembourg.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 card-hover-effect shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0">01</span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Comment recruter un chauffeur SPL (Super Poids Lourd) ?
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                  Sur <strong>FretTalent</strong>, accédez à la carte interactive des conducteurs titulaires du <strong>Permis CE</strong>, <strong>Carte Chrono</strong> et <strong>FIMO/FCO</strong> à jour. Filtrez par département (FR), province (BE) ou canton (CH, LU) et débloquez directement leurs coordonnées.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 card-hover-effect shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0">02</span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pourquoi recruter sans agence d&apos;intérim transport ?
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                  Les agences d&apos;intérim prélèvent de lourdes commissions (coefficient 1.8 à 2.2). FretTalent propose un <strong>modèle direct et équitable</strong> : 4,99€ par contact débloqué, sans aucun prélèvement sur les salaires.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 card-hover-effect shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0">03</span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Quelles certifications sont vérifiées sur la plateforme ?
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                  Notre équipe valide manuellement les <strong>Permis C et CE</strong>, la <strong>Carte Conducteur (Chrono)</strong>, l&apos;attestation <strong>FIMO / FCO Marchandises</strong> et les spécialités <strong>ADR de base, Citerne et Matières Dangereuses</strong>.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 card-hover-effect shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0">04</span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Comment fonctionne l&apos;emploi transfrontalier ?
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                  FretTalent intègre les spécificités des 4 pays : <strong>SIRET (France)</strong>, <strong>BCE (Belgique)</strong>, <strong>RCS (Luxembourg)</strong> et <strong>IDE (Suisse)</strong>. Les conducteurs transfrontaliers peuvent postuler selon leur mobilité géographique.
                </p>
              </div>

            </div>

            <div className="text-center pt-4">
              <Link
                href="/register?role=candidate"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20 transition-all hover:scale-105"
              >
                <span>Rejoindre le réseau FretTalent gratuitement</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

