import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';
import MarketingEmail from '@/emails/MarketingEmail';

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

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 2. Récupération des destinataires
    let recipientEmails = [];

    if (target === 'specific' && specificEmails) {
      recipientEmails = specificEmails
        .split(',')
        .map(e => e.trim())
        .filter(e => e);
    } else if (target === 'all_candidates' || target === 'all_companies') {
      const roleFilter =
        target === 'all_candidates' ? 'candidate' : 'recruiter';
      const { data: profilesList } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', roleFilter);

      if (profilesList && profilesList.length > 0) {
        const {
          data: { users },
        } = await supabaseAdmin.auth.admin.listUsers();
        const profileIds = new Set(profilesList.map(p => p.id));

        recipientEmails = users
          .filter(u => profileIds.has(u.id) && u.email)
          .map(u => u.email);
      }
    }

    if (recipientEmails.length === 0) {
      return NextResponse.json(
        { error: 'Aucun destinataire trouvé' },
        { status: 400 },
      );
    }

    // 3. Rendu du Template React Email
    const htmlBody = await render(
      <MarketingEmail
        type={type}
        title={title}
        message={message}
        ctaText={ctaText}
        ctaLink={ctaLink}
      />,
    );

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FretTalent <support@frettalent.fr>';

    // 4. Envoi via Resend (Domaine vérifié DKIM / SPF)
    let sentCount = 0;
    const errors = [];

    for (const email of recipientEmails) {
      try {
        const { error: resendError } = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: subject || title,
          html: htmlBody,
          headers: {
            'List-Unsubscribe': `<mailto:support@frettalent.fr?subject=unsubscribe>`,
          },
        });

        if (resendError) {
          console.error(`Erreur Resend pour ${email}:`, resendError);
          errors.push(email);
        } else {
          sentCount++;
        }
      } catch (err) {
        console.error(`Exception envoi Resend à ${email}:`, err.message);
        errors.push(email);
      }
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      message: `${sentCount} e-mail(s) envoyé(s) avec succès${errors.length > 0 ? `, ${errors.length} échec(s)` : ''}`,
    });
  } catch (err) {
    console.error('Erreur API Mail:', err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'e-mail" },
      { status: 500 },
    );
  }
}
