import { NextResponse } from 'next/server';
import { sendContactFormEmails } from '@/lib/email-service';
import { sendTelegramPartnershipNotification } from '@/lib/telegram';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, partnerType, message } = body;

    // Validation des champs obligatoires
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires (Nom, E-mail, Message).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Veuillez fournir une adresse e-mail valide.' },
        { status: 400 }
      );
    }

    const formattedSubject = `🤝 Demande de Partenariat [${partnerType || 'Général'}] - ${company || name}`;

    // 1. Envoi des e-mails (Support FretTalent + Confirmation automatique au souscripteur)
    const emailResults = await sendContactFormEmails({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      role: 'Partner Request',
      subject: formattedSubject,
      message: `ENTREPRISE / ORGANISME: ${company || 'Non spécifié'}\nTYPE DE PARTENARIAT: ${partnerType || 'Général'}\n\nPROPOSITION:\n${message.trim()}`,
    });

    // 2. Notification Telegram instantanée à l'admin
    try {
      await sendTelegramPartnershipNotification({
        name: name.trim(),
        company: company ? company.trim() : '',
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : '',
        partnerType: partnerType || 'Général',
        message: message.trim(),
      });
    } catch (teleErr) {
      console.error('[Partenariat API] Erreur Telegram:', teleErr);
    }

    // 3. Archivage optionnel Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('contact_messages').insert([
          {
            name: `${name.trim()} (${company || 'Partenaire'})`,
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            role: 'partner',
            subject: formattedSubject,
            message: message.trim(),
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (dbErr) {
      console.log('[Partenariat API] Note Supabase:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Votre demande de partenariat a bien été transmise à notre équipe. Nous prendrons contact avec vous sous 24h ouvrées.',
      emailResults,
    });
  } catch (error) {
    console.error('Erreur API /api/partenariat:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la transmission. Vous pouvez nous contacter directement à support@frettalent.fr.' },
      { status: 500 }
    );
  }
}
