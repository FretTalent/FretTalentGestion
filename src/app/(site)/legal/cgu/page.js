import React from 'react';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation (CGU) | FretTalent',
  description: 'Conditions Générales d\'Utilisation de la plateforme de mise en relation FretTalent.',
};

export default function CGU() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Conditions Générales d'Utilisation (CGU)
          </h1>
          <p className="text-sm text-slate-500">Date de dernière mise à jour : 12 Août 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Préambule</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Les présentes Conditions Générales d'Utilisation (ci-après désignées "CGU") ont pour objet de définir les modalités et conditions dans lesquelles d'une part, M. Gabin NICAISE (ci-après l'"Éditeur") met à la disposition de ses utilisateurs la plateforme <strong>FretTalent</strong>, et d'autre part, la manière dont les utilisateurs accèdent et utilisent cette plateforme.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Toute connexion et utilisation de la plateforme FretTalent implique l'acceptation sans réserve des présentes CGU de la part de l'utilisateur. En cas de refus de ces conditions, l'utilisateur est prié de ne pas utiliser le site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 1 : Définitions</h2>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Plateforme / Site :</strong> désigne le site web accessible à l'adresse <em>https://www.frettalent.fr</em>.</li>
            <li><strong>Utilisateur :</strong> désigne toute personne physique ou morale accédant à la Plateforme.</li>
            <li><strong>Candidat :</strong> désigne un Utilisateur personne physique à la recherche d'opportunités professionnelles (chauffeur, exploitation, etc.) ayant créé un compte sur le Site.</li>
            <li><strong>Entreprise / Recruteur :</strong> désigne une entité morale ou physique (transporteur, commissionnaire...) utilisant la Plateforme à des fins de recrutement.</li>
            <li><strong>Contenu :</strong> désigne l'ensemble des éléments audiovisuels, textuels, photographiques, logiciels, bases de données constituant la Plateforme.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 2 : Objet de la Plateforme</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            FretTalent est une plateforme numérique spécialisée dans la mise en relation entre des entreprises du secteur du transport et de la logistique, et des professionnels ou candidats à la recherche d'un emploi dans ces secteurs. La Plateforme met à disposition des fonctionnalités permettant la diffusion d'offres d'emploi, la création de profils candidats, l'accès à une CVthèque anonymisée et la messagerie interne.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 3 : Accès aux services</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            La Plateforme est accessible gratuitement en tout lieu à tout Utilisateur ayant un accès à Internet. Tous les frais supportés par l'Utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            L'accès à certains services dédiés (tels que la gestion des offres, la consultation des profils candidats détaillés, la messagerie) nécessite la création d'un compte (Candidat ou Entreprise). La création de compte implique la fourniture d'informations exactes, sincères et à jour.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            L'Éditeur se réserve le droit de refuser l'accès, de suspendre ou de supprimer le compte de tout Utilisateur qui ne respecterait pas les présentes CGU, ou pour des raisons de sécurité ou de maintenance.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 4 : Obligations de l'Utilisateur</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            L'Utilisateur s'engage à utiliser la Plateforme et ses services de manière loyale, conformément à sa destination et aux lois en vigueur. Il s'interdit expressément de :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li>Diffuser des informations fausses, trompeuses ou mensongères dans son profil, ses offres d'emploi ou ses communications.</li>
            <li>Usurper l'identité d'un tiers, d'une entreprise ou utiliser un prête-nom.</li>
            <li>Utiliser les données de la Plateforme à des fins de prospection commerciale non sollicitée (spamming) ou d'extraction massive (scraping).</li>
            <li>Publier des contenus à caractère diffamatoire, injurieux, obscène, offensant, violent ou incitant à la haine ou à la discrimination.</li>
            <li>Tenter de porter atteinte à l'intégrité ou à la sécurité de l'infrastructure informatique de FretTalent.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 5 : Responsabilité de l'Éditeur</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            FretTalent intervient exclusivement en qualité d'intermédiaire technique fournissant une plateforme de mise en relation. L'obligation de l'Éditeur est une <strong>obligation de moyens</strong> et non de résultat.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            En aucun cas, FretTalent ne garantit l'aboutissement d'un recrutement, la véracité exhaustive des CV ou documents déposés par les Candidats (tels que le permis de conduire, la FIMO, la carte conducteur), bien que des efforts de modération soient effectués. Les Entreprises demeurent seules responsables des vérifications légales et réglementaires relatives à l'embauche du personnel.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            La responsabilité de l'Éditeur ne saurait être engagée en cas de dysfonctionnement du réseau, d'une panne d'hébergement, d'un cas de force majeure, ou encore en cas de dommages indirects (perte de chance, perte de données, préjudice financier) subis par l'Utilisateur.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 6 : Propriété Intellectuelle</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Les marques, logos, signes ainsi que tous les contenus du site (textes, images, sons) font l'objet d'une protection par le Code de la propriété intellectuelle. Toute reproduction, publication, copie des différents contenus est strictement interdite sans le consentement exprès de l'Éditeur.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            L'Utilisateur cède à titre gratuit et non exclusif à FretTalent le droit de reproduire, de représenter, d'adapter et de distribuer les contenus (annonces, profil, logo d'entreprise) qu'il publie sur le Site, pour le monde entier et pour la durée de protection légale des droits d'auteur, aux fins exclusives du bon fonctionnement du service et de sa promotion.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 7 : Données Personnelles</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            L'Éditeur accorde une importance primordiale au respect de la vie privée et s'engage à ce que la collecte et le traitement des données à caractère personnel soient conformes au Règlement (UE) 2016/679 (RGPD) et à la Loi Informatique et Libertés. Pour connaître le détail de la gestion de vos données et l'exercice de vos droits, veuillez consulter notre <a href="/legal/confidentialite" className="text-blue-600 hover:underline">Politique de Confidentialité</a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 8 : Liens Hypertextes</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Le Site peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. Les liens vers ces autres ressources vous font quitter le site FretTalent. L'Éditeur décline toute responsabilité quant au contenu, à l'exactitude ou à la légalité des sites tiers accessibles par ces liens.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 9 : Évolution des CGU</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            La Plateforme se réserve le droit de modifier unilatéralement et à tout moment le contenu des présentes CGU. Les Utilisateurs sont invités à les consulter régulièrement. En continuant d'utiliser les services après modification, l'Utilisateur accepte implicitement les nouvelles CGU.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Article 10 : Droit Applicable et Juridiction Compétente</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Les présentes CGU sont soumises à la loi française. En cas d'absence de résolution amiable d'un litige né entre les parties, et si l'Utilisateur agit en qualité de professionnel, compétence exclusive est attribuée aux tribunaux du ressort du Tribunal de Commerce de Saint-Quentin (02). Si l'Utilisateur est un consommateur (Candidat), les juridictions compétentes seront déterminées selon les règles du droit commun.
          </p>
        </section>
      </main>
    </div>
  );
}
