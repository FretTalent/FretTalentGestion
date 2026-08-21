import { NextResponse } from 'next/server';
import { fetchTalentComOffers } from '@/lib/services/talentService';
import { lookupSireneCompany } from '@/lib/services/sireneService';
import { enrichWithDropcontact } from '@/lib/services/dropcontactService';
import { processAndRegisterEntreprise } from '@/lib/services/entrepriseRegistry';
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
    console.log(`[Robot Import] ${offers.length} offre(s) récupérée(s) sur Talent.com`);

    for (const offer of offers) {
      const companyName = offer.company_name;
      const city = offer.city || 'France';
      const directEmail = offer.email;

      // Étape 3 : Condition prioritaire : Email direct Talent.com
      if (directEmail) {
        console.log(`[Robot Import] Email direct Talent.com trouvé pour ${companyName} (${directEmail})`);
        
        const res = await processAndRegisterEntreprise({
          nom_entreprise: companyName,
          siret: offer.siret || null,
          email: directEmail,
          ville: city,
          adresse: offer.address || city,
          postal_code: offer.postal_code || '60000',
          source: 'talent.com-direct',
        });

        if (res.status === 'success') {
          logs.imported_direct.push({
            company_name: companyName,
            city,
            email: directEmail,
            source: 'talent.com-direct',
          });
        } else if (res.status === 'duplicate_skipped') {
          logs.duplicates_skipped.push({ company_name: companyName, reason: res.reason });
        } else {
          logs.ignored_no_email.push({ company_name: companyName, reason: res.reason });
        }

        // Passer à l'entreprise suivante (aucun appel SIRENE ou Dropcontact requis)
        continue;
      }

      // Étape 4 : Si Talent.com ne fournit PAS d'email -> SIRENE + Dropcontact
      console.log(`[Robot Import] Pas d'email direct pour ${companyName}. Lancement SIRENE + Dropcontact...`);

      // 4.1 SIRENE Lookup
      const sireneData = await lookupSireneCompany(companyName, city);
      const targetSiret = sireneData?.siret || null;
      const officialName = sireneData?.nom_entreprise || companyName;
      const officialAddress = sireneData?.adresse || city;
      const officialPostalCode = sireneData?.postal_code || offer.postal_code || '60000';
      const officialCity = sireneData?.ville || city;

      // 4.2 Dropcontact Enrichment
      const dropcontactData = await enrichWithDropcontact(officialName, officialCity, offer.url);

      if (dropcontactData.email) {
        console.log(`[Robot Import] Email enrichi avec succès pour ${officialName} (${dropcontactData.email})`);

        const res = await processAndRegisterEntreprise({
          nom_entreprise: officialName,
          siret: targetSiret,
          email: dropcontactData.email,
          ville: officialCity,
          adresse: officialAddress,
          postal_code: officialPostalCode,
          source: 'talent.com-enriched',
        });

        if (res.status === 'success') {
          logs.imported_enriched.push({
            company_name: officialName,
            city: officialCity,
            email: dropcontactData.email,
            siret: targetSiret,
            source: 'talent.com-enriched',
          });
        } else if (res.status === 'duplicate_skipped') {
          logs.duplicates_skipped.push({ company_name: officialName, reason: res.reason });
        } else {
          logs.ignored_no_email.push({ company_name: officialName, reason: res.reason });
        }
      } else {
        // RÈGLE ABSOLUE : Si aucun e-mail n'est trouvé, ignorer (AUCUNE insertion)
        console.log(`[Robot Import] ⚠️ Aucun email trouvé pour ${officialName}. Entreprise ignorée.`);
        logs.ignored_no_email.push({
          company_name: officialName,
          city: officialCity,
          siret: targetSiret,
          reason: 'Aucun email professionnel trouvé via Dropcontact/Talent.com',
        });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Étape 5 & Telegram briefing
    const summaryText =
      `🤖 <b>RAPPORT D'IMPORTATION AUTOMATIQUE ENTREPRISES</b> 🚛\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📥 <b>Imports Directs (Talent.com) :</b> ${logs.imported_direct.length}\n` +
      `🔍 <b>Imports Enrichis (SIRENE + Dropcontact) :</b> ${logs.imported_enriched.length}\n` +
      `⚠️ <b>Ignorées (Sans E-mail) :</b> ${logs.ignored_no_email.length}\n` +
      `♻️ <b>Doublons Ignorés :</b> ${logs.duplicates_skipped.length}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⏱ <b>Durée du scan :</b> ${duration} secondes\n` +
      `🏷️ <b>Statut des fiches :</b> non_contacté (Prêtes pour prospection)`;

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
