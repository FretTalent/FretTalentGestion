-- Création de la table jobs pour les annonces d'emploi
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contract_type VARCHAR(50) NOT NULL, -- 'CDI', 'CDD', 'Intérim', etc.
    location VARCHAR(150) NOT NULL, -- ex: 'Lyon (69)'
    salary VARCHAR(100), -- ex: '2500€ - 3000€'
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activer RLS sur la table jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour JOBS
-- 1. Tout le monde peut voir les jobs approuvés
CREATE POLICY "Tout le monde peut voir les offres approuvees"
    ON public.jobs FOR SELECT
    USING (status = 'approved');

-- 2. Une entreprise peut tout faire sur ses propres jobs
CREATE POLICY "Les entreprises gerent leurs offres"
    ON public.jobs FOR ALL
    USING (auth.uid() = company_id)
    WITH CHECK (auth.uid() = company_id);

-- 3. Les administrateurs ont un accès total en lecture sur toutes les offres
CREATE POLICY "Les admins voient toutes les offres"
    ON public.jobs FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Les administrateurs peuvent mettre à jour (approuver/rejeter) toutes les offres
CREATE POLICY "Les admins modèrent les offres"
    ON public.jobs FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
