import { NextResponse } from 'next/server';
import { sendContactFormEmails } from '@/lib/email-service';
import { sendTelegramContactNotification } from '@/lib/telegram';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, subject, message } = body;

    // Validation des champs obligatoires
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires (Nom, Email, Sujet, Message).' },
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

    // 1. Envoi des e-mails (Support FretTalent + Confirmation automatique au visiteur)
    const emailResults = await sendContactFormEmails({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      role: role || 'other',
      subject: subject.trim(),
      message: message.trim(),
    });

    // 2. Notification Telegram instantanée à l'admin
    try {
      await sendTelegramContactNotification({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : '',
        role: role || 'other',
        subject: subject.trim(),
        message: message.trim(),
      });
    } catch (teleErr) {
      console.error('Erreur notification Telegram contact:', teleErr);
    }

    // 3. Optionnel : Enregistrement dans Supabase pour historique
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('contact_messages').insert([
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            role: role || 'other',
            subject: subject.trim(),
            message: message.trim(),
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (dbErr) {
      // Non-bloquant si la table n'existe pas
      console.log('Note Supabase contact_messages:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Votre message a été transmis avec succès à notre équipe. Un accusé de réception vous a été envoyé par e-mail.',
      emailResults,
    });
  } catch (error) {
    console.error('Erreur API /api/contact:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer ou nous écrire directement à support@frettalent.fr.' },
      { status: 500 }
    );
  }
}
