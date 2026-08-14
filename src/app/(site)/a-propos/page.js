import Link from 'next/link';
import {
  Truck,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  FileCheck,
  Bell,
  ArrowRight,
  UserX,
  Clock,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'À propos de nous - L\'histoire de FretTalent par un Ancien Chauffeur',
  description:
    'Découvrez l\'histoire de FretTalent, fondée par Gabin, ancien chauffeur routier. Une solution née du terrain pour simplifier le recrutement et valoriser les conducteurs.',
};

export default function APropos() {
  const painPoints = [
    {
      icon: UserX,
      title: 'Des offres inadaptées',
      desc: 'Marre des agences d\'intérim qui proposent des missions éloignées ou ne correspondant pas aux souhaits du chauffeur.',
    },
    {
      icon: Clock,
      title: 'Des milliers de CV ignorés',
      desc: 'Sur Indeed, Leboncoin ou HelloWork, des milliers de candidatures s\'empilent sans aucune réponse, face à des recruteurs saturés.',
    },
    {
      icon: ShieldCheck,
      title: 'Perte de temps inutile',
      desc: 'Envoyer des CV à la chaîne à des entreprises qui ne recrutent même pas activement.',
    },
  ];

  const upcomingFeatures = [
    {
      icon: MapPin,
      title: 'Carte & Liste des Parkings Poids Lourds',
      desc: 'Un répertoire complet des aires de stationnement et services adaptés aux chauffeurs en France, Belgique, Luxembourg et Suisse.',
      status: 'Prochainement',
    },
    {
      icon: FileCheck,
      title: 'Gestion & Renouvellement de Permis',
      desc: 'FretTalent s\'occupe de tout : prise de rendez-vous chez le médecin agréé et démarches administratives pour la demande de permis gouvernementale.',
      status: 'En développement',
    },
    {
      icon: Bell,
      title: 'Alertes Expiration de Cartes & Titres',
      desc: 'Rappels automatiques avant l\'expiration de votre FIMO, FCO, Carte Chrono, Permis ou habilitation ADR.',
      status: 'Prochainement',
    },
  ];

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-semibold">
            <Sparkles className="h-4 w-4" /> Notre Histoire
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Né du terrain, créé par un <span className="text-orange-500">ancien chauffeur routier</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            FretTalent est né d'un constat simple et concret du quotidien sur la route : le recrutement dans le transport routier avait désespérément besoin de transparence, d'efficacité et de respect pour les conducteurs.
          </p>
        </div>
      </section>

      {/* Le Mot du Fondateur - Storytelling */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-200 pb-6">
            <div className="bg-orange-500 text-white p-4 rounded-2xl flex-shrink-0 shadow-lg shadow-orange-500/20">
              <Truck className="h-10 w-10" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Le Mot du Fondateur</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">Gabin — Fondateur de FretTalent</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Ancien Chauffeur Routier passionné</p>
            </div>
          </div>

          <div className="space-y-5 text-slate-700 text-base sm:text-lg leading-relaxed">
            <p>
              « En tant qu’ancien chauffeur routier, j’en avais marre. Marre de ne pas trouver d’emplois qui me convenaient réellement, marre des agences d’intérim qui vous proposent des missions dont vous ne voulez pas, et marre des plateformes comme Indeed, Leboncoin ou HelloWork où nous étions des milliers à postuler sans jamais recevoir la moindre réponse. »
            </p>
            <p>
              « Du côté des entreprises, les patrons et responsables d’exploitation sont trop occupés pour traiter 1 000 mails par jour. Résultat : des retours mails automatiques négatifs, des heures perdues à envoyer des CV à des entreprises qui ne recrutaient même pas activement. »
            </p>
            <p className="font-semibold text-slate-900 bg-orange-50 p-4 rounded-2xl border border-orange-100">
              💡 C’est là que j’ai pris la décision de créer <strong>FretTalent</strong> : inverser les rôles !
            </p>
            <p>
              Sur FretTalent, ce sont les entreprises qui choisissent les profils qualifiés avant de débloquer leurs coordonnées. Cela évite aux recruteurs de crouler sous des tonnes de CV inadaptés, et cela garantit aux candidats d'être contactés pour des postes réels et recrutés à leur juste valeur.
            </p>
          </div>
        </div>
      </section>

      {/* Le Constat du Terrain (Pain points) */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Pourquoi changer les choses ?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950">
              Les problèmes que nous résolvons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {painPoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform"
                >
                  <div className="bg-red-50 text-red-500 p-3.5 rounded-2xl w-12 h-12 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Les Nouveautés à Venir (Roadmap) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Roadmap & Projets futurs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950">
            L'avenir de FretTalent
          </h2>
          <p className="text-slate-600 text-base">
            FretTalent ne s'arrête pas là. Nous développons de nouveaux services conçus exclusivement pour simplifier la vie des chauffeurs français et belges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcomingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-orange-50 text-orange-600 p-3.5 rounded-2xl">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {feat.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Prêt à faire partie de l'aventure ?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Que vous soyez chauffeur ou transporteur, rejoignez le réseau qui valorise le transport routier en France, Belgique, Luxembourg et Suisse.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register?role=candidate"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Je suis Chauffeur (100% Gratuit)
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/register?role=recruiter"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-all duration-300"
            >
              Je suis Recruteur
            </Link>
          </div>

          <div className="pt-4">
            <a
              href="https://www.facebook.com/profile.php?id=61593021909293"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-slate-900 px-4 py-2 rounded-full border border-slate-800 hover:border-slate-700"
            >
              <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Suivez l'aventure FretTalent sur notre page Facebook →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
