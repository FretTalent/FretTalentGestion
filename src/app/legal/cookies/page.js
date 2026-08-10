import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Gestion des Cookies | FretTalent",
  description: "Politique d'usage des cookies et de consentement sur la plateforme FretTalent.",
};

export default function Cookies() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Politique relative aux Cookies
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">1. Qu'est-ce qu'un cookie ?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Un cookie est un petit fichier texte déposé sur votre ordinateur ou votre terminal mobile lors de la consultation d'un site internet. Il permet au site de se souvenir de vos actions et de vos préférences pour une période donnée.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">2. Cookies utilisés sur FretTalent</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Nous utilisons principalement deux catégories de cookies :
            <br />- **Cookies de session/fonctionnels (Essentiels)** : Ils permettent de mémoriser vos choix de connexion, l'état de connexion de votre compte candidat ou entreprise, et de sécuriser votre session.
            <br />- **Cookies de mesure d'audience** : Ils nous permettent de récolter des données statistiques anonymisées sur la fréquentation de nos pages pour en améliorer l'expérience utilisateur.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">3. Gestion de votre consentement</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Conformément aux directives de la CNIL, vous pouvez choisir d'accepter ou de refuser les cookies non essentiels (analyse/audience) lors de votre première visite via notre bandeau de cookies. Vous pouvez modifier vos préférences à tout moment en supprimant les cookies enregistrés par votre navigateur ou en modifiant les réglages de ce dernier.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
