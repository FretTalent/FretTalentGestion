import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
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
    default: 'FretTalent - Recrutement Chauffeurs Routiers (France & Belgique)',
    template: '%s | FretTalent',
  },
  description:
    'Le 1er réseau de recrutement en direct pour chauffeurs routiers (SPL, PL, Benne, Frigo, Citerne ADR) et entreprises de transport en France 🇫🇷 et en Belgique 🇧🇪. Compatible SIRET & BCE.',
  keywords: [
    'recrutement chauffeur routier france',
    'recrutement chauffeur poids lourd belgique',
    'emploi transport routier',
    'chauffeur spl france belgique',
    'conducteur poids lourd bce siret',
    'emploi benne frigo citerne adr',
    'fret talent',
  ],
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'HaOFAtVy2hTWaEMQwIe99GOYa82kYu0inM7cgWsnIp4',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'FretTalent - Recrutement Chauffeurs Routiers (France & Belgique)',
    description:
      'Mise en relation directe sans intermédiaire pour chauffeurs et transporteurs en France 🇫🇷 et en Belgique 🇧🇪. 100% gratuit pour les chauffeurs.',
    url: 'https://www.frettalent.fr',
    siteName: 'FretTalent',
    images: [
      {
        url: 'https://www.frettalent.fr/logo.png',
        width: 800,
        height: 600,
        alt: 'FretTalent Logo',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    name: 'FretTalent',
    url: 'https://www.frettalent.fr',
    logo: 'https://www.frettalent.fr/logo.png',
    description:
      'Plateforme de recrutement en direct pour les chauffeurs routiers et transporteurs en France et en Belgique.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '7 RUE DE BOIS',
      addressLocality: 'PARGNY-LES-BOIS',
      postalCode: '02270',
      addressCountry: 'FR',
    },
    areaServed: ['FR', 'BE'],
    priceRange: '€',
  };

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#334155',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '16px',
              boxShadow:
                '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
