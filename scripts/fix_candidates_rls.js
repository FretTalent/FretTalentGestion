const { Client } = require('pg');
require('dotenv').config({ path: './.env.local' });

async function fixCandidatesRLS() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connecté à Supabase Postgres.');

    // 1. Ajouter la politique SELECT pour les admins sur public.candidates
    await client.query(`
      DROP POLICY IF EXISTS "Admin peut lire tous les candidats" ON public.candidates;
      DROP POLICY IF EXISTS "Admin peut voir les candidats" ON public.candidates;
      
      CREATE POLICY "Admin peut voir tous les candidats"
        ON public.candidates FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    `);
    console.log('✅ Politique SELECT pour les admins créée sur public.candidates');

    // 2. Ajouter la politique UPDATE pour les admins sur public.candidates
    await client.query(`
      DROP POLICY IF EXISTS "Admin peut modifier les candidats" ON public.candidates;
      
      CREATE POLICY "Admin peut modifier les candidats"
        ON public.candidates FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    `);
    console.log('✅ Politique UPDATE pour les admins créée sur public.candidates');

    const rls = await client.query(
      "SELECT policyname, cmd FROM pg_policies WHERE tablename = 'candidates';"
    );
    console.log('Nouvelles RLS actives sur candidates:', rls.rows);

  } catch (err) {
    console.error('Erreur SQL:', err);
  } finally {
    await client.end();
  }
}

fixCandidatesRLS();
