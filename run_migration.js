// Exécute la migration SQL directement via l'API Supabase REST
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx === -1) return;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  env[key] = val;
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];
const DB_URL = env['DATABASE_URL'] || env['SUPABASE_DB_URL'];

console.log('\n========================================');
console.log('🔧 MIGRATION: Ajout colonne validated');
console.log('========================================\n');

// Méthode 1: Via l'API REST Supabase (pg endpoint)
async function runMigration() {
  const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
  console.log(`Project ref: ${projectRef}`);

  // Essai via l'API Management de Supabase
  const sqlCommands = [
    `ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS validated BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ`,
    `UPDATE public.candidates SET validated = TRUE, validated_at = NOW() WHERE is_verified = TRUE AND validated = FALSE`,
  ];

  // Utiliser pg directement
  let pg;
  try {
    pg = require('pg');
  } catch(e) {
    console.log('Module pg non disponible localement');
    console.log('\n📋 INSTRUCTIONS MANUELLES:');
    console.log('1. Ouvrir https://supabase.com/dashboard/project/' + projectRef + '/sql');
    console.log('2. Copier-coller le SQL du fichier: src/supabase/add_validated_column.sql');
    console.log('3. Cliquer "Run"\n');
    return;
  }

  // Essai connexion directe PostgreSQL
  const connectionStrings = [
    `postgresql://postgres:${env['DB_PASSWORD'] || 'Gabin.02350'}@db.${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres.${projectRef}:${env['DB_PASSWORD'] || 'Gabin.02350'}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`,
  ];

  let connected = false;
  for (const connStr of connectionStrings) {
    try {
      const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
      await client.connect();
      console.log('✅ Connexion PostgreSQL réussie\n');

      for (const sql of sqlCommands) {
        try {
          await client.query(sql);
          console.log('✅ Exécuté:', sql.slice(0, 60) + '...');
        } catch(e) {
          console.log('⚠️ ', sql.slice(0, 60) + '...:', e.message);
        }
      }

      // Vérification
      const result = await client.query(
        'SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = ANY($2)',
        ['candidates', ['validated', 'validated_at', 'is_verified']]
      );
      console.log('\n✅ Colonnes présentes:', result.rows.map(r => r.column_name));

      await client.end();
      connected = true;
      break;
    } catch(e) {
      console.log('⚠️ Connexion échouée avec:', connStr.slice(0, 50) + '...', '-', e.message);
    }
  }

  if (!connected) {
    console.log('\n📋 INSTRUCTIONS MANUELLES:');
    console.log('1. Ouvrir: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('2. Copier-coller:\n');
    console.log('ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS validated BOOLEAN NOT NULL DEFAULT FALSE;');
    console.log('ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;');
    console.log('UPDATE public.candidates SET validated = TRUE, validated_at = NOW() WHERE is_verified = TRUE;');
    console.log('\n3. Cliquer "Run"');
  }
}

runMigration().catch(console.error);
