import Link from 'next/link';
import {
  CheckCircle2,
  UserPlus,
  Eye,
  FileText,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'Emploi Chauffeur Routier France, Belgique, Luxembourg, Suisse (SPL / PL)',
  description:
    'Inscrivez-vous gratuitement en tant que chauffeur routier en France, Belgique, Luxembourg et Suisse. Valorisez vos permis C/CE, FIMO, ADR, Benne, Frigo, Citerne et soyez contacté directement et anonymement.',
};

export default function PourLesChauffeurs() {
  const steps = [
    {
      icon: UserPlus,
      title: '1. Inscription 100% Gratuite',
      desc: "Créez votre profil en 2 minutes. Renseignez vos permis (C, CE), vos habilitations (FIMO, ADR, etc.) et votre localisation en France, Belgique, Luxembourg ou Suisse. C'est totalement gratuit pour vous, sans aucun frais caché.",
    },
    {
      icon: Eye,
      title: '2. Profil Anonyme & Sécurisé',
      desc: 'Les transporteurs proches de chez vous consultent vos compétences, votre expérience et votre disponibilité réelle. Votre identité et vos coordonnées restent totalement masquées.',
    },
    {
      icon: FileText,
      title: '3. Contact Direct & Documents',
      desc: "Lorsqu'une entreprise est intéressée, elle débloque votre contact. Elle reçoit alors instantanément vos coordonnées et vos justificatifs (permis, carte conducteur, FIMO) pour vous proposer le poste.",
    },
  ];

  const docs = [
    { label: 'Permis C & CE (PL / SPL)', active: true },
    { label: 'FIMO & FCO à jour', active: true },
    { label: 'Carte Conducteur (Chrono)', active: true },
    { label: 'Spécialisation ADR (Matières Dangereuses)', active: true },
    { label: 'CV et attestations professionnelles', active: true },
  ];

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-b from-orange-50/20 via-slate-50 to-white border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texte Hero */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold">
                <Sparkles className="h-4 w-4" /> 100% Gratuit • France, Belgique, Luxembourg & Suisse
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-none">
                Trouvez votre prochain job de chauffeur routier{' '}
                <span className="text-orange-500 relative">
                  sans intermédiaire
                  <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-200/50 -z-10 rounded"></span>
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                FretTalent vous met directement en relation avec les transporteurs qui recrutent en France, en Belgique, au Luxembourg et en Suisse. Créez votre dossier professionnel sécurisé, restez anonyme et laissez les entreprises vous contacter.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/register?role=candidate"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Créer mon profil gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/candidats-disponibles"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-slate-900 border-2 border-slate-200 hover:border-slate-950 transition-all duration-300"
                >
                  Voir les candidats en direct
                </Link>
              </div>
            </div>

            {/* Carte Visuelle interactive avec photo du chauffeur */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative z-10 max-w-[280px] sm:max-w-[320px] mb-4 animate-in fade-in zoom-in-95 duration-500">
                <img
                  src="/images/chauffeur-fingers-crossed.png"
                  alt="Chauffeur FretTalent qui croise les doigts"
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xl w-full max-w-md relative space-y-3 hover:shadow-2xl transition-shadow duration-300">
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                  Profil Vérifié & Actif
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-600">
                    <Shield className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">
                      Chauffeur Routier Certifié
                    </h3>
                    <p className="text-xs text-slate-500">
                      France, Belgique, Luxembourg, Suisse
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium block">Disponibilité</span>
                    <span className="font-bold text-green-600 text-xs">Immédiate</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium block">Permis</span>
                    <span className="font-bold text-slate-800 text-xs">C / CE • ADR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Le Parcours en 3 étapes */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Comment ça fonctionne pour vous ?
          </h2>
          <p className="text-slate-600 text-base">
            Reprenez le contrôle de votre carrière et évitez les coups de fil
            incessants des agences d'intérim. Tout est transparent et sécurisé.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
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

      {/* Dossier Documentaire Chauffeur */}
      <section className="bg-slate-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Dossier Administratif Sécurisé
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Simplifiez vos démarches de recrutement
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Une fois votre profil créé, vous déposez vos documents officiels
              dans votre espace sécurisé. Lorsque vous acceptez d'être contacté
              par un transporteur, ce dossier complet lui est transmis
              directement pour accélérer votre embauche.
            </p>

            <div className="space-y-3 pt-2">
              {docs.map((doc, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-orange-500/20 text-orange-400 p-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">
                    {doc.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visuel d'illustration Coffre Fort / Lock */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-bold text-white">
                  Historique de vos partages
                </span>
              </div>
              <span className="text-xs text-slate-500">Mis à jour</span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">
                    Transports Lyon Fret SAS
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Demande d'accès acceptée le 10/08/2026
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                  Partagé
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between opacity-60">
                <div>
                  <div className="text-xs font-bold text-white">
                    Logistique Carrier Nord
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Demande de contact reçue
                  </div>
                </div>
                <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  En attente
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communauté Facebook Chauffeurs */}
      <section className="py-14 bg-blue-50/60 border-y border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-[#1877F2] text-xs font-bold uppercase tracking-wider">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Communauté Facebook FretTalent
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Échangez avec d'autres chauffeurs routiers
          </h3>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Suivez notre page Facebook officielle pour découvrir en direct les nouvelles offres d'emploi, partager votre quotidien sur la route et échanger des conseils entre professionnels du transport.
          </p>
          <div>
            <a
              href="https://www.facebook.com/profile.php?id=61593021909293"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Rejoindre notre page Facebook</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-white border-t border-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-955 tracking-tight">
            Prêt à trouver votre prochain contrat de route ?
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Rejoignez gratuitement la communauté FretTalent. Créez votre profil
            en 2 minutes et laissez les meilleures entreprises de transport vous
            proposer des postes adaptés.
          </p>

          <div className="pt-2">
            <Link
              href="/register?role=candidate"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Je m'inscris gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
