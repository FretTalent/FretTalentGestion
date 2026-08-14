'use client';

import Link from 'next/link';
import { ShieldCheck, MapPin, ArrowRight, Truck, CheckCircle2, Search, Users, Globe } from 'lucide-react';

export default function Home() {
  const stats = [
    { value: '100%', label: 'Gratuit pour les chauffeurs' },
    { value: '2 €', label: 'Par contact débloqué' },
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
                    <div className="hidden sm:flex absolute -top-2 -left-4 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg px-3.5 py-1.5 rounded-2xl items-center gap-2 z-20 hover:scale-105 transition-transform">
                      <span className="text-orange-500 text-sm">🔒</span>
                      <span className="text-[11px] font-bold text-slate-800">100% Anonyme</span>
                    </div>

                    {/* Badge flottant supérieur droit */}
                    <div className="hidden sm:flex absolute top-6 -right-4 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg px-3.5 py-1.5 rounded-2xl items-center gap-2 z-20 hover:scale-105 transition-transform">
                      <span className="text-emerald-500 text-sm">⚡</span>
                      <span className="text-[11px] font-bold text-slate-800">Embauche Directe</span>
                    </div>

                    {/* Image grand format */}
                    <img
                      src="/images/chauffeur-fingers-crossed.png"
                      alt="Chauffeur routier FretTalent qui croise les doigts pour son recrutement"
                      className="w-full h-auto max-h-[500px] sm:max-h-[580px] object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-300"
                    />
                    
                    {/* Badge flottant principal "Plus besoin de croiser les doigts" */}
                    <div className="relative -mt-6 sm:-mt-8 bg-white/95 backdrop-blur-md border border-orange-200/80 shadow-2xl px-5 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-3 whitespace-nowrap z-20 ring-4 ring-orange-500/10">
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

        {/* Section SEO enrichie — Informations et recrutement transport */}
        <section className="py-16 bg-white border-t border-slate-100 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-700 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
              <img src="https://png.pngtree.com/png-clipart/20250521/original/pngtree-an-orange-logistic-truck-with-container-png-image_21052117.png" alt="Camion logistique FretTalent" className="w-[500px] object-contain" />
            </div>
            <div className="max-w-3xl space-y-4 relative z-10">
              <h2 className="text-2xl font-bold text-slate-900">
                La plateforme de référence pour le recrutement dans le transport routier
              </h2>
              <p className="text-sm leading-relaxed">
                FretTalent est le premier réseau spécialisé dans la mise en relation directe entre <strong>chauffeurs routiers qualifiés</strong> et <strong>entreprises de transport</strong> en France, en Belgique, au Luxembourg et en Suisse. Notre mission est de simplifier l&apos;embauche de conducteurs poids lourds et super poids lourds sans passer par les agences d&apos;intérim traditionnelles, garantissant rapidité, transparence et zéro commission sur les salaires.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Pour les Chauffeurs Routiers (PL, SPL)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accédez gratuitement à des opportunités de recrutement en CDI, CDD, Intérim et missions indépendantes. Valorisez votre expérience, vos permis (B, C, CE), vos certifications (FIMO, FCO, Carte Chronotachygraphe) et vos habilitations spéciales (ADR de base, Citerne, Explosifs) auprès de centaines de transporteurs certifiés.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Pour les Entreprises & Transporteurs
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Recrutez efficacement vos conducteurs en France (SIRET), Belgique (BCE), Luxembourg (RCS/TVA) et Suisse (IDE). Filtrez les profils disponibles selon le rayon de mobilité, les spécialités de matériel (Benne, Frigo, Tautliner, Citerne, Plateau, Messagerie) et débloquez directement les coordonnées vérifiées des candidats.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Transparence & Sécurité Garanties
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tous les documents essentiels (permis de conduire, carte de qualification conducteur, attestation FIMO/FCO) sont vérifiés par notre équipe de modération. Les candidats conservent un contrôle total sur l&apos;anonymat de leurs données jusqu&apos;à la demande de déblocage par une entreprise.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

