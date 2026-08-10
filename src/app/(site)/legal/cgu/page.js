import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Conditions Générales d'Utilisation | FretTalent",
  description: "CGU régissant l'utilisation des services de recrutement FretTalent.",
};

export default function CGU() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Conditions Générales d'Utilisation (CGU)
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">1. Objet et acceptation</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Les présentes CGU ont pour objet de définir les conditions dans lesquelles les utilisateurs (candidats et entreprises) accèdent et utilisent la plateforme FretTalent. L'inscription sur la plateforme emporte acceptation sans réserve des CGU.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">2. Activité de placement et conformité légale</h2>
          <p className="text-sm text-slate-650 font-semibold leading-relaxed bg-orange-50/50 p-4 border-l-4 border-orange-500 rounded-r-lg">
            FretTalent exerce une activité de placement au sens de l'article L5321-3 du Code du travail. À ce titre, le service est intégralement gratuit pour les candidats à la recherche d'un emploi. Aucune rétribution directe ou indirecte ne leur est demandée.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">3. Non-discrimination et modération</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Conformément aux dispositions relatives à la non-discrimination (articles L5321-2 et L1132-1 du Code du travail), aucun profil ou offre d'emploi ne saurait contenir d'informations basées sur des critères discriminatoires. FretTalent se réserve le droit de modérer, suspendre ou supprimer tout compte en cas de non-respect de ces règles.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">4. Anonymisation et droit à l'oubli</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            FretTalent garantit l'anonymisation des profils de chauffeurs. Les informations personnelles ne sont transmises qu'après déblocage de contact payant par l'entreprise ou accord explicite. Chaque utilisateur dispose du droit de désactiver son profil ou d'en demander la suppression immédiate depuis son espace personnel.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
