export const metadata = {
  title: 'Mentions Légales | FretTalent',
  description:
    'Mentions légales réglementaires de la plateforme de recrutement FretTalent.',
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Mentions Légales
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            1. Éditeur de la plateforme
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            La plateforme web **FretTalent** est éditée par la société
            FretTalent SAS, société par actions simplifiée au capital de 10 000
            €, immatriculée au Registre du Commerce et des Sociétés de Paris
            sous le numéro SIREN 123 456 789.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Siège social :</strong> 10 Rue des Transports, 75001 Paris,
            France.
            <br />
            <strong>Numéro de TVA intracommunautaire :</strong> FR 12 123456789.
            <br />
            <strong>Directeur de la publication :</strong> Gabin (Directeur
            Général).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">2. Hébergeur</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            La plateforme FretTalent est hébergée par la société **Vercel
            Inc.**, dont le siège social est situé à l'adresse suivante :<br />
            Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            <br />
            Site web : https://vercel.com
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">3. Contact</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pour toute question ou réclamation concernant l'utilisation du site,
            vous pouvez nous écrire à l'adresse e-mail dédiée :{' '}
            <strong>support@frettalent.fr</strong>.
          </p>
        </section>
      </main>
    </div>
  );
}
