import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800/80 relative overflow-hidden font-sans">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[120px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 border-b border-slate-800/80">
          
          {/* Col 1 : Logo & Brand (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block group">
              <img
                src="/logo.png"
                alt="FretTalent - Recrutement Chauffeurs Routiers France & Europe"
                className="h-14 md:h-16 w-auto object-contain brightness-0 invert group-hover:opacity-90 transition-opacity"
              />
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Le premier réseau de recrutement en direct pour les <strong>chauffeurs routiers (PL, SPL)</strong> et entreprises de transport en <strong>France, Belgique, Luxembourg et Suisse</strong>.
            </p>

            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              <a
                href="https://t.me/Frettalent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-[#229ED9] text-slate-300 hover:text-white transition-all duration-200 text-xs font-bold border border-slate-800 hover:border-transparent group shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#229ED9] group-hover:text-white transition-colors" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.847-1.077 4.708-1.564 6.782-.206.879-.537 1.173-.858 1.202-.699.064-1.23-.462-1.907-.905-.884-.578-1.383-.938-2.241-1.503-.993-.654-.35-1.014.217-1.602.148-.153 2.723-2.496 2.773-2.708.006-.027.012-.127-.048-.18-.06-.054-.148-.035-.212-.021-.09.02-1.528.971-4.312 2.851-.408.281-.778.419-1.109.412-.365-.008-1.068-.207-1.591-.377-.642-.208-1.152-.319-1.108-.673.023-.184.278-.373.766-.567 3.003-1.307 5.006-2.17 6.009-2.589 2.864-1.196 3.458-1.404 3.847-1.41.085-.001.277.021.401.122.105.085.134.199.148.279.014.079.03.261.016.402z"/>
                </svg>
                <span>Telegram @Frettalent</span>
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61593021909293"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-[#1877F2] text-slate-300 hover:text-white transition-all duration-200 text-xs font-bold border border-slate-800 hover:border-transparent group shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#1877F2] group-hover:text-white transition-colors" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Col 2 : Plateforme (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Plateforme & Opportunités
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/candidats-disponibles"
                  className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-bold transition-all group"
                >
                  <span>Candidats disponibles</span>
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-orange-500/30 group-hover:bg-orange-500/30">
                    En direct
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/offres"
                  className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-bold transition-all group"
                >
                  <span>Offres d&apos;emploi</span>
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-orange-500/30 group-hover:bg-orange-500/30">
                    Recrutement
                  </span>
                </Link>
              </li>

              <li>
                <Link href="/entreprises" className="hover:text-white transition-colors">
                  Pour les Entreprises
                </Link>
              </li>
              <li>
                <Link href="/chauffeurs" className="hover:text-white transition-colors">
                  Pour les Chauffeurs
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="hover:text-white transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-white transition-colors">
                  Tarifs & Abonnements
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/a-propos" className="hover:text-white transition-colors">
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Foire Aux Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-bold transition-colors"
                >
                  <span>Contact & Support</span>
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-orange-500/30">
                    7j/7
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 : Légal */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Légal & Sécurité
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/cgu" className="hover:text-white transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/legal/cgv" className="hover:text-white transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/legal/confidentialite" className="hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-white transition-colors">
                  Gestion des cookies
                </Link>
              </li>
            </ul>
          </div>

        </div>



        {/* Footer Bottom Bar */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} FretTalent. Tous droits réservés. Plateforme de mise en relation directe transport & logistique.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-400">
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full font-medium text-slate-300">
              100% gratuit pour les chauffeurs
            </span>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full font-medium text-slate-300">
              France • Belgique • Luxembourg • Suisse
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
