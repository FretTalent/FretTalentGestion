'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, ArrowRight, LogIn, ChevronRight, ChevronDown,
  Truck, Briefcase, MapPin, Sparkles
} from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seoDropdownOpen, setSeoDropdownOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
    setSeoDropdownOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;

  const navLinks = [
    { name: 'Candidats disponibles', path: '/candidats-disponibles', isLive: true },
    { name: 'Entreprises', path: '/entreprises' },
    { name: 'Chauffeurs', path: '/chauffeurs' },
    { name: 'Tarifs', path: '/tarifs' },
    { name: 'Contact', path: '/contact' },
  ];

  const seoCategories = [
    {
      id: 'specialites',
      title: 'Métiers & Spécialités',
      icon: Truck,
      badgeColor: 'bg-orange-50 text-orange-600 border-orange-200/60',
      iconColor: 'text-orange-500 bg-orange-50',
      links: [
        { name: 'Chauffeur SPL (Permis CE)', path: '/chauffeur-spl', badge: 'Permis CE' },
        { name: 'Chauffeur PL (Permis C)', path: '/chauffeur-pl', badge: 'Permis C' },
        { name: 'Chauffeur ADR (Matières Dangereuses)', path: '/chauffeur-adr', badge: 'ADR' },
        { name: 'Chauffeur Frigo (Frais)', path: '/chauffeur-frigo', badge: 'Frigo' },
        { name: 'Chauffeur Benne (TP & Vrac)', path: '/chauffeur-benne', badge: 'TP' },
        { name: 'Messagerie & Distribution', path: '/messagerie', badge: 'Livreur' },
        { name: 'Fret Express & Navettes', path: '/fret-express', badge: 'Urgent' },
      ],
    },
    {
      id: 'emploi',
      title: 'Emploi & Réseau',
      icon: Briefcase,
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200/60',
      iconColor: 'text-amber-500 bg-amber-50',
      links: [
        { name: 'Offres d’Emploi Chauffeur', path: '/emploi-chauffeur', badge: 'CDI/CDD' },
        { name: 'Recrutement Transport Direct', path: '/recrutement-transport', badge: '0% Intérim' },
        { name: 'Transporteurs de France', path: '/transporteurs-france', badge: 'Réseau' },
        { name: 'Secteur Transport (TRM)', path: '/transport-routier', badge: 'Guide' },
      ],
    },
    {
      id: 'regions',
      title: 'Zones & Régions',
      icon: MapPin,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/60',
      iconColor: 'text-slate-700 bg-slate-100',
      links: [
        { name: 'Chauffeur SPL Hauts-de-France', path: '/chauffeur-spl-hauts-de-france', badge: '59/62/02' },
        { name: 'Chauffeur SPL Aisne (02)', path: '/chauffeur-spl-aisne', badge: '02 Aisne' },
        { name: 'Transporteurs Hauts-de-France', path: '/transporteurs-hauts-de-france', badge: 'HDF' },
        { name: 'Transporteurs Aisne (02)', path: '/transporteurs-aisne', badge: 'Aisne' },
      ],
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full transition-all duration-300 px-3 sm:px-6 py-2.5 sm:py-3 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/logo.png"
              alt="FretTalent"
              className="h-11 sm:h-13 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Menu (Floating Pill Center) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-full border border-slate-200/60 backdrop-blur-md relative">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`whitespace-nowrap relative px-4 py-2 text-xs xl:text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    active
                      ? 'text-orange-600 bg-white shadow-sm ring-1 ring-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  {link.isLive && (
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* DROPDOWN MEGA MENU SEO METIERS & REGIONS */}
            <div
              className="relative"
              onMouseEnter={() => setSeoDropdownOpen(true)}
              onMouseLeave={() => setSeoDropdownOpen(false)}
            >
              <button
                onClick={() => setSeoDropdownOpen(!seoDropdownOpen)}
                className={`whitespace-nowrap px-4 py-2 text-xs xl:text-sm font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  seoDropdownOpen
                    ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200/80 font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span>Métiers & Régions</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${seoDropdownOpen ? 'rotate-180 text-orange-500' : ''}`} />
              </button>

              {seoDropdownOpen && (
                <div className="absolute top-full -left-20 xl:-left-10 mt-3 w-[720px] bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] p-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  
                  {/* Subtle top indicator arrow */}
                  <div className="absolute -top-2 left-28 w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45" />

                  {/* Mega Menu Grid - 3 Columns */}
                  <div className="grid grid-cols-3 gap-6 relative z-10">
                    {seoCategories.map((category) => {
                      const CategoryIcon = category.icon;
                      return (
                        <div key={category.id} className="space-y-3">
                          {/* Column Header */}
                          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                            <div className={`p-1.5 rounded-xl ${category.iconColor}`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 tracking-wide">
                              {category.title}
                            </h4>
                          </div>

                          {/* Column Links */}
                          <div className="space-y-1">
                            {category.links.map((item) => (
                              <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setSeoDropdownOpen(false)}
                                className="group flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-all duration-150"
                              >
                                <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform">
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${category.badgeColor}`}>
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mega Menu Footer Banner */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 -mx-6 -mb-6 px-6 py-3 rounded-b-3xl">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>Trouvez votre opportunité transport direct sans agence d’intérim</span>
                    </div>
                    <Link
                      href="/offres"
                      onClick={() => setSeoDropdownOpen(false)}
                      className="inline-flex items-center gap-1 font-black text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      <span>Voir toutes les offres</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              )}
            </div>

            {/* Offres d'emploi (Highlight en orange) */}
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

      {/* Drawer Mobile */}
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
          {/* Main Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="flex items-center justify-between px-4 py-3 text-sm font-bold rounded-2xl transition-all text-slate-700 hover:bg-slate-50"
              >
                <span>{link.name}</span>
                {link.isLive && (
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    En direct
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* ACCORDEON METIERS & REGIONS MOBILE */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 px-2 pb-1">
              <Truck className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Métiers & Régions
              </h3>
            </div>

            {seoCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isExpanded = activeMobileCategory === category.id;
              return (
                <div key={category.id} className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => setActiveMobileCategory(isExpanded ? null : category.id)}
                    className="w-full flex items-center justify-between p-3 text-[13px] font-extrabold text-slate-800 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-xl ${category.iconColor}`}>
                        <CategoryIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>{category.title}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-orange-500' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 space-y-1 border-t border-slate-200/60 bg-white">
                      {category.links.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
                        >
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${category.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
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
