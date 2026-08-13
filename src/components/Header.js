'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = path => pathname === path;

  const navLinks = [
    { name: 'Pour les entreprises', path: '/entreprises' },
    { name: 'Pour les chauffeurs', path: '/chauffeurs' },
    { name: 'Tarifs', path: '/tarifs' },
    { name: 'Comment ça marche', path: '/comment-ca-marche' },
  ];

  return (
    <>
      <div className="sticky top-0 z-50 w-full transition-all duration-300">
        <header
          className={`w-full transition-all duration-300 ${
            scrolled
              ? 'bg-white/85 backdrop-blur-2xl shadow-sm border-b border-slate-200/60 py-3'
              : 'bg-white/95 md:bg-white/0 border-b border-slate-100 md:border-transparent py-5'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/logo.png"
                alt="FretTalent"
                className={`w-auto object-contain transition-all duration-500 group-hover:scale-105 ${
                  scrolled ? 'h-12 md:h-14' : 'h-14 md:h-16'
                }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`whitespace-nowrap relative px-3 xl:px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-orange-700 bg-orange-100/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/offres"
                className={`whitespace-nowrap group relative flex items-center gap-2 px-4 xl:px-5 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
                  isActive('/offres')
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-orange-600 bg-orange-50 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/30'
                }`}
              >
                Offres d'emploi
                <div className="relative flex h-2 w-2 ml-0.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isActive('/offres') ? 'bg-white' : 'bg-orange-400 group-hover:bg-white'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isActive('/offres') ? 'bg-white' : 'bg-orange-500 group-hover:bg-white'
                    }`}
                  ></span>
                </div>
              </Link>
            </nav>

            {/* CTA Buttons & Mobile Toggle */}
            <div className="flex items-center gap-2 md:gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61593021909293"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-[#1877F2] text-slate-600 hover:text-white transition-all shadow-sm group"
                title="Suivez FretTalent sur Facebook"
              >
                <svg className="w-4 h-4 fill-current text-[#1877F2] group-hover:text-white transition-colors" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <Link
                href="/login"
                className={`whitespace-nowrap hidden md:flex px-4 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
                  isActive('/login')
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2.5 md:px-6 md:py-2.5 rounded-full text-sm font-extrabold text-white bg-gradient-to-tr from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-400 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Je m'inscris
              </Link>
              
              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 text-slate-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors ml-1"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <img src="/logo.png" alt="FretTalent" className="h-10 w-auto" />
          <button
            className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`px-4 py-3 text-base font-semibold rounded-2xl transition-colors ${
                isActive(link.path)
                  ? 'text-orange-700 bg-orange-50'
                  : 'text-slate-700 hover:text-orange-600 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/offres"
            className={`flex items-center justify-between px-4 py-3 mt-2 text-base font-bold rounded-2xl transition-colors ${
              isActive('/offres')
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-orange-600 bg-orange-50 hover:bg-orange-100'
            }`}
          >
            Offres d'emploi
            <div className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive('/offres') ? 'bg-white' : 'bg-orange-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isActive('/offres') ? 'bg-white' : 'bg-orange-500'}`}></span>
            </div>
          </Link>

          {/* Facebook Link in Mobile Menu */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            <a
              href="https://www.facebook.com/profile.php?id=61593021909293"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#1877F2] font-bold text-sm transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Suivez-nous sur Facebook</span>
            </a>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <Link
            href="/login"
            className="w-full flex items-center justify-center px-4 py-3 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
          >
            Connexion
          </Link>
        </div>
      </div>
    </>
  );
}
