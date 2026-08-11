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

const admin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function test() {
  console.log('\n=== TEST API admin/candidates ===\n');

  // Test 1: order by created_at (bug actuel)
  const { data: d1, error: e1 } = await admin.from('candidates').select('*').order('created_at', { ascending: false });
  console.log('Test order(created_at):', e1 ? 'ERREUR - ' + e1.message : 'OK ' + d1.length + ' candidats');

  // Test 2: order by updated_at (fix)
  const { data: d2, error: e2 } = await admin.from('candidates').select('*').order('updated_at', { ascending: false });
  console.log('Test order(updated_at):', e2 ? 'ERREUR - ' + e2.message : 'OK ' + d2.length + ' candidats');

  // Test 3: sans order (fallback)
  const { data: d3, error: e3 } = await admin.from('candidates').select('*');
  console.log('Test sans order:', e3 ? 'ERREUR - ' + e3.message : 'OK ' + d3.length + ' candidats');
  
  if (d3 && d3.length > 0) {
    console.log('\nColonnes disponibles:', Object.keys(d3[0]).join(', '));
    d3.forEach(c => console.log(' -', c.full_name, '|', c.email));
  }
}

test().catch(console.error);
