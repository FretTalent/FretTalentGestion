import React from 'react';

export const metadata = {
  title: 'Mentions Légales | FretTalent',
  description: 'Mentions légales et informations réglementaires de la plateforme FretTalent, éditée par Gabin NICAISE.',
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Mentions Légales
          </h1>
          <p className="text-sm text-slate-500">Dernière mise à jour : 12 Août 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">1. Informations légales et Éditeur du Site</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Conformément aux dispositions de l'article 6-III et 19 de la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (dite L.C.E.N.), il est porté à la connaissance des utilisateurs et visiteurs de la plateforme <strong>FretTalent</strong> (ci-après le "Site"), accessible à l'adresse <em>https://www.frettalent.fr</em>, les présentes mentions légales.
          </p>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2 text-sm text-slate-700">
            <p><strong>Éditeur et Propriétaire :</strong> Mr NICAISE Gabin</p>
            <p><strong>Forme Juridique :</strong> Entrepreneur Individuel (Micro-entreprise)</p>
            <p><strong>Date de Création :</strong> 16 avril 2026</p>
            <p><strong>SIREN :</strong> 809 784 754</p>
            <p><strong>SIRET du siège social :</strong> 809 784 754 00065</p>
            <p><strong>Adresse du siège social :</strong> 7 RUE DE BOIS, 02270 PARGNY-LES-BOIS, France</p>
            <p><strong>Directeur de la publication :</strong> Gabin NICAISE</p>
            <p><strong>Contact e-mail :</strong> support@frettalent.fr</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">2. Hébergement du Site</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            L'hébergement de la plateforme FretTalent est assuré par la société :
          </p>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2 text-sm text-slate-700">
            <p><strong>Vercel Inc.</strong></p>
            <p>340 S Lemon Ave #4133</p>
            <p>Walnut, CA 91789, États-Unis</p>
            <p><strong>Site Web :</strong> <a href="https://vercel.com" className="text-blue-600 hover:underline">https://vercel.com</a></p>
          </div>
          <p className="text-base text-slate-600 leading-relaxed">
            Les bases de données sont quant à elles hébergées sur des serveurs sécurisés par <strong>Supabase</strong>, dont les datacenters pour FretTalent sont localisés au sein de l'Union Européenne afin de garantir la conformité avec la réglementation sur la protection des données.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">3. Propriété Intellectuelle et Contrefaçons</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            M. Gabin NICAISE est propriétaire exclusif des droits de propriété intellectuelle et détient les droits d'usage sur tous les éléments accessibles sur le site internet (notamment les textes, images, graphismes, logos, vidéos, architecture, icônes et sons), à l'exception des marques, logos ou contenus appartenant à des sociétés tierces ou aux utilisateurs.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est formellement interdite, sauf autorisation écrite préalable de M. Gabin NICAISE.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">4. Limitation de Responsabilité</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            M. Gabin NICAISE ne pourra être tenu pour responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site <em>https://www.frettalent.fr</em>.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            M. Gabin NICAISE décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur <em>https://www.frettalent.fr</em>. L'éditeur s'engage à sécuriser au mieux le site, cependant sa responsabilité ne pourra être mise en cause si des données indésirables sont importées et installées sur son site à son insu.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Des espaces interactifs (tels que la messagerie interne, les profils candidats et les offres d'emploi) sont à la disposition des utilisateurs. M. Gabin NICAISE se réserve le droit de supprimer, sans mise en demeure préalable, tout contenu déposé dans cet espace qui contreviendrait à la législation applicable en France, en particulier aux dispositions relatives à la protection des données ou comportant des éléments discriminatoires.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">5. CNIL et Gestion des Données Personnelles</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Conformément aux dispositions de la loi 78-17 du 6 janvier 1978 modifiée par la loi n°2018-493 du 20 juin 2018 relative à la protection des données personnelles, ainsi qu'au Règlement Général sur la Protection des Données (RGPD : n° 2016-679), l'utilisateur du site <em>https://www.frettalent.fr</em> dispose d'un droit d'accès, de modification, de portabilité et de suppression des informations collectées.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Pour exercer ce droit, il convient d'envoyer un message à notre Délégué à la Protection des Données (DPO) : Gabin NICAISE, à l'adresse <strong>support@frettalent.fr</strong>.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Pour plus d'informations sur la façon dont nous traitons vos données (type de données, finalité, destinataire...), lisez notre <a href="/legal/confidentialite" className="text-blue-600 hover:underline">Politique de Confidentialité</a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">6. Droit Applicable et Attribution de Juridiction</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Tout litige en relation avec l'utilisation du site <em>https://www.frettalent.fr</em> est soumis au droit français. En dehors des cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents du ressort du siège social de l'éditeur (Tribunal de Commerce de Saint-Quentin).
          </p>
        </section>

      </main>
    </div>
  );
}
