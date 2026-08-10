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
        </div>
      </main>
    </div>
  );
}
