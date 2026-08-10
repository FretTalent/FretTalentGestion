-- Correction des politiques RLS d'insertion pour permettre l'inscription des utilisateurs

-- 1. Politique d'insertion pour la table profiles
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leur propre profil" ON public.profiles;
CREATE POLICY "Autoriser l'insertion publique des profils" 
    ON public.profiles FOR INSERT 
    WITH CHECK (true);

-- 2. Politiques d'insertion et contrôle pour la table candidates
DROP POLICY IF EXISTS "Le candidat contrôle son profil" ON public.candidates;

CREATE POLICY "Candidat lit son propre profil" 
    ON public.candidates FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Candidat met à jour son propre profil" 
    ON public.candidates FOR UPDATE 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Candidat supprime son propre profil" 
    ON public.candidates FOR DELETE 
    USING (auth.uid() = id);

CREATE POLICY "Autoriser l'insertion publique des candidats" 
    ON public.candidates FOR INSERT 
    WITH CHECK (true);

-- 3. Politiques d'insertion et contrôle pour la table companies
DROP POLICY IF EXISTS "Les entreprises peuvent modifier leur propre profil" ON public.companies;

CREATE POLICY "Entreprise lit son propre profil" 
    ON public.companies FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Entreprise met à jour son propre profil" 
    ON public.companies FOR UPDATE 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Entreprise supprime son propre profil" 
    ON public.companies FOR DELETE 
    USING (auth.uid() = id);

CREATE POLICY "Autoriser l'insertion publique des entreprises" 
    ON public.companies FOR INSERT 
    WITH CHECK (true);
