require('dotenv').config({ path: './.env.local' });

const emailHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" />
  </head>
  <body style="background-color: #f1f5f9; padding: 40px 10px; margin: 0; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width: 560px; margin: 0 auto; width: 100%;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 20px 20px 0 0; padding: 36px 32px 28px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: 900; color: #ffffff; margin: 0 0 6px; letter-spacing: -0.5px;">
          Fret<span style="color: #f97316;">Talent</span>
        </h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 0; font-weight: 500;">
          La plateforme n°1 du recrutement transport & logistique
        </p>
      </div>

      <!-- Main Card -->
      <div style="background-color: #ffffff; padding: 36px 36px 32px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; border-radius: 9999px; padding: 6px 14px; font-size: 12px; font-weight: 700; display: inline-block;">
            ✉️ Validation de votre adresse e-mail
          </span>
        </div>

        <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0 0 16px;">
          Bienvenue sur FretTalent ! 👋
        </h2>

        <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 24px;">
          Merci de nous rejoindre. Pour finaliser la création de votre compte et accéder à la plateforme de recrutement transport, veuillez confirmer votre adresse e-mail.
        </p>

        <!-- CTA Box -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
          <p style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 0 0 16px;">
            Confirmez votre compte dès maintenant :
          </p>
          <a href="{{ .ConfirmationURL }}" style="background-color: #f97316; border-radius: 12px; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; text-align: center; display: inline-block; padding: 14px 28px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);">
            Activer mon compte FretTalent →
          </a>
          <p style="color: #64748b; font-size: 12px; margin: 14px 0 0;">
            Ce lien est sécurisé et valable pendant 24 heures.
          </p>
        </div>

        <!-- Alt Link -->
        <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">
          Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
        </p>
        <p style="word-break: break-all; margin: 0 0 24px;">
          <a href="{{ .ConfirmationURL }}" style="color: #f97316; font-size: 12px; text-decoration: underline;">
            {{ .ConfirmationURL }}
          </a>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

        <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0;">
          Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail en toute sécurité.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding: 24px 16px 0; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">
          © 2026 FretTalent. Tous droits réservés.
        </p>
      </div>
    </div>
  </body>
</html>`;

async function updateSupabaseEmailTemplate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Connexion à la Management API de Supabase pour le projet :', supabaseUrl);

  // Endpoint Supabase Auth Admin Config (GoTrue)
  const endpoint = `${supabaseUrl}/auth/v1/admin/config`;

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        MAILER_SUBJECTS_CONFIRMATION: 'Activer votre compte FretTalent 🚚',
        MAILER_TEMPLATES_CONFIRMATION_CONTENT: emailHtml,
      }),
    });

    const status = response.status;
    const bodyText = await response.text();
    console.log('Statut de la requête API :', status);
    console.log('Réponse :', bodyText);

    if (response.ok) {
      console.log('✅ Le template d\'e-mail de confirmation a été mis à jour directement sur Supabase !');
    } else {
      console.log('L\'API GoTrue à cet endpoint n\'est pas directement modifiable via service_role API. Tentative alternative via Supabase Management API...');
    }
  } catch (err) {
    console.error('Erreur API :', err.message);
  }
}

updateSupabaseEmailTemplate();
