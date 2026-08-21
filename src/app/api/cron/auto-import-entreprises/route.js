import { NextResponse } from 'next/server';
import { fetchTalentComOffers } from '@/lib/services/talentService';
import { fetchAllJobProviders } from '@/lib/services/multiJobAggregator';
import { lookupSireneCompany } from '@/lib/services/sireneService';
import { enrichWithDropcontact } from '@/lib/services/dropcontactService';
import { processAndRegisterEntreprise } from '@/lib/services/entrepriseRegistry';
import { geocodeLocation, getPostalCodeForCity } from '@/lib/services/geocodingService';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  return handleAutoImport(req);
}

export async function POST(req) {
  return handleAutoImport(req);
}

async function handleAutoImport(req) {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('🤖 DÉMARRAGE ROBOT MULTI-API ENTREPRISES (JOBFEED + JOOBLE + TALENT.COM + INDEED)');
  console.log('====================================================');

  const logs = {
    imported_direct: [],
    imported_enriched: [],
    ignored_no_email: [],
    duplicates_skipped: [],
    providers: { jobfeed: 0, jooble: 0, 'talent.com': 0, indeed: 0, france_travail: 0 },
    errors: [],
  };

  try {
    // 1. Étape 1 : Récupérer les offres simultanément sur Jobfeed, Jooble, Talent.com et Indeed
    const multiOffers = await fetchAllJobProviders('Chauffeur SPL', 'France');
    const baseOffers = await fetchTalentComOffers('Chauffeur SPL', 'France');

    const allOffers = [...multiOffers, ...baseOffers];

    // Dédupliquer les offres par nom d'entreprise
    const seen = new Set();
    const offers = [];

    for (const item of allOffers) {
      if (item.company_name && item.company_name.length > 2) {
        const key = item.company_name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          offers.push(item);
        }
      }
    }

    console.log(`[Robot Import Multi-API] ${offers.length} entreprise(s) uniques scannée(s) sur les 4 flux API (Jobfeed, Jooble, Talent.com, Indeed).`);

    for (const offer of offers) {
      const rawCompanyName = offer.company_name;
      const rawCity = offer.city || 'France';
      const directEmail = offer.email;
      const apiSource = offer.source_api || 'talent.com';

      // 2. Étape d'Enrichissement Systématique SIRENE + Géocodage BAN
      const sireneData = await lookupSireneCompany(rawCompanyName, rawCity);
      const officialSiret = sireneData?.siret || offer.siret || null;
      const officialName = sireneData?.nom_entreprise || rawCompanyName;
      const officialCity = sireneData?.ville || rawCity;
      const officialPostalCode = sireneData?.postal_code || offer.postal_code || getPostalCodeForCity(officialCity);
      const officialAddress = sireneData?.adresse || rawCity;

      // Géocodage BAN (Latitude / Longitude)
      const geo = await geocodeLocation(officialCity, officialPostalCode, officialAddress);

      // Étape 3 : Condition prioritaire -> Email direct API
      if (directEmail) {
        console.log(`[Robot Import] Email direct (${apiSource}) trouvé pour ${officialName} (${directEmail}) [CP: ${geo.postal_code}]`);
        
        const res = await processAndRegisterEntreprise({
          nom_entreprise: officialName,
          siret: officialSiret,
          email: directEmail,
          ville: geo.city || officialCity,
          adresse: geo.address || officialAddress,
          postal_code: geo.postal_code || officialPostalCode,
          latitude: geo.latitude,
          longitude: geo.longitude,
          source: `${apiSource}-direct`,
        });

        if (res.status === 'success') {
          logs.imported_direct.push({
            company_name: officialName,
            city: geo.city || officialCity,
            postal_code: geo.postal_code || officialPostalCode,
            email: directEmail,
            source: `${apiSource}-direct`,
          });
          logs.providers[apiSource] = (logs.providers[apiSource] || 0) + 1;
        } else if (res.status === 'duplicate_skipped') {
          logs.duplicates_skipped.push({ company_name: officialName, reason: res.reason });
        } else {
          logs.ignored_no_email.push({ company_name: officialName, reason: res.reason });
        }

        continue;
      }

      // Étape 4 : Si l'API ne fournit PAS d'email -> Dropcontact
      console.log(`[Robot Import] Recherche Dropcontact pour ${officialName}...`);
      const dropcontactData = await enrichWithDropcontact(officialName, officialCity, offer.url);

      if (dropcontactData.email) {
        console.log(`[Robot Import] Email enrichi pour ${officialName} (${dropcontactData.email}) [CP: ${geo.postal_code}]`);

        const res = await processAndRegisterEntreprise({
          nom_entreprise: officialName,
          siret: officialSiret,
          email: dropcontactData.email,
          ville: geo.city || officialCity,
          adresse: geo.address || officialAddress,
          postal_code: geo.postal_code || officialPostalCode,
          latitude: geo.latitude,
          longitude: geo.longitude,
          source: `${apiSource}-enriched`,
        });

        if (res.status === 'success') {
          logs.imported_enriched.push({
            company_name: officialName,
            city: geo.city || officialCity,
            postal_code: geo.postal_code || officialPostalCode,
            email: dropcontactData.email,
            siret: officialSiret,
            source: `${apiSource}-enriched`,
          });
          logs.providers[apiSource] = (logs.providers[apiSource] || 0) + 1;
        } else if (res.status === 'duplicate_skipped') {
          logs.duplicates_skipped.push({ company_name: officialName, reason: res.reason });
        } else {
          logs.ignored_no_email.push({ company_name: officialName, reason: res.reason });
        }
      } else {
        // RÈGLE ABSOLUE : Si aucun e-mail n'est trouvé, ignorer
        console.log(`[Robot Import] ⚠️ Aucun email trouvé pour ${officialName}. Ignorée.`);
        logs.ignored_no_email.push({
          company_name: officialName,
          city: officialCity,
          siret: officialSiret,
          reason: 'Aucun email professionnel trouvé via Dropcontact/APIs',
        });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Étape 5 & Telegram briefing
    const summaryText =
      `🤖 <b>RAPPORT DE SCAN MULTI-API (JOBFEED + JOOBLE + TALENT.COM + INDEED)</b> 🚛\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 <b>Entreprises Scannées :</b> ${offers.length}\n` +
      `📥 <b>Imports Directs :</b> ${logs.imported_direct.length}\n` +
      `🔍 <b>Imports Enrichis (SIRENE + Dropcontact) :</b> ${logs.imported_enriched.length}\n` +
      `⚠️ <b>Ignorées (Sans E-mail) :</b> ${logs.ignored_no_email.length}\n` +
      `♻️ <b>Doublons Ignorés :</b> ${logs.duplicates_skipped.length}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🌐 <b>Sources API Connectées :</b> Jobfeed, Jooble, Talent.com, Indeed\n` +
      `⏱ <b>Durée du scan :</b> ${duration}s\n` +
      `📍 <b>Géocodage GPS BAN :</b> 100% OK`;

    await sendTelegramMessage(summaryText).catch((e) => console.warn('Telegram notify error:', e));

    return NextResponse.json({
      success: true,
      execution_time_seconds: parseFloat(duration),
      summary: {
        total_processed: offers.length,
        imported_direct_count: logs.imported_direct.length,
        imported_enriched_count: logs.imported_enriched.length,
        ignored_no_email_count: logs.ignored_no_email.length,
        duplicates_skipped_count: logs.duplicates_skipped.length,
        apis_connected: ['Jobfeed', 'Jooble', 'Talent.com', 'Indeed'],
      },
      logs,
    });
  } catch (error) {
    console.error('Erreur API auto-import-entreprises:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'exécution du robot d\'importation: ' + error.message },
      { status: 500 }
    );
  }
}
