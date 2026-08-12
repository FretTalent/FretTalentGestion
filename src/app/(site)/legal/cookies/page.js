import React from 'react';

export const metadata = {
  title: 'Politique de gestion des Cookies | FretTalent',
  description: 'Informations concernant l\'utilisation des cookies sur la plateforme FretTalent.',
};

export default function Cookies() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Politique de gestion des Cookies
          </h1>
          <p className="text-sm text-slate-500">Dernière mise à jour : 12 Août 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">1. Qu'est-ce qu'un cookie ?</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Un "cookie" est un petit fichier texte ou traceur déposé et stocké sur le disque dur de votre terminal (ordinateur, smartphone, tablette) lors de la consultation de la plateforme FretTalent. Il permet à l'Éditeur du site de reconnaître votre navigateur pendant la durée de validité du cookie concerné et de mémoriser certaines informations (comme votre session de connexion) afin de faciliter votre navigation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">2. Les cookies utilisés sur FretTalent</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Conformément aux lignes directrices de la CNIL, FretTalent privilégie une approche minimaliste. Nous utilisons principalement des cookies <strong>strictement nécessaires</strong> au bon fonctionnement technique de la plateforme. Ceux-ci sont dispensés du recueil de votre consentement préalable car le service ne pourrait pas fonctionner sans eux.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mt-6">A. Cookies techniques et de session (Strictement nécessaires)</h3>
          <p className="text-base text-slate-600 leading-relaxed">
            Ces cookies sont indispensables pour naviguer sur FretTalent et utiliser ses fonctionnalités fondamentales :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Authentification et Sécurité :</strong> Cookies générés par <em>Supabase</em> permettant de maintenir votre session ouverte, de vous identifier de façon sécurisée lors de la navigation entre les pages, et de protéger vos données contre les accès non autorisés (ex: jetons CSRF).</li>
            <li><strong>Préférences UI :</strong> Cookies mémorisant brièvement certaines de vos interactions avec l'interface pour améliorer l'expérience utilisateur immédiate.</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mt-6">B. Cookies tiers sécurisés</h3>
          <p className="text-base text-slate-600 leading-relaxed">
            Pour les entreprises souscrivant à nos services payants, la plateforme intègre le module de paiement <strong>Stripe</strong>.
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Stripe :</strong> Lors du processus de paiement, Stripe peut déposer des cookies strictement nécessaires à la prévention de la fraude et à la sécurisation des transactions bancaires. Ces cookies sont encadrés par la <a href="https://stripe.com/fr/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">politique de cookies de Stripe</a>.</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mt-6">C. Cookies d'analyse (Exemptés de consentement ou avec consentement)</h3>
          <p className="text-base text-slate-600 leading-relaxed">
            Nous pouvons utiliser des outils de mesure d'audience (comme Vercel Analytics). Si ces outils produisent des statistiques agrégées et anonymes, ils entrent dans le cadre des exemptions de la CNIL. S'ils sont amenés à tracer le comportement individuel de manière approfondie, un bandeau de consentement explicite vous sera présenté lors de votre première visite.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">3. Durée de conservation</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            La durée de vie des cookies techniques de session est généralement limitée à votre session de navigation ou à quelques heures. Les cookies persistants (par exemple pour l'authentification "Se souvenir de moi") sont conservés pour une durée maximale de <strong>13 mois</strong>, conformément aux recommandations de la CNIL. Les informations collectées via ces cookies sont conservées au maximum 25 mois.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">4. Gestion et blocage des cookies</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Étant donné que la grande majorité des cookies utilisés par FretTalent sont strictement nécessaires au fonctionnement (connexion à l'espace personnel), les refuser ou les bloquer <strong>vous empêchera de vous connecter et d'utiliser la plateforme</strong>.
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Si vous souhaitez néanmoins configurer votre logiciel de navigation de manière à ce que les cookies soient rejetés ou que vous soyez averti avant leur installation, vous pouvez modifier les paramètres de votre navigateur :
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-600">
            <li><strong>Google Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies et autres données des sites.</li>
            <li><strong>Safari :</strong> Préférences &gt; Confidentialité &gt; Bloquer tous les cookies.</li>
            <li><strong>Mozilla Firefox :</strong> Options &gt; Vie privée et sécurité &gt; Cookies et données de sites.</li>
            <li><strong>Microsoft Edge :</strong> Paramètres &gt; Cookies et autorisations de site.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
