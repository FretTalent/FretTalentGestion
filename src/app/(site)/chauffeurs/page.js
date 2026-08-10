import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Chauffeur Routier - Inscription Gratuite | FretTalent",
  description: "Rejoignez FretTalent gratuitement. Soyez visible de manière 100% anonyme pour les entreprises proches de chez vous.",
};

export default function PourLesChauffeurs() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white border border-slate-205 rounded-3xl p-8 space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="text-center font-bold text-slate-800 text-sm border-b border-slate-100 pb-4">
                  Garantie d'anonymat FretTalent
                </div>
                <div className="space-y-2 text-xs text-slate-650">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Nom & Prénom masqués
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Numéro de téléphone masqué
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Adresse e-mail masquée
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold text-slate-950 sm:text-5xl">
                Votre profil, vos règles
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                L'inscription est 100% gratuite et prend moins de 2 minutes. Vos données personnelles restent strictement anonymes. Seule l'entreprise de votre choix peut accéder à vos informations une fois le déblocage validé.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">100% gratuit, sans aucun abonnement candidat</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">Visibilité contrôlable et désactivable en 1 clic</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">Données protégées et non revendues (conforme RGPD)</span>
                </div>
              </div>
              <div className="pt-4">
                <Link 
                  href="/register?role=candidate" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-slate-900 hover:bg-slate-950 shadow-lg transition-all"
                >
                  Je crée mon profil chauffeur
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
