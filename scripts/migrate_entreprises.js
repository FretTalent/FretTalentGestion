require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL non trouvée dans .env.local');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connexion PostgreSQL établie.');

    await client.query(`
      ALTER TABLE public.entreprises 
      ADD COLUMN IF NOT EXISTS nom_entreprise text,
      ADD COLUMN IF NOT EXISTS siret text,
      ADD COLUMN IF NOT EXISTS email text,
      ADD COLUMN IF NOT EXISTS ville text,
      ADD COLUMN IF NOT EXISTS adresse text,
      ADD COLUMN IF NOT EXISTS source text DEFAULT 'talent.com-direct',
      ADD COLUMN IF NOT EXISTS date_import timestamp with time zone DEFAULT now(),
      ADD COLUMN IF NOT EXISTS statut_contact text DEFAULT 'non_contacté';
    `);

    console.log('✅ Migration SQL exécutée : colonnes d\'import ajoutées à la table entreprises !');
  } catch (err) {
    console.error('Erreur migration PostgreSQL:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
