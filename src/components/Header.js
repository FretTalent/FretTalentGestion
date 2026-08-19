'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Sparkles, User, LogIn, ChevronRight, ChevronDown, Truck } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seoDropdownOpen, setSeoDropdownOpen] = useState(false);
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

  const seoQuickLinks = [
    { name: 'Chauffeur SPL', path: '/chauffeur-spl' },
    { name: 'Chauffeur PL', path: '/chauffeur-pl' },
    { name: 'Chauffeur ADR', path: '/chauffeur-adr' },
    { name: 'Chauffeur Frigo', path: '/chauffeur-frigo' },
    { name: 'Chauffeur Benne', path: '/chauffeur-benne' },
    { name: 'Emploi Chauffeur', path: '/emploi-chauffeur' },
    { name: 'Recrutement Transport', path: '/recrutement-transport' },
    { name: 'Transporteurs France', path: '/transporteurs-france' },
    { name: 'Chauffeur SPL Hauts-de-France', path: '/chauffeur-spl-hauts-de-france' },
    { name: 'Chauffeur SPL Aisne (02)', path: '/chauffeur-spl-aisne' },
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

            {/* DROPDOWN SEO METIERS & REGIONS */}
            <div className="relative">
              <button
                onClick={() => setSeoDropdownOpen(!seoDropdownOpen)}
                onMouseEnter={() => setSeoDropdownOpen(true)}
                className="whitespace-nowrap px-4 py-2 text-xs xl:text-sm font-bold text-slate-700 hover:text-slate-950 rounded-full transition-all flex items-center gap-1.5 cursor-pointer hover:bg-white/60"
              >
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span>Métiers & Régions</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${seoDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {seoDropdownOpen && (
                <div
                  onMouseLeave={() => setSeoDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="text-[10px] font-black uppercase text-slate-400 px-3 py-1.5 tracking-wider border-b border-slate-100">
                    Pages d'Atterrissage SEO
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto space-y-0.5">
                    {seoQuickLinks.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setSeoDropdownOpen(false)}
                        className="block px-3 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                      >
                        {item.name}
                      </Link>
                    ))}
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
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col ${
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

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
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

          {/* SECTION SEO MOBILE */}
          <div className="pt-3 pb-1 border-t border-slate-100 space-y-1">
            <p className="px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Métiers & Régions (SEO)
            </p>
            {seoQuickLinks.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="block px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <Link
            href="/offres"
            className="flex items-center justify-between px-4 py-3.5 mt-2 text-sm font-black rounded-2xl transition-all text-orange-600 bg-orange-50 hover:bg-orange-100"
          >
            <span>Offres d&apos;emploi</span>
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
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
