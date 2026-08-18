import Link from 'next/link';
import {
  Search,
  UserCheck,
  Unlock,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'Comment ça marche ? | Recrutement Chauffeur SPL & Transporteurs | FretTalent',
  description:
    'Découvrez le fonctionnement de FretTalent : mise en relation directe entre transporteurs et chauffeurs routiers SPL (Super Poids Lourd) en France, Suisse, Belgique et Luxembourg. Simple, rapide et 100% sécurisé.',
  alternates: {
    canonical: 'https://www.frettalent.fr/comment-ca-marche',
  },
};

export default function CommentCaMarche() {
  const stepsRecruiter = [
    {
      icon: Search,
      title: '1. Filtrez & Ciblez',
      desc: 'Recherchez par zone géographique, rayon de mobilité (km), permis (C, CE), habilitations (FIMO, ADR) et type de contrat recherché.',
    },
    {
      icon: ShieldCheck,
      title: '2. Visualisez le profil',
      desc: "Consultez les compétences, l'expérience détaillée et la validité des documents administratifs (permis, FIMO) sur une fiche de compétences anonyme.",
    },
    {
      icon: Unlock,
      title: '3. Débloquez & Recrutez',
      desc: 'Débloquez le contact pour 4,99 € (ou en illimité via le forfait) pour obtenir le nom, e-mail, téléphone et télécharger directement les justificatifs officiels.',
    },
  ];

  const stepsCandidate = [
    {
      icon: UserPlus,
      title: '1. Inscrivez-vous gratuitement',
      desc: 'Créez votre profil professionnel en 2 minutes en indiquant vos permis, formations de conduite et votre secteur géographique.',
    },
    {
      icon: ShieldCheck,
      title: '2. Restez anonyme',
      desc: 'Vos coordonnées (nom, téléphone, e-mail) et vos documents restent totalement masqués pour vous prémunir du spam ou des appels indésirables.',
    },
    {
      icon: UserCheck,
      title: '3. Soyez contacté en direct',
      desc: "Les transporteurs intéressés débloquent votre profil. Vous êtes notifié et mis en relation directe avec l'entreprise pour passer votre entretien.",
    },
  ];

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pb-32 bg-white border-b border-slate-100">
        {/* Pattern dots moderne */}
        <div className="absolute inset-0 bg-dots opacity-[0.35] pointer-events-none" />
        {/* Halo orange subtil */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Mise en relation directe
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Comment fonctionne FretTalent ?
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Une plateforme éthique, performante et sans intermédiaire qui
            connecte les entreprises de transport et les conducteurs routiers.
          </p>
        </div>
      </section>

      {/* PARCOURS ENTREPRISES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Pour les recruteurs
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Recrutez vos chauffeurs en quelques clics
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Fini les coefficients d'intérim exorbitants et les CV non
              qualifiés. Trouvez directement les conducteurs possédant les
              permis requis à proximité de vos dépôts.
            </p>
          </div>
          <div className="lg:col-span-5 flex lg:justify-end">
            <Link
              href="/register?role=recruiter"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Je crée un compte entreprise
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stepsRecruiter.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <div className="bg-orange-50 text-orange-500 p-4 rounded-2xl w-14 h-14 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PARCOURS CHAUFFEURS */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                Pour les conducteurs
              </span>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Valorisez votre profil en toute sécurité
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Gardez la main sur vos données personnelles. Soyez visible
                uniquement des entreprises locales sérieuses sans dévoiler vos
                coordonnées à tout le monde.
              </p>
            </div>
            <div className="lg:col-span-5 flex lg:justify-end">
              <Link
                href="/register?role=candidate"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Je m'inscris gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stepsCandidate.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <div className="bg-orange-50 text-orange-500 p-4 rounded-2xl w-14 h-14 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RÉSULTAT DU DOSSIER COMPLET */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-10 rounded-3xl space-y-5 shadow-xl shadow-orange-500/25 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="text-2xl font-black text-white relative z-10">
            Une fluidité administrative garantie
          </h3>
          <p className="text-sm text-orange-50 max-w-3xl mx-auto leading-relaxed relative z-10">
            Grâce à l’intégration du{' '}
            <strong>Dossier Numérique Chauffeur</strong>, les candidats ne
            perdent plus de temps à renvoyer leurs documents par e-mail et les
            entreprises disposent instantanément de toutes les pièces
            obligatoires (permis de conduire C/CE, carte de qualification
            conducteur FIMO/FCO, carte chronotachygraphe) pour rédiger le
            contrat de travail.
          </p>
          <div className="flex justify-center gap-4 pt-2 relative z-10">
            <Link
              href="/register"
              className="px-7 py-3 rounded-full text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 transition-colors shadow-md"
            >
              Je crée mon compte
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
