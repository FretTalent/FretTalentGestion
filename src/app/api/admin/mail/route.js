import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';
import MarketingEmail from '@/emails/MarketingEmail';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const {
      target,
      specificEmails,
      type,
      subject,
      title,
      message,
      ctaText,
      ctaLink,
    } = await req.json();

    // 1. Authentification & Vérification Admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const ADMIN_EMAILS = ['support@frettalent.fr', 'gabin77700@gmail.com', 'gnri02270@gmail.com'];
    const isAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase());

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!isAdminEmail && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    // 2. Récupération des destinataires selon la cible choisie
    let recipientEntries = []; // Array of { email, name, role, entrepriseId, companyId, candidateId }

    if (target === 'specific' && specificEmails) {
      const emailList = specificEmails
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      for (const email of emailList) {
        recipientEntries.push({ email, name: email, role: 'contact' });
      }
    } else if (target === 'candidates_incomplete_docs') {
      // Cibler UNIQUEMENT les chauffeurs non validés avec documents incomplets
      const { data: candidates } = await supabaseAdmin
        .from('candidates')
        .select('id, full_name, email, documents, validated')
        .eq('validated', false);

      if (candidates && candidates.length > 0) {
        candidates.forEach(c => {
          if (c.email) {
            const docs = c.documents || {};
            const count = ['cv', 'permis_recto', 'permis_verso', 'chrono_recto', 'chrono_verso', 'fimo_recto', 'fimo_verso'].filter(k => !!docs[k]).length;
            if (count < 7) {
              recipientEntries.push({
                email: c.email.trim().toLowerCase(),
                name: c.full_name || c.email,
                role: 'candidate',
                candidateId: c.id,
              });
            }
          }
        });
      }
    } else if (target === 'all_candidates') {
      // Récupérer 100% des e-mails chauffeurs
      const { data: cands } = await supabaseAdmin
        .from('candidates')
        .select('id, full_name, email');

      (cands || []).forEach(c => {
        if (c.email && c.email.includes('@')) {
          recipientEntries.push({
            email: c.email.trim().toLowerCase(),
            name: c.full_name || c.email,
            role: 'candidate',
            candidateId: c.id,
          });
        }
      });
    } else if (target === 'all_companies') {
      // Récupérer 100% des e-mails recruteurs inscrits
      const { data: comps } = await supabaseAdmin
        .from('companies')
        .select('id, name, email');

      (comps || []).forEach(c => {
        if (c.email && c.email.includes('@')) {
          recipientEntries.push({
            email: c.email.trim().toLowerCase(),
            name: c.name || c.email,
            role: 'recruiter',
            companyId: c.id,
          });
        }
      });
    }

    // 3. Dédupliquer les destinataires par adresse e-mail
    const seenEmails = new Set();
    const uniqueRecipients = [];

    for (const entry of recipientEntries) {
      if (entry.email && !seenEmails.has(entry.email)) {
        seenEmails.add(entry.email);
        uniqueRecipients.push(entry);
      }
    }

    if (uniqueRecipients.length === 0) {
      return NextResponse.json(
        { error: 'Aucun destinataire valide trouvé pour cette cible.' },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FretTalent <support@frettalent.fr>';

    // Récupérer un ID de candidature valide pour les contraintes SQL de la table candidature_emails
    const { data: cand } = await supabaseAdmin.from('candidatures').select('id').limit(1).maybeSingle();
    const validCandidatureId = cand?.id || '2450981b-c623-4db2-b0f3-2b4a2c3dbca3';

    // 4. Envoi individuel via Resend avec pixel de tracking et alerte Telegram
    let sentCount = 0;
    const errors = [];

    for (const recipient of uniqueRecipients) {
      try {
        const emailB64 = Buffer.from(recipient.email).toString('base64').replace(/=/g, '');
        const trackingToken = `mail-c-${emailB64}-${Math.random().toString(36).substring(2, 8)}`;
        const trackingUrl = `${baseUrl}/api/premium/open-tracking?t=${trackingToken}`;

        // Générer le HTML de l'e-mail avec le pixel de tracking dynamique
        const htmlBody = await render(
          <MarketingEmail
            type={type}
            title={title}
            message={message}
            ctaText={ctaText}
            ctaLink={ctaLink}
            trackingUrl={trackingUrl}
          />,
        );

        // Enregistrer l'envoi dans candidature_emails pour activer le tracking d'ouverture et l'alerte Telegram
        try {
          await supabaseAdmin.from('candidature_emails').insert({
            candidature_id: validCandidatureId,
            candidate_id: recipient.candidateId || null,
            entreprise_id: recipient.entrepriseId || recipient.companyId || null,
            company_name: recipient.name || recipient.email,
            company_email: recipient.email,
            tracking_token: trackingToken,
            status: 'sent',
            open_count: 0,
            sent_at: new Date().toISOString(),
          });

          // Si c'est une entreprise du Registre, mettre à jour son statut de contact
          if (recipient.entrepriseId) {
            await supabaseAdmin
              .from('entreprises')
              .update({
                statut_contact: 'contacté',
                notes: `Email commercial envoyé le ${new Date().toLocaleDateString('fr-FR')}`,
                updated_at: new Date().toISOString(),
              })
              .eq('id', recipient.entrepriseId);
          }
        } catch (dbErr) {
          console.warn('[Admin Mail] Warning enregistrement token tracking:', dbErr.message);
        }

        // Envoi via Resend API
        const { error: resendError } = await resend.emails.send({
          from: fromEmail,
          to: recipient.email,
          subject: subject || title,
          html: htmlBody,
          headers: {
            'List-Unsubscribe': `<mailto:support@frettalent.fr?subject=unsubscribe>`,
          },
        });

        if (resendError) {
          console.error(`Erreur Resend pour ${recipient.email}:`, resendError);
          errors.push(recipient.email);
        } else {
          sentCount++;
        }
      } catch (err) {
        console.error(`Exception envoi Resend à ${recipient.email}:`, err.message);
        errors.push(recipient.email);
      }
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      total_targeted: uniqueRecipients.length,
      errors_count: errors.length,
      message: `${sentCount} e-mail(s) envoyé(s) avec succès${errors.length > 0 ? `, ${errors.length} échec(s)` : ''}`,
    });
  } catch (err) {
    console.error('Erreur API Mail:', err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'e-mail: " + err.message },
      { status: 500 },
    );
  }
}
