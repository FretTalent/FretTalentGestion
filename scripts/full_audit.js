const { Client } = require('pg');
require('dotenv').config({ path: './.env.local' });

async function audit() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('=== 1. COLONNES DE LA TABLE CANDIDATES ===');
    const cols = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'candidates';"
    );
    console.log('Colonnes candidates:', cols.rows);

    console.log('=== 2. LISTE COMPLETE DES CANDIDATS ===');
    const candidates = await client.query('SELECT * FROM public.candidates;');
    console.log('Nombre de candidats:', candidates.rows.length);
    console.log('Candidats:', JSON.stringify(candidates.rows, null, 2));

    console.log('=== 3. RLS SUR CANDIDATES ===');
    const rls = await client.query(
      "SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'candidates';"
    );
    console.log('RLS candidates:', rls.rows);
  } catch (err) {
    console.error('Erreur audit DB:', err);
  } finally {
    await client.end();
  }
}

audit();
