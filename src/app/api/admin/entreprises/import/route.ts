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

const ADMIN_EMAILS = ['support@frettalent.fr', 'gabin77700@gmail.com', 'gnri02270@gmail.com'];

async function verifyAdminAuth(req: Request) {
  const supabaseAdmin = getAdminSupabase();

  // 1. Essai via Header Authorization Bearer
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) return { authorized: true, user };
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role === 'admin') return { authorized: true, user };
    }
  }

  // 2. Essai via Cookie de session Supabase
  try {
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (user) {
      if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) return { authorized: true, user };
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role === 'admin') return { authorized: true, user };
    }
  } catch (e) {}

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
      perPage = 50,
      department,
      enrichEmails = false,
    } = body;

    // 1. Récupération des entreprises depuis l'API SIRENE officielle
    const sireneResult = await fetchTransportCompaniesFromSirene({
      nafCodes: Array.isArray(nafCodes) && nafCodes.length > 0 ? nafCodes : TRANSPORT_NAF_CODES,
      page: Number(page) || 1,
      perPage: Math.min(Number(perPage) || 50, 100),
      department: department ? String(department).trim() : undefined,
      enrichEmails: Boolean(enrichEmails),
    });

    const { companies, totalResults, hasMore } = sireneResult;

    let importedCount = 0;
    let skippedCount = 0;
    let emailsFoundCount = 0;
    const errors: string[] = [];

    // 2. Traitement et insertion par lots dans le registre officiel (entreprises)
    // RÈGLE STRICTE : Seules les entreprises avec une adresse e-mail valide sont enregistrées
    for (const comp of companies) {
      try {
        if (!comp.nom_entreprise || !comp.ville || !comp.code_postal) {
          skippedCount++;
          continue;
        }

        // Filtre strict : L'entreprise DOIT impérativement posséder une adresse e-mail
        if (!comp.email || !comp.email.includes('@')) {
          skippedCount++;
          continue;
        }

        emailsFoundCount++;

        // Vérification de doublon par SIRET ou Email
        if (comp.siret) {
          const { data: existing } = await supabaseAdmin
            .from('entreprises')
            .select('id')
            .eq('siret', comp.siret)
            .maybeSingle();

          if (existing) {
            skippedCount++;
            continue;
          }
        }

        const { data: existingEmail } = await supabaseAdmin
          .from('entreprises')
          .select('id')
          .eq('email', comp.email)
          .maybeSingle();

        if (existingEmail) {
          skippedCount++;
          continue;
        }

        // Insertion dans la table entreprises (utilisée par la Candidature Rapide 19,99€)
        const { error: insertError } = await supabaseAdmin.from('entreprises').insert({
          name: comp.nom_entreprise,
          email: comp.email,
          phone: comp.telephone,
          siret: comp.siret,
          address: comp.adresse || null,
          postal_code: comp.code_postal,
          city: comp.ville,
          country: comp.pays || 'FR',
          latitude: comp.latitude,
          longitude: comp.longitude,
          is_partner: false,
          is_active: true,
          specialties: [comp.code_naf],
          notes: `Importé via API SIRENE + Email vérifié (${comp.code_naf})`,
        });

        if (insertError) {
          if (insertError.code === '23505') {
            skippedCount++;
          } else {
            console.warn(`[Import Insertion Error] ${comp.nom_entreprise}:`, insertError.message);
            errors.push(`${comp.nom_entreprise} : ${insertError.message}`);
          }
        } else {
          importedCount++;
        }
      } catch (itemErr: any) {
        errors.push(`${comp.nom_entreprise} : ${itemErr.message}`);
      }
    }

    // 3. Enregistrer l'opération dans l'historique des imports
    try {
      await supabaseAdmin.from('entreprises_import_history').insert({
        naf_code: Array.isArray(nafCodes) ? nafCodes.join(', ') : '49.41A',
        imported_count: importedCount,
        skipped_count: skippedCount,
        emails_found_count: emailsFoundCount,
        errors_count: errors.length,
        details: {
          page,
          perPage,
          totalResults,
          department: department || 'France entière',
          sampleImported: companies.slice(0, 5).map(c => c.nom_entreprise),
          errors: errors.slice(0, 10),
        },
        status: errors.length > 0 && importedCount === 0 ? 'failed' : 'completed',
      });
    } catch (histErr: any) {
      console.warn('[Import History Log Error]:', histErr.message);
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      emailsFoundCount,
      errorsCount: errors.length,
      errors: errors.slice(0, 10),
      page: Number(page) || 1,
      perPage: Number(perPage) || 50,
      totalResults,
      hasMore,
    });
  } catch (err: any) {
    console.error('[API Import POST] Error:', err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'import" }, { status: 500 });
  }
}
