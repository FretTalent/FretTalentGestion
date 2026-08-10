import Link from "next/link";
import { CheckCircle2, Search } from "lucide-react";

export const metadata = {
  title: "Recruteur - Trouver un Chauffeur | FretTalent",
  description: "FretTalent pour les entreprises de transport et logistique. Recrutez localement au meilleur coût.",
};

export default function PourLesEntreprises() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <main className="flex-grow py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold text-slate-950 sm:text-5xl">
                Trouvez le bon chauffeur, sans perdre de temps
              </h1>
              <p className="text-slate-650 text-lg leading-relaxed">
                Filtrez les candidats selon vos critères objectifs : permis de conduire (PL/SPL), habilitations à jour (FIMO, ADR), type de contrat, localisation et rayon de mobilité. Payez uniquement à la performance ou via notre forfait mensuel illimité.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">Recherche locale géolocalisée</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">Paiement post-payé ultra-sécurisé via Stripe</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">Aucun frais d'inscription ou d'installation</span>
                </div>
              </div>
              <div className="pt-4">
                <Link 
                  href="/register?role=recruiter" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all"
                >
                  Je crée mon compte entreprise
                </Link>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6 shadow-inner">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-slate-700">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Recherche rapide</div>
                    <div className="text-sm font-bold text-slate-900">Permis CE + FIMO</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  84 disponibles
                </span>
              </div>
            </div>
          </div>

          {/* SECTION EDITORIALE COMPARATIVE: FRETTALENT VS INTERIM */}
          <div className="mt-20 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Comparatif & Analyse</span>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">
                Pourquoi FretTalent est l'alternative idéale à l'intérim traditionnel ?
              </h2>
              <p className="text-base text-slate-650 leading-relaxed">
                Dans le secteur du transport routier, le recours systématique aux agences d'intérim pèse lourdement sur la rentabilité des entreprises. FretTalent réinvente le recrutement en proposant un modèle direct, sans intermédiaires et orienté performance.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50/30 border-l-4 border-orange-500 rounded-r-2xl space-y-1">
                  <h4 className="text-base font-bold text-slate-900">Jusqu'à 10 fois moins cher</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Là où une agence d'intérim applique des coefficients multiplicateurs élevés sur chaque heure travaillée (représentant des milliers d'euros par mois), FretTalent vous facture seulement 2 € par contact qualifié ou un forfait fixe sans engagement.</p>
                </div>
                <div className="p-4 bg-slate-50 border-l-4 border-slate-400 rounded-r-2xl space-y-1">
                  <h4 className="text-base font-bold text-slate-900">Une spécialisation 100% Transport & Logistique</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Contrairement aux agences généralistes, notre plateforme est développée exclusivement pour les métiers de la route. Les profils intègrent nativement les permis PL/SPL, les habilitations ADR, la validité FIMO/FCO et la gestion de la carte chronotachygraphe.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 shadow-xl">
              <h3 className="text-lg font-bold text-white">FretTalent vs Intérim traditionnel</h3>
              <div className="divide-y divide-slate-800 text-sm">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-400">Coût de mise en relation</span>
                  <span className="font-bold text-orange-400">2 € unique (ou forfait)</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-400">Coût moyen Interim</span>
                  <span className="font-bold text-red-400">Coeff. de 1.8 à 2.2 par heure</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-400">Filtres métiers</span>
                  <span className="font-bold text-green-400">Spécifiques (Permis, FIMO, ADR)</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-400">Liberté contractuelle</span>
                  <span className="font-bold text-green-400">Directe (CDI, CDD, Intérim libre)</span>
                </div>
              </div>
              <div className="text-center pt-2">
                <Link href="/register?role=recruiter" className="text-base font-bold text-orange-400 hover:underline">
                  Créer mon compte entreprise gratuitement →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
