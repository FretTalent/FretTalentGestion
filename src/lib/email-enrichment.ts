/**
 * Module d'Enrichissement d'Emails Professionnels
 * FretTalent Platform
 * Sources :
 * 1. Hunter.io API (Free Tier)
 * 2. Abstract API Company Enrichment (Free Tier)
 * 3. Dropcontact API
 * 4. Clearbit Enrichment API
 * 5. Scanner DNS MX Réel (Vérifie l'existence réelle du serveur mail du domaine avant d'attribuer un email)
 */

import dns from 'dns';
import { promisify } from 'util';

const resolveMxAsync = promisify(dns.resolveMx);

interface EnrichmentResult {
  email: string | null;
  phone?: string | null;
  source?: string | null;
}

/**
 * Vérifie si un nom de domaine possède un serveur de messagerie (MX) actif et joignable
 */
export async function isDomainMailActive(domain: string): Promise<boolean> {
  if (!domain || domain.length < 4 || !domain.includes('.')) return false;
  try {
    const mxRecords = await resolveMxAsync(domain);
    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch (err) {
    return false;
  }
}

/**
 * Nettoie le nom de l'entreprise pour générer des variantes de domaines
 */
function sanitizeCompanyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(sas|sarl|sa|eurl|sasu|snc|sci|transports|transport|logistique|fret|groupe|france|services)\b/gi, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * 1. Recherche d'email via Hunter.io API (Clé gratuite HUNTER_API_KEY)
 */
async function findEmailViaHunter(
  companyName: string,
  domain?: string
): Promise<EnrichmentResult | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return null;

  try {
    const clean = sanitizeCompanyName(companyName);
    const targetDomain = domain || `${clean}.fr`;
    const res = await fetch(`https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(targetDomain)}&api_key=${apiKey}&limit=1`, {
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const firstEmail = data.data?.emails?.[0]?.value || null;
      if (firstEmail) {
        return { email: firstEmail, source: 'hunter.io' };
      }
    }
  } catch (err: any) {
    console.warn('[Hunter API] Warning:', err.message);
  }

  return null;
}

/**
 * 2. Recherche d'email via Abstract API (Clé gratuite ABSTRACT_API_KEY)
 */
async function findEmailViaAbstract(
  companyName: string,
  domain?: string
): Promise<EnrichmentResult | null> {
  const apiKey = process.env.ABSTRACT_API_KEY;
  if (!apiKey) return null;

  try {
    const clean = sanitizeCompanyName(companyName);
    const targetDomain = domain || `${clean}.fr`;
    const res = await fetch(`https://companyenrichment.abstractapi.com/v1/?api_key=${apiKey}&domain=${encodeURIComponent(targetDomain)}`, {
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const email = data.email || null;
      const phone = data.phone || null;
      if (email) {
        return { email, phone, source: 'abstractapi' };
      }
    }
  } catch (err: any) {
    console.warn('[Abstract API] Warning:', err.message);
  }

  return null;
}

/**
 * 3. Recherche d'email via Clearbit Enrichment API (Clé CLEARBIT_API_KEY)
 */
async function findEmailViaClearbit(
  companyName: string,
  domain?: string
): Promise<EnrichmentResult | null> {
  const apiKey = process.env.CLEARBIT_API_KEY;
  if (!apiKey) return null;

  try {
    const clean = sanitizeCompanyName(companyName);
    const targetDomain = domain || `${clean}.fr`;
    const res = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(targetDomain)}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const email = data.site?.emailAddresses?.[0] || data.email || null;
      const phone = data.phone || null;
      if (email) {
        return { email, phone, source: 'clearbit' };
      }
    }
  } catch (err: any) {
    console.warn('[Clearbit Enrichment] Warning:', err.message);
  }

  return null;
}

/**
 * 4. Recherche d'email via Dropcontact API (Clé DROPCONTACT_API_KEY)
 */
async function findEmailViaDropcontact(
  companyName: string,
  siren?: string
): Promise<EnrichmentResult | null> {
  const apiKey = process.env.DROPCONTACT_API_KEY;
  if (!apiKey) return null;

  try {
    const payload: Record<string, any> = {
      company: companyName,
      country: 'FR',
    };
    if (siren) payload.siren = siren;

    const res = await fetch('https://api.dropcontact.com/v1/enrich/company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const email = data.email || data.email_addresses?.[0]?.email || null;
      const phone = data.phone || null;
      if (email) {
        return { email, phone, source: 'dropcontact' };
      }
    }
  } catch (err: any) {
    console.warn('[Dropcontact Enrichment] Warning:', err.message);
  }

  return null;
}

/**
 * 5. Scanner DNS MX Réel : Teste les domaines réels du transporteur
 * Ne renvoie un email QUE SI LE DOMAINE EXISTE RÉELLEMENT ET POSSÈDE DES SERVEURS MX ACTIFS
 */
async function discoverVerifiedCompanyEmail(companyName: string): Promise<string | null> {
  const clean = sanitizeCompanyName(companyName);
  if (!clean || clean.length < 3) return null;

  // Liste des domaines plausibles pour cette entreprise
  const domainCandidates = [
    `${clean}.fr`,
    `${clean}.com`,
    `${clean}-transport.fr`,
    `transports-${clean}.fr`,
    `${clean}-transports.fr`,
    `${clean}-logistique.fr`,
    `groupe-${clean}.fr`,
    `${clean}transport.fr`,
    `${clean}transports.fr`,
    `${clean}.eu`,
  ];

  for (const domain of domainCandidates) {
    const isLive = await isDomainMailActive(domain);
    if (isLive) {
      return `contact@${domain}`;
    }
  }

  return null;
}

/**
 * Fonction Principale d'enrichissement d'email professionnel
 * Priorité : Hunter.io ➔ Abstract ➔ Clearbit ➔ Dropcontact ➔ Scanner DNS MX Réel
 */
export async function enrichCompanyEmail(
  companyName: string,
  siren?: string,
  domain?: string
): Promise<EnrichmentResult> {
  // 1. Essai Hunter.io
  const hunterResult = await findEmailViaHunter(companyName, domain);
  if (hunterResult?.email) {
    return hunterResult;
  }

  // 2. Essai Abstract API
  const abstractResult = await findEmailViaAbstract(companyName, domain);
  if (abstractResult?.email) {
    return abstractResult;
  }

  // 3. Essai Clearbit
  const clearbitResult = await findEmailViaClearbit(companyName, domain);
  if (clearbitResult?.email) {
    return clearbitResult;
  }

  // 4. Essai Dropcontact
  const dropcontactResult = await findEmailViaDropcontact(companyName, siren);
  if (dropcontactResult?.email) {
    return dropcontactResult;
  }

  // 5. Scanner DNS MX Réel (Vérification stricte de serveur mail actif)
  const verifiedEmail = await discoverVerifiedCompanyEmail(companyName);
  if (verifiedEmail) {
    return { email: verifiedEmail, phone: null, source: 'dns_mx_verified' };
  }

  // Si aucun serveur email n'existe, on renvoie null (l'entreprise ne sera pas importée)
  return { email: null, phone: null, source: null };
}
