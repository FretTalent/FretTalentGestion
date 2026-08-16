import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  metadataBase: new URL('https://www.frettalent.fr'),
  title: {
    default: 'Recrutement Chauffeur SPL & PL en Direct | Emploi Super Poids Lourd France, Suisse, Belgique, Luxembourg | FretTalent',
    template: '%s | FretTalent - Recrutement Chauffeur SPL',
  },
  description:
    'Recrutement en direct de chauffeurs routiers SPL (Super Poids Lourd - Permis CE), PL (Permis C), ADR, Frigo, Benne et Citerne en France, Suisse, Belgique et Luxembourg. Mise en relation directe sans agence d\'intérim, 100% gratuit pour les conducteurs.',
  keywords: [
    'recrutement chauffeur spl',
    'emploi chauffeur super poids lourd',
    'recrutement chauffeur spl suisse',
    'emploi chauffeur spl luxembourg',
    'recrutement chauffeur spl belgique',
    'emploi conducteur spl france',
    'chauffeur permis ce cdi',
    'recrutement chauffeur poids lourd',
    'chauffeur frigo spl',
    'conducteur benne tp spl',
    'chauffeur citerne adr spl',
    'offre emploi transport routier',
    'recruter chauffeur spl',
    'fret talent',
    'frettalent',
  ],
  authors: [{ name: 'FretTalent', url: 'https://www.frettalent.fr' }],
  creator: 'FretTalent',
  publisher: 'FretTalent',
  category: 'Employment',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.frettalent.fr',
    languages: {
      'fr-FR': 'https://www.frettalent.fr',
      'fr-BE': 'https://www.frettalent.fr',
      'fr-LU': 'https://www.frettalent.fr',
      'fr-CH': 'https://www.frettalent.fr',
      'nl-BE': 'https://www.frettalent.fr',
      'x-default': 'https://www.frettalent.fr',
    },
  },
  verification: {
    google: 'HaOFAtVy2hTWaEMQwIe99GOYa82kYu0inM7cgWsnIp4',
  },
  icons: {
    icon: [
      { url: '/favicon.png?v=2', type: 'image/png' },
      { url: '/favicon.ico?v=2' },
      { url: '/icon.png?v=2', type: 'image/png' },
    ],
    shortcut: ['/favicon.png?v=2', '/favicon.ico?v=2'],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Recrutement Chauffeur SPL & PL en Direct | FretTalent',
    description:
      'Recrutement en direct de chauffeurs routiers Super Poids Lourd (SPL / Permis CE) et transporteurs en France, Suisse, Belgique et Luxembourg. Zéro commission, 100% gratuit conducteurs.',
    url: 'https://www.frettalent.fr',
    siteName: 'FretTalent',
    images: [
      {
        url: 'https://www.frettalent.fr/og-image.png?v=3',
        width: 1200,
        height: 630,
        alt: 'FretTalent - Recrutement Chauffeur SPL et PL',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recrutement Chauffeur SPL & PL en Direct | FretTalent',
    description:
      'Recrutement direct de chauffeurs routiers Super Poids Lourd (SPL / Permis CE) en France, Suisse, Belgique et Luxembourg.',
    images: ['https://www.frettalent.fr/og-image.png?v=3'],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EmploymentAgency',
        '@id': 'https://www.frettalent.fr/#agency',
        name: 'FretTalent',
        url: 'https://www.frettalent.fr',
        logo: 'https://www.frettalent.fr/logo.png',
        image: 'https://www.frettalent.fr/og-image.png?v=3',
        description:
          'Plateforme de recrutement en direct pour les chauffeurs routiers SPL (Super Poids Lourd) et transporteurs en France, Suisse, Belgique et Luxembourg.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '7 RUE DE BOIS',
          addressLocality: 'PARGNY-LES-BOIS',
          postalCode: '02270',
          addressCountry: 'FR',
        },
        areaServed: [
          { '@type': 'Country', name: 'France' },
          { '@type': 'Country', name: 'Switzerland' },
          { '@type': 'Country', name: 'Belgium' },
          { '@type': 'Country', name: 'Luxembourg' },
        ],
        priceRange: '€',
        sameAs: [
          'https://www.facebook.com/profile.php?id=61593021909293',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.frettalent.fr/#website',
        url: 'https://www.frettalent.fr',
        name: 'FretTalent',
        description: 'Recrutement Chauffeur SPL et PL en France, Suisse, Belgique et Luxembourg',
        publisher: { '@id': 'https://www.frettalent.fr/#agency' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.frettalent.fr/offres?keyword={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FM3KS33QN1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-FM3KS33QN1');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col selection:bg-orange-500 selection:text-white">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
