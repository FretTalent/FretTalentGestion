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
    enrichEmails = true,
  } = options;

  // L'API officielle gouv.fr limite strictement `per_page` entre 1 et 25
  const safePerPage = Math.min(Math.max(Number(perPage) || 25, 1), 25);
  const nafParam = nafCodes.join(',');
  let url = `https://recherche-entreprises.api.gouv.fr/search?activite_principale=${nafParam}&page=${page}&per_page=${safePerPage}&etat_administratif=A`;

  // Gestion robuste du département
  if (department && typeof department === 'string' && department.trim() !== '') {
    const rawDept = department.trim().replace(/^0+/, ''); // enlève les zéros en tête pour tester
    const cleanDept = department.trim();
    if (cleanDept.length === 1 && !isNaN(Number(cleanDept))) {
      url += `&departement=0${cleanDept}`;
    } else if (cleanDept.length > 0) {
      url += `&departement=${encodeURIComponent(cleanDept)}`;
    }
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
    // Si un département est spécifié, vérifier si un établissement local actif correspond
    let targetEtablissement = item.siege || {};
    if (department && Array.isArray(item.matching_etablissements) && item.matching_etablissements.length > 0) {
      const openLocal = item.matching_etablissements.find((e: any) => e.etat_administratif === 'A' && e.code_postal?.startsWith(department));
      if (openLocal) {
        targetEtablissement = openLocal;
      }
    }

    const siret = targetEtablissement.siret || item.siege?.siret || (item.siren ? `${item.siren}00018` : null);
    const nomEntreprise = item.nom_raison_sociale || item.nom_complet || 'Entreprise de Transport';
    
    // Adresse
    const address = targetEtablissement.adresse || targetEtablissement.complement_adresse || item.siege?.adresse || '';
    const postalCode = targetEtablissement.code_postal || item.siege?.code_postal || '';
    const city = targetEtablissement.libelle_commune || item.siege?.libelle_commune || '';
    const nafCode = targetEtablissement.activite_principale || item.activite_principale || item.siege?.activite_principale || '49.41A';

    // Coordonnées GPS fournies par l'API SIRENE ou fallback
    let lat: number | null = targetEtablissement.latitude ? parseFloat(targetEtablissement.latitude) : (item.siege?.latitude ? parseFloat(item.siege.latitude) : null);
    let lon: number | null = targetEtablissement.longitude ? parseFloat(targetEtablissement.longitude) : (item.siege?.longitude ? parseFloat(item.siege.longitude) : null);

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
