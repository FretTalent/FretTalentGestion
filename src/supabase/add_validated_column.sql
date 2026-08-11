-- ================================================================
-- MIGRATION FretTalent - Ajout colonnes validated + validated_at
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. Ajouter la colonne "validated" (si elle n'existe pas encore)
ALTER TABLE public.candidates 
  ADD COLUMN IF NOT EXISTS validated BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Ajouter la colonne "validated_at" (timestamp de validation)
ALTER TABLE public.candidates 
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- 3. Synchroniser is_verified → validated (si des candidats avaient is_verified = true)
UPDATE public.candidates 
  SET validated = TRUE, validated_at = NOW()
  WHERE is_verified = TRUE AND validated = FALSE;

-- 4. Vérification - afficher l'état après migration
SELECT id, full_name, email, is_active, is_verified, validated, validated_at
FROM public.candidates
ORDER BY created_at DESC;

-- ================================================================
-- POLITIQUE RLS pour permettre la mise à jour par les admins
-- ================================================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Admin peut modifier les candidats" ON public.candidates;

-- Créer une politique permettant à l'admin de mettre à jour tous les candidats
CREATE POLICY "Admin peut modifier les candidats"
  ON public.candidates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================================
-- POLITIQUE RLS pour permettre la lecture par l'admin
-- ================================================================

DROP POLICY IF EXISTS "Admin peut lire tous les candidats" ON public.candidates;

CREATE POLICY "Admin peut lire tous les candidats"
  ON public.candidates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vérifier les policies actives
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'candidates'
ORDER BY policyname;
