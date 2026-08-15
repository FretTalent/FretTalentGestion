export default function sitemap() {
  const baseUrl = 'https://www.frettalent.fr';

  const routes = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/candidats-disponibles', changeFrequency: 'daily', priority: 0.95 },
    { path: '/offres', changeFrequency: 'daily', priority: 0.95 },
    { path: '/chauffeurs', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/entreprises', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/tarifs', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/comment-ca-marche', changeFrequency: 'monthly', priority: 0.85 },
    { path: '/a-propos', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/login', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/register', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/legal/mentions-legales', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/legal/cgu', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/legal/cgv', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/legal/confidentialite', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/legal/cookies', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return routes.map(route => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
