export interface TalentOffer {
  id: string;
  title: string;
  company_name: string;
  city: string;
  postal_code?: string;
  email?: string | null;
  url?: string;
  date_posted?: string;
}

export interface SireneCompany {
  siret: string;
  siren: string;
  nom_entreprise: string;
  adresse: string;
  postal_code: string;
  ville: string;
  code_naf?: string;
}

export interface DropcontactResult {
  email: string | null;
  qualification?: string;
  first_name?: string;
  last_name?: string;
  confidence_score?: number;
}

export interface EntrepriseRecord {
  id?: string;
  nom_entreprise: string;
  name: string;
  siret?: string | null;
  email: string; // OBLIGATOIRE - Jamais vide ou null
  ville: string;
  city: string;
  adresse?: string | null;
  address?: string | null;
  postal_code?: string | null;
  source: 'talent.com-direct' | 'talent.com-enriched';
  statut_contact: 'non_contacté' | 'email_préparé' | 'contacté';
  date_import: string;
  created_at?: string;
}

export interface ImportLog {
  timestamp: string;
  action: 'imported_direct' | 'imported_enriched' | 'ignored_no_email' | 'duplicate_skipped';
  company_name: string;
  city: string;
  email?: string | null;
  siret?: string | null;
  reason?: string;
}
