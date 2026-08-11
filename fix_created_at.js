// Ajoute la colonne created_at à candidates (manquante) + la peuple avec updated_at
const { Client } = require('pg');
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

const projectRef = env['NEXT_PUBLIC_SUPABASE_URL'].replace('https://', '').split('.')[0];

async function fix() {
  const client = new Client({
    connectionString: `postgresql://postgres:${env['DB_PASSWORD'] || 'Gabin.02350'}@db.${projectRef}.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connecté à PostgreSQL\n');

  try {
    // Ajouter created_at à candidates
    await client.query(`
      ALTER TABLE public.candidates 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    `);
    console.log('✅ Colonne created_at ajoutée');

    // Peupler avec updated_at pour les enregistrements existants
    const result = await client.query(`
      UPDATE public.candidates 
      SET created_at = updated_at 
      WHERE created_at = NOW() OR created_at IS NULL;
    `);
    console.log('✅ created_at peuplée avec updated_at:', result.rowCount, 'lignes');

    // Vérification finale
    const check = await client.query(`
      SELECT id, full_name, email, created_at, updated_at, validated 
      FROM public.candidates 
      ORDER BY created_at DESC
    `);
    console.log('\n✅ Candidats après migration:');
    check.rows.forEach(r => {
      console.log(`  - ${r.full_name} | ${r.email} | created_at: ${r.created_at} | validated: ${r.validated}`);
    });

  } catch (e) {
    console.error('Erreur:', e.message);
  }

  await client.end();
  console.log('\nTerminé.');
}

fix().catch(console.error);
