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
} from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
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
    setMegaMenuOpen(false);
  }, [pathname]);

  const isActive = path => pathname === path;

  const navLinks = [
    { name: 'Candidats disponibles', path: '/candidats-disponibles', isLive: true },
    { name: 'Entreprises', path: '/entreprises' },
    { name: 'Chauffeurs', path: '/chauffeurs' },
    { name: 'Tarifs', path: '/tarifs' },
    { name: 'Contact', path: '/contact' },
  ];

  const megaMenuCategories = [
    {
      id: 'specialites',
      title: 'Chauffeurs & Permis',
      icon: Truck,
      badgeColor: 'bg-orange-50 text-orange-600 border-orange-200/70',
      iconColor: 'text-orange-500 bg-orange-50',
      links: [
        { name: 'Chauffeur SPL (Permis CE)', path: '/chauffeur-spl', badge: 'Permis CE' },
        { name: 'Chauffeur PL (Permis C)', path: '/chauffeur-pl', badge: 'Permis C' },
        { name: 'Chauffeur ADR (Dangereux)', path: '/chauffeur-adr', badge: 'ADR' },
        { name: 'Chauffeur Frigo (Frais)', path: '/chauffeur-frigo', badge: 'Frigo' },
        { name: 'Chauffeur Benne (TP & Vrac)', path: '/chauffeur-benne', badge: 'TP' },
        { name: 'Messagerie & Delivery', path: '/messagerie', badge: 'Livreur' },
        { name: 'Fret Express & Urgence', path: '/fret-express', badge: 'Urgent' },
      ],
    },
    {
      id: 'recrutement',
      title: 'Recruteurs & Services',
      icon: Briefcase,
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200/70',
      iconColor: 'text-amber-500 bg-amber-50',
      links: [
        { name: 'CVthèque Chauffeurs', path: '/candidats-disponibles', badge: 'Vérifiés' },
        { name: 'Offres d’Emploi Transport', path: '/emploi-chauffeur', badge: 'CDI/CDD' },
        { name: 'Recrutement 0% Intérim', path: '/recrutement-transport', badge: 'Direct' },
        { name: 'Transporteurs de France', path: '/transporteurs-france', badge: 'Réseau' },
        { name: 'Formules & Déblocage 4,99€', path: '/tarifs', badge: 'Sans engagement' },
        { name: 'Guide Transport Routier', path: '/transport-routier', badge: 'Guide' },
      ],
    },
    {
      id: 'regions',
      title: 'Zones & Régions',
      icon: MapPin,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/70',
      iconColor: 'text-slate-700 bg-slate-100',
      links: [
        { name: 'Chauffeur SPL Hauts-de-France', path: '/chauffeur-spl-hauts-de-france', badge: '🇫🇷 59/62/02' },
        { name: 'Chauffeur SPL Aisne (02)', path: '/chauffeur-spl-aisne', badge: '🇫🇷 02' },
        { name: 'Transporteurs Hauts-de-France', path: '/transporteurs-hauts-de-france', badge: '🇫🇷 HDF' },
        { name: 'Transporteurs Aisne (02)', path: '/transporteurs-aisne', badge: '🇫🇷 Aisne' },
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
            {navLinks.map(link => {
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

            {/* BOUTON DÉCLENCHEUR MEGA MENU */}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`whitespace-nowrap px-4 py-2 text-xs xl:text-sm font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  megaMenuOpen
                    ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200/80 font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Explorer le Réseau</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    megaMenuOpen ? 'rotate-180 text-orange-500' : ''
                  }`}
                />
              </button>

              {/* PANNEAU MEGA MENU FULL-WIDTH INTERACTIF */}
              {megaMenuOpen && (
                <div className="absolute top-full -left-[280px] xl:-left-[240px] pt-3 z-50 w-[940px] max-w-[95vw] animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.18)] p-7 relative">
                    
                    {/* Flèche d'indication supérieure */}
                    <div className="absolute -top-2 left-[340px] xl:left-[300px] w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45" />

                    {/* Grille Mega Menu 4 Colonnes */}
                    <div className="grid grid-cols-4 gap-6 relative z-10">
                      {megaMenuCategories.map(category => {
                        const CategoryIcon = category.icon;
                        return (
                          <div key={category.id} className="space-y-3">
                            {/* Titre de Colonne */}
                            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                              <div className={`p-1.5 rounded-xl ${category.iconColor}`}>
                                <CategoryIcon className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase">
                                {category.title}
                              </h4>
                            </div>

                            {/* Liens de la Colonne */}
                            <div className="space-y-1">
                              {category.links.map(item => (
                                <Link
                                  key={item.path}
                                  href={item.path}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="group flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-all duration-150"
                                >
                                  <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform">
                                    {item.name}
                                  </span>
                                  {item.badge && (
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${category.badgeColor}`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* COLONNE 4 : CARTE PROMOTIONNELLE DYNAMIQUE */}
                      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />

                        <div className="space-y-3 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400">
                              En Direct • 100% Vérifié 🛡️
                            </span>
                          </div>

                          <h4 className="text-sm font-black leading-snug text-white">
                            Sourcing Chauffeurs sans agence d’intérim
                          </h4>

                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Accédez directement aux coordonnées complètes et documents vérifiés (FIMO, Chrono, Permis CE).
                          </p>
                        </div>

                        <div className="pt-3 relative z-10">
                          <Link
                            href="/candidats-disponibles"
                            onClick={() => setMegaMenuOpen(false)}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white text-xs font-black py-2.5 px-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                          >
                            <span>CVthèque Temps Réel</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* BANDEAU DE PIED DE MEGA MENU */}
                    <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/90 -mx-7 -mb-7 px-7 py-3.5 rounded-b-3xl">
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span>
                          Vous êtes recruteur ? Débloquez les profils à l&apos;unité (4,99€) ou optez pour l&apos;accès illimité.
                        </span>
                      </div>
                      <Link
                        href="/tarifs"
                        onClick={() => setMegaMenuOpen(false)}
                        className="inline-flex items-center gap-1.5 font-black text-orange-600 hover:text-orange-700 hover:underline bg-orange-100/60 px-3 py-1.5 rounded-xl border border-orange-200/60 transition-colors"
                      >
                        <span>Découvrir les Tarifs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Offres d'emploi (Highlight) */}
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
            {navLinks.map(link => (
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
              <Sparkles className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Explorer le Réseau
              </h3>
            </div>

            {megaMenuCategories.map(category => {
              const CategoryIcon = category.icon;
              const isExpanded = activeMobileCategory === category.id;
              return (
                <div
                  key={category.id}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/50"
                >
                  <button
                    onClick={() =>
                      setActiveMobileCategory(isExpanded ? null : category.id)
                    }
                    className="w-full flex items-center justify-between p-3 text-[13px] font-extrabold text-slate-800 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-xl ${category.iconColor}`}>
                        <CategoryIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>{category.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-orange-500' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 space-y-1 border-t border-slate-200/60 bg-white">
                      {category.links.map(item => (
                        <Link
                          key={item.path}
                          href={item.path}
                          className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
                        >
                          <span>{item.name}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${category.badgeColor}`}
                            >
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
