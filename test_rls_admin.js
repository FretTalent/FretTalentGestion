require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function testRLS() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  
  try {
    // Set role to authenticated to simulate RLS
    await client.query(`SET ROLE authenticated;`);
    
    // Set the JWT claims for the admin user UUID in the session (false = not local to transaction)
    await client.query(`
      SELECT set_config('request.jwt.claims', '{"sub": "d55cee49-c804-44bd-b289-3ce6a8a73934", "role": "authenticated"}', false);
    `);
    
    const resUid = await client.query(`SELECT auth.uid() as uid, current_setting('request.jwt.claims', true) as claims`);
    console.log("Auth UUID:", resUid.rows);
    
    const resAdmin = await client.query(`SELECT public.is_admin()`);
    console.log("Is Admin?", resAdmin.rows);
    
    const res = await client.query(`SELECT id, role FROM public.profiles`);
    console.log("Admin sees profiles count:", res.rows.length);
  } catch (e) {
    console.error("Error testing RLS:", e.message);
  }
  
  await client.end();
}
testRLS();
