/**
 * Service d'Extraction et d'Import des Entreprises de Transport Françaises (API SIRENE)
 * FretTalent Platform
 */

import { enrichCompanyEmail } from './email-enrichment';
import { geocodeAddress } from './geo';

export interface TransportCompanyRaw {
  nom_entreprise: string;
  email: string | null;
  telephone: string | null;
  siret: string | null;
  siren: string | null;
  pays: string;
  adresse: string;
  code_postal: string;
  ville: string;
  latitude: number | null;
  longitude: number | null;
  partenaire: boolean;
  code_naf: string;
}

export interface SireneFetchOptions {
  nafCodes?: string[];
  page?: number;
  perPage?: number;
  department?: string;
  enrichEmails?: boolean;
}

export interface SireneFetchResult {
  companies: TransportCompanyRaw[];
  page: number;
  perPage: number;
  totalResults: number;
  hasMore: boolean;
}

// Codes NAF officiels du transport routier de marchandises et logistique
export const TRANSPORT_NAF_CODES = [
  '49.41A', // Transports routiers de fret interurbains
  '49.41B', // Transports routiers de fret de proximité
  '52.10A', // Entreposage et stockage frigorifique
  '52.29A', // Messagerie, fret express
];

/**
 * Récupère un lot d'entreprises de transport depuis l'API officielle Recherche Entreprises gouv.fr (SIRENE)
 */
export async function fetchTransportCompaniesFromSirene(
  options: SireneFetchOptions = {}
): Promise<SireneFetchResult> {
  const {
    nafCodes = TRANSPORT_NAF_CODES,
    page = 1,
    perPage = 25,
    department,
    enrichEmails = false,
  } = options;

  const nafParam = encodeURIComponent(nafCodes.join(','));
  let url = `https://recherche-entreprises.api.gouv.fr/search?activite_principale=${nafParam}&page=${page}&per_page=${perPage}&etat_administratif=A`;

  if (department) {
    url += `&departement=${encodeURIComponent(department)}`;
  }

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'FretTalent-Transport-Importer/1.0 (support@frettalent.fr)',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Erreur API Recherche Entreprises (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const rawResults = data.results || [];
  const totalResults = data.total_results || 0;
  const companies: TransportCompanyRaw[] = [];

  for (const item of rawResults) {
    const siege = item.siege || {};
    const siret = siege.siret || (item.siren ? `${item.siren}00018` : null);
    const nomEntreprise = item.nom_raison_sociale || item.nom_complet || 'Entreprise de Transport';
    
    // Adresse
    const address = siege.adresse || siege.complement_adresse || '';
    const postalCode = siege.code_postal || '';
    const city = siege.libelle_commune || '';
    const nafCode = item.activite_principale || siege.activite_principale || '49.41A';

    // Coordonnées GPS fournies par l'API SIRENE ou fallback
    let lat: number | null = siege.latitude ? parseFloat(siege.latitude) : null;
    let lon: number | null = siege.longitude ? parseFloat(siege.longitude) : null;

    // Si les coordonnées ne sont pas fournies par SIRENE, géocoder l'adresse
    if ((!lat || !lon || isNaN(lat) || isNaN(lon)) && (address || postalCode || city)) {
      try {
        const geo = await geocodeAddress({
          address,
          postalCode,
          city,
          country: 'FR',
        });
        if (geo) {
          lat = geo.latitude;
          lon = geo.longitude;
        }
      } catch (geoErr) {
        console.warn(`[Geocoding] Fallback ignoré pour ${nomEntreprise}:`, geoErr);
      }
    }

    // Enrichissement Email (Optionnel ou automatique)
    let email: string | null = null;
    let phone: string | null = null;

    if (enrichEmails) {
      try {
        const enriched = await enrichCompanyEmail(nomEntreprise, item.siren);
        if (enriched.email) email = enriched.email;
        if (enriched.phone) phone = enriched.phone;
      } catch (err) {
        console.warn(`[Enrichment] Erreur enrichissement pour ${nomEntreprise}:`, err);
      }
    }

    companies.push({
      nom_entreprise: nomEntreprise,
      email: email,
      telephone: phone,
      siret: siret,
      siren: item.siren || null,
      pays: 'FR',
      adresse: address,
      code_postal: postalCode,
      ville: city,
      latitude: lat && !isNaN(lat) ? lat : null,
      longitude: lon && !isNaN(lon) ? lon : null,
      partenaire: false,
      code_naf: nafCode,
    });
  }

  const hasMore = page * perPage < totalResults;

  return {
    companies,
    page,
    perPage,
    totalResults,
    hasMore,
  };
}
