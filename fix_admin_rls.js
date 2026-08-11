const { Client } = require('c:\\Users\\Gabin\\Desktop\\Fret Talent\\node_modules\\pg');

async function fix() {
  const client = new Client({
    connectionString: "postgresql://postgres:Gabin.02350@db.udqirxeqtloauvcoitka.supabase.co:5432/postgres",
  });
  
  await client.connect();
  
  try {
    await client.query(`
      DROP POLICY IF EXISTS "Admin peut voir les profils" ON public.profiles;
      DROP POLICY IF EXISTS "Admin peut voir les candidats" ON public.candidates;
      DROP POLICY IF EXISTS "Admin peut voir les entreprises" ON public.companies;
      
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS boolean
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        );
      $$;

      CREATE POLICY "Admin peut voir les profils" ON public.profiles FOR SELECT
      USING ( public.is_admin() );
      
      CREATE POLICY "Admin peut voir les candidats" ON public.candidates FOR SELECT
      USING ( public.is_admin() );
      
      CREATE POLICY "Admin peut voir les entreprises" ON public.companies FOR SELECT
      USING ( public.is_admin() );
    `);
    console.log("Admin policies created successfully using SECURITY DEFINER.");
  } catch (e) {
    console.error(e.message);
  }
  
  await client.end();
}
fix();
