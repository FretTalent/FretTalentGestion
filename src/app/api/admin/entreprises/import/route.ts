import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase-server';
import { fetchTransportCompaniesFromSirene, TRANSPORT_NAF_CODES } from '@/lib/sirene-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s max pour Next.js / Vercel Pro

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ADMIN_EMAILS = ['support@frettalent.fr'];

async function verifyAdminAuth(req: Request) {
  const supabaseAdmin = getAdminSupabase();

  // 1. Essai via Cookie de session Supabase (Standard Next.js)
  try {
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (user) {
      if (user.email?.toLowerCase() === 'support@frettalent.fr') return { authorized: true, user };
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role === 'admin') return { authorized: true, user };
    }
  } catch (e) {}

  // 2. Essai via Header Authorization Bearer
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      if (user.email?.toLowerCase() === 'support@frettalent.fr') return { authorized: true, user };
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role === 'admin') return { authorized: true, user };
    }
  }

  return { authorized: false, user: null };
}

// GET /api/admin/entreprises/import : Récupère l'historique des imports et les statistiques globales
export async function GET(req: Request) {
  try {
    const { authorized } = await verifyAdminAuth(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const supabaseAdmin = getAdminSupabase();

    // Récupérer l'historique des imports
    const { data: history, error: histError } = await supabaseAdmin
      .from('entreprises_import_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (histError) throw histError;

    // Récupérer le total des entreprises dans le registre
    const { count: totalCompanies, error: countError } = await supabaseAdmin
      .from('entreprises')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    return NextResponse.json({
      success: true,
      history: history || [],
      totalCompaniesInRegister: totalCompanies || 0,
      supportedNafCodes: TRANSPORT_NAF_CODES,
    });
  } catch (err: any) {
    console.error('[API Import GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}

// POST /api/admin/entreprises/import : Lance l'importation autonome d'entreprises par lot
export async function POST(req: Request) {
  try {
    const { authorized } = await verifyAdminAuth(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const supabaseAdmin = getAdminSupabase();

    const body = await req.json().catch(() => ({}));
    const {
      nafCodes = TRANSPORT_NAF_CODES,
      page = 1,
      perPage = 25,
      department,
      enrichEmails = true,
    } = body;

    // 1. Récupération des entreprises depuis l'API SIRENE officielle
    const sireneResult = await fetchTransportCompaniesFromSirene({
      nafCodes: Array.isArray(nafCodes) && nafCodes.length > 0 ? nafCodes : TRANSPORT_NAF_CODES,
      page: Number(page) || 1,
      perPage: Math.min(Number(perPage) || 25, 25),
      department: department ? String(department).trim() : undefined,
      enrichEmails: enrichEmails !== false,
    });

    const { companies, totalResults, hasMore } = sireneResult;

    let importedCount = 0;
    let skippedCount = 0;
    let emailsFoundCount = 0;
    let validatedCount = 0;
    let pendingReviewCount = 0;
    const errors: string[] = [];

    // 2. Traitement et insertion par lots dans le registre officiel (entreprises)
    // RÈGLE STRICTE : Evaluation du score (MX, site, domaine, Jaro-Winkler, adresse)
    // score >= 70 -> Validé pour insertion ('validated')
    // score < 70 -> Mis en attente de revue manuelle ('pending_review')
    for (const comp of companies) {
      try {
        if (!comp.nom_entreprise) {
          skippedCount++;
          continue;
        }

        // Filtre de sécurité : E-mail obligatoire
        if (!comp.email || !comp.email.includes('@')) {
          skippedCount++;
          continue;
        }

        emailsFoundCount++;

        // Vérification de doublon strict par adresse e-mail
        const { data: existingEmail } = await supabaseAdmin
          .from('entreprises')
          .select('id')
          .eq('email', comp.email.trim().toLowerCase())
          .maybeSingle();

        if (existingEmail) {
          skippedCount++;
          continue;
        }

        const score = comp.email_score ?? 0;
        const status = comp.validation_status ?? (score >= 70 ? 'validated' : 'pending_review');

        if (status === 'validated') {
          validatedCount++;
        } else {
          pendingReviewCount++;
        }

        // Insertion dans la table entreprises
        let { error: insertError } = await supabaseAdmin.from('entreprises').insert({
          name: comp.nom_entreprise,
          email: comp.email.trim().toLowerCase(),
          phone: comp.telephone || null,
          siret: comp.siret || null,
          address: comp.adresse || `Zone d'activité transport`,
          postal_code: comp.code_postal || '02000',
          city: comp.ville || 'France',
          country: 'FR',
          latitude: comp.latitude || 49.5641,
          longitude: comp.longitude || 3.6199,
          is_partner: false,
          specialties: ['Transport Routier de Fret', 'Messagerie & Logistique'],
          notes: comp.site_web ? `Site officiel: ${comp.site_web}` : 'Importé via Robot d\'Extraction Directe',
          email_score: score,
          validation_status: status,
          validation_details: comp.validation_details || null,
        });

        // Fallback de sécurité si la table Supabase n'a pas encore les colonnes email_score/validation_status créées
        if (
          insertError &&
          (insertError.message.includes('column') ||
            insertError.message.includes('schema cache') ||
            insertError.message.includes('email_score') ||
            insertError.message.includes('validation_status'))
        ) {
          const fallbackRes = await supabaseAdmin.from('entreprises').insert({
            name: comp.nom_entreprise,
            email: comp.email.trim().toLowerCase(),
            phone: comp.telephone || null,
            siret: comp.siret || null,
            address: comp.adresse || `Zone d'activité transport`,
            postal_code: comp.code_postal || '02000',
            city: comp.ville || 'France',
            country: 'FR',
            latitude: comp.latitude || 49.5641,
            longitude: comp.longitude || 3.6199,
            is_partner: false,
            specialties: ['Transport Routier de Fret', 'Messagerie & Logistique'],
            notes: comp.site_web
              ? `Site officiel: ${comp.site_web} (Score: ${score} pts)`
              : `Importé via Robot d'Extraction Directe (Score: ${score} pts)`,
          });
          insertError = fallbackRes.error;
        }

        if (insertError) {
          console.error('[Direct Importer] Erreur insertion:', insertError.message);
          errors.push(`${comp.nom_entreprise}: ${insertError.message}`);
        } else {
          importedCount++;
        }
      } catch (rowErr: any) {
        errors.push(`${comp.nom_entreprise}: ${rowErr.message}`);
      }
    }

    // 3. Enregistrement de l'historique
    try {
      await supabaseAdmin.from('sirene_imports_history').insert({
        naf_code: 'TRANSPORT_DIRECT',
        imported_count: importedCount,
        skipped_count: skippedCount,
        emails_found_count: emailsFoundCount,
        errors_count: errors.length,
        details: {
          page,
          perPage,
          totalResults,
          department,
          validatedCount,
          pendingReviewCount,
          sampleImported: companies.slice(0, 5).map((c) => c.nom_entreprise),
          errors: errors.slice(0, 5),
        },
        status: errors.length === 0 ? 'success' : 'completed_with_errors',
      });
    } catch (histErr) {
      // Ignorer si la table d'historique n'est pas critique
    }

    return NextResponse.json({
      success: true,
      data: {
        page,
        perPage,
        totalResults,
        importedCount,
        skippedCount,
        emailsFoundCount,
        validatedCount,
        pendingReviewCount,
        hasMore,
        errors,
        companies: companies.map(c => ({
          name: c.nom_entreprise,
          email: c.email,
          phone: c.telephone,
          city: c.ville,
          postalCode: c.code_postal,
          site: c.site_web,
          score: c.email_score || 0,
          validationStatus: c.validation_status || 'pending_review',
          validationDetails: c.validation_details || null,
        }))
      },
    });
  } catch (error: any) {
    console.error('[Direct Importer Route] Erreur globale:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur interne lors de l\'importation des entreprises',
      },
      { status: 500 }
    );
  }
}
