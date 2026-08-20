'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ArrowRight,
  LogIn,
  ChevronRight,
  ChevronDown,
  Truck,
  Briefcase,
  MapPin,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Search,
  CheckCircle2,
  Globe,
  Award,
} from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'recruiter' | 'drivers' | 'regions' | null
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus lors d'un changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const isActive = path => pathname === path;

  // Données des 3 Mega Menus
  const recruiterMegaMenu = {
    title: 'Solutions Recruteurs',
    id: 'recruiter',
    icon: Briefcase,
    columns: [
      {
        title: 'CVthèque & Sourcing Direct',
        links: [
          {
            name: 'CVthèque Temps Réel',
            path: '/candidats-disponibles',
            desc: '500+ chauffeurs disponibles et validés',
            badge: 'En direct',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          },
          {
            name: 'Recrutement 0% Intérim',
            path: '/recrutement-transport',
            desc: 'Embauchez en direct sans agence d’intérim',
            badge: 'Économie',
            badgeColor: 'bg-orange-50 text-orange-600 border-orange-200',
          },
          {
            name: 'Transporteurs de France',
            path: '/transporteurs-france',
            desc: 'Réseau des entreprises de transport',
            badge: 'Réseau',
            badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          },
        ],
      },
      {
        title: 'Offres & Formules',
        links: [
          {
            name: 'Espace Entreprises',
            path: '/entreprises',
            desc: 'Présentation des services aux transporteurs',
            badge: 'Pro',
            badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
          },
          {
            name: 'Tarifs & Déblocage 4,99€',
            path: '/tarifs',
            desc: 'Déblocage unitaire ou abonnements illimités',
            badge: 'Dès 4,99€',
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          },
          {
            name: 'Guide Transport Routier',
            path: '/transport-routier',
            desc: 'Normes RSE, coefficients et conseils',
            badge: 'Guide',
            badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
          },
        ],
      },
    ],
    card: {
      badge: 'Accès Entreprise 🛡️',
      title: 'Trouvez vos chauffeurs sans frais d’agence',
      desc: 'Débloquez les coordonnées téléphoniques et documents vérifiés (Permis CE, FIMO, Chrono).',
      ctaText: 'Explorer la CVthèque',
      ctaPath: '/candidats-disponibles',
      gradient: 'from-slate-950 via-slate-900 to-orange-950',
    },
  };

  const driversMegaMenu = {
    title: 'Métiers & Permis',
    id: 'drivers',
    icon: Truck,
    columns: [
      {
        title: 'Conducteurs Routiers (PL / SPL)',
        links: [
          { name: 'Chauffeur SPL (Permis CE)', path: '/chauffeur-spl', badge: 'Permis CE', badgeColor: 'bg-orange-50 text-orange-600 border-orange-200' },
          { name: 'Chauffeur PL (Permis C)', path: '/chauffeur-pl', badge: 'Permis C', badgeColor: 'bg-blue-50 text-blue-600 border-blue-200' },
          { name: 'Chauffeur ADR (Matières Dangereuses)', path: '/chauffeur-adr', badge: 'ADR', badgeColor: 'bg-red-50 text-red-600 border-red-200' },
          { name: 'Chauffeur Frigo (Frais)', path: '/chauffeur-frigo', badge: 'Frigo', badgeColor: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
        ],
      },
      {
        title: 'Spécialités & Logistique',
        links: [
          { name: 'Chauffeur Benne (TP & Vrac)', path: '/chauffeur-benne', badge: 'TP / Vrac', badgeColor: 'bg-amber-50 text-amber-600 border-amber-200' },
          { name: 'Messagerie & Delivery', path: '/messagerie', badge: 'Livreur', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
          { name: 'Fret Express & Navettes', path: '/fret-express', badge: 'Urgent', badgeColor: 'bg-rose-50 text-rose-600 border-rose-200' },
          { name: 'Offres d’Emploi Chauffeur', path: '/emploi-chauffeur', badge: 'Offres', badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
          { name: 'Espace Chauffeur', path: '/chauffeurs', badge: 'Espace', badgeColor: 'bg-orange-50 text-orange-600 border-orange-200' },
        ],
      },
    ],
    card: {
      badge: 'Espace Chauffeurs 🚛',
      title: 'Inscrivez-vous et soyez contacté en direct',
      desc: 'Déposez votre dossier une fois et recevez des propositions en CDI / CDD sans passer par l’intérim.',
      ctaText: 'Créer mon profil candidat',
      ctaPath: '/register?role=candidate',
      gradient: 'from-orange-950 via-slate-900 to-slate-950',
    },
  };

  const regionsMegaMenu = {
    title: 'Zones & Régions',
    id: 'regions',
    icon: MapPin,
    columns: [
      {
        title: 'Régions & Départements Cibles',
        links: [
          { name: 'Chauffeur SPL Hauts-de-France', path: '/chauffeur-spl-hauts-de-france', badge: '🇫🇷 59 / 62 / 02', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
          { name: 'Chauffeur SPL Aisne (02)', path: '/chauffeur-spl-aisne', badge: '🇫🇷 02 Aisne', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
          { name: 'Transporteurs Hauts-de-France', path: '/transporteurs-hauts-de-france', badge: '🇫🇷 HDF', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
          { name: 'Transporteurs Aisne (02)', path: '/transporteurs-aisne', badge: '🇫🇷 Aisne', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
        ],
      },
      {
        title: 'Pays Transfrontaliers Couverts',
        links: [
          { name: 'France (National & Régional)', path: '/candidats-disponibles', badge: '🇫🇷 France', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
          { name: 'Belgique (Wallonie & Flandres)', path: '/candidats-disponibles', badge: '🇧🇪 Belgique', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
          { name: 'Luxembourg (Grand-Duché)', path: '/candidats-disponibles', badge: '🇱🇺 Luxembourg', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
          { name: 'Suisse (Romande & Allemande)', path: '/candidats-disponibles', badge: '🇨🇭 Suisse', badgeColor: 'bg-red-50 text-red-700 border-red-200' },
        ],
      },
    ],
    card: {
      badge: 'Réseau Transfrontalier 🌐',
      title: 'Maillage européen du transport routier',
      desc: 'Recherchez des conducteurs selon leur commune ou leur rayon d’action transfrontalier.',
      ctaText: 'Voir la carte temps réel',
      ctaPath: '/candidats-disponibles',
      gradient: 'from-slate-950 via-slate-900 to-blue-950',
    },
  };

  const megaMenusList = [recruiterMegaMenu, driversMegaMenu, regionsMegaMenu];

  return (
    <>
      <header className="sticky top-0 z-50 w-full transition-all duration-300 px-3 sm:px-6 py-2.5 sm:py-3 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/logo.png"
              alt="FretTalent"
              className="h-11 sm:h-13 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* DESKTOP NAVIGATION BAR (MODERNE, STRUCTURÉE ET ÉPURÉE) */}
          <nav className="hidden lg:flex items-center gap-1 p-1.5 bg-slate-100/80 rounded-full border border-slate-200/60 backdrop-blur-md relative">
            
            {/* MEGA MENU 1 : Solutions Recruteurs */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('recruiter')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'recruiter' ? null : 'recruiter')}
                className={`whitespace-nowrap px-4 py-2 text-xs xl:text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeDropdown === 'recruiter' || isActive('/candidats-disponibles') || isActive('/entreprises')
                    ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200/80 font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                <span>Solutions Recruteurs</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    activeDropdown === 'recruiter' ? 'rotate-180 text-orange-500' : ''
                  }`}
                />
              </button>

              {/* PANNEAU MEGA MENU RECRUTEURS */}
              {activeDropdown === 'recruiter' && (
                <div className="absolute top-full -left-10 pt-3 z-50 w-[840px] max-w-[90vw] animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.18)] p-6 relative">
                    <div className="absolute -top-2 left-16 w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45" />

                    <div className="grid grid-cols-12 gap-6 relative z-10">
                      {/* Colonnes de liens (8 cols) */}
                      <div className="col-span-8 grid grid-cols-2 gap-6">
                        {recruiterMegaMenu.columns.map((col, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase pb-2 border-b border-slate-100">
                              {col.title}
                            </h4>
                            <div className="space-y-1.5">
                              {col.links.map(link => (
                                <Link
                                  key={link.path + link.name}
                                  href={link.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className="group flex flex-col p-2.5 rounded-2xl hover:bg-orange-50/80 transition-all duration-150"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                      {link.name}
                                    </span>
                                    {link.badge && (
                                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${link.badgeColor}`}>
                                        {link.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-0.5 line-clamp-1">
                                    {link.desc}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Carte Promo Droit (4 cols) */}
                      <div className={`col-span-4 bg-gradient-to-br ${recruiterMegaMenu.card.gradient} text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group`}>
                        <div className="space-y-3 relative z-10">
                          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-full">
                            {recruiterMegaMenu.card.badge}
                          </span>
                          <h4 className="text-sm font-black leading-snug text-white">
                            {recruiterMegaMenu.card.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {recruiterMegaMenu.card.desc}
                          </p>
                        </div>
                        <div className="pt-4 relative z-10">
                          <Link
                            href={recruiterMegaMenu.card.ctaPath}
                            onClick={() => setActiveDropdown(null)}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                          >
                            <span>{recruiterMegaMenu.card.ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer Banner */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/90 -mx-6 -mb-6 px-6 py-3 rounded-b-3xl">
                      <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-orange-500" />
                        Déblocage unitaire à 4,99 € ou abonnement mensuel illimité sans engagement.
                      </span>
                      <Link
                        href="/tarifs"
                        onClick={() => setActiveDropdown(null)}
                        className="font-black text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                      >
                        <span>Voir les formules</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MEGA MENU 2 : Métiers & Permis */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('drivers')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'drivers' ? null : 'drivers')}
                className={`whitespace-nowrap px-4 py-2 text-xs xl:text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeDropdown === 'drivers' || isActive('/chauffeur-spl') || isActive('/chauffeur-pl')
                    ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200/80 font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span>Métiers & Permis</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    activeDropdown === 'drivers' ? 'rotate-180 text-orange-500' : ''
                  }`}
                />
              </button>

              {/* PANNEAU MEGA MENU MÉTIERS */}
              {activeDropdown === 'drivers' && (
                <div className="absolute top-full -left-28 pt-3 z-50 w-[840px] max-w-[90vw] animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.18)] p-6 relative">
                    <div className="absolute -top-2 left-36 w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45" />

                    <div className="grid grid-cols-12 gap-6 relative z-10">
                      {/* Colonnes de liens (8 cols) */}
                      <div className="col-span-8 grid grid-cols-2 gap-6">
                        {driversMegaMenu.columns.map((col, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase pb-2 border-b border-slate-100">
                              {col.title}
                            </h4>
                            <div className="space-y-1">
                              {col.links.map(link => (
                                <Link
                                  key={link.path + link.name}
                                  href={link.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className="group flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-all duration-150"
                                >
                                  <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform">
                                    {link.name}
                                  </span>
                                  {link.badge && (
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${link.badgeColor}`}>
                                      {link.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Carte Promo Droit (4 cols) */}
                      <div className={`col-span-4 bg-gradient-to-br ${driversMegaMenu.card.gradient} text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group`}>
                        <div className="space-y-3 relative z-10">
                          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-full">
                            {driversMegaMenu.card.badge}
                          </span>
                          <h4 className="text-sm font-black leading-snug text-white">
                            {driversMegaMenu.card.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {driversMegaMenu.card.desc}
                          </p>
                        </div>
                        <div className="pt-4 relative z-10">
                          <Link
                            href={driversMegaMenu.card.ctaPath}
                            onClick={() => setActiveDropdown(null)}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                          >
                            <span>{driversMegaMenu.card.ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer Banner */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/90 -mx-6 -mb-6 px-6 py-3 rounded-b-3xl">
                      <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        Vous cherchez un poste ? Consultez toutes les offres de recrutement transport.
                      </span>
                      <Link
                        href="/offres"
                        onClick={() => setActiveDropdown(null)}
                        className="font-black text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                      >
                        <span>Voir les offres</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MEGA MENU 3 : Zones & Régions */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('regions')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'regions' ? null : 'regions')}
                className={`whitespace-nowrap px-4 py-2 text-xs xl:text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeDropdown === 'regions' || isActive('/chauffeur-spl-hauts-de-france')
                    ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200/80 font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Zones & Régions</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    activeDropdown === 'regions' ? 'rotate-180 text-orange-500' : ''
                  }`}
                />
              </button>

              {/* PANNEAU MEGA MENU RÉGIONS */}
              {activeDropdown === 'regions' && (
                <div className="absolute top-full -left-52 pt-3 z-50 w-[840px] max-w-[90vw] animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.18)] p-6 relative">
                    <div className="absolute -top-2 left-60 w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45" />

                    <div className="grid grid-cols-12 gap-6 relative z-10">
                      {/* Colonnes de liens (8 cols) */}
                      <div className="col-span-8 grid grid-cols-2 gap-6">
                        {regionsMegaMenu.columns.map((col, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase pb-2 border-b border-slate-100">
                              {col.title}
                            </h4>
                            <div className="space-y-1">
                              {col.links.map(link => (
                                <Link
                                  key={link.path + link.name}
                                  href={link.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className="group flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-all duration-150"
                                >
                                  <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform">
                                    {link.name}
                                  </span>
                                  {link.badge && (
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${link.badgeColor}`}>
                                      {link.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Carte Promo Droit (4 cols) */}
                      <div className={`col-span-4 bg-gradient-to-br ${regionsMegaMenu.card.gradient} text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group`}>
                        <div className="space-y-3 relative z-10">
                          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-full">
                            {regionsMegaMenu.card.badge}
                          </span>
                          <h4 className="text-sm font-black leading-snug text-white">
                            {regionsMegaMenu.card.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {regionsMegaMenu.card.desc}
                          </p>
                        </div>
                        <div className="pt-4 relative z-10">
                          <Link
                            href={regionsMegaMenu.card.ctaPath}
                            onClick={() => setActiveDropdown(null)}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                          >
                            <span>{regionsMegaMenu.card.ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer Banner */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/90 -mx-6 -mb-6 px-6 py-3 rounded-b-3xl">
                      <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-orange-500" />
                        Recherche géolocalisée interactive disponible sur toute la France et le Benelux.
                      </span>
                      <Link
                        href="/candidats-disponibles"
                        onClick={() => setActiveDropdown(null)}
                        className="font-black text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                      >
                        <span>Voir la carte</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* OFFRES D'EMPLOI (Bouton badge mis en valeur) */}
            <Link
              href="/offres"
              className={`whitespace-nowrap relative px-4 py-2 text-xs xl:text-sm font-black rounded-full transition-all duration-200 flex items-center gap-2 ${
                isActive('/offres')
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25'
                  : 'text-orange-600 bg-orange-500/10 hover:bg-orange-500 hover:text-white transition-all'
              }`}
            >
              <span>Offres d&apos;emploi</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            </Link>

            {/* TARIFS (Lien direct) */}
            <Link
              href="/tarifs"
              className={`whitespace-nowrap px-4 py-2 text-xs xl:text-sm font-bold rounded-full transition-all duration-200 ${
                isActive('/tarifs')
                  ? 'text-orange-600 bg-white shadow-sm ring-1 ring-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <span>Tarifs</span>
            </Link>

          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs xl:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all duration-200"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Connexion</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs xl:text-sm font-black text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-orange-500 shadow-[0_4px_14px_rgba(249,115,22,0.32)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.45)] hover:scale-105 transition-all duration-200"
            >
              <span>Je m&apos;inscris</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors border border-slate-200/80"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Backdrop Mobile */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Mobile (Ergonomique avec accordéons) */}
      <div
        className={`fixed top-0 right-0 h-full w-[88%] max-w-sm bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <img src="/logo.png" alt="FretTalent" className="h-10 w-auto" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Accordéons des 3 catégories Mega Menu sur Mobile */}
          <div className="space-y-2">
            {megaMenusList.map(menu => {
              const CategoryIcon = menu.icon;
              const isExpanded = activeMobileCategory === menu.id;
              return (
                <div
                  key={menu.id}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/50"
                >
                  <button
                    onClick={() =>
                      setActiveMobileCategory(isExpanded ? null : menu.id)
                    }
                    className="w-full flex items-center justify-between p-3.5 text-xs font-extrabold text-slate-800 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-orange-50 text-orange-500">
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <span className="uppercase tracking-wide">{menu.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-orange-500' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 space-y-3 border-t border-slate-200/60 bg-white">
                      {menu.columns.map((col, cIdx) => (
                        <div key={cIdx} className="space-y-1">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 pt-1">
                            {col.title}
                          </h5>
                          {col.links.map(item => (
                            <Link
                              key={item.path + item.name}
                              href={item.path}
                              className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
                            >
                              <span>{item.name}</span>
                              {item.badge && (
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${item.badgeColor}`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Link
            href="/offres"
            className="flex items-center justify-between px-4 py-3.5 text-sm font-black rounded-2xl transition-all text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200/60"
          >
            <span>Offres d&apos;emploi</span>
            <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
              Nouveau
            </span>
          </Link>

          <Link
            href="/tarifs"
            className="flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80"
          >
            <span>Tarifs & Abonnements</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/contact"
            className="flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80"
          >
            <span>Contact & Support</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        <div className="p-5 border-t border-slate-100 space-y-2.5 bg-white">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors"
          >
            <LogIn className="w-4 h-4 text-slate-400" />
            <span>Connexion</span>
          </Link>
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-orange-500 transition-all"
          >
            <span>Créer un compte</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
