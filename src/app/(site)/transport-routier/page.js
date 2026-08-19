import SeoLandingTemplate from '@/components/seo/SeoLandingTemplate';
import { seoPagesData } from '@/lib/seo-data';

const pageKey = 'transport-routier';
const data = seoPagesData[pageKey];

export const metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: {
    canonical: `https://www.frettalent.fr/${pageKey}`,
  },
  openGraph: {
    title: data.metaTitle,
    description: data.metaDescription,
    url: `https://www.frettalent.fr/${pageKey}`,
    siteName: 'FretTalent',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: data.metaTitle,
    description: data.metaDescription,
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.metaTitle,
    description: data.metaDescription,
    url: `https://www.frettalent.fr/${pageKey}`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.frettalent.fr' },
      { '@type': 'ListItem', position: 2, name: 'Transport Routier', item: `https://www.frettalent.fr/${pageKey}` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  },
];

export default function TransportRoutierPage() {
  return (
    <SeoLandingTemplate
      h1={data.h1}
      subtitle={data.subtitle}
      badgeText={data.badgeText}
      sections={data.sections}
      faqs={data.faqs}
      jsonLd={jsonLd}
    />
  );
}
