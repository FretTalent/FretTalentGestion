import Link from 'next/link';
import {
  CheckCircle2,
  Search,
  ShieldCheck,
  DollarSign,
  Users,
  ArrowRight,
  FileText,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'Recruter Chauffeur SPL & PL en Direct (Sans Intérim) | CVthèque France, Suisse, Belgique, Luxembourg | FretTalent',
  description:
    'Accédez à la CVthèque N°1 de chauffeurs routiers Super Poids Lourd (SPL / Permis CE) et Poids Lourd en France, Suisse, Belgique et Luxembourg. Validation SIRET/BCE/RCS/IDE, contact direct 4,99€ sans commission d\'intérim.',
  keywords: [
    'recruter chauffeur spl',
    'recrutement chauffeur super poids lourd',
    'cvtheque chauffeur routier',
    'trouver chauffeur permis ce',
    'recrutement transport routier france',
    'recruter conducteur spl suisse',
    'chauffeur poids lourd belgique',
  ],
  alternates: {
    canonical: 'https://www.frettalent.fr/entreprises',
  },
};

export default function PourLesEntreprises() {
  const benefits = [
    {
      icon: Search,
      title: 'Recherche Multicritères Précise',
      desc: 'Trouvez le candidat idéal en filtrant par permis (C, CE), habilitations (FIMO, FCO, ADR), type de contrat, localisation exacte et rayon de mobilité.',
    },
    {
      icon: ShieldCheck,
      title: 'Dossier Candidat Complet',
      desc: "Consultez les compétences clés, l'expérience de conduite, le statut administratif et la validité des documents (permis, FIMO, carte conducteur).",
    },
    {
      icon: DollarSign,
      title: 'Tarif à la Performance',
      desc: "Pas de frais de commission ni d'abonnement obligatoire. Payez seulement 4,99 € par contact qualifié débloqué ou optez pour notre forfait sans engagement.",
    },
  ];

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pattern" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texte de présentation */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="hero-badge">
                <Sparkles className="h-4 w-4" /> Recrutement Direct & Sans
                Intermédiaire
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-none">
                Recrutez vos chauffeurs routiers{' '}
                <span className="text-orange-500 relative">
                  au meilleur coût
                  <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-200/50 -z-10 rounded"></span>
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Accédez à notre base de conducteurs qualifiés et disponibles à
                proximité. Filtrez selon vos besoins réels et débloquez
                instantanément leurs coordonnées et justificatifs de conduite.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/register?role=recruiter"
                  className="btn-primary w-full sm:w-auto"
                >
                  Créer mon compte entreprise
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/tarifs"
                  className="btn-secondary w-full sm:w-auto"
                >
                  Consulter nos tarifs
                </Link>
              </div>
            </div>

            {/* Aperçu interactif du moteur de recherche */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-inner w-full max-w-md space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Recherche rapide
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        Permis CE + FIMO
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    84 disponibles
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Filtres actifs
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                      CE (Super Lourd)
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                      ADR Citerne
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                      Dispo : Immédiate
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-650">
                      <FileText className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Statut des documents
                      </div>
                      <div className="text-xs font-bold text-green-600">
                        Dossier vérifié & complet
                      </div>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Les Avantages Recruteurs */}
      <section className="section-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="section-title">
            Pourquoi recruter sur FretTalent ?
          </h2>
          <p className="text-slate-600 text-base">
            Profitez d'une mise en relation directe avec des profils
            pré-qualifiés et simplifiez vos processus d'embauche de chauffeurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="feature-card space-y-4 group"
              >
                <div className="bg-orange-50 text-orange-500 p-4 rounded-2xl w-14 h-14 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION COMPARATIVE: FRETTALENT VS INTERIM */}
      <section className="section-block-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="hero-badge">
                Comparatif & Analyse
              </span>
              <h2 className="section-title">
                Pourquoi FretTalent est l'alternative idéale à l'intérim
                traditionnel ?
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Dans le secteur du transport routier, le recours systématique
                aux agences d'intérim pèse lourdement sur la rentabilité des
                entreprises. FretTalent réinvente le recrutement en proposant un
                modèle direct, sans intermédiaires et orienté performance.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50/30 border-l-4 border-orange-500 rounded-r-2xl space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    Jusqu'à 10 fois moins cher
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Là où une agence d'intérim applique des coefficients
                    multiplicateurs élevés sur chaque heure travaillée
                    (représentant des milliers d'euros par mois), FretTalent
                    vous facture seulement 4,99 € par contact qualifié ou un
                    forfait fixe sans engagement.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border-l-4 border-slate-400 rounded-r-2xl space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    Une spécialisation 100% Transport & Logistique
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Contrairement aux agences généralistes, notre plateforme est
                    développée exclusivement pour les métiers de la route. Les
                    profils intègrent nativement les permis PL/SPL, les
                    habilitations ADR, la validité FIMO/FCO et la gestion de la
                    carte chronotachygraphe.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
                FretTalent vs Intérim traditionnel
              </h3>
              <div className="divide-y divide-slate-800 text-sm">
                <div className="py-3.5 flex justify-between">
                  <span className="text-slate-400">
                    Coût de mise en relation
                  </span>
                  <span className="font-bold text-orange-400">
                    4,99 € unique (ou forfait)
                  </span>
                </div>
                <div className="py-3.5 flex justify-between">
                  <span className="text-slate-400">Coût moyen Interim</span>
                  <span className="font-bold text-red-400">
                    Coeff. de 1.8 à 2.2 par heure
                  </span>
                </div>
                <div className="py-3.5 flex justify-between">
                  <span className="text-slate-400">Filtres métiers</span>
                  <span className="font-bold text-green-400">
                    Spécifiques (Permis, FIMO, ADR)
                  </span>
                </div>
                <div className="py-3.5 flex justify-between">
                  <span className="text-slate-400">Liberté contractuelle</span>
                  <span className="font-bold text-green-400">
                    Directe (CDI, CDD, Intérim libre)
                  </span>
                </div>
              </div>
              <div className="text-center pt-2">
                <Link
                  href="/register?role=recruiter"
                  className="text-base font-bold text-orange-400 hover:underline"
                >
                  Créer mon compte entreprise gratuitement →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section-block text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="section-title">
            Prêt à optimiser vos recrutements de conducteurs ?
          </h2>
          <p className="section-subtitle mx-auto">
            Rejoignez FretTalent aujourd'hui. Créez votre compte recruteur et
            commencez à chercher des chauffeurs disponibles immédiatement près
            de vos dépôts.
          </p>

          <div className="pt-2">
            <Link
              href="/register?role=recruiter"
              className="btn-primary"
            >
              Créer un compte entreprise gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
