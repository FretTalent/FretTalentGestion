/**
 * Module d'Enrichissement d'Emails Professionnels
 * FretTalent Platform
 * Sources : Clearbit Enrichment API (prioritaire) & Dropcontact API (fallback)
 */

interface EnrichmentResult {
  email: string | null;
  phone?: string | null;
  source?: 'clearbit' | 'dropcontact' | null;
}

/**
 * Nettoie le nom de l'entreprise pour générer un domaine potentiel ou une recherche
 */
function sanitizeCompanyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(sas|sarl|sa|eurl|sasu|snc|sci|transports|transport|logistique|fret|groupe|france)\b/gi, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * 1. Recherche d'email via Clearbit Enrichment API
 */
async function findEmailViaClearbit(
  companyName: string,
  domain?: string
): Promise<EnrichmentResult | null> {
  const apiKey = process.env.CLEARBIT_API_KEY;
  if (!apiKey) return null;

  try {
    const targetDomain = domain || `${sanitizeCompanyName(companyName)}.fr`;
    if (!targetDomain || targetDomain.length < 4) return null;

    const res = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(targetDomain)}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      // Timeout court pour éviter les blocages sur gros volumes
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
 * 2. Recherche d'email via Dropcontact API (Fallback)
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
 * Fonction Principale d'enrichissement d'email professionnel
 * Priorité : Clearbit ➔ Fallback Dropcontact ➔ null
 */
export async function enrichCompanyEmail(
  companyName: string,
  siren?: string,
  domain?: string
): Promise<EnrichmentResult> {
  // 1. Essai Clearbit
  const clearbitResult = await findEmailViaClearbit(companyName, domain);
  if (clearbitResult?.email) {
    return clearbitResult;
  }

  // 2. Essai Fallback Dropcontact
  const dropcontactResult = await findEmailViaDropcontact(companyName, siren);
  if (dropcontactResult?.email) {
    return dropcontactResult;
  }

  return { email: null, phone: null, source: null };
}
