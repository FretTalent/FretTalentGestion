"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  ArrowRight 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [candidates, setCandidates] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("id, city, postal_code")
          .eq("is_active", true);

        if (error) throw error;
        if (!data || data.length === 0) {
          setCandidates([]);
          setLoadingMap(false);
          return;
        }

        // Géocoder chaque code postal unique présent dans les résultats
        const uniquePostalCodes = [...new Set(data.map(c => c.postal_code))];
        const coordsCache = {};

        await Promise.all(
          uniquePostalCodes.map(async (pc) => {
            try {
              const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${pc}&type=municipality&limit=1`);
              if (!res.ok) return;
              const json = await res.json();
              if (json.features && json.features.length > 0) {
                const [lon, lat] = json.features[0].geometry.coordinates;
                coordsCache[pc] = { lon, lat };
              }
            } catch (e) {
              console.error("Erreur géocodage pour " + pc, e);
            }
          })
        );

        // Projeter les coordonnées sur la carte de France (en x/y de 0 à 100)
        const minLon = -5.2;
        const maxLon = 8.5;
        const minLat = 42.2;
        const maxLat = 51.1;

        const mappedCandidates = data
          .map((c) => {
            const coords = coordsCache[c.postal_code];
            if (!coords) return null;
            
            const x = ((coords.lon - minLon) / (maxLon - minLon)) * 100;
            const y = 100 - (((coords.lat - minLat) / (maxLat - minLat)) * 100);

            return {
              id: c.id,
              city: c.city,
              x,
              y
            };
          })
          .filter(Boolean);

        setCandidates(mappedCandidates);
      } catch (err) {
        console.error("Erreur de chargement des candidats pour la carte", err);
      } finally {
        setLoadingMap(false);
      }
    };

    fetchCandidates();
  }, []);

  const stats = [
    { value: "100%", label: "Gratuit pour les chauffeurs" },
    { value: "2 €", label: "Par contact débloqué" },
    { value: "0 €", label: "Frais cachés" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">

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
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-955 tracking-tight leading-none">
                  Trouvez vos chauffeurs ou votre prochain job <span className="text-orange-500 relative">en 1 clic<span className="absolute bottom-1 left-0 w-full h-2 bg-orange-200/50 -z-10 rounded"></span></span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  FretTalent connecte directement les entreprises de transport et les chauffeurs routiers disponibles. Simple, rapide et 100% gratuit pour les candidats.
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

                    <div className="relative group/btn w-full">
                      {/* Bloc d'information interactif (Tooltip) */}
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-2.5 opacity-0 scale-95 translate-y-2 pointer-events-none group-hover/btn:opacity-100 group-hover/btn:scale-100 group-hover/btn:translate-y-0 transition-all duration-300 ease-out z-20">
                        <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                          Ce que vous débloquez :
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-200">
                          <li className="flex items-center gap-2">
                            <span className="text-orange-500 text-xs">📈</span>
                            <span className="font-semibold">Facturation mensuelle</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-orange-500 text-xs">⚡</span>
                            <span>Info contact instantané (tél, email)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-orange-500 text-xs">📂</span>
                            <span>Tous les documents candidat visibles</span>
                          </li>
                        </ul>
                        {/* Flèche du tooltip */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-950/95 w-0 h-0"></div>
                      </div>

                      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all">
                        Débloquer le contact (2€)
                      </button>
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
                    <img src="https://get-picto.com/wp-content/uploads/2023/07/amazon-logo-png.webp" alt="Amazon" className="partner-logo" />
                    <img src="https://koerber-supplychain.com/fileadmin/_processed_/a/b/csm_reference_db-schenker_logo_814c09a032.png" alt="DB Schenker" className="partner-logo" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/XPO_Logistics_logo.svg/1280px-XPO_Logistics_logo.svg.png" alt="XPO Logistics" className="partner-logo" />
                    <img src="https://images.seeklogo.com/logo-png/18/2/translux-logo-png_seeklogo-187301.png" alt="Translux" className="partner-logo" />
                    <img src="https://epca.eu/sites/epca.eu/files/company-logo/Geodis.png" alt="Geodis" className="partner-logo" />
                    <img src="https://i.pinimg.com/originals/27/87/7b/27877bcbab95edc899c251e48af48fc3.png" alt="Logistics Carrier" className="partner-logo" />
                  </div>
                  {/* Deuxième set identique pour boucler à l'infini sans coupure */}
                  <div className="animate-marquee flex items-center" aria-hidden="true">
                    <img src="https://get-picto.com/wp-content/uploads/2023/07/amazon-logo-png.webp" alt="Amazon" className="partner-logo" />
                    <img src="https://koerber-supplychain.com/fileadmin/_processed_/a/b/csm_reference_db-schenker_logo_814c09a032.png" alt="DB Schenker" className="partner-logo" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/XPO_Logistics_logo.svg/1280px-XPO_Logistics_logo.svg.png" alt="XPO Logistics" className="partner-logo" />
                    <img src="https://images.seeklogo.com/logo-png/18/2/translux-logo-png_seeklogo-187301.png" alt="Translux" className="partner-logo" />
                    <img src="https://epca.eu/sites/epca.eu/files/company-logo/Geodis.png" alt="Geodis" className="partner-logo" />
                    <img src="https://i.pinimg.com/originals/27/87/7b/27877bcbab95edc899c251e48af48fc3.png" alt="Logistics Carrier" className="partner-logo" />
                  </div>
                </div>
              </div>
            </div>

            {/* CARTE DE FRANCE DES CANDIDATS EN DIRECT */}
            <div className="mt-20 pt-16 border-t border-slate-100 max-w-5xl mx-auto">
              <div className="text-center mb-12 space-y-3">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  Réseau temps réel
                </span>
                <h2 className="text-3xl font-extrabold text-slate-955 tracking-tight">
                  Candidats actuellement disponibles
                </h2>
                <p className="text-slate-600 text-sm max-w-xl mx-auto">
                  Découvrez la répartition géographique en direct de nos chauffeurs inscrits. Chaque point représente un profil de conducteur disponible à proximité.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-center gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                {/* Carte de France SVG en arrière-plan */}
                <div className="relative w-full max-w-[340px] h-[340px] flex-shrink-0">
                  <svg viewBox="0 0 500 500" className="w-full h-full text-slate-200 drop-shadow-sm select-none" fill="currentColor">
                    <path 
                      d="M250,15 L285,18 L330,42 L385,45 L415,75 L425,115 L445,135 L435,175 L465,205 L445,245 L415,265 L425,295 L405,345 L395,395 L345,435 L325,425 L295,445 L245,475 L215,485 L185,475 L145,465 L105,435 L85,415 L65,375 L45,355 L25,335 L15,295 L35,255 L25,205 L45,165 L25,135 L40,115 L75,105 L100,70 L145,70 L175,45 Z" 
                      fill="#f1f5f9" 
                      stroke="#cbd5e1" 
                      strokeWidth="2.5" 
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Points des candidats positionnés en absolu */}
                  {!loadingMap && candidates.map((candidate) => (
                    <div 
                      key={candidate.id}
                      className="absolute group"
                      style={{ 
                        left: `${candidate.x}%`, 
                        top: `${candidate.y}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                    >
                      {/* Onde de choc pulsante */}
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-orange-400 opacity-75 animate-ping -left-1 -top-1"></span>
                      {/* Point central fixe */}
                      <span className="relative block h-2.5 w-2.5 rounded-full bg-orange-500 border border-white shadow-md cursor-pointer"></span>
                      
                      {/* Tooltip au survol */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-205 pointer-events-none bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-30">
                        <span className="font-bold text-orange-400">Chauffeur disponible</span> • {candidate.city}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-900 w-0 h-0"></div>
                      </div>
                    </div>
                  ))}

                  {loadingMap && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-xs text-slate-500 font-medium">Chargement de la carte en direct...</p>
                      </div>
                    </div>
                  )}

                  {!loadingMap && candidates.length === 0 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 border border-slate-105 py-1.5 px-4 rounded-xl shadow-sm text-[10px] font-bold text-slate-500">
                      En attente de nouvelles inscriptions
                    </div>
                  )}
                </div>

                {/* Explication & Statistiques de la carte */}
                <div className="space-y-6 max-w-sm">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-950">Mise à jour en temps réel</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Dès qu'un nouveau chauffeur s'enregistre et valide son adresse, son profil apparaît instantanément sur cette carte.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-slate-700">Flux d'inscriptions vérifiées</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-semibold text-slate-700">100% profils conformes</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link 
                      href="/offres" 
                      className="inline-flex items-center text-xs font-bold text-orange-500 hover:text-orange-600"
                    >
                      Consulter les profils par filtres métiers →
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
