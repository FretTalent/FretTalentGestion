-- Migration SQL : Ajout du support pour le Luxembourg (LU) et la Suisse (CH)

-- 1. Table companies : ajout des colonnes d'identifiants
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS country VARCHAR(5) NOT NULL DEFAULT 'FR';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS rcs_lux VARCHAR(20);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS tva_lux VARCHAR(20);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS ide_ch VARCHAR(30);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50);

-- Ajustement de la contrainte siret non-bloquante si l'entreprise est étrangère
ALTER TABLE public.companies ALTER COLUMN siret DROP NOT NULL;

-- Contrainte de vérification des pays autorisés
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_companies_country') THEN
        ALTER TABLE public.companies DROP CONSTRAINT check_companies_country;
    END IF;
    ALTER TABLE public.companies ADD CONSTRAINT check_companies_country CHECK (country IN ('FR', 'BE', 'LU', 'CH'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Table candidates : ajout de la colonne pays et contrainte
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS country VARCHAR(5) NOT NULL DEFAULT 'FR';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_candidates_country') THEN
        ALTER TABLE public.candidates DROP CONSTRAINT check_candidates_country;
    END IF;
    ALTER TABLE public.candidates ADD CONSTRAINT check_candidates_country CHECK (country IN ('FR', 'BE', 'LU', 'CH'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
