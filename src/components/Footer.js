import Link from 'next/link';
import { Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Intro */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="FretTalent - Recrutement Chauffeurs Routiers France & Belgique" className="h-16 md:h-20 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Le premier réseau de recrutement en direct pour les chauffeurs
              routiers et entreprises de transport en France et en Belgique.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Plateforme
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/entreprises"
                  className="hover:text-white transition-colors"
                >
                  Pour les Entreprises
                </Link>
              </li>
              <li>
                <Link
                  href="/chauffeurs"
                  className="hover:text-white transition-colors"
                >
                  Pour les Chauffeurs
                </Link>
              </li>
              <li>
                <Link
                  href="/comment-ca-marche"
                  className="hover:text-white transition-colors"
                >
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link
                  href="/tarifs"
                  className="hover:text-white transition-colors"
                >
                  Tarifs & Abonnements
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors text-orange-400 font-semibold"
                >
                  Foire Aux Questions (FAQ)
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

          {/* Account links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Espace membre
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  Créer un compte
                </Link>
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
          <p className="bg-slate-800 text-orange-400 px-3.5 py-1.5 rounded-full font-medium text-center">
            100% gratuit pour les chauffeurs — Compatible SIRET (France) & BCE (Belgique)
          </p>
        </div>
      </div>
    </footer>
  );
}
