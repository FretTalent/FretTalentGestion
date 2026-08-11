const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
);

async function checkCandidates() {
  const { data, error } = await supabase
    .from('candidates')
    .select('id, full_name, email, validated, is_active, availability, documents, city, postal_code')
    .eq('validated', true);

  if (error) {
    console.error('Error fetching candidates:', error);
    return;
  }

  console.log(`Trouvé ${data.length} candidat(s) validé(s) par l'admin :\n`);

  for (const c of data) {
    const REQUIRED_DOCS = ['cv', 'permis', 'chrono', 'fimo'];
    const docs = c.documents || {};
    const missingDocs = REQUIRED_DOCS.filter(k => !docs[k]);
    const allDocsPresent = missingDocs.length === 0;
    
    const isAvailable = c.is_active && c.availability && c.availability !== '';
    const fullVerified = c.validated && allDocsPresent && isAvailable;

    console.log(`=== ${c.full_name || 'Inconnu'} (${c.email}) ===`);
    console.log(`- 1. Validé admin (validated) : ${c.validated ? '✅' : '❌'}`);
    console.log(`- 2. Documents complets       : ${allDocsPresent ? '✅' : '❌'} (Manque: ${missingDocs.join(', ') || 'aucun'})`);
    console.log(`- 3. Coordonnées présentes    : ${c.postal_code && c.city ? '✅' : '❌'} (${c.postal_code} ${c.city})`);
    console.log(`- 4. Disponibilité activée    : ${isAvailable ? '✅' : '❌'} (is_active: ${c.is_active}, availability: "${c.availability}")`);
    
    console.log(`=> Résultat sur la carte      : ${fullVerified ? 'VERT 🟢' : 'ORANGE 🟠'}\n`);
  }
}

checkCandidates();
