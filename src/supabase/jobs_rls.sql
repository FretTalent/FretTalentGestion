-- ============================================================
-- RLS Policy : lecture publique des offres approuvées (jobs)
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. S'assurer que RLS est activée sur la table jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 2. Policy SELECT public : tout le monde peut lire les offres approuvées
CREATE POLICY "Public can read approved jobs"
ON public.jobs
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- 3. Policy SELECT entreprise : une entreprise peut lire SES propres offres (tous statuts)
CREATE POLICY "Company can read own jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (company_id = auth.uid());

-- 4. Policy INSERT : seul un recruteur authentifié peut créer une offre
CREATE POLICY "Recruiter can insert jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (company_id = auth.uid());

-- 5. Policy UPDATE admin : seul un admin peut modifier le statut (modération)
CREATE POLICY "Admin can update job status"
ON public.jobs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
