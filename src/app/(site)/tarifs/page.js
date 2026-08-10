import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Tarifs Recrutement - Usage & Forfaits | FretTalent",
  description: "Tarification transparente pour recruter vos chauffeurs routiers : 2€ au contact débloqué ou forfait pro illimité.",
};

export default function Tarifs() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-950 sm:text-5xl">
              Nos Tarifs Entreprise
            </h1>
            <p className="text-slate-650 text-lg">
              Choisissez le modèle adapté à vos besoins en recrutement, sans engagement de durée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Carte 1 */}
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 relative space-y-6 shadow-sm hover:border-slate-200 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Paiement à l'usage</h3>
                <p className="text-sm text-slate-500">Idéal pour les recrutements ponctuels</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-950">2 €</span>
                <span className="text-sm text-slate-500">/ contact débloqué</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Zéro frais d'inscription
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Pas d'abonnement mensuel requis
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Payé en fin de mois par Stripe
                </li>
              </ul>
            </div>

            {/* Carte 2 */}
            <div className="bg-white border-2 border-orange-500 rounded-3xl p-8 relative space-y-6 shadow-md">
              <span className="absolute -top-3 right-6 bg-orange-500 text-white font-bold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full">
                Recommandé
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Forfait Pro</h3>
                <p className="text-sm text-slate-500">Idéal pour les recruteurs actifs</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-950">149 €</span>
                <span className="text-sm text-slate-500">/ mois</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Déblocages de profils illimités
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Support dédié prioritaire
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Sans engagement, résiliable en ligne
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
