import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  DollarSign,
  Briefcase,
  Clock,
  Bell,
  FileText,
  ShieldCheck,
  TrendingDown,
  Check,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'Tarifs Recrutement Chauffeurs France, Belgique, Luxembourg, Suisse',
  description:
    'Tarifs transparents pour recruter des chauffeurs routiers en France, Belgique, Luxembourg et Suisse. À la performance à 2€/contact ou forfaits illimités Pro et Premium.',
};

export default function Tarifs() {
  const jobboards = [
    {
      name: 'Indeed',
      cost: '150 € à 1 200 € / mois',
      ads: 'Limité / Payant CPC',
      docs: 'Non vérifiés',
      specialization: 'Généraliste',
      commitment: 'Frais au clic variables',
    },
    {
      name: 'Leboncoin',
      cost: '276 € à 1 500 € / mois',
      ads: "Payant à l'unité",
      docs: 'Indisponibles',
      specialization: 'Généraliste',
      commitment: "Paiement à la durée d'annonce",
    },
    {
      name: 'Monster',
      cost: '1 000 € à 2 000 € / mois',
      ads: 'Limité par licence',
      docs: 'Non vérifiés',
      specialization: 'Généraliste',
      commitment: 'Abonnement annuel rigide',
    },
    {
      name: 'Cadremploi / StepStone',
      cost: '2 000 € à 4 000 € / mois',
      ads: "Payant à l'annonce",
      docs: 'Non vérifiés',
      specialization: 'Cadres / Tertiaire',
      commitment: 'Contrat à engagement long',
    },
    {
      name: 'Talent.com',
      cost: 'Minimum 500 € / mois',
      ads: 'CPC publicitaire',
      docs: 'Indisponibles',
      specialization: 'Généraliste',
      commitment: 'Budget mensuel obligatoire',
    },
    {
      name: 'LinkedIn',
      cost: 'Minimum 300 € / mois',
      ads: 'Limité / CPC',
      docs: 'Non vérifiés',
      specialization: 'Réseau Pro Généraliste',
      commitment: 'Budget quotidien variable',
    },
  ];

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* En-tête des tarifs */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Tarifs clairs & sans engagement
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Des formules conçues pour les transporteurs
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Trouvez vos chauffeurs routiers selon vos besoins réels. Pas de
            commissions d'embauche, pas de frais cachés.
          </p>
        </div>
      </section>

      {/* Grille Tarifaire */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Formule à l'usage */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md relative">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-105 px-2.5 py-1 rounded-md">
                  Usage ponctuel
                </span>
                <h3 className="text-xl font-bold text-slate-950 mt-3">
                  À la performance
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Idéal pour combler des besoins en recrutement occasionnels.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 border-b border-slate-100 pb-6">
                <span className="text-4xl lg:text-5xl font-black text-slate-950 whitespace-nowrap">
                  2 €
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                  / contact
                </span>
              </div>

              <ul className="space-y-4 text-xs text-slate-650">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Accès complet aux coordonnées (Téléphone, E-mail, Nom)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      Déblocage des documents officiels obligatoires
                    </strong>{' '}
                    du candidat (Permis, FIMO, Carte...)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Zéro abonnement et aucun frais fixe récurrent</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Facturation post-payée Stripe en fin de mois au réel
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/register?role=recruiter"
                className="w-full inline-flex items-center justify-center py-3.5 rounded-xl text-xs font-bold text-slate-800 border-2 border-slate-200 hover:border-slate-950 transition-all text-center"
              >
                Commencer à l'usage
              </Link>
            </div>
          </div>

          {/* Formule Abonnement Pro */}
          <div className="bg-white border-2 border-orange-500 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative transform md:-translate-y-4 z-10">
            <span className="absolute -top-3.5 right-6 bg-orange-500 text-white font-bold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-full shadow-md">
              Recommandé par les transporteurs
            </span>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-md">
                  Recrutement Actif
                </span>
                <h3 className="text-xl font-bold text-slate-955 mt-3">
                  Forfait Illimité Pro
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Idéal pour les flottes actives qui recrutent régulièrement.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 border-b border-orange-100 pb-6">
                <span className="text-4xl lg:text-5xl font-black text-slate-955 whitespace-nowrap">
                  39,99 €
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                  / mois
                </span>
              </div>

              <ul className="space-y-4 text-xs text-slate-650">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      Déblocages et coordonnées candidats illimités
                    </strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Accès illimité aux documents officiels</strong>{' '}
                    (Permis, FIMO, chronotachygraphe, habilitations ADR...)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Publication d'offres d'emploi illimitée</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Alertes e-mail temps réel</strong> sur critères
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold text-orange-655">
                    Sans engagement, résiliable en 1 clic
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/register?role=recruiter"
                className="w-full inline-flex items-center justify-center py-3.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all duration-300 text-center hover:-translate-y-0.5"
              >
                Activer le Forfait Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Formule Abonnement Premium Plus */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative">
            <span className="absolute -top-3.5 right-6 bg-slate-900 text-white font-bold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-full shadow-md">
              Marque Employeur Forte
            </span>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                  Visibilité Maximale
                </span>
                <h3 className="text-xl font-bold text-slate-955 mt-3">
                  Forfait Premium Plus
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Idéal pour attirer les meilleurs profils et valoriser sa flotte.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 border-b border-slate-200 pb-6">
                <span className="text-4xl lg:text-5xl font-black text-slate-955 whitespace-nowrap">
                  54,99 €
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                  / mois
                </span>
              </div>

              <ul className="space-y-4 text-xs text-slate-650">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Toutes les options du Forfait Pro</strong> (Illimité)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mise en avant du logo entreprise</strong> sur le site
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Article sur mesure</strong> (flotte, salariés, avantages...)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mise en avant des offres d'emploi premium</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Support prioritaire</strong> dédié
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/register?role=recruiter"
                className="w-full inline-flex items-center justify-center py-3.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all duration-300 text-center hover:-translate-y-0.5"
              >
                Activer le Forfait Premium Plus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TABLEAU COMPARATIF : FRETALENT VS JOBBOARDS */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Analyse comparative des coûts
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              FretTalent vs Jobboards traditionnels
            </h2>
            <p className="text-slate-600 text-sm">
              Découvrez les différences de budget et de fonctionnalités entre
              les plateformes généralistes et notre solution dédiée au transport
              routier.
            </p>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 border-r border-slate-800">
                      Plateforme
                    </th>
                    <th className="p-4 border-r border-slate-800">
                      Coût Mensuel Estimé
                    </th>
                    <th className="p-4 border-r border-slate-800">
                      Offres d'emploi
                    </th>
                    <th className="p-4 border-r border-slate-800">
                      Justificatifs Candidats
                    </th>
                    <th className="p-4 border-r border-slate-800">
                      Spécialisation Transport
                    </th>
                    <th className="p-4">Facturation / Engagement</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {/* FretTalent en premier et mis en valeur */}
                  <tr className="bg-orange-50/40 font-semibold text-slate-900">
                    <td className="p-4 border-r border-slate-100 flex items-center gap-2 text-orange-600 font-bold">
                      <Sparkles className="h-4.5 w-4.5" /> FretTalent
                    </td>
                    <td className="p-4 border-r border-slate-100 text-slate-950 font-black">
                      49,99 € / mois
                    </td>
                    <td className="p-4 border-r border-slate-100 text-green-700">
                      Publication Illimitée
                    </td>
                    <td className="p-4 border-r border-slate-100 text-green-700">
                      Documents officiels vérifiés & illimités
                    </td>
                    <td className="p-4 border-r border-slate-100 text-green-700">
                      Oui (100% Métiers de la Route)
                    </td>
                    <td className="p-4 text-slate-850">
                      Aucun engagement / Aucun surcoût
                    </td>
                  </tr>

                  {/* Jobboards généraux */}
                  {jobboards.map((board, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 text-slate-650"
                    >
                      <td className="p-4 border-r border-slate-100 font-bold text-slate-800">
                        {board.name}
                      </td>
                      <td className="p-4 border-r border-slate-100 font-medium">
                        {board.cost}
                      </td>
                      <td className="p-4 border-r border-slate-100">
                        {board.ads}
                      </td>
                      <td className="p-4 border-r border-slate-100">
                        {board.docs}
                      </td>
                      <td className="p-4 border-r border-slate-100">
                        {board.specialization}
                      </td>
                      <td className="p-4">{board.commitment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analyse Détaillée */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" /> Analyse
                détaillée des coûts de diffusion
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Les jobboards traditionnels appliquent un modèle généraliste
                facturé soit à la durée d'affichage de l'annonce, soit au coût
                par clic (CPC) sans garantie de retour. Pour un poste de
                chauffeur routier, la concurrence sur les plateformes comme
                Indeed ou Leboncoin fait grimper les budgets d'acquisition
                (jusqu'à 1 500 € par mois pour une seule entreprise) pour des
                candidatures souvent non qualifiées (absence de permis, FIMO
                expirée).
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                FretTalent neutralise complètement ce risque financier : notre
                spécialisation transport permet de filtrer uniquement les
                candidats possédant les permis requis. De plus, notre abonnement
                unique à <strong>49,99 €</strong> offre une maîtrise parfaite de
                votre budget sans aucune facturation au clic ni engagement à
                long terme.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Synthèse des Économies Réalisées
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    Coût moyen mensuel Jobboard classique :
                  </span>
                  <span className="font-bold text-red-655">~ 650 €</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    Coût mensuel FretTalent Forfait :
                  </span>
                  <span className="font-bold text-green-600">49,99 €</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-900">
                    Économie mensuelle moyenne :
                  </span>
                  <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                    ~ 600 € / mois
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Conclusion orientée conversion */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">
                Pourquoi payer plus cher pour des profils non qualifiés ?
              </h4>
              <p className="text-xs text-slate-400 max-w-2xl">
                Bénéficiez dès aujourd'hui d'une plateforme métier configurée
                exclusivement pour le recrutement de transport routier. Dépôts
                illimités et accès au dossier administratif candidat complet.
              </p>
            </div>
            <Link
              href="/register?role=recruiter"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex-shrink-0"
            >
              Créer mon compte entreprise
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ ou Informations additionnelles */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="text-2xl font-bold text-slate-950">
          Une question sur nos forfaits ?
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          Notre équipe commerciale est disponible 7j/7 pour vous accompagner
          dans le paramétrage de vos offres et la configuration de votre tableau
          de bord.
        </p>
        <Link
          href="/comment-ca-marche"
          className="inline-flex items-center text-xs font-bold text-orange-500 hover:text-orange-600"
        >
          Découvrir le fonctionnement détaillé de la mise en relation →
        </Link>
      </section>

      <div className="text-center pb-8 text-xs text-slate-500 max-w-4xl mx-auto px-4">
        * Les tarifs affichés sont des prix nets. TVA non applicable, art. 293 B
        du CGI.
      </div>
    </div>
  );
}
