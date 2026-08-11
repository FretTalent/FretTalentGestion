const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=");
  if (key && val) {
    acc[key.trim()] = val.join("=").replace(/"/g, '').trim();
  }
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDocumentsStorage() {
  console.log("Adding documents JSONB column to candidates table...");
  const { error: sqlError } = await supabase.rpc('execute_sql', {
    sql_query: `
      ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;
    `
  });

  if (sqlError) {
    // Si la fonction RPC execute_sql n'existe pas, on tente via postgrest query normale si on peut ? Non, il faut utiliser psql ou faire ça manuellement
    console.warn("Could not execute RPC. Assuming you will run the schema SQL manually.");
    console.error(sqlError);
  } else {
    console.log("Column added.");
  }

  console.log("Creating candidate-documents bucket...");
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('candidate-documents', {
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
  });
  
  if (bucketError && bucketError.message !== "The resource already exists") {
    console.error("Error creating bucket:", bucketError);
  } else {
    console.log("Bucket created or already exists.");
  }

  // Adding RLS Policies for storage.objects
  console.log("Applying Storage RLS Policies...");
  const { error: rlsError } = await supabase.rpc('execute_sql', {
    sql_query: `
      -- Politique Candidat : Peut uploader/lire ses propres fichiers
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
      DROP POLICY IF EXISTS "Les admins peuvent tout voir" ON storage.objects;
      CREATE POLICY "Les admins peuvent tout voir"
      ON storage.objects FOR SELECT
      USING (
          bucket_id = 'candidate-documents' AND
          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
    `
  });

  if (rlsError) {
    console.error("Error setting RLS Policies:", rlsError);
  } else {
    console.log("Storage RLS Policies applied.");
  }
}

setupDocumentsStorage();
