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
    console.log("1. Adding documents column to candidates table...");
    await client.query(`ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;`);
    console.log("Column added.");

    console.log("2. Creating candidate-documents bucket if it does not exist...");
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'candidate-documents', 
        'candidate-documents', 
        false, 
        10485760, 
        ARRAY['image/jpeg', 'image/png', 'application/pdf']
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Bucket created.");

    console.log("3. Applying RLS policies on storage.objects...");
    await client.query(`
      -- Politique Candidat : Peut uploader/lire/modifier/supprimer ses propres fichiers
      DROP POLICY IF EXISTS "Les candidats peuvent gerer leurs documents" ON storage.objects;
      CREATE POLICY "Les candidats peuvent gerer leurs documents"
      ON storage.objects FOR ALL
      USING (bucket_id = 'candidate-documents' AND auth.uid()::text = (storage.foldername(name))[1])
      WITH CHECK (bucket_id = 'candidate-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

      -- Politique Entreprise : Peut lire les fichiers d'un candidat debloque
      DROP POLICY IF EXISTS "Les recruteurs peuvent voir les documents debloques" ON storage.objects;
      CREATE POLICY "Les recruteurs peuvent voir les documents debloques"
      ON storage.objects FOR SELECT
      USING (
          bucket_id = 'candidate-documents' AND
          EXISTS (
              SELECT 1 FROM public.unlocks
              WHERE company_id = auth.uid()
              AND candidate_id::text = (storage.foldername(name))[1]
          )
      );

      -- Politique Admin : Peut lire tous les documents
      DROP POLICY IF EXISTS "Les admins peuvent tout voir sur candidate-documents" ON storage.objects;
      CREATE POLICY "Les admins peuvent tout voir sur candidate-documents"
      ON storage.objects FOR SELECT
      USING (
          bucket_id = 'candidate-documents' AND
          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
    `);
    console.log("RLS Policies applied successfully!");
    
    // Update schema.sql as well so it's documented
    const schemaPath = "src/supabase/schema.sql";
    if (fs.existsSync(schemaPath)) {
        let schema = fs.readFileSync(schemaPath, "utf8");
        if (!schema.includes("documents JSONB")) {
            schema = schema.replace(
                "is_active BOOLEAN NOT NULL DEFAULT TRUE,", 
                "is_active BOOLEAN NOT NULL DEFAULT TRUE,\n    documents JSONB DEFAULT '{}'::jsonb, -- Fichiers joints du candidat"
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
