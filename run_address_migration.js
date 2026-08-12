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

console.log('\n========================================');
console.log('🔧 MIGRATION: Ajout colonnes addresses');
console.log('========================================\n');

async function runMigration() {
  const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
  console.log(`Project ref: ${projectRef}`);

  const sqlCommands = [
    `ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS address VARCHAR(255)`,
    `ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address VARCHAR(255)`,
    `ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10)`,
    `ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS city VARCHAR(100)`
  ];

  let pg;
  try {
    pg = require('pg');
  } catch(e) {
    console.log('Module pg non disponible localement');
    return;
  }

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
          console.log('✅ Exécuté:', sql);
        } catch(e) {
          console.log('⚠️ ', sql, e.message);
        }
      }

      await client.end();
      connected = true;
      break;
    } catch(e) {
      console.log('⚠️ Connexion échouée avec:', connStr.slice(0, 50) + '...', '-', e.message);
    }
  }

  if (!connected) {
    console.log('\n📋 INSTRUCTIONS MANUELLES: Executez ceci dans supabase');
    sqlCommands.forEach(s => console.log(s + ';'));
  }
}

runMigration().catch(console.error);
