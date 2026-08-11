const { Client } = require('c:\\Users\\Gabin\\Desktop\\Fret Talent\\node_modules\\pg');

async function fix() {
  const client = new Client({
    connectionString: "postgresql://postgres:Gabin.02350@db.udqirxeqtloauvcoitka.supabase.co:5432/postgres",
  });
  
  await client.connect();
  
  try {
    await client.query(`
      CREATE POLICY "Les admins peuvent supprimer les offres" ON public.jobs FOR DELETE
      USING ( public.is_admin() );
    `);
    console.log("Delete policy for jobs created.");
  } catch (e) {
    if (e.message.includes("already exists")) {
      console.log("Policy already exists.");
    } else {
      console.error(e.message);
    }
  }
  
  await client.end();
}
fix();
