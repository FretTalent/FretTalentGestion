// Audit complet v2 — vérifie la colonne validated + RLS policies
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
const ANON_KEY = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const admin = createClient(SUPABASE_URL, SERVICE_KEY);
const anon = createClient(SUPABASE_URL, ANON_KEY);

async function audit2() {
  console.log('\n========================================');
  console.log('🔍 AUDIT V2 — COLONNES & RLS DÉTAILLÉ');
  console.log('========================================\n');

  // ─── Vérifier les colonnes de la table candidates ─────────────────────────
  console.log('━━━ COLONNES de la table candidates ━━━━━━━━━━━━');
  const { data: cols, error: colErr } = await admin.rpc('exec_sql', {
    sql: `SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'candidates'
          ORDER BY ordinal_position`
  });

  if (colErr) {
    // Essai direct
    const { data: sample } = await admin.from('candidates').select('*').limit(1);
    if (sample && sample[0]) {
      console.log('Colonnes disponibles:', Object.keys(sample[0]));
      console.log('\nValeur du champ "validated":', sample[0].validated);
      console.log('Valeur du champ "is_verified":', sample[0].is_verified);
      console.log('Valeur du champ "is_active":', sample[0].is_active);
    }
  } else {
    cols.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`));
  }

  // ─── Vérifier RLS policies via information_schema ──────────────────────────
  console.log('\n━━━ RLS POLICIES (via pg_policies) ━━━━━━━━━━━━━');
  const { data: policies, error: pErr } = await admin
    .from('pg_policies')
    .select('policyname, tablename, cmd, permissive, roles, qual, with_check')
    .in('tablename', ['candidates', 'profiles']);

  if (pErr) {
    console.log('Impossible via pg_policies:', pErr.message);
    
    // Test direct: est-ce que l'anon peut lire ?
    console.log('\n━━━ TEST LECTURE ANON (simulation page accueil) ━');
    const { data: anonData, error: anonErr } = await anon
      .from('candidates')
      .select('id, city, postal_code')
      .not('postal_code', 'is', null)
      .neq('postal_code', '');
    
    if (anonErr) {
      console.log('❌ ERREUR anon:', anonErr.message, anonErr.code);
    } else {
      console.log(`✅ Anon voit ${anonData.length} candidat(s):`);
      anonData.forEach(c => console.log(`   - ${c.city} (${c.postal_code})`));
    }
  } else {
    policies.forEach(p => {
      console.log(`  [${p.tablename}] "${p.policyname}" | ${p.cmd} | roles: ${p.roles}`);
      if (p.qual) console.log(`    USING: ${p.qual}`);
    });
  }

  // ─── Test complet de la query identique à la page accueil ─────────────────
  console.log('\n━━━ QUERY IDENTIQUE PAGE ACCUEIL ━━━━━━━━━━━━━━');
  const { data: mapData, error: mapErr } = await anon
    .from('candidates')
    .select('id, city, postal_code, validated')
    .not('postal_code', 'is', null)
    .neq('postal_code', '');
  
  if (mapErr) {
    console.log('❌ ERREUR:', mapErr.message);
    console.log('  Code:', mapErr.code);
    console.log('  Hint:', mapErr.hint);
    console.log('  → CAUSE PROBABLE: colonne "validated" n\'existe pas !');
  } else {
    console.log(`✅ ${mapData.length} candidat(s) trouvé(s):`);
    mapData.forEach(c => {
      console.log(`   - ${c.city} (${c.postal_code}) | validated=${c.validated}`);
    });
  }

  // ─── Test sans le champ validated ─────────────────────────────────────────
  console.log('\n━━━ QUERY SANS "validated" ━━━━━━━━━━━━━━━━━━━━');
  const { data: mapData2, error: mapErr2 } = await anon
    .from('candidates')
    .select('id, city, postal_code')
    .not('postal_code', 'is', null)
    .neq('postal_code', '');
  
  if (mapErr2) {
    console.log('❌ ERREUR même sans validated:', mapErr2.message);
  } else {
    console.log(`✅ Sans validated: ${mapData2.length} candidat(s)`);
    mapData2.forEach(c => console.log(`   - ${c.city} (${c.postal_code})`));
  }

  // ─── Vérifier si la colonne validated existe ───────────────────────────────
  console.log('\n━━━ EXISTENCE COLONNE "validated" ━━━━━━━━━━━━━━');
  const { data: adminAll } = await admin.from('candidates').select('*').limit(1);
  if (adminAll && adminAll[0]) {
    const keys = Object.keys(adminAll[0]);
    console.log('Toutes les colonnes:', keys.join(', '));
    console.log('"validated" existe:', keys.includes('validated') ? '✅ OUI' : '❌ NON → PROBLÈME !');
    console.log('"is_verified" existe:', keys.includes('is_verified') ? '✅ OUI' : '❌ NON');
    console.log('"is_active" existe:', keys.includes('is_active') ? '✅ OUI' : '❌ NON');
    
    if (!keys.includes('validated')) {
      console.log('\n⚠️  SOLUTION REQUISE: Ajouter la colonne "validated" et "validated_at"');
      console.log('   SQL à exécuter dans Supabase:');
      console.log('   ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS validated BOOLEAN DEFAULT FALSE;');
      console.log('   ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;');
    }
  }

  // ─── Test ajout colonnes manquantes ───────────────────────────────────────
  console.log('\n━━━ TENTATIVE AUTO-FIX COLONNES ━━━━━━━━━━━━━━━');
  const addColResult = await admin.rpc('exec_sql', {
    sql: `ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS validated BOOLEAN DEFAULT FALSE; ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;`
  });
  if (addColResult.error) {
    console.log('ℹ️  RPC exec_sql non disponible (normal). Il faut ajouter manuellement via SQL Editor Supabase.');
  } else {
    console.log('✅ Colonnes ajoutées via RPC');
  }

  console.log('\n========================================\n');
}

audit2().catch(console.error);
