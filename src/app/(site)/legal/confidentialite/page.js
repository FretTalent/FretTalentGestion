
export const metadata = {
  title: "Politique de Confidentialité | FretTalent",
  description: "Politique de protection des données personnelles de la plateforme FretTalent.",
};

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Politique de Confidentialité (RGPD)
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">1. Responsable du traitement</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Le responsable du traitement des données est la société FretTalent SAS, 10 Rue des Transports, 75001 Paris (délégué à la protection des données : support@frettalent.fr).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">2. Données collectées</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Conformément aux directives de la CNIL sur le recrutement, nous collectons uniquement les données strictement nécessaires au bon déroulement de la mise en relation professionnelle :
            <br />- **Candidats** : Ville/Code postal, Rayon de mobilité, Permis détenus, Habilitations professionnelles, Expérience, CV éventuel, Nom, Prénom, E-mail, Téléphone (coordonnées masquées par défaut).
            <br />- **Entreprises** : Raison sociale, SIRET, Nom du contact, E-mail de contact, Téléphone, Moyen de paiement (via Stripe).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">3. Base légale et destinataires</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Le traitement repose sur le consentement des candidats (profil) et l'exécution de mesures précontractuelles/contractuelles pour les entreprises.
            Les destinataires des données sont l'éditeur FretTalent, ainsi que nos sous-traitants techniques (Supabase pour l'hébergement de la base de données, Stripe pour les paiements).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">4. Vos Droits</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement complet de vos données (droit à l'oubli). Vous pouvez exercer ces droits à tout moment en nous envoyant un e-mail à support@frettalent.fr ou directement depuis les paramètres de votre compte candidat.
          </p>
        </section>
      </main>
    </div>
  );
}
