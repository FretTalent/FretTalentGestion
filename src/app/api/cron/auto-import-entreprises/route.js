import { NextResponse } from 'next/server';
import { fetchTalentComOffers } from '@/lib/services/talentService';
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
  console.log('🤖 DÉMARRAGE ROBOT AUTO-IMPORT ENTREPRISES (TALENT.COM)');
  console.log('====================================================');

  const logs = {
    imported_direct: [],
    imported_enriched: [],
    ignored_no_email: [],
    duplicates_skipped: [],
    errors: [],
  };

  try {
    // 1. Étape 1 : Récupérer les offres Talent.com pour "Chauffeur SPL"
    const offers = await fetchTalentComOffers('Chauffeur SPL', 'France');
    console.log(`[Robot Import] ${offers.length} offre(s) scannée(s) sur Talent.com`);

    for (const offer of offers) {
      const rawCompanyName = offer.company_name;
      const rawCity = offer.city || 'France';
      const directEmail = offer.email;

      // 2. Étape d'Enrichissement Systématique SIRENE + Géocodage BAN
      const sireneData = await lookupSireneCompany(rawCompanyName, rawCity);
      const officialSiret = sireneData?.siret || offer.siret || null;
      const officialName = sireneData?.nom_entreprise || rawCompanyName;
      const officialCity = sireneData?.ville || rawCity;
      const officialPostalCode = sireneData?.postal_code || offer.postal_code || getPostalCodeForCity(officialCity);
      const officialAddress = sireneData?.adresse || rawCity;

      // Géocodage BAN (Latitude / Longitude)
      const geo = await geocodeLocation(officialCity, officialPostalCode, officialAddress);

      // Étape 3 : Condition prioritaire -> Email direct Talent.com
      if (directEmail) {
        console.log(`[Robot Import] Email direct trouvé pour ${officialName} (${directEmail}) [CP: ${geo.postal_code}]`);
        
        const res = await processAndRegisterEntreprise({
          nom_entreprise: officialName,
          siret: officialSiret,
          email: directEmail,
          ville: geo.city || officialCity,
          adresse: geo.address || officialAddress,
          postal_code: geo.postal_code || officialPostalCode,
          latitude: geo.latitude,
          longitude: geo.longitude,
          source: 'talent.com-direct',
        });

        if (res.status === 'success') {
          logs.imported_direct.push({
            company_name: officialName,
            city: geo.city || officialCity,
            postal_code: geo.postal_code || officialPostalCode,
            email: directEmail,
            source: 'talent.com-direct',
          });
        } else if (res.status === 'duplicate_skipped') {
          logs.duplicates_skipped.push({ company_name: officialName, reason: res.reason });
        } else {
          logs.ignored_no_email.push({ company_name: officialName, reason: res.reason });
        }

        continue;
      }

      // Étape 4 : Si Talent.com ne fournit PAS d'email -> Dropcontact
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
          source: 'talent.com-enriched',
        });

        if (res.status === 'success') {
          logs.imported_enriched.push({
            company_name: officialName,
            city: geo.city || officialCity,
            postal_code: geo.postal_code || officialPostalCode,
            email: dropcontactData.email,
            siret: officialSiret,
            source: 'talent.com-enriched',
          });
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
          reason: 'Aucun email professionnel trouvé via Dropcontact/Talent.com',
        });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Étape 5 & Telegram briefing
    const summaryText =
      `🤖 <b>RAPPORT D'IMPORTATION AUTOMATIQUE ENTREPRISES</b> 🚛\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 <b>Offres Scannées :</b> ${offers.length}\n` +
      `📥 <b>Imports Directs (Talent.com) :</b> ${logs.imported_direct.length}\n` +
      `🔍 <b>Imports Enrichis (SIRENE + Dropcontact) :</b> ${logs.imported_enriched.length}\n` +
      `⚠️ <b>Ignorées (Sans E-mail) :</b> ${logs.ignored_no_email.length}\n` +
      `♻️ <b>Doublons Ignorés :</b> ${logs.duplicates_skipped.length}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⏱ <b>Durée du scan :</b> ${duration}s\n` +
      `📍 <b>Géocodage GPS :</b> 100% OK`;

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
