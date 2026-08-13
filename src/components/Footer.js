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
            {/* Facebook Social Link */}
            <div className="pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61593021909293"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-[#1877F2] text-slate-300 hover:text-white transition-all text-xs font-bold shadow-sm border border-slate-700/60 hover:border-transparent group"
              >
                <svg className="w-4 h-4 fill-current text-[#1877F2] group-hover:text-white transition-colors" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Rejoignez-nous sur Facebook</span>
              </a>
            </div>
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
                  href="/a-propos"
                  className="hover:text-white transition-colors text-orange-400 font-semibold"
                >
                  À propos de nous
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
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61593021909293"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Page Facebook
                </a>
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
          <div className="flex items-center gap-3">
            <p className="text-slate-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} FretTalent. Tous droits réservés.
            </p>
            <a
              href="https://www.facebook.com/profile.php?id=61593021909293"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-[#1877F2] text-slate-400 hover:text-white transition-colors"
              title="Page Facebook FretTalent"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          <p className="bg-slate-800 text-orange-400 px-3.5 py-1.5 rounded-full font-medium text-center">
            100% gratuit pour les chauffeurs — Compatible SIRET (FR), BCE (BE), RCS/TVA (LU) & IDE (CH)
          </p>
        </div>
      </div>
    </footer>
  );
}
