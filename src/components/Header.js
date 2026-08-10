"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/95 backdrop-blur-md shadow-md py-3" 
        : "bg-white py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-orange-500 text-white p-2 rounded-xl transition-transform group-hover:rotate-[360deg] duration-700 ease-in-out">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Fret<span className="text-orange-500">Talent</span>
            </span>
          </Link>

          {/* Navigation avec des vraies pages au lieu de ancres de défilement */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/comment-ca-marche" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
              Comment ça marche
            </Link>
            <Link href="/entreprises" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
              Pour les entreprises
            </Link>
            <Link href="/chauffeurs" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
              Pour les chauffeurs
            </Link>
            <Link href="/tarifs" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
              Tarifs
            </Link>
            <Link href="/offres" className="text-sm font-medium text-slate-605 bg-orange-50 text-orange-600 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors">
              Offres d'emploi
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 hover:-translate-y-0.5">
              Je m'inscris
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
