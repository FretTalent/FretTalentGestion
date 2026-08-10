"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  ArrowRight 
} from "lucide-react";

export default function Home() {
  const stats = [
    { value: "100%", label: "Gratuit pour les chauffeurs" },
    { value: "2 €", label: "Par contact débloqué" },
    { value: "0 €", label: "Frais cachés" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">

      {/* Bannière Défilante "Ils nous font confiance" */}
      <section className="bg-slate-50 border-b border-slate-100 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Ils nous font déjà confiance
          </p>
        </div>
        <div className="relative w-full flex items-center">
          {/* Gradients pour effet fondu sur les côtés */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex overflow-hidden">
            {/* Premier set d'images pour le défilement infini */}
            <div className="animate-marquee flex items-center gap-16 pr-16">
              <img src="https://get-picto.com/wp-content/uploads/2023/07/amazon-logo-png.webp" alt="Amazon" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://koerber-supplychain.com/fileadmin/_processed_/a/b/csm_reference_db-schenker_logo_814c09a032.png" alt="DB Schenker" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/XPO_Logistics_logo.svg/1280px-XPO_Logistics_logo.svg.png" alt="XPO Logistics" className="h-6 md:h-8 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://images.seeklogo.com/logo-png/18/2/translux-logo-png_seeklogo-187301.png" alt="Translux" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://www.liblogo.com/img-logo/ge60143be2-geodis-logo-3pl-geodis-saves-25-on-packaging-supplies-by-vendor-consolidation.png" alt="Geodis" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://i.pinimg.com/originals/27/87/7b/27877bcbab95edc899c251e48af48fc3.png" alt="Logistics Carrier" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
            </div>
            {/* Deuxième set identique pour boucler à l'infini sans coupure */}
            <div className="animate-marquee flex items-center gap-16 pr-16" aria-hidden="true">
              <img src="https://get-picto.com/wp-content/uploads/2023/07/amazon-logo-png.webp" alt="Amazon" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://koerber-supplychain.com/fileadmin/_processed_/a/b/csm_reference_db-schenker_logo_814c09a032.png" alt="DB Schenker" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/XPO_Logistics_logo.svg/1280px-XPO_Logistics_logo.svg.png" alt="XPO Logistics" className="h-6 md:h-8 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://images.seeklogo.com/logo-png/18/2/translux-logo-png_seeklogo-187301.png" alt="Translux" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://www.liblogo.com/img-logo/ge60143be2-geodis-logo-3pl-geodis-saves-25-on-packaging-supplies-by-vendor-consolidation.png" alt="Geodis" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
              <img src="https://i.pinimg.com/originals/27/87/7b/27877bcbab95edc899c251e48af48fc3.png" alt="Logistics Carrier" className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300" />
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow flex items-center">
        {/* HERO SECTION UNIQUE */}
        <section className="w-full relative overflow-hidden py-16 md:py-24">
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
                        <h4 className="text-sm font-bold text-slate-955">Chauffeur SPL Anonyme</h4>
                        <p className="text-xs text-slate-505">Localisé à Lyon (69)</p>
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

            {/* SECTION EDITORIALE COMPARATIVE: FRETTALENT VS INTERIM */}
            <div className="mt-20 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Comparatif & Analyse</span>
                <h2 className="text-3xl font-extrabold text-slate-955 tracking-tight leading-snug">
                  Pourquoi FretTalent est l'alternative idéale à l'intérim traditionnel ?
                </h2>
                <p className="text-base text-slate-600 leading-relaxed">
                  Dans le secteur du transport routier, le recours systématique aux agences d'intérim pèse lourdement sur la rentabilité des entreprises. FretTalent réinvente le recrutement en proposant un modèle direct, sans intermédiaires et orienté performance.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50/30 border-l-4 border-orange-500 rounded-r-2xl space-y-1">
                    <h4 className="text-base font-bold text-slate-900">Jusqu'à 10 fois moins cher</h4>
                    <p className="text-base text-slate-600">Là où une agence d'intérim applique des coefficients multiplicateurs élevés sur chaque heure travaillée (représentant des milliers d'euros par mois), FretTalent vous facture seulement 2 € par contact qualifié ou un forfait fixe sans engagement.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border-l-4 border-slate-400 rounded-r-2xl space-y-1">
                    <h4 className="text-base font-bold text-slate-900">Une spécialisation 100% Transport & Logistique</h4>
                    <p className="text-base text-slate-600">Contrairement aux agences généralistes, notre plateforme est développée exclusivement pour les métiers de la route. Les profils intègrent nativement les permis PL/SPL, les habilitations ADR, la validité FIMO/FCO et la gestion de la carte chronotachygraphe.</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 shadow-xl">
                <h3 className="text-lg font-bold text-white">FretTalent vs Intérim traditionnel</h3>
                <div className="divide-y divide-slate-800 text-base">
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400">Coût de mise en relation</span>
                    <span className="font-bold text-orange-400">2 € unique (ou forfait)</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400">Coût moyen Interim</span>
                    <span className="font-bold text-red-400">Coeff. de 1.8 à 2.2 par heure</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400">Filtres métiers</span>
                    <span className="font-bold text-green-400">Spécifiques (Permis, FIMO, ADR)</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400">Liberté contractuelle</span>
                    <span className="font-bold text-green-400">Directe (CDI, CDD, Intérim libre)</span>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <Link href="/entreprises" className="text-base font-bold text-orange-400 hover:underline">
                    Découvrir l'espace entreprise →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
