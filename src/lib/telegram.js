/**
 * Service de Notifications Telegram pour l'Administrateur FretTalent
 * 
 * Variables d'environnement requises :
 * - TELEGRAM_BOT_TOKEN : Token du bot créé via @BotFather (ex: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ)
 * - TELEGRAM_ADMIN_CHAT_ID : ID du chat ou groupe Telegram où envoyer les alertes (ex: 123456789 ou -100123456789)
 */

export async function sendTelegramMessage(htmlMessage) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      '[Telegram Notification] TELEGRAM_BOT_TOKEN ou TELEGRAM_ADMIN_CHAT_ID manquant dans les variables d\'environnement.'
    );
    return { success: false, reason: 'Variables d\'environnement non configurées' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('[Telegram Notification] Erreur API Telegram:', data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Telegram Notification] Exception lors de l\'envoi:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 1. Alerte : Nouveau Chauffeur inscrit
 */
export async function notifyTelegramNewCandidate({
  candidateName,
  email,
  phone,
  city,
  postalCode,
  country = 'FR',
  licenses = [],
}) {
  const flag = country === 'BE' ? '🇧🇪' : country === 'LU' ? '🇱🇺' : country === 'CH' ? '🇨🇭' : '🇫🇷';
  const licensesStr = licenses.length > 0 ? licenses.join(', ') : 'Permis C/CE';

  const message = `
🚛 <b>NOUVEAU CHAUFFEUR INSCRIT !</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Nom :</b> ${escapeHtml(candidateName || 'Non renseigné')}
📧 <b>E-mail :</b> ${escapeHtml(email || '—')}
📞 <b>Téléphone :</b> ${escapeHtml(phone || '—')}
📍 <b>Ville :</b> ${escapeHtml(city || '—')} (${escapeHtml(postalCode || '—')}) ${flag}
🪪 <b>Permis :</b> ${escapeHtml(licensesStr)}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

🔗 <a href="https://www.frettalent.fr/dashboard/admin/candidates">Ouvrir l'Espace Admin</a>
`.trim();

  return sendTelegramMessage(message);
}

/**
 * 2. Alerte : Nouvelle Entreprise inscrite
 */
export async function notifyTelegramNewCompany({
  companyName,
  email,
  country = 'FR',
  identifier,
  city,
  postalCode,
}) {
  const flag = country === 'BE' ? '🇧🇪' : country === 'LU' ? '🇱🇺' : country === 'CH' ? '🇨🇭' : '🇫🇷';

  const message = `
🏢 <b>NOUVELLE ENTREPRISE INSCRITE !</b>
━━━━━━━━━━━━━━━━━━
🏭 <b>Société :</b> ${escapeHtml(companyName || 'Non renseigné')}
📧 <b>E-mail :</b> ${escapeHtml(email || '—')}
🆔 <b>Identifiant légal :</b> ${escapeHtml(identifier || '—')} ${flag}
📍 <b>Localisation :</b> ${escapeHtml(city || '—')} (${escapeHtml(postalCode || '—')})
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

🔗 <a href="https://www.frettalent.fr/dashboard/admin/companies">Voir les entreprises</a>
`.trim();

  return sendTelegramMessage(message);
}

/**
 * 3. Alerte : Dépôt de documents par un candidat
 */
export async function notifyTelegramDocumentsUploaded({
  candidateName,
  candidateId,
  city,
  country = 'FR',
  uploadedCount,
  totalRequired = 7,
  isComplete = false,
  docLabel = '',
}) {
  const flag = country === 'BE' ? '🇧🇪' : country === 'LU' ? '🇱🇺' : country === 'CH' ? '🇨🇭' : '🇫🇷';
  const statusEmoji = isComplete ? '✅ <b>DOSSIER 100% COMPLET !</b>' : '📄 <b>Nouveau document déposé</b>';

  const message = `
${statusEmoji}
━━━━━━━━━━━━━━━━━━
👤 <b>Chauffeur :</b> ${escapeHtml(candidateName || 'Candidat')}
📍 <b>Ville :</b> ${escapeHtml(city || '—')} ${flag}
📎 <b>Document :</b> ${escapeHtml(docLabel || 'Justificatif')}
📊 <b>Progression :</b> ${uploadedCount}/${totalRequired} pièces officielles ${isComplete ? '🎉' : ''}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

${isComplete ? '👉 <i>Le dossier est prêt à être validé et certifié !</i>\n' : ''}
🔗 <a href="https://www.frettalent.fr/dashboard/admin/candidates/${candidateId || ''}">Vérifier le dossier candidat</a>
`.trim();

  return sendTelegramMessage(message);
}

/**
 * 4. Alerte : Nouvelle Demande / Ticket Tchat Support
 */
export async function notifyTelegramNewSupportTicket({
  userName,
  userEmail,
  userRole = 'candidate',
  subject,
  messagePreview,
}) {
  const roleLabel = userRole === 'recruiter' ? '🏢 Entreprise' : '🚛 Chauffeur';

  const message = `
💬 <b>NOUVELLE DEMANDE TCHAT SUPPORT !</b>
━━━━━━━━━━━━━━━━━━
👤 <b>De :</b> ${escapeHtml(userName || userEmail || 'Utilisateur')} (${roleLabel})
📧 <b>E-mail :</b> ${escapeHtml(userEmail || '—')}
📝 <b>Sujet :</b> ${escapeHtml(subject || 'Assistance')}
💬 <b>Message :</b>
<i>"${escapeHtml(truncate(messagePreview, 250))}"</i>

⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

🔗 <a href="https://www.frettalent.fr/dashboard/admin/chat">Répondre dans le Tchat Support</a>
`.trim();

  return sendTelegramMessage(message);
}

/**
 * 5. Alerte : Nouveau Message dans un Tchat Existant
 */
export async function notifyTelegramSupportMessage({
  userName,
  userEmail,
  userRole = 'candidate',
  subject,
  messagePreview,
}) {
  const roleLabel = userRole === 'recruiter' ? '🏢 Entreprise' : '🚛 Chauffeur';

  const message = `
📩 <b>NOUVEAU MESSAGE SUR LE TCHAT !</b>
━━━━━━━━━━━━━━━━━━
👤 <b>De :</b> ${escapeHtml(userName || userEmail || 'Utilisateur')} (${roleLabel})
📝 <b>Conversation :</b> ${escapeHtml(subject || 'Support')}
💬 <b>Réponse :</b>
<i>"${escapeHtml(truncate(messagePreview, 250))}"</i>

⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

🔗 <a href="https://www.frettalent.fr/dashboard/admin/chat">Accéder à la conversation</a>
`.trim();

  return sendTelegramMessage(message);
}

/**
 * 6. Alerte : Déblocage de Candidat / Paiement Stripe
 */
export async function notifyTelegramUnlock({
  companyName,
  candidateName,
  candidateCity,
  amount = 2.0,
}) {
  const message = `
💳 <b>DÉBLOCAGE COORDONNÉES EFFECTUÉ !</b>
━━━━━━━━━━━━━━━━━━
🏢 <b>Entreprise :</b> ${escapeHtml(companyName || 'Recruteur')}
👤 <b>Candidat débloqué :</b> ${escapeHtml(candidateName || 'Chauffeur')} (${escapeHtml(candidateCity || '—')})
💰 <b>Montant :</b> +${amount.toFixed(2)} € (Stripe)
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

🔗 <a href="https://www.frettalent.fr/dashboard/admin/finance">Voir les transactions</a>
`.trim();

  return sendTelegramMessage(message);
}

/**
 * 7. Message de test Telegram
 */
export async function notifyTelegramTest() {
  const message = `
🚀 <b>TEST BOT TELEGRAM FRETTALENT RÉUSSI !</b>
━━━━━━━━━━━━━━━━━━
✅ Votre robot Telegram est parfaitement connecté et opérationnel.
Vous recevrez désormais en temps réel les notifications pour :
• 🚛 Nouvelles inscriptions de chauffeurs
• 🏢 Nouvelles inscriptions d'entreprises
• 📄 Dépôts de documents & dossiers complets
• 💬 Nouvelles demandes et messages de tchat support
• 💳 Déblocages de contacts et paiements Stripe

⏱ <b>Date du test :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
`.trim();

  return sendTelegramMessage(message);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str, maxLen = 200) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}
