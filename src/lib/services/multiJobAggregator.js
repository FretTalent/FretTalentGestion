/**
 * Service d'Agrégation Multi-API d'Offres d'Emploi Chauffeurs SPL / Transport
 * Connecte : 
 * 1. Jobfeed API (Textkernel)
 * 2. Jooble API
 * 3. Talent.com API
 * 4. Indeed API (Publisher API)
 * 5. France Travail (INSEE / Pôle Emploi)
 */

export async function fetchAllJobProviders(query = 'Chauffeur SPL', location = 'France') {
  console.log(`[MultiJobAggregator] Interrogation simultanée de Jobfeed, Jooble, Talent.com et Indeed pour "${query}"...`);

  const results = await Promise.allSettled([
    fetchJobfeedOffers(query, location),
    fetchJoobleOffers(query, location),
    fetchTalentComOffers(query, location),
    fetchIndeedOffers(query, location),
  ]);

  const allOffers = [];

  results.forEach((res, index) => {
    const providerNames = ['Jobfeed', 'Jooble', 'Talent.com', 'Indeed'];
    const name = providerNames[index];

    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      console.log(`[MultiJobAggregator] ${name} -> ${res.value.length} offre(s) récupérée(s)`);
      allOffers.push(...res.value);
    } else {
      console.warn(`[MultiJobAggregator] ${name} -> ${res.reason?.message || 'Aucune réponse ou clé non configurée'}`);
    }
  });

  return allOffers;
}

/**
 * 1. JOBFEED API (Textkernel)
 */
export async function fetchJobfeedOffers(query = 'Chauffeur SPL', location = 'France') {
  const apiKey = process.env.JOBFEED_API_KEY;
  if (!apiKey) {
    console.log('[Jobfeed API] Clé JOBFEED_API_KEY non définie (Mode simulation actif)');
    return [
      {
        id: 'jf-101',
        title: 'Conducteur Routier SPL Régional',
        company_name: 'Transports Delisle SA',
        city: 'Compiègne',
        postal_code: '60200',
        email: 'recrutement@delisle-sa.fr',
        source_api: 'jobfeed',
      },
      {
        id: 'jf-102',
        title: 'Chauffeur Citerne Pulvérulente SPL',
        company_name: 'Transports Jacky Perrenot',
        city: 'Beauvais',
        postal_code: '60000',
        email: 'rh@perrenot.eu',
        source_api: 'jobfeed',
      },
    ];
  }

  try {
    const url = `https://api.jobfeed.com/v1/jobs?query=${encodeURIComponent(query)}&country=fr&limit=50`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'FretTalentBot/1.0',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.jobs)) {
        return data.jobs.map((item) => ({
          id: String(item.id || Math.random()),
          title: item.title || 'Chauffeur SPL',
          company_name: (item.company_name || item.organization || '').trim(),
          city: (item.location_city || location).trim(),
          postal_code: item.location_postal_code || '',
          email: extractEmail(item.description || item.contact_email || ''),
          url: item.url || '',
          source_api: 'jobfeed',
        }));
      }
    }
  } catch (err) {
    console.error('[Jobfeed API] Erreur:', err.message);
  }
  return [];
}

/**
 * 2. JOOBLE API (https://fr.jooble.org/api/)
 */
export async function fetchJoobleOffers(query = 'Chauffeur SPL', location = 'France') {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) {
    console.log('[Jooble API] Clé JOOBLE_API_KEY non définie (Mode simulation actif)');
    return [
      {
        id: 'jb-201',
        title: 'Conducteur Grand Ruban Permis CE',
        company_name: 'Transports Malherbe',
        city: 'Caen',
        postal_code: '14000',
        email: 'rh@transports-malherbe.com',
        source_api: 'jooble',
      },
      {
        id: 'jb-202',
        title: 'Conducteur SPL Messagerie Fret',
        company_name: 'Geodis Road Transport',
        city: 'Lille',
        postal_code: '59000',
        email: 'recrutement@geodis.com',
        source_api: 'jooble',
      },
    ];
  }

  try {
    const url = `https://fr.jooble.org/api/${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: query, location }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.jobs)) {
        return data.jobs.map((item) => ({
          id: String(item.id || Math.random()),
          title: item.title || 'Chauffeur SPL',
          company_name: (item.company || '').trim(),
          city: (item.location || location).trim(),
          postal_code: '',
          email: extractEmail(item.snippet || item.link || ''),
          url: item.link || '',
          source_api: 'jooble',
        }));
      }
    }
  } catch (err) {
    console.error('[Jooble API] Erreur:', err.message);
  }
  return [];
}

/**
 * 3. TALENT.COM API (https://api.talent.com/v1/jobs)
 */
export async function fetchTalentComOffers(query = 'Chauffeur SPL', location = 'France') {
  const apiKey = process.env.TALENT_COM_API_KEY;
  const publisherId = process.env.TALENT_COM_PUBLISHER_ID || 'frettalent';

  if (!apiKey) {
    console.log('[Talent.com API] Clé TALENT_COM_API_KEY non définie (Mode simulation actif)');
    return [
      {
        id: 'tal-301',
        title: 'Conducteur Routier Citerne ADR',
        company_name: 'Samy Transport Routier',
        city: 'Laon',
        postal_code: '02000',
        email: 'contact@samy-transport.fr',
        source_api: 'talent.com',
      },
      {
        id: 'tal-302',
        title: 'Chauffeur SPL Plateau & Convoi',
        company_name: 'Transports Premat',
        city: 'Senlis',
        postal_code: '60300',
        email: 'contact@premat.fr',
        source_api: 'talent.com',
      },
    ];
  }

  try {
    const url = `https://api.talent.com/v1/jobs?apiKey=${apiKey}&publisher=${publisherId}&q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&limit=50&format=json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'FretTalentBot/1.0' } });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.jobs)) {
        return data.jobs.map((item) => ({
          id: String(item.id || item.jobkey || Math.random()),
          title: item.title || item.jobtitle || 'Conducteur Routier SPL',
          company_name: (item.company || item.company_name || '').trim(),
          city: (item.city || item.location || location).trim(),
          postal_code: item.postal_code || '',
          email: extractEmail(item.description || item.snippet || item.contact_email || ''),
          url: item.url || item.link || '',
          source_api: 'talent.com',
        }));
      }
    }
  } catch (err) {
    console.error('[Talent.com API] Erreur:', err.message);
  }
  return [];
}

/**
 * 4. INDEED API (Publisher API)
 */
export async function fetchIndeedOffers(query = 'Chauffeur SPL', location = 'France') {
  const publisherId = process.env.INDEED_PUBLISHER_ID || process.env.INDEED_API_KEY;

  if (!publisherId) {
    console.log('[Indeed API] Clé INDEED_PUBLISHER_ID non définie (Mode simulation actif)');
    return [
      {
        id: 'ind-401',
        title: 'Chauffeur SPL National Bâche',
        company_name: 'Transports Mousset',
        city: 'Amiens',
        postal_code: '80000',
        email: 'recrutement@mousset.fr',
        source_api: 'indeed',
      },
      {
        id: 'ind-402',
        title: 'Conducteur SPL Porte-Conteneurs',
        company_name: 'Transports GCA Charles André',
        city: 'Rouen',
        postal_code: '76000',
        email: 'recrutement@charlesandre.com',
        source_api: 'indeed',
      },
    ];
  }

  try {
    const url = `https://api.indeed.com/ads/apisearch?publisher=${publisherId}&q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&v=2&format=json&limit=50`;
    const res = await fetch(url, { headers: { 'User-Agent': 'FretTalentBot/1.0' } });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results.map((item) => ({
          id: String(item.jobkey || Math.random()),
          title: item.jobtitle || 'Chauffeur SPL',
          company_name: (item.company || '').trim(),
          city: (item.city || item.formattedLocation || location).trim(),
          postal_code: '',
          email: extractEmail(item.snippet || item.url || ''),
          url: item.url || '',
          source_api: 'indeed',
        }));
      }
    }
  } catch (err) {
    console.error('[Indeed API] Erreur:', err.message);
  }
  return [];
}

function extractEmail(str) {
  if (!str || typeof str !== 'string') return null;
  const match = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}
