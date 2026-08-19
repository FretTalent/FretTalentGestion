export default function sitemap() {
  const baseUrl = 'https://www.frettalent.fr';

  const routes = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/candidats-disponibles', changeFrequency: 'daily', priority: 0.95 },
    { path: '/offres', changeFrequency: 'daily', priority: 0.95 },
    
    // Pages SEO Métiers & Thématiques
    { path: '/chauffeur-spl', changeFrequency: 'daily', priority: 0.9 },
    { path: '/chauffeur-pl', changeFrequency: 'daily', priority: 0.9 },
    { path: '/chauffeur-adr', changeFrequency: 'daily', priority: 0.9 },
    { path: '/chauffeur-frigo', changeFrequency: 'daily', priority: 0.9 },
    { path: '/chauffeur-benne', changeFrequency: 'daily', priority: 0.9 },
    { path: '/emploi-chauffeur', changeFrequency: 'daily', priority: 0.9 },
    { path: '/recrutement-transport', changeFrequency: 'daily', priority: 0.9 },
    { path: '/transporteurs-france', changeFrequency: 'daily', priority: 0.9 },
    { path: '/transport-routier', changeFrequency: 'daily', priority: 0.9 },
    { path: '/messagerie', changeFrequency: 'daily', priority: 0.9 },
    { path: '/fret-express', changeFrequency: 'daily', priority: 0.9 },

    // Pages SEO Régionales & Locales
    { path: '/chauffeur-spl-hauts-de-france', changeFrequency: 'daily', priority: 0.9 },
    { path: '/chauffeur-spl-aisne', changeFrequency: 'daily', priority: 0.9 },
    { path: '/transporteurs-hauts-de-france', changeFrequency: 'daily', priority: 0.9 },
    { path: '/transporteurs-aisne', changeFrequency: 'daily', priority: 0.9 },

    // Pages Institutionnelles
    { path: '/chauffeurs', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/entreprises', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/tarifs', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/comment-ca-marche', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/a-propos', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/login', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/register', changeFrequency: 'monthly', priority: 0.7 },
    
    // Pages Légales
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
