"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  ArrowRight 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function Home() {
  const stats = [
    { value: "100%", label: "Gratuit pour les chauffeurs" },
    { value: "2 €", label: "Par contact débloqué" },
    { value: "0 €", label: "Frais cachés" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Header />

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
          </div>
        </section>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}
