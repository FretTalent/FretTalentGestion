-- ====================================================================
-- MODULE AUTO-CANDIDATURE PREMIUM (19,99 €) - SCHÉMA SQL COMPLET
-- FretTalent Platform Database
-- ====================================================================

-- Activer l'extension uuid-ossp pour la génération d'identifiants uniques
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. FONCTION CALCUL DE DISTANCE HAVERSINE (EN KILOMÈTRES)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.haversine_distance(
    lat1 FLOAT8,
    lon1 FLOAT8,
    lat2 FLOAT8,
    lon2 FLOAT8
)
RETURNS FLOAT8 AS $$
DECLARE
    r FLOAT8 := 6371.0; -- Rayon moyen de la Terre en kilomètres
    dlat FLOAT8;
    dlon FLOAT8;
    a FLOAT8;
    c FLOAT8;
BEGIN
    -- Gestion des coordonnées nulles
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;

    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat / 2.0)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2.0)^2;
    c := 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
    
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ====================================================================
-- 2. TABLE ENTREPRISES (REGISTRE OFFICIEL DES TRANSPORTEURS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.entreprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    siret VARCHAR(20),
    vat_number VARCHAR(30),
    
    -- Adresse et Géolocalisation
    address TEXT,
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(10) NOT NULL DEFAULT 'FR',
    latitude FLOAT8,
    longitude FLOAT8,
    
    -- Statut Partenaire & Activité
    is_partner BOOLEAN NOT NULL DEFAULT FALSE,
    specialties TEXT[] DEFAULT '{}',
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Métriques
    candidatures_received_count INTEGER NOT NULL DEFAULT 0,
    candidatures_opened_count INTEGER NOT NULL DEFAULT 0,
    last_candidature_received_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide par ville, CP, pays, statut et coordonnées
CREATE INDEX IF NOT EXISTS idx_entreprises_coords ON public.entreprises (latitude, longitude) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_entreprises_postal ON public.entreprises (postal_code, country);
CREATE INDEX IF NOT EXISTS idx_entreprises_partner ON public.entreprises (is_partner, is_active);
CREATE INDEX IF NOT EXISTS idx_entreprises_email ON public.entreprises (email);

ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture entreprises autorisée pour utilisateurs authentifiés"
    ON public.entreprises FOR SELECT
    USING (true);

CREATE POLICY "Admin CRUD total sur entreprises"
    ON public.entreprises FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- 3. TABLE CANDIDATURES (SESSIONS D'AUTO-CANDIDATURE PREMIUM)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.candidatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Paiement Stripe
    stripe_session_id VARCHAR(150),
    stripe_payment_intent_id VARCHAR(150),
    amount_paid INTEGER NOT NULL DEFAULT 1999, -- 19,99 € en centimes
    currency VARCHAR(10) NOT NULL DEFAULT 'eur',
    
    -- Paramètres de recherche & diffusion
    radius_km INTEGER NOT NULL DEFAULT 50,
    candidate_lat FLOAT8,
    candidate_lon FLOAT8,
    candidate_postal_code VARCHAR(20),
    candidate_city VARCHAR(100),
    
    -- Statistiques d'envoi
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    target_companies_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    opened_count INTEGER NOT NULL DEFAULT 0,
    relance_count INTEGER NOT NULL DEFAULT 0,
    
    -- Horodatages
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidatures_candidate ON public.candidatures (candidate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidatures_status ON public.candidatures (status);

ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidat voit ses propres candidatures"
    ON public.candidatures FOR SELECT
    USING (auth.uid() = candidate_id);

CREATE POLICY "Admin voit toutes les candidatures"
    ON public.candidatures FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- 4. TABLE CANDIDATURE_EMAILS (SUIVI UNITAIRE DES ENVOIS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.candidature_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidature_id UUID NOT NULL REFERENCES public.candidatures(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entreprise_id UUID REFERENCES public.entreprises(id) ON DELETE SET NULL,
    
    -- Coordonnées de l'entreprise destinataire
    company_name VARCHAR(200) NOT NULL,
    company_email VARCHAR(200) NOT NULL,
    distance_km FLOAT8,
    is_partner BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Tracking & Sécurité
    tracking_token VARCHAR(100) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- 'queued', 'sent', 'failed'
    resend_email_id VARCHAR(100),
    error_message TEXT,
    
    -- Suivi ouvertures
    opened_at TIMESTAMPTZ,
    open_count INTEGER NOT NULL DEFAULT 0,
    
    -- Suivi relance J+7
    relance_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'skipped', 'failed'
    relance_sent_at TIMESTAMPTZ,
    
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cand_emails_token ON public.candidature_emails (tracking_token);
CREATE INDEX IF NOT EXISTS idx_cand_emails_candidature ON public.candidature_emails (candidature_id);
CREATE INDEX IF NOT EXISTS idx_cand_emails_candidate ON public.candidature_emails (candidate_id);

ALTER TABLE public.candidature_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidat voit le suivi de ses emails de candidature"
    ON public.candidature_emails FOR SELECT
    USING (auth.uid() = candidate_id);

CREATE POLICY "Admin contrôle candidature_emails"
    ON public.candidature_emails FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- 5. TABLE CANDIDATURE_OPEN_TRACKING (JOURNAL DES OUVERTURES EMAIL)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.candidature_open_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidature_email_id UUID NOT NULL REFERENCES public.candidature_emails(id) ON DELETE CASCADE,
    tracking_token VARCHAR(100) NOT NULL,
    
    ip_address VARCHAR(50),
    user_agent TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_open_tracking_email_id ON public.candidature_open_tracking (candidature_email_id);
CREATE INDEX IF NOT EXISTS idx_open_tracking_date ON public.candidature_open_tracking (opened_at DESC);

ALTER TABLE public.candidature_open_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin et Service Role accèdent à candidature_open_tracking"
    ON public.candidature_open_tracking FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- 6. TABLE PREMIUM_BADGES (MISE EN AVANT DU CHAUFFEUR PENDANT 48H)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.premium_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    candidature_id UUID REFERENCES public.candidatures(id) ON DELETE SET NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_premium_badges_active ON public.premium_badges (candidate_id, is_active, expires_at);

ALTER TABLE public.premium_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les badges actifs"
    ON public.premium_badges FOR SELECT
    USING (is_active = TRUE AND expires_at > NOW());

CREATE POLICY "Admin contrôle les badges"
    ON public.premium_badges FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- 7. TABLE SCHEDULED_RELANCES (FILE D'ATTENTE DES RELANCES J+7)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.scheduled_relances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidature_id UUID NOT NULL REFERENCES public.candidatures(id) ON DELETE CASCADE,
    candidature_email_id UUID NOT NULL REFERENCES public.candidature_emails(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entreprise_id UUID REFERENCES public.entreprises(id) ON DELETE SET NULL,
    
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'cancelled', 'failed'
    executed_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relances_due ON public.scheduled_relances (scheduled_for, status) WHERE status = 'pending';

ALTER TABLE public.scheduled_relances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gère scheduled_relances"
    ON public.scheduled_relances FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- 8. TABLE TELEGRAM_NOTIFICATIONS (JOURNAL DES ALERTES ADMIN)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.telegram_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_type VARCHAR(50) NOT NULL DEFAULT 'admin',
    chat_id VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'premium_purchase', 'candidature_opened', 'relance_sent'
    status VARCHAR(50) NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_notif_date ON public.telegram_notifications (created_at DESC);

ALTER TABLE public.telegram_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin accède aux notifications telegram"
    ON public.telegram_notifications FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- 9. FONCTION RPC DE RECHERCHE D'ENTREPRISES DANS UN RAYON DE 50 KM
-- ====================================================================
CREATE OR REPLACE FUNCTION public.get_companies_within_radius(
    user_lat FLOAT8,
    user_lon FLOAT8,
    max_radius_km FLOAT8 DEFAULT 50.0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(10),
    latitude FLOAT8,
    longitude FLOAT8,
    is_partner BOOLEAN,
    specialties TEXT[],
    distance_km FLOAT8
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.email,
        e.phone,
        e.address,
        e.postal_code,
        e.city,
        e.country,
        e.latitude,
        e.longitude,
        e.is_partner,
        e.specialties,
        public.haversine_distance(user_lat, user_lon, e.latitude, e.longitude) AS distance_km
    FROM public.entreprises e
    WHERE e.is_active = TRUE
      AND e.latitude IS NOT NULL
      AND e.longitude IS NOT NULL
      AND public.haversine_distance(user_lat, user_lon, e.latitude, e.longitude) <= max_radius_km
    ORDER BY 
        e.is_partner DESC, -- Entreprises partenaires prioritaires
        distance_km ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
