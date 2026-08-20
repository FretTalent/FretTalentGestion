require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  
  const res = await client.query(`
    SELECT tablename, policyname, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'jobs';
  `);
  
  console.log(res.rows);
  await client.end();
}
check();
