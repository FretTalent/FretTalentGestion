const { Client } = require('c:\\Users\\Gabin\\Desktop\\Fret Talent\\node_modules\\pg');

async function check() {
  const client = new Client({
    connectionString: "postgresql://postgres:Gabin.02350@db.udqirxeqtloauvcoitka.supabase.co:5432/postgres",
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
