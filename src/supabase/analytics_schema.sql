-- Table pour enregistrer les visites et l'audience du site
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    referrer TEXT,
    referrer_domain VARCHAR(255),
    device_type VARCHAR(50) DEFAULT 'desktop', -- 'desktop', 'mobile', 'tablet'
    session_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour accélérer les requêtes d'analytics par date, chemin et provenance
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_referrer_domain ON public.page_views (referrer_domain);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views (session_id);

-- Activer RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut insérer une vue de page (via l'API anonyme ou publique)
CREATE POLICY "Permettre l'insertion publique des statistiques"
    ON public.page_views FOR INSERT
    WITH CHECK (true);

-- Politique : Seuls les admins peuvent lire les données statistiques
CREATE POLICY "Les administrateurs peuvent lire toutes les statistiques"
    ON public.page_views FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
