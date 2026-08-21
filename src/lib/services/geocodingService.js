/**
 * Service Geocoding BAN (Base Adresse Nationale - API Gouv)
 * Permet de récupérer les coordonnées GPS (latitude, longitude) et d'obtenir le VRAI code postal d'une ville française.
 */

const CITY_POSTAL_MAP = {
  laon: '02000',
  'saint-quentin': '02100',
  'st-quentin': '02100',
  compiègne: '60200',
  compiegne: '60200',
  caen: '14000',
  beauvais: '60000',
  amiens: '80000',
  reims: '51100',
  lille: '50000',
  paris: '75001',
  lyon: '69001',
  marseille: '13001',
  toulouse: '31000',
  bordeaux: '33000',
  nantes: '44000',
  strasbourg: '67000',
  rennes: '35000',
  rouen: '76000',
  'le havre': '76600',
  metz: '57000',
  nancy: '54000',
  dijon: '21000',
  orléans: '45000',
  orleans: '45000',
  tours: '37000',
  poitiers: '86000',
  limoges: '87000',
  'clermont-ferrand': '63000',
  grenoble: '38000',
  nice: '06000',
  toulon: '83000',
  avignon: '84000',
  nîmes: '30000',
  nimes: '30000',
  montpellier: '34000',
  perpignan: '66000',
  soissons: '02200',
  hirson: '02500',
  'château-thierry': '02400',
  'chateau-thierry': '02400',
  senlis: '60300',
  creil: '60100',
  chantilly: '60500',
  'nogent-sur-oise': '60180',
  arras: '62000',
  calais: '62100',
  'boulogne-sur-mer': '62200',
  dunkerque: '59140',
  valenciennes: '59300',
  douai: '59500',
  cambrai: '59400',
  roubaix: '59100',
  tourcoing: '59200',
};

export function getPostalCodeForCity(city = '', defaultPostal = '') {
  if (!city) return defaultPostal || '75000';
  const cleanCity = city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (CITY_POSTAL_MAP[cleanCity]) {
    return CITY_POSTAL_MAP[cleanCity];
  }

  // Tenter une correspondance partielle
  for (const [key, code] of Object.entries(CITY_POSTAL_MAP)) {
    if (cleanCity.includes(key) || key.includes(cleanCity)) {
      return code;
    }
  }

  return defaultPostal || '75000';
}

export async function geocodeLocation(city = '', postalCode = '', address = '') {
  const query = `${address} ${postalCode} ${city} France`.trim();
  try {
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`,
      { headers: { 'User-Agent': 'FretTalentBot/1.0' } }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates; // [lng, lat]
        const properties = data.features[0].properties;

        return {
          latitude: coords[1],
          longitude: coords[0],
          postal_code: properties.postcode || getPostalCodeForCity(city, postalCode),
          city: properties.city || city,
          address: properties.name || address || city,
        };
      }
    }
  } catch (err) {
    console.error('[GeocodingService] Erreur BAN:', err.message);
  }

  return {
    latitude: null,
    longitude: null,
    postal_code: getPostalCodeForCity(city, postalCode),
    city: city || 'France',
    address: address || city,
  };
}
