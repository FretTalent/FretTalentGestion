import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Comment ça marche | FretTalent",
  description: "Découvrez le fonctionnement de la plateforme de recrutement FretTalent en 3 étapes.",
};

export default function CommentCaMarche() {
  const steps = [
    {
      title: "1. Profil anonyme",
      desc: "Le chauffeur crée son profil en quelques clics : permis, habilitations, zone de mobilité. Ses coordonnées (nom, prénom, e-mail, téléphone) restent masquées."
    },
    {
      title: "2. Recherche sur carte",
      desc: "L'entreprise localise les chauffeurs disponibles autour d'elle sur notre carte interactive à l'aide de filtres avancés (permis, expérience, distance)."
    },
    {
      title: "3. Contact débloqué",
      desc: "L'entreprise débloque l'accès aux coordonnées complètes du chauffeur en un clic. Facturation à l'usage, uniquement après validation de son empreinte de carte."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-950 sm:text-5xl">
              Comment ça marche ?
            </h1>
            <p className="text-slate-600 text-lg">
              Une mise en relation directe, éthique et performante en 3 étapes simples.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
