const { Client } = require('pg');
const fs = require('fs');

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=");
  if (key && val) {
    acc[key.trim()] = val.join("=").replace(/"/g, '').trim();
  }
  return acc;
}, {});

const client = new Client({
  connectionString: env.DATABASE_URL
});

async function setup() {
  await client.connect();
  try {
    console.log("Adding is_verified column to candidates table...");
    await client.query(`ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;`);
    console.log("Column added.");

    // Update schema.sql as well so it's documented
    const schemaPath = "src/supabase/schema.sql";
    if (fs.existsSync(schemaPath)) {
        let schema = fs.readFileSync(schemaPath, "utf8");
        if (!schema.includes("is_verified BOOLEAN")) {
            schema = schema.replace(
                "is_active BOOLEAN NOT NULL DEFAULT TRUE,", 
                "is_active BOOLEAN NOT NULL DEFAULT TRUE,\n    is_verified BOOLEAN NOT NULL DEFAULT FALSE, -- Profil validé par un administrateur"
            );
            fs.writeFileSync(schemaPath, schema);
            console.log("Updated src/supabase/schema.sql");
        }
    }
  } catch (err) {
    console.error("Error setting up DB:", err);
  } finally {
    await client.end();
  }
}

setup();
