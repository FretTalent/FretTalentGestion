'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = path => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
          : 'bg-white py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="FretTalent - Recrutement Chauffeurs Routiers France et Belgique" 
              className="h-16 md:h-20 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
            />
          </Link>

          {/* Navigation avec détection d'état actif */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/entreprises"
              className={`text-sm transition-colors ${
                isActive('/entreprises')
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-600 font-medium hover:text-orange-500'
              }`}
            >
              Pour les entreprises
            </Link>
            <Link
              href="/chauffeurs"
              className={`text-sm transition-colors ${
                isActive('/chauffeurs')
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-600 font-medium hover:text-orange-500'
              }`}
            >
              Pour les chauffeurs
            </Link>
            <Link
              href="/tarifs"
              className={`text-sm transition-colors ${
                isActive('/tarifs')
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-600 font-medium hover:text-orange-500'
              }`}
            >
              Tarifs
            </Link>
            <Link
              href="/comment-ca-marche"
              className={`text-sm transition-colors ${
                isActive('/comment-ca-marche')
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-600 font-medium hover:text-orange-500'
              }`}
            >
              Comment ça marche
            </Link>
            <Link
              href="/offres"
              className={`text-sm px-4 py-1.5 rounded-full transition-all ${
                isActive('/offres')
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25'
                  : 'text-orange-600 bg-orange-50 font-medium hover:bg-orange-100'
              }`}
            >
              Offres d'emploi
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className={`text-sm transition-colors ${
                isActive('/login')
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-700 font-semibold hover:text-orange-500'
              }`}
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Je m'inscris
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
