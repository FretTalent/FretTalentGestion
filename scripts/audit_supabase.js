const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 AUDIT GLOBAL DE LA BASE DE DONNÉES SUPABASE FRETTALENT');
  console.log('====================================================\n');

  // 1. AUDIT DES TABLES & EXISTENCE
  const tables = [
    'candidates',
    'companies',
    'jobs',
    'profiles',
    'unlocks',
    'candidatures',
    'candidature_emails',
    'candidature_open_tracking',
    'push_subscriptions',
    'support_conversations',
    'support_messages',
    'page_views',
  ];

  console.log('--- 1. ÉTAT ET COMPTAGE DES TABLES ---');
  for (const t of tables) {
    try {
      const { count, error } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table '${t}': INACCESSIBLE OU ABSENTE (${error.message})`);
      } else {
        console.log(`✅ Table '${t}': OK (${count} enregistrements)`);
      }
    } catch (err) {
      console.log(`❌ Table '${t}': EXCEPTION (${err.message})`);
    }
  }

  // 2. AUDIT DE SANTE DE LA TABLE CANDIDATES
  console.log('\n--- 2. AUDIT DE SANTÉ : CANDIDATS (CHAUFFEURS) ---');
  const { data: candidates, error: candErr } = await supabase
    .from('candidates')
    .select('id, full_name, email, phone, country, validated, created_at, documents');

  if (candErr) {
    console.error('Erreur lecture candidats:', candErr.message);
  } else {
    const total = candidates.length;
    const validated = candidates.filter(c => c.validated).length;
    const withEmail = candidates.filter(c => c.email && c.email.trim().length > 0).length;
    const withPhone = candidates.filter(c => c.phone && c.phone.trim().length > 0).length;
    const franceCount = candidates.filter(c => c.country === 'FR').length;
    const belgiumCount = candidates.filter(c => c.country === 'BE').length;
    const swissCount = candidates.filter(c => c.country === 'CH').length;
    const luxCount = candidates.filter(c => c.country === 'LU').length;

    console.log(`• Total candidats inscrits : ${total}`);
    console.log(`• Profils 100% Vérifiés : ${validated} (${Math.round((validated / (total || 1)) * 100)}%)`);
    console.log(`• Candidats avec E-mail : ${withEmail} / ${total}`);
    console.log(`• Candidats avec Téléphone : ${withPhone} / ${total}`);
    console.log(`• Répartition géo : 🇫🇷 France: ${franceCount} | 🇧🇪 Belgique: ${belgiumCount} | 🇨🇭 Suisse: ${swissCount} | 🇱🇺 Luxembourg: ${luxCount}`);

    // Détection d'anomalies
    const duplicatesEmail = candidates.reduce((acc, c) => {
      if (c.email) {
        const emailLower = c.email.toLowerCase().trim();
        acc[emailLower] = (acc[emailLower] || 0) + 1;
      }
      return acc;
    }, {});
    const duplicateEmailList = Object.entries(duplicatesEmail).filter(([_, count]) => count > 1);

    if (duplicateEmailList.length > 0) {
      console.log(`⚠️ ANOMALIE DÉTECTÉE : ${duplicateEmailList.length} e-mails en doublon dans candidats !`);
      duplicateEmailList.slice(0, 5).forEach(([email, count]) => {
        console.log(`   - ${email}: ${count} occurrences`);
      });
    } else {
      console.log('✅ Aucun doublon d\'e-mail détecté dans candidats.');
    }
  }

  // 3. AUDIT DE SANTE DE LA TABLE COMPANIES & JOBS
  console.log('\n--- 3. AUDIT DE SANTÉ : ENTREPRISES & OFFRES ---');
  const { data: companies } = await supabase.from('companies').select('id, name, email, country, siret, bce');
  if (companies) {
    console.log(`• Total entreprises inscrites : ${companies.length}`);
    const compWithEmail = companies.filter(c => c.email).length;
    console.log(`• Entreprises avec E-mail : ${compWithEmail} / ${companies.length}`);
  }

  const { data: jobs } = await supabase.from('jobs').select('id, title, company_name, is_approved, is_active, created_at');
  if (jobs) {
    console.log(`• Total offres d'emploi déposées : ${jobs.length}`);
    const approvedJobs = jobs.filter(j => j.is_approved !== false && j.is_active !== false).length;
    console.log(`• Offres actives en ligne : ${approvedJobs} / ${jobs.length}`);
  }

  // 4. AUDIT DES REVENUS STRIPE & DEBLOCAGES
  console.log('\n--- 4. AUDIT DES TRANSACTIONS & DÉBLOCAGES ---');
  const { data: unlocks } = await supabase.from('unlocks').select('id, amount_charged, company_id, candidate_id, created_at');
  if (unlocks) {
    const totalUnlocks = unlocks.length;
    const totalRevenue = unlocks.reduce((sum, u) => sum + (u.amount_charged || 200), 0) / 100;
    console.log(`• Total déblocages effectués : ${totalUnlocks}`);
    console.log(`• Volume d'affaires déblocages : ${totalRevenue.toFixed(2)} €`);
  }

  // 5. AUDIT DES PERMISSIONS & SEGMENTS
  console.log('\n--- 5. RECOMMANDATIONS & ANALYSE FINALE ---');
  console.log('====================================================');
}

runAudit();
