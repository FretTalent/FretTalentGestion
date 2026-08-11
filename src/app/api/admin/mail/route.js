import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
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
      const tableName =
        target === 'all_candidates' ? 'candidates' : 'companies';
      // Fetch users from auth.users via profiles, but since candidates/companies tables have emails?
      // Wait, candidates table has 'email'. companies table doesn't have email in the schema! It relies on auth.users for email.
      // So we should query auth.users instead, filtering by role in profiles.
      // Or query profiles and fetch email from auth.users.
      // Fortunately, supabaseAdmin.auth.admin.listUsers() can list users.
      // But a simple join on profiles and candidates/companies might be easier.
      // Let's just fetch from profiles and then use auth admin API to map emails.
      const roleFilter =
        target === 'all_candidates' ? 'candidate' : 'recruiter';
      const { data: profilesList } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', roleFilter);

      if (profilesList && profilesList.length > 0) {
        // Fetch all users to get their emails
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

    // 4. Configuration Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-fr.securemail.pro',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 5. Envoi du mail
    // On utilise BCC pour envoyer à plusieurs personnes sans qu'elles voient les autres adresses.
    // L'adresse 'to' sera l'adresse de support (ou l'expéditeur) pour que le champ "À" ne soit pas vide.
    const mailOptions = {
      from: `"FretTalent" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // S'envoyer à soi-même
      bcc: recipientEmails.join(', '), // Liste des destinataires cachés
      subject: subject || title,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `${recipientEmails.length} e-mail(s) envoyé(s)`,
      info: info.messageId,
    });
  } catch (err) {
    console.error('Erreur API Mail:', err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'e-mail" },
      { status: 500 },
    );
  }
}
