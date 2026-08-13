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
      <div
        className={`sticky top-0 z-50 w-full flex justify-center transition-all duration-300 ${
          scrolled ? 'md:pt-4' : 'pt-0'
        }`}
      >
        <header
          className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between ${
            scrolled
              ? 'max-w-6xl bg-white/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-b md:border border-slate-200/60 md:rounded-full py-2.5 px-4 md:px-6'
              : 'max-w-7xl bg-white/95 md:bg-white/0 md:backdrop-blur-none border-b border-slate-100 md:border-transparent py-4 md:py-6 px-4 md:px-8'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="/logo.png"
              alt="FretTalent"
              className={`w-auto object-contain transition-all duration-500 group-hover:scale-105 ${
                scrolled ? 'h-10 md:h-12' : 'h-14 md:h-16'
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
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
              className={`group relative flex items-center gap-2 px-5 py-2 ml-2 text-sm font-bold rounded-full transition-all duration-300 ${
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
            <Link
              href="/login"
              className={`hidden md:flex px-4 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
                isActive('/login')
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-2.5 rounded-full text-sm font-extrabold text-white bg-gradient-to-tr from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-400 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5 transition-all duration-300"
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
