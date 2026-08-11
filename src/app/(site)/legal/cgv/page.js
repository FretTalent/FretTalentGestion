export const metadata = {
  title: 'Conditions Générales de Vente | FretTalent',
  description:
    'CGV applicables aux entreprises clientes de la plateforme FretTalent.',
};

export default function CGV() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Conditions Générales de Vente (CGV) — Espace Entreprise
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            1. Tarification et modèle économique
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            La mise en relation s'effectue selon deux modèles possibles :
            <br />- **Paiement à l'usage** : Chaque déblocage de contact de
            chauffeur (accès au nom, téléphone et e-mail) est facturé à l'unité
            au tarif de 2,00 €.
            <br />- **Abonnement mensuel** : Forfait illimité facturé
            mensuellement selon la tarification en vigueur (49,99 €/mois).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            2. Empreinte bancaire obligatoire et facturation
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pour pouvoir utiliser le service et débloquer des contacts,
            l'entreprise doit obligatoirement renseigner une carte bancaire
            valide. L'authentification de la carte se fait par le biais d'un
            **Setup Intent Stripe** sécurisé.
            <br />
            La facturation intervient à terme échu en fin de mois civil pour la
            consommation accumulée. Le paiement est prélevé automatiquement par
            Stripe.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            3. Contestation et remboursement
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            En cas de contestation sur la validité ou la correspondance d'un
            profil débloqué (par exemple, si les coordonnées d'un chauffeur
            s'avèrent fausses ou inaccessibles), l'entreprise peut déposer un
            litige auprès du support client sous 7 jours. En cas d'erreur
            avérée, un avoir équivalent sera crédité sur la prochaine facture.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            4. Absence de droit de rétractation (B2B)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Les contrats conclus entre professionnels (B2B) ne bénéficient pas
            d'un droit de rétractation légal dès lors que le service commence
            immédiatement après le déblocage ou l'enregistrement de
            l'abonnement.
          </p>
        </section>
      </main>
    </div>
  );
}
