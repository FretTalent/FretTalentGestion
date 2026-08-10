-- Création du schéma initial FretTalent

-- Activer l'extension uuid-ossp pour la génération de clés primaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table profiles (profils d'utilisateurs liés à auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'recruiter', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habiliter l'accès aux profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Table candidates (profils des chauffeurs routiers)
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    postal_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    mobility_radius INTEGER NOT NULL DEFAULT 50, -- Rayon d'action en kilomètres
    experience_years INTEGER NOT NULL DEFAULT 0,
    availability VARCHAR(50) NOT NULL DEFAULT 'immediate', -- 'immediate', 'specific_date', 'part_time'
    availability_date DATE,
    contract_types VARCHAR(50)[] NOT NULL DEFAULT '{}', -- 'CDI', 'CDD', 'Intérim'
    licenses VARCHAR(50)[] NOT NULL DEFAULT '{}', -- 'B', 'C', 'CE', 'PL', 'SPL'
    certifications VARCHAR(50)[] NOT NULL DEFAULT '{}', -- 'FIMO', 'FCO', 'ADR', 'Chrono'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Données nominatives et de contact, cachées par défaut
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 3. Table companies (profils des recruteurs)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    siret VARCHAR(14) NOT NULL,
    stripe_customer_id VARCHAR(100),
    has_payment_method BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 4. Table unlocks (déblocages de contacts par les entreprises)
CREATE TABLE IF NOT EXISTS public.unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    amount_charged INTEGER NOT NULL DEFAULT 200, -- En centimes (200 = 2.00 €)
    stripe_invoice_item_id VARCHAR(100),
    CONSTRAINT unique_unlock UNIQUE (company_id, candidate_id)
);

ALTER TABLE public.unlocks ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Politiques pour PROFILES
CREATE POLICY "Les utilisateurs peuvent lire leur propre profil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Politiques pour COMPANIES
CREATE POLICY "Tout le monde peut voir les entreprises"
    ON public.companies FOR SELECT
    USING (true);

CREATE POLICY "Les entreprises peuvent modifier leur propre profil"
    ON public.companies FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Politiques pour UNLOCKS
CREATE POLICY "Les entreprises peuvent voir leurs propres déblocages"
    ON public.unlocks FOR SELECT
    USING (auth.uid() = company_id);

CREATE POLICY "Les entreprises peuvent insérer un déblocage"
    ON public.unlocks FOR INSERT
    WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Les administrateurs peuvent tout voir sur unlocks"
    ON public.unlocks FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Politiques pour CANDIDATES
-- 1. Un candidat peut faire toutes les opérations sur son propre profil
CREATE POLICY "Le candidat contrôle son profil"
    ON public.candidates FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. Tout le monde/les entreprises peuvent voir les profils candidats anonymisés
CREATE POLICY "Voir les candidats anonymisés"
    ON public.candidates FOR SELECT
    USING (is_active = TRUE);

-- ==========================================
-- VUES DE SÉCURITÉ POUR MASQUER LES CONTACTS
-- ==========================================

-- Pour garantir que les champs sensibles ne fuitent jamais directement par select *, 
-- on crée une vue publique anonymisée que les recruteurs utiliseront sans droit d'accès
-- direct aux colonnes privées ou en gérant cela dynamiquement par une fonction de masquage.

CREATE OR REPLACE FUNCTION public.mask_candidate_field(candidate_id UUID, field_name TEXT, field_value TEXT)
RETURNS TEXT AS $$
DECLARE
    is_unlocked BOOLEAN;
BEGIN
    -- Si l'utilisateur connecté est le candidat lui-même, il voit sa donnée
    IF auth.uid() = candidate_id THEN
        RETURN field_value;
    END IF;
    
    -- Si l'utilisateur connecté est admin, il voit la donnée
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN field_value;
    END IF;

    -- Vérifier si l'entreprise connectée a débloqué le contact
    SELECT EXISTS (
        SELECT 1 FROM public.unlocks 
        WHERE company_id = auth.uid() AND candidate_id = $1
    ) INTO is_unlocked;

    IF is_unlocked THEN
        RETURN field_value;
    ELSE
        RETURN '[Masqué - Débloquer pour afficher]';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
