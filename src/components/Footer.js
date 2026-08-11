import Link from 'next/link';
import { Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Intro */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-orange-500 text-white p-2 rounded-xl">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Fret<span className="text-orange-500">Talent</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Le premier réseau de recrutement en direct pour les chauffeurs
              routiers et entreprises de transport en France.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="#comment-ca-marche"
                  className="hover:text-white transition-colors"
                >
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link
                  href="#tarifs"
                  className="hover:text-white transition-colors"
                >
                  Tarifs
                </Link>
              </li>
              <li>
                <Link
                  href="#pour-les-entreprises"
                  className="hover:text-white transition-colors"
                >
                  Entreprises
                </Link>
              </li>
              <li>
                <Link
                  href="/offres"
                  className="hover:text-white transition-colors text-orange-400 font-bold"
                >
                  Offres d'emploi
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Ressources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="#faq"
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <span className="text-slate-500">
                  Blog & Conseils (Bientôt)
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Légal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/legal/mentions-legales"
                  className="hover:text-white transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cgu"
                  className="hover:text-white transition-colors"
                >
                  CGU
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cgv"
                  className="hover:text-white transition-colors"
                >
                  CGV (Entreprises)
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/confidentialite"
                  className="hover:text-white transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="hover:text-white transition-colors"
                >
                  Politique de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} FretTalent. Tous droits réservés.
          </p>
          <p className="bg-slate-800 text-orange-400 px-3 py-1.5 rounded-full font-medium text-center">
            100% gratuit pour les chauffeurs — conforme au Code du travail (art.
            L5321-3)
          </p>
        </div>
      </div>
    </footer>
  );
}
