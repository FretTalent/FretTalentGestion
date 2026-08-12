export default function sitemap() {
  const baseUrl = 'https://www.frettalent.fr';

  const routes = [
    '',
    '/chauffeurs',
    '/entreprises',
    '/comment-ca-marche',
    '/tarifs',
    '/offres',
    '/faq',
    '/login',
    '/register',
    '/legal/mentions-legales',
    '/legal/cgu',
    '/legal/cgv',
    '/legal/confidentialite',
    '/legal/cookies',
  ];

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' || route === '/offres' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/chauffeurs' || route === '/entreprises' ? 0.9 : 0.8,
  }));
}
