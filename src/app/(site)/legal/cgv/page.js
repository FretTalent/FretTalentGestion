import React from 'react';

export const metadata = {
  title: 'Conditions Générales de Vente (CGV) | FretTalent',
  description: 'Conditions Générales de Vente applicables aux services payants proposés aux entreprises sur FretTalent.',
};

export default function CGV() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Conditions Générales de Vente (CGV) B2B
          </h1>
          <p className="text-sm text-slate-500">Date de dernière mise à jour : 12 Août 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Préambule et Objet</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Les présentes Conditions Générales de Vente (ci-après les "CGV") s'appliquent de façon exclusive aux relations commerciales actuelles et futures existant entre <strong>Mr Gabin NICAISE</strong>, Entrepreneur Individuel, dont le siège social est situé au 7 RUE DE BOIS, 02270 PARGNY-LES-BOIS (SIRET : 809 784 754 00065), ci-après "Le Prestataire", et toute personne morale (entreprise, société de transport, etc.) agissant exclusivement à des fins professionnelles, ci-après "Le Client".
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Les présentes CGV visent à définir les modalités de souscription, de fourniture et de paiement des services proposés sur la plateforme <em>FretTalent</em> (abonnement mensuel, paiement au déblocage de profil). La validation d'une commande par le Client implique l'adhésion irrévocable, pleine et entière aux présentes CGV.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 1 : Description des Services</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Le Prestataire propose au Client, via la plateforme FretTalent, des services numériques visant à faciliter le recrutement de personnel dans le secteur du transport. Les services payants (ci-après les "Services") se déclinent selon trois formules :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Paiement au déblocage :</strong> Permet au Client, de manière ponctuelle et sans engagement récurrent, d'accéder aux coordonnées complètes et documents d'un profil candidat spécifique moyennant la facturation d'un montant forfaitaire.</li>
            <li><strong>Forfait Pro :</strong> Abonnement mensuel offrant un accès étendu aux fonctionnalités de recrutement, la gestion d'offres et l'accès à la CVthèque sous les limites indiquées sur le site.</li>
            <li><strong>Forfait Premium Plus :</strong> Abonnement mensuel offrant l'intégralité du Forfait Pro avec des avantages supplémentaires : mise en avant du logo entreprise, ajout d'articles sur la constitution de flotte, mise en avant prioritaire des offres d'emploi, et support dédié prioritaire.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 2 : Tarification</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Les tarifs des Services sont indiqués sur le Site en Euros (€) et sont exprimés Hors Taxes (HT). Étant donné le statut de micro-entrepreneur du Prestataire, <strong>la TVA est non applicable, article 293 B du CGI</strong> (sauf modification du régime fiscal auquel cas la TVA au taux en vigueur sera appliquée et les prix seront exprimés en TTC).
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li>Paiement au déblocage : 2,00 € par candidat débloqué.</li>
            <li>Forfait Pro : 39,99 € / mois.</li>
            <li>Forfait Premium Plus : 54,99 € / mois.</li>
          </ul>
          <p className="text-base text-slate-600 leading-relaxed">
            Le Prestataire se réserve le droit de modifier ses tarifs à tout moment. Toutefois, pour les abonnements en cours, le tarif appliqué sera celui en vigueur au moment de la souscription ou du dernier renouvellement, sauf notification préalable d'une hausse tarifaire avec possibilité de résiliation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 3 : Modalités de Paiement et Sécurité</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Le règlement des achats s'effectue exclusivement par carte bancaire via le prestataire de paiement sécurisé <strong>Stripe</strong>. Les coordonnées bancaires du Client sont cryptées selon les normes de sécurité en vigueur et ne sont à aucun moment stockées ni directement accessibles par le Prestataire.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Dans le cadre du Forfait Pro et Premium Plus, le paiement est exigible immédiatement à la souscription, puis prélevé mensuellement à la date anniversaire via tacite reconduction.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Dans le cadre du "Paiement au déblocage", si le Client a enregistré une méthode de paiement valide sur son compte, la carte est débitée automatiquement à chaque action de déblocage effectuée par le Client sur le Site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 4 : Durée, Renouvellement et Résiliation</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            <strong>Durée :</strong> Les abonnements (Pro et Premium Plus) sont conclus pour une durée d'un (1) mois à compter de la validation du paiement.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            <strong>Renouvellement tacite :</strong> L'abonnement se renouvelle par tacite reconduction pour des périodes successives d'un mois, sauf dénonciation par le Client.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            <strong>Résiliation :</strong> Le Client peut résilier son abonnement à tout moment et sans frais depuis son espace "Paramètres" (Rubrique Abonnement). La résiliation prendra effet à l'échéance de la période de facturation en cours. Aucun prorata temporis ne sera remboursé pour le mois entamé.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 5 : Absence du Droit de Rétractation</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Conformément aux dispositions légales en vigueur, le Client agissant dans le cadre de son activité professionnelle (B2B) ne bénéficie pas du droit de rétractation prévu par le Code de la Consommation. Par ailleurs, s'agissant de la fourniture d'un contenu numérique non fourni sur un support matériel et d'un service dont l'exécution commence immédiatement après l'achat, l'achat est ferme, définitif et non remboursable dès l'acceptation de la commande.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 6 : Responsabilité et Force Majeure</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Le Prestataire ne garantit en aucun cas l'embauche d'un candidat, les compétences effectives de ce dernier, ni le bon déroulement du processus de recrutement, son rôle se limitant à la mise à disposition technique d'un outil de mise en relation.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            La responsabilité du Prestataire, dans le cas où elle serait reconnue par une juridiction compétente, est expressément limitée au montant des sommes effectivement payées par le Client pour les Services concernés au cours des trois (3) mois précédant le fait générateur du dommage. En aucun cas, le Prestataire ne saurait être tenu responsable des dommages indirects, commerciaux ou financiers, ni des pertes de données, de chiffre d'affaires, de bénéfices ou de clientèle.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Aucune des parties ne pourra être tenue pour responsable si l'exécution de ses obligations est retardée ou empêchée en raison d'un cas de force majeure tel que défini par la jurisprudence française.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 7 : Droit Applicable et Litiges</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Les présentes Conditions Générales de Vente et les opérations qui en découlent sont régies et soumises au droit français.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            En cas de litige ou de différend relatif à l'interprétation, l'exécution ou la rupture des présentes CGV, les parties s'engagent à rechercher préalablement une solution amiable. À défaut d'accord amiable dans un délai de trente (30) jours, tout litige sera porté <strong>exclusivement devant le Tribunal de Commerce de Saint-Quentin (02)</strong>, y compris en cas de référé, d'appel en garantie ou de pluralité de défendeurs.
          </p>
        </section>
      </main>
    </div>
  );
}
