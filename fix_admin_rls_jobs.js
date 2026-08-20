require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
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
