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
        <section className="w-full relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-orange-50/30 via-white to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text side */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold">
                  <ShieldCheck className="h-4 w-4 text-orange-500" />
                  <span>Réseau N°1 du Recrutement Transport • France, Belgique, Luxembourg & Suisse</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-none">
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
                      <div className="text-2xl font-black text-slate-950">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
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
            <div className="mt-20 pt-10 border-t border-slate-100 overflow-hidden w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Ils nous font déjà confiance
                </p>
              </div>
              <div className="relative w-full flex items-center bg-slate-50 py-6 rounded-2xl border border-slate-100">
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

        {/* Bannière Communauté Facebook */}
        <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-12 text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1877F2]/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Communauté Transport & Logistique
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                Rejoignez la communauté FretTalent sur Facebook
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Suivez nos actualités, échangez avec des centaines de conducteurs et découvrez les offres de recrutement en direct.
              </p>
            </div>
            <a
              href="https://www.facebook.com/profile.php?id=61593021909293"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold px-6 py-3.5 rounded-full text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2.5 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Suivre notre page Facebook</span>
            </a>
          </div>
        </section>

        {/* Section Vitrine SEO & Valeur Ajoutée */}
        <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden border-t border-slate-100">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
            
            {/* Top Presentation Card with Photo */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* Left Text Presentation */}
                <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider border border-orange-100">
                    <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                    <span>L&apos;Excellence du Recrutement Transport</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                    La plateforme de référence pour le recrutement dans le transport routier
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    <strong>FretTalent</strong> est le premier réseau spécialisé dans la mise en relation directe entre <strong>chauffeurs routiers qualifiés</strong> et <strong>entreprises de transport</strong> en France, en Belgique, au Luxembourg et en Suisse. Notre mission est de simplifier l&apos;embauche de conducteurs poids lourds et super poids lourds sans passer par les agences d&apos;intérim traditionnelles, garantissant rapidité, transparence et <strong>zéro commission sur les salaires</strong>.
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800">
                      <span className="text-emerald-500 font-black">✓</span> Sans agence d&apos;intérim
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800">
                      <span className="text-orange-500 font-black">✓</span> 0% commission sur salaire
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800">
                      <span className="text-blue-500 font-black">✓</span> Contact direct 4,99€
                    </div>
                  </div>
                </div>

                {/* Right Photo Presentation */}
                <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-4 lg:pt-0">
                  <div className="relative w-full max-w-[340px] sm:max-w-[380px] flex items-center justify-center">
                    
                    {/* Orange Glow Halo */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-amber-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

                    {/* Driver Image */}
                    <img
                      src="/driver-victory.png"
                      alt="Chauffeur routier FretTalent avec le signe de la victoire"
                      className="w-full h-auto max-h-[340px] sm:max-h-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300 relative z-10"
                    />

                    {/* Floating badge */}
                    <div className="absolute -bottom-2 bg-white/95 backdrop-blur-md border border-orange-200 shadow-xl px-4 py-2 rounded-full flex items-center gap-2 z-20 hover:scale-105 transition-transform">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-black text-slate-900">Embauches Réussies ✌️</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 3 Pillar Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Carte 1 : Chauffeurs Routiers */}
              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-wider">Candidats Chauffeurs</span>
                    <h3 className="text-lg font-black text-slate-950">
                      Pour les Chauffeurs Routiers (PL, SPL)
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Accédez gratuitement à des opportunités de recrutement en <strong>CDI, CDD, Intérim et missions indépendantes</strong>. Valorisez votre expérience, vos permis (B, C, CE), vos certifications (FIMO, FCO, Carte Chronotachygraphe) et vos habilitations spéciales (ADR de base, Citerne, Explosifs) auprès de centaines de transporteurs certifiés.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">CDI / CDD / Intérim</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Permis B, C & CE</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">FIMO • FCO • ADR</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    href="/register?role=candidate"
                    className="text-xs font-bold text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 group-hover:underline"
                  >
                    <span>Créer mon profil chauffeur gratuit</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Carte 2 : Entreprises & Transporteurs */}
              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Recruteurs & Transport</span>
                    <h3 className="text-lg font-black text-slate-950">
                      Pour les Entreprises & Transporteurs
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Recrutez efficacement vos conducteurs en <strong>France</strong> (SIRET), <strong>Belgique</strong> (BCE), <strong>Luxembourg</strong> (RCS/TVA) et <strong>Suisse</strong> (IDE). Filtrez les profils disponibles selon le rayon de mobilité, les spécialités de matériel (Benne, Frigo, Tautliner, Citerne, Plateau, Messagerie) et débloquez directement les coordonnées vérifiées des candidats.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">FR • BE • LU • CH</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Benne / Frigo / Citerne</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Filtre km précis</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    href="/register?role=recruiter"
                    className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1.5 group-hover:underline"
                  >
                    <span>Découvrir les profils transport</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Carte 3 : Transparence & Sécurité */}
              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Qualité & Contrôle</span>
                    <h3 className="text-lg font-black text-slate-950">
                      Transparence & Sécurité Garanties
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tous les documents essentiels (permis de conduire, carte de qualification conducteur, attestation FIMO/FCO) sont vérifiés par notre équipe de modération. Les candidats conservent un <strong>contrôle total sur l&apos;anonymat</strong> de leurs données jusqu&apos;à la demande de déblocage par une entreprise.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">Vérification manuelle</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">100% Anonymat garanti</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">Paiement 4,99€ Stripe</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    href="/comment-ca-marche"
                    className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1.5 group-hover:underline"
                  >
                    <span>Comment fonctionne FretTalent</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION SEO AVANCÉE : RECRUTEMENT CHAUFFEUR SPL & QUESTIONS FRÉQUENTES */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider border border-orange-100">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 card-hover-effect">
                <h3 className="text-base font-bold text-slate-900 flex items-start gap-2.5">
                  <span className="text-orange-500 font-black">01.</span>
                  Comment recruter un chauffeur SPL (Super Poids Lourd) ?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sur <strong>FretTalent</strong>, accédez à la carte interactive des conducteurs titulaires du <strong>Permis CE</strong>, <strong>Carte Chrono</strong> et <strong>FIMO/FCO</strong> à jour. Filtrez par département (FR), province (BE) ou canton (CH, LU) et débloquez directement leurs coordonnées pour une embauche sans intermédiaire.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 card-hover-effect">
                <h3 className="text-base font-bold text-slate-900 flex items-start gap-2.5">
                  <span className="text-orange-500 font-black">02.</span>
                  Pourquoi recruter sans agence d&apos;intérim transport ?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Les agences d&apos;intérim traditionnelles prélèvent de lourdes commissions récurrentes sur chaque heure travaillée (taux horaire coefficient 1.8 à 2.2). FretTalent propose un <strong>modèle direct et équitable</strong> : 4,99€ par contact débloqué ou forfait sans engagement, sans aucun prélèvement sur les salaires.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 card-hover-effect">
                <h3 className="text-base font-bold text-slate-900 flex items-start gap-2.5">
                  <span className="text-orange-500 font-black">03.</span>
                  Quelles certifications sont vérifiées sur la plateforme ?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Notre équipe valide manuellement les <strong>Permis C et CE</strong> (recto/verso), la <strong>Carte Conducteur (Chrono)</strong>, l&apos;attestation <strong>FIMO / FCO Marchandises</strong> et les spécialités <strong>ADR de base, Citerne et Matières Dangereuses</strong> pour garantir des profils 100% opérationnels.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 card-hover-effect">
                <h3 className="text-base font-bold text-slate-900 flex items-start gap-2.5">
                  <span className="text-orange-500 font-black">04.</span>
                  Comment fonctionne l&apos;emploi transfrontalier (Suisse, Luxembourg, Belgique) ?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  FretTalent intègre les spécificités administratives des 4 pays : vérification des entreprises via <strong>SIRET (France)</strong>, <strong>BCE (Belgique)</strong>, <strong>RCS (Luxembourg)</strong> et <strong>IDE (Suisse)</strong>. Les conducteurs transfrontaliers peuvent postuler selon leur mobilité géographique.
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

