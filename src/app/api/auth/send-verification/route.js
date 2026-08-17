import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationEmail } from '@/lib/email-service';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.frettalent.fr';
    const redirectTo = `${siteUrl}/login?confirmed=true`;

    // Générer le lien de confirmation Supabase sécurisé
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.warn('generateLink warning:', linkError.message);
      return NextResponse.json({ error: linkError.message }, { status: 400 });
    }

    const confirmationUrl = linkData?.properties?.action_link;
    if (!confirmationUrl) {
      return NextResponse.json({ error: 'Impossible de générer le lien de confirmation' }, { status: 500 });
    }

    // Envoyer via Resend pour une délivrabilité maximale (support@frettalent.fr)
    const emailResult = await sendVerificationEmail(email, confirmationUrl);

    if (!emailResult.success) {
      console.error('Erreur Resend sendVerificationEmail:', emailResult.error);
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `E-mail de confirmation envoyé à ${email}`,
    });
  } catch (err) {
    console.error('Erreur API send-verification:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
