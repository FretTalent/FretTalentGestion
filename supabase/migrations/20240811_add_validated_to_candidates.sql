-- Migration: add validated flag and validated_at timestamp to candidates table
-- ---------------------------------------------------------------
-- Ensure the migration number is unique (use timestamp prefix)
-- This file will be executed by the Supabase SQL runner or via your
-- migration script (e.g. `npm run setup_documents_db.js`).

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS validated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE;

-- Optional index for faster look‑ups on the validated column
CREATE INDEX IF NOT EXISTS idx_candidates_validated ON public.candidates(validated);