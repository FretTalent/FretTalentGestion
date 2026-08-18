/**
 * TypeScript Interfaces & Types — Module Auto-Candidature Premium 19,99 €
 * FretTalent Platform
 */

export interface Entreprise {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  siret?: string | null;
  vat_number?: string | null;
  address?: string | null;
  postal_code: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  is_partner: boolean;
  specialties?: string[];
  notes?: string | null;
  is_active: boolean;
  candidatures_received_count: number;
  candidatures_opened_count: number;
  last_candidature_received_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidature {
  id: string;
  candidate_id: string;
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  amount_paid: number;
  currency: string;
  radius_km: number;
  candidate_lat?: number | null;
  candidate_lon?: number | null;
  candidate_postal_code?: string | null;
  candidate_city?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  target_companies_count: number;
  sent_count: number;
  opened_count: number;
  relance_count: number;
  created_at: string;
  completed_at?: string | null;
  updated_at: string;
}

export interface CandidatureEmail {
  id: string;
  candidature_id: string;
  candidate_id: string;
  entreprise_id?: string | null;
  company_name: string;
  company_email: string;
  distance_km?: number | null;
  is_partner: boolean;
  tracking_token: string;
  status: 'queued' | 'sent' | 'failed';
  resend_email_id?: string | null;
  error_message?: string | null;
  opened_at?: string | null;
  open_count: number;
  relance_status: 'pending' | 'sent' | 'skipped' | 'failed';
  relance_sent_at?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export interface CandidatureOpenTracking {
  id: string;
  candidature_email_id: string;
  tracking_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  opened_at: string;
}

export interface PremiumBadge {
  id: string;
  candidate_id: string;
  candidature_id?: string | null;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface ScheduledRelance {
  id: string;
  candidature_id: string;
  candidature_email_id: string;
  candidate_id: string;
  entreprise_id?: string | null;
  scheduled_for: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  executed_at?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface TelegramNotification {
  id: string;
  recipient_type: 'admin' | 'candidate';
  chat_id: string;
  message: string;
  event_type: 'premium_purchase' | 'candidature_opened' | 'relance_sent';
  status: 'sent' | 'failed';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CandidateProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string | null;
  postal_code: string;
  city: string;
  country?: string | null;
  licenses: string[];
  certifications: string[];
  experience_years: number;
  mobility_radius: number;
  availability: string;
  availability_date?: string | null;
  contract_types: string[];
  job_preferences: string[];
  bio?: string | null;
  documents?: Record<string, string | { url: string; name?: string; size?: number; type?: string }>;
  is_verified?: boolean;
}

export interface CompanyWithinRadius extends Entreprise {
  distance_km: number;
}
