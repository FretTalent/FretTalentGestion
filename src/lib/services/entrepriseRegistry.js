import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Registre Entreprise FretTalent
 * Enregistre uniquement les entreprises ayant un e-mail valide.
 */

export async function processAndRegisterEntreprise({
  nom_entreprise,
  siret,
  email,
  ville,
  adresse,
  postal_code,
  source,
}) {
  // 1. RÈGLE ABSOLUE : Email obligatoire
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
    return {
      status: 'ignored_no_email',
      reason: 'E-mail manquant ou invalide. Aucun enregistrement autorisé.',
      company_name: nom_entreprise,
    };
  }

  const supabaseAdmin = getAdminClient();
  const cleanName = (nom_entreprise || 'Entreprise Transport').trim();
  const cleanCity = (ville || 'France').trim();
  const cleanAddress = (adresse || cleanCity).trim();
  const cleanSiret = siret ? siret.trim() : null;

  try {
    // 2. Vérification des doublons dans le registre `entreprises`
    // A. Par e-mail
    const { data: existingByEmail } = await supabaseAdmin
      .from('entreprises')
      .select('id, name')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingByEmail) {
      return {
        status: 'duplicate_skipped',
        reason: `Entreprise déjà enregistrée par e-mail (${cleanEmail}).`,
        company_name: cleanName,
      };
    }

    // B. Par SIRET (si disponible)
    if (cleanSiret) {
      const { data: existingBySiret } = await supabaseAdmin
        .from('entreprises')
        .select('id, name')
        .eq('siret', cleanSiret)
        .maybeSingle();

      if (existingBySiret) {
        return {
          status: 'duplicate_skipped',
          reason: `Entreprise déjà enregistrée par SIRET (${cleanSiret}).`,
          company_name: cleanName,
        };
      }
    }

    // 3. Insérer strictement dans la table "entreprises" (Registre Entreprises)
    // ⚠️ NE JAMAIS insérer dans profiles ni recruteurs inscrits
    const recordPayload = {
      nom_entreprise: cleanName,
      name: cleanName,
      siret: cleanSiret,
      email: cleanEmail,
      ville: cleanCity,
      city: cleanCity,
      adresse: cleanAddress,
      address: cleanAddress,
      postal_code: postal_code || '60000',
      country: 'FR',
      source: source || 'talent.com-direct',
      statut_contact: 'non_contacté',
      date_import: new Date().toISOString(),
      created_at: new Date().toISOString(),
      validation_status: 'pending_review',
    };

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('entreprises')
      .insert([recordPayload])
      .select()
      .single();

    if (insertErr) {
      throw insertErr;
    }

    return {
      status: 'success',
      source,
      record: inserted,
      company_name: cleanName,
      email: cleanEmail,
    };
  } catch (err) {
    console.error('[EntrepriseRegistry] Erreur insertion:', err.message);
    return {
      status: 'error',
      reason: err.message,
      company_name: cleanName,
    };
  }
}
