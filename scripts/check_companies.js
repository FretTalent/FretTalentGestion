require('dotenv').config({path:'.env.local'});
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'companies'");
    console.log(res.rows.map(r => r.column_name));
  } catch(e) {
    console.error(e);
  }
  await client.end();
}
run();
