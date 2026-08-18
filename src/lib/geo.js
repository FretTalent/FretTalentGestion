/**
 * Moteur de Géolocalisation & Calcul de Distance (Haversine)
 * FretTalent Platform
 */

/**
 * Calcule la distance en kilomètres entre deux coordonnées géographiques (Formule de Haversine)
 * @param {number} lat1 Latitude point 1
 * @param {number} lon1 Longitude point 1
 * @param {number} lat2 Latitude point 2
 * @param {number} lon2 Longitude point 2
 * @returns {number} Distance en kilomètres arrondie à une décimale
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === null || lat1 === undefined ||
    lon1 === null || lon1 === undefined ||
    lat2 === null || lat2 === undefined ||
    lon2 === null || lon2 === undefined
  ) {
    return Infinity;
  }

  const R = 6371.0; // Rayon moyen de la Terre en km
  const toRad = (angle) => (angle * Math.PI) / 180.0;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Géocode une adresse (ou code postal + ville) pour obtenir { latitude, longitude }
 * Utilise l'API Adresse gouv pour la France et Nominatim OpenStreetMap en fallback
 * @param {Object} params { address, postalCode, city, country }
 * @returns {Promise<{ latitude: number, longitude: number, formattedAddress: string } | null>}
 */
export async function geocodeAddress({ address = '', postalCode = '', city = '', country = 'FR' }) {
  const cleanCountry = (country || 'FR').toUpperCase().trim();
  const cleanCity = (city || '').trim();
  const cleanPostal = (postalCode || '').trim();
  const cleanAddress = (address || '').trim();

  // 1. Pour la France : API Adresse officielle (ultra rapide, gratuite, sans clé API)
  if (cleanCountry === 'FR') {
    try {
      const query = [cleanAddress, cleanPostal, cleanCity].filter(Boolean).join(' ');
      if (query.length > 2) {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1${
          cleanPostal ? `&postcode=${encodeURIComponent(cleanPostal)}` : ''
        }`;
        
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const [lon, lat] = feature.geometry.coordinates;
            return {
              latitude: lat,
              longitude: lon,
              formattedAddress: feature.properties.label || `${cleanPostal} ${cleanCity}, France`,
            };
          }
        }
      }
    } catch (err) {
      console.warn('[Geocoding] Erreur api-adresse.data.gouv.fr, fallback sur Nominatim:', err.message);
    }
  }

  // 2. Pour Belgique, Suisse, Luxembourg ou Fallback FR : OpenStreetMap Nominatim
  try {
    const queryParts = [];
    if (cleanAddress) queryParts.push(cleanAddress);
    if (cleanPostal) queryParts.push(cleanPostal);
    if (cleanCity) queryParts.push(cleanCity);
    
    const countryNames = {
      FR: 'France',
      BE: 'Belgique',
      LU: 'Luxembourg',
      CH: 'Suisse',
    };
    queryParts.push(countryNames[cleanCountry] || cleanCountry);

    const query = queryParts.join(', ');
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'FretTalent-Geocoding-Engine/1.0 (support@frettalent.fr)',
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const results = await res.json();
      if (results && results.length > 0) {
        const first = results[0];
        return {
          latitude: parseFloat(first.lat),
          longitude: parseFloat(first.lon),
          formattedAddress: first.display_name || `${cleanPostal} ${cleanCity}`,
        };
      }
    }
  } catch (err) {
    console.error('[Geocoding] Exception Nominatim:', err.message);
  }

  return null;
}

/**
 * Trouve toutes les entreprises dans un rayon donné (par défaut 50 km)
 * @param {any} supabaseClient Client Supabase avec privilèges
 * @param {number} userLat Latitude du chauffeur
 * @param {number} userLon Longitude du chauffeur
 * @param {number} radiusKm Rayon maximum en kilomètres (défaut: 50)
 * @returns {Promise<Array<object>>} Liste des entreprises dans le rayon, triées par priorité partenaire et distance
 */
export async function findNearbyCompanies(supabaseClient, userLat, userLon, radiusKm = 50) {
  if (!userLat || !userLon) return [];

  // Tenter d'abord la fonction RPC Postgres si disponible
  try {
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc('get_companies_within_radius', {
      user_lat: userLat,
      user_lon: userLon,
      max_radius_km: radiusKm,
    });

    if (!rpcError && Array.isArray(rpcData)) {
      return rpcData;
    }
  } catch (e) {
    console.warn('[findNearbyCompanies] Fallback JS pour le calcul de distance:', e.message);
  }

  // Fallback JavaScript : interroger la table `entreprises`
  const { data: companies, error } = await supabaseClient
    .from('entreprises')
    .select('*')
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error || !companies) {
    console.error('[findNearbyCompanies] Erreur récupération entreprises:', error);
    return [];
  }

  const matching = [];

  for (const comp of companies) {
    if (comp.latitude && comp.longitude) {
      const distance = calculateHaversineDistance(userLat, userLon, comp.latitude, comp.longitude);
      if (distance <= radiusKm) {
        matching.push({
          ...comp,
          distance_km: distance,
        });
      }
    }
  }

  // Tri : 1. Partenaires prioritaires en premier, 2. Du plus proche au plus éloigné
  matching.sort((a, b) => {
    if (a.is_partner === b.is_partner) {
      return a.distance_km - b.distance_km;
    }
    return a.is_partner ? -1 : 1;
  });

  return matching;
}
