require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  console.log('Connected to Postgres DB...');

  try {
    // 1. Add bio column to candidates table if missing
    await client.query(`
      ALTER TABLE public.candidates 
      ADD COLUMN IF NOT EXISTS bio TEXT;
    `);
    console.log('✓ Column bio added to candidates table.');

    // 2. Add any other useful missing candidate columns
    await client.query(`
      ALTER TABLE public.candidates 
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'FR',
      ADD COLUMN IF NOT EXISTS job_preferences TEXT[] DEFAULT '{}';
    `);
    console.log('✓ Columns address, country, job_preferences verified.');

    // 3. Reload PostgREST schema cache
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('✓ PostgREST schema cache reloaded successfully.');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
