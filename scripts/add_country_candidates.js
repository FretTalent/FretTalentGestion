require('dotenv').config({path:'.env.local'});
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  try {
    await client.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS country varchar(2) DEFAULT 'FR';");
    console.log('Added country column to candidates table');
  } catch(e) {
    console.error(e);
  }
  await client.end();
}
run();
