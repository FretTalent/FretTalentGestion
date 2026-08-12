import React from 'react';

export const metadata = {
  title: 'Politique de Confidentialité | FretTalent',
  description: 'Politique de gestion et de protection des données personnelles (RGPD) de la plateforme FretTalent.',
};

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Politique de Confidentialité et Protection des Données Personnelles
          </h1>
          <p className="text-sm text-slate-500">Conforme au Règlement Général sur la Protection des Données (RGPD) - Dernière mise à jour : 12 Août 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Préambule</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Dans le cadre de ses activités et de l'exploitation de la plateforme <strong>FretTalent</strong> (ci-après le "Site"), M. Gabin NICAISE, agissant en qualité de responsable de traitement, s'engage à assurer la protection, la confidentialité et la sécurité des données à caractère personnel de ses Utilisateurs (candidats, recruteurs, visiteurs), dans le respect strict du Règlement Général sur la Protection des Données (RGPD - Règlement (UE) 2016/679) et de la loi Informatique et Libertés du 6 janvier 1978 modifiée.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            La présente politique vise à vous informer de manière transparente sur les finalités, le mode de collecte, la durée de conservation de vos données, ainsi que sur les droits dont vous disposez.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 1 : Responsable du Traitement</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Le responsable du traitement des données à caractère personnel collectées sur <em>https://www.frettalent.fr</em> est :<br />
            <strong>Mr Gabin NICAISE (EI)</strong><br />
            SIRET : 809 784 754 00065<br />
            Siège social : 7 RUE DE BOIS, 02270 PARGNY-LES-BOIS<br />
            E-mail de contact (Délégué à la Protection des Données) : <strong>support@frettalent.fr</strong>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 2 : Données Collectées</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Lors de votre navigation ou de votre utilisation de nos services, nous pouvons être amenés à collecter les catégories de données suivantes :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Données d'identification :</strong> nom, prénom, adresse e-mail, numéro de téléphone, entreprise, SIRET.</li>
            <li><strong>Données professionnelles (Candidats) :</strong> CV, type de permis, FIMO/FCO, carte conducteur, expériences professionnelles, ville, rayon de recherche.</li>
            <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, système d'exploitation, navigateur (mesures d'audience et sécurité).</li>
            <li><strong>Données transactionnelles :</strong> informations liées aux abonnements, historique des paiements (FretTalent ne stocke <strong>aucun</strong> numéro de carte bancaire, ces données étant chiffrées et gérées par notre prestataire certifié PCI-DSS, Stripe).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 3 : Finalités du Traitement</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Vos données sont collectées sur la base de votre consentement, de l'exécution d'un contrat, ou de l'intérêt légitime de FretTalent. Elles sont traitées pour les finalités suivantes :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li>Création, gestion et sécurisation de l'espace personnel.</li>
            <li>Mise en relation professionnelle (candidats / recruteurs) via la plateforme, la messagerie interne et la CVthèque.</li>
            <li>Gestion des offres d'emploi, des candidatures et du matching algorithmique.</li>
            <li>Gestion des abonnements, de la facturation et du traitement des paiements.</li>
            <li>Envoi d'e-mails de notification (nouveaux messages, candidatures, réinitialisation de mot de passe, alertes emploi).</li>
            <li>Analyse du trafic et amélioration technique de la plateforme.</li>
            <li>Prévention de la fraude et respect de nos obligations légales.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 4 : Destinataires des Données</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Dans le cadre exclusif des finalités décrites ci-dessus, vos données peuvent être transmises aux destinataires suivants :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Les Recruteurs :</strong> Si vous êtes candidat, les informations de votre profil (hors coordonnées dans la CVthèque anonyme) et de vos candidatures sont transmises aux entreprises. Les coordonnées sont débloquées par l'entreprise uniquement dans le cadre d'un recrutement.</li>
            <li><strong>Supabase :</strong> Hébergement sécurisé des bases de données et gestion de l'authentification (serveurs situés en UE).</li>
            <li><strong>Vercel :</strong> Hébergement web et infrastructure de l'application.</li>
            <li><strong>Stripe :</strong> Prestataire de services de paiement agissant en tant que sous-traitant pour la sécurisation des flux financiers.</li>
            <li><strong>Resend :</strong> Prestataire d'envoi d'e-mails transactionnels.</li>
          </ul>
          <p className="text-base text-slate-600 leading-relaxed">
            Nous ne vendons ni ne louons <strong>jamais</strong> vos données personnelles à des tiers à des fins commerciales ou publicitaires.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 5 : Durée de Conservation</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Vos données sont conservées pour une durée n'excédant pas celle nécessaire aux finalités pour lesquelles elles ont été collectées :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Données de compte :</strong> 3 ans après la dernière activité de l'Utilisateur sur la Plateforme (après quoi le compte et les données associées sont supprimés).</li>
            <li><strong>Pièces jointes et CV :</strong> Supprimés en même temps que le compte ou sur simple action manuelle depuis le profil.</li>
            <li><strong>Données de facturation (B2B) :</strong> 10 ans, conformément aux obligations légales de conservation comptable et fiscale en France.</li>
            <li><strong>Logs de connexion :</strong> Conservés pour une durée maximale de 1 an à des fins de sécurité.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 6 : Sécurité des Données</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            FretTalent met en œuvre l'ensemble des mesures techniques et organisationnelles appropriées (chiffrement des données en transit via SSL/TLS, chiffrement des mots de passe avec sel, accès restreint et authentifié aux bases de données via le RLS de Supabase) afin de garantir la sécurité, l'intégrité et la confidentialité de vos données personnelles, et de les protéger contre toute perte, destruction, ou accès non autorisé.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 7 : Vos Droits</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Conformément à la réglementation (Articles 15 à 22 du RGPD), vous disposez des droits suivants concernant vos données personnelles :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Droit d'accès :</strong> obtenir la confirmation que des données vous concernant sont traitées et y accéder.</li>
            <li><strong>Droit de rectification :</strong> demander la mise à jour de données inexactes ou incomplètes.</li>
            <li><strong>Droit à l'effacement ("droit à l'oubli") :</strong> demander la suppression de vos données personnelles (vous pouvez supprimer votre compte et toutes ses données d'un simple clic depuis vos "Paramètres" FretTalent).</li>
            <li><strong>Droit à la limitation du traitement :</strong> geler temporairement l'utilisation de certaines de vos données.</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et couramment utilisé.</li>
            <li><strong>Droit d'opposition :</strong> vous opposer à tout moment à un traitement pour des motifs légitimes, ou au traitement à des fins de prospection.</li>
          </ul>
          <p className="text-base text-slate-600 leading-relaxed">
            Pour exercer vos droits, vous pouvez effectuer ces actions directement depuis votre compte, ou contacter notre DPO par e-mail à : <strong>support@frettalent.fr</strong> (en joignant une copie d'une pièce d'identité en cours de validité en cas de doute raisonnable sur votre identité).
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous avez la possibilité d'adresser une réclamation à la CNIL (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr.
          </p>
        </section>
      </main>
    </div>
  );
}
