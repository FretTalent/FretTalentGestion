const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const sql = `
    CREATE TABLE IF NOT EXISTS public.push_subscriptions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'candidate',
      endpoint TEXT UNIQUE NOT NULL,
      subscription JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public full push_subscriptions" ON public.push_subscriptions;
    CREATE POLICY "Allow public full push_subscriptions" ON public.push_subscriptions
      FOR ALL USING (true) WITH CHECK (true);
  `;

  await client.query(sql);
  console.log('✅ Table public.push_subscriptions créée avec succès dans Supabase !');
  await client.end();
}

main().catch(err => {
  console.error('Erreur SQL:', err);
  process.exit(1);
});
