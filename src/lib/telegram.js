/**
 * Service Avancé de Notifications & Commandes Telegram FretTalent
 */

import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8965208658:AAFHr8KYT6Z7oX4-iBzcA-bWAMCFsGIUkcY';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '8376439336';

export async function sendTelegramMessage(htmlMessage, options = {}) {
  const token = BOT_TOKEN;
  const chatId = options.chatId || ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] Token ou Chat ID manquant.');
    return { success: false, reason: 'Variables non configurées' };
  }

  try {
    const payload = {
      chat_id: chatId,
      text: htmlMessage,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    if (options.reply_markup) {
      payload.reply_markup = options.reply_markup;
    }

    if (options.reply_to_message_id) {
      payload.reply_to_message_id = options.reply_to_message_id;
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error('[Telegram] Erreur sendMessage:', data);
      return { success: false, error: data };
    }

    return { success: true, data: data.result };
  } catch (error) {
    console.error('[Telegram] Exception sendMessage:', error);
    return { success: false, error: error.message };
  }
}

export async function answerTelegramCallbackQuery(callbackQueryId, text = '', showAlert = false) {
  const token = BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: showAlert,
      }),
    });
  } catch (err) {
    console.error('[Telegram] Erreur answerCallbackQuery:', err);
  }
}

export async function editTelegramMessageText(chatId, messageId, newHtmlText, replyMarkup = null) {
  const token = BOT_TOKEN;
  if (!token) return;

  try {
    const payload = {
      chat_id: chatId,
      message_id: messageId,
      text: newHtmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;

    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[Telegram] Erreur editMessageText:', err);
  }
}

/**
 * 1. Alerte : Nouveau Chauffeur inscrit avec bouton direct
 */
export async function notifyTelegramNewCandidate({
  candidateName,
  candidateId,
  email,
  phone,
  city,
  postalCode,
  country = 'FR',
  licenses = [],
}) {
  const flag = country === 'BE' ? '🇧🇪' : country === 'LU' ? '🇱🇺' : country === 'CH' ? '🇨🇭' : '🇫🇷';
  const licensesStr = licenses.length > 0 ? licenses.join(', ') : 'Permis C / CE';

  const message = `
🚛 <b>NOUVEAU CHAUFFEUR INSCRIT !</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Nom :</b> ${escapeHtml(candidateName || 'Chauffeur')}
📧 <b>E-mail :</b> ${escapeHtml(email || '—')}
📞 <b>Téléphone :</b> ${escapeHtml(phone || '—')}
📍 <b>Ville :</b> ${escapeHtml(city || '—')} (${escapeHtml(postalCode || '—')}) ${flag}
🪪 <b>Permis :</b> ${escapeHtml(licensesStr)}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: '🔍 Voir le Chauffeur',
          url: `https://www.frettalent.fr/dashboard/admin/candidates${candidateId ? `/${candidateId}` : ''}`,
        },
      ],
    ],
  };

  return sendTelegramMessage(message, { reply_markup });
}

/**
 * 2. Alerte : Nouvelle Entreprise inscrite
 */
export async function notifyTelegramNewCompany({
  companyName,
  companyId,
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
🏭 <b>Société :</b> ${escapeHtml(companyName || 'Entreprise')}
📧 <b>E-mail :</b> ${escapeHtml(email || '—')}
🆔 <b>Identifiant légal :</b> ${escapeHtml(identifier || '—')} ${flag}
📍 <b>Localisation :</b> ${escapeHtml(city || '—')} (${escapeHtml(postalCode || '—')})
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: '🔍 Voir les Entreprises',
          url: 'https://www.frettalent.fr/dashboard/admin/companies',
        },
      ],
    ],
  };

  return sendTelegramMessage(message, { reply_markup });
}

/**
 * 3. Alerte : Dossier de documents 100% complet avec boutons d'action rapide (Valider en 1 clic !)
 */
export async function notifyTelegramDocumentsUploaded({
  candidateName,
  candidateId,
  city,
  country = 'FR',
  uploadedCount = 7,
  totalRequired = 7,
  docList = [],
  missingDocs = [],
}) {
  const flag = country === 'BE' ? '🇧🇪' : country === 'LU' ? '🇱🇺' : country === 'CH' ? '🇨🇭' : '🇫🇷';
  const isStrictlyComplete = missingDocs.length === 0;

  const docsDetail = docList.length > 0
    ? `\n📋 <b>Pièces déposées :</b>\n${docList.map(d => `  ✅ ${escapeHtml(d)}`).join('\n')}`
    : '';

  const missingDetail = missingDocs.length > 0
    ? `\n⚠️ <b>Pièces obligatoires manquantes :</b>\n${missingDocs.map(d => `  ❌ ${escapeHtml(d)}`).join('\n')}`
    : '';

  const statusTitle = isStrictlyComplete
    ? `🎉 <b>DOSSIER CHAUFFEUR 100% COMPLET !</b> 🛡️`
    : `📑 <b>DÉPÔT DE DOCUMENTS CHAUFFEUR (${uploadedCount}/${totalRequired})</b>`;

  const footerNotice = isStrictlyComplete
    ? `👉 <i>Tous les justificatifs indispensables (CV, Permis Recto/Verso, Chrono Recto/Verso, FIMO Recto/Verso) sont conformes !</i>`
    : `👉 <i>Attention : Le dossier n'a pas encore toutes les pièces indispensables pour être certifié.</i>`;

  const message = `
${statusTitle}
━━━━━━━━━━━━━━━━━━
👤 <b>Chauffeur :</b> ${escapeHtml(candidateName || 'Candidat')}
📍 <b>Ville :</b> ${escapeHtml(city || '—')} ${flag}
📑 <b>Total :</b> ${uploadedCount}/${totalRequired} pièces obligatoires
${docsDetail}${missingDetail}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

${footerNotice}
`.trim();

  const inline_keyboard = [];

  if (candidateId) {
    if (isStrictlyComplete) {
      inline_keyboard.push([
        {
          text: '🛡️ Valider le Chauffeur (1 Clic)',
          callback_data: `validate_cand:${candidateId}`,
        },
      ]);
    }

    inline_keyboard.push([
      {
        text: '📂 Consulter le Dossier Complet',
        url: `https://www.frettalent.fr/dashboard/admin/candidates/${candidateId}`,
      },
    ]);
  }

  return sendTelegramMessage(message, {
    reply_markup: inline_keyboard.length > 0 ? { inline_keyboard } : undefined,
  });
}

/**
 * 4. Alerte : Nouvelle Demande Tchat Support (Avec tag de conversation pour réponse directe)
 */
export async function notifyTelegramNewSupportTicket({
  conversationId,
  userName,
  userEmail,
  userRole = 'candidate',
  subject,
  messagePreview,
}) {
  const roleLabel = userRole === 'recruiter' ? '🏢 Entreprise' : '🚛 Chauffeur';
  const tag = conversationId ? `#ticket_${conversationId}` : '';

  const message = `
💬 <b>NOUVELLE DEMANDE TCHAT SUPPORT !</b>
━━━━━━━━━━━━━━━━━━
👤 <b>De :</b> ${escapeHtml(userName || userEmail || 'Utilisateur')} (${roleLabel})
📧 <b>E-mail :</b> ${escapeHtml(userEmail || '—')}
📝 <b>Sujet :</b> ${escapeHtml(subject || 'Assistance')}
💬 <b>Message :</b>
<i>"${escapeHtml(truncate(messagePreview, 280))}"</i>

⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

💡 <i>Astuce : Faites "Répondre" (Reply) à ce message pour répondre directement à l'utilisateur sur le tchat !</i>
${tag}
`.trim();

  const inline_keyboard = [
    [
      {
        text: '💬 Répondre sur le Site',
        url: `https://www.frettalent.fr/dashboard/admin/chat?id=${conversationId || ''}`,
      },
    ],
  ];

  if (conversationId) {
    inline_keyboard[0].push({
      text: '🔒 Clôturer',
      callback_data: `resolve_conv:${conversationId}`,
    });
  }

  return sendTelegramMessage(message, { reply_markup: { inline_keyboard } });
}

/**
 * 5. Alerte : Réponse / Message Tchat Support
 */
export async function notifyTelegramSupportMessage({
  conversationId,
  userName,
  userEmail,
  userRole = 'candidate',
  subject,
  messagePreview,
}) {
  const roleLabel = userRole === 'recruiter' ? '🏢 Entreprise' : '🚛 Chauffeur';
  const tag = conversationId ? `#ticket_${conversationId}` : '';

  const message = `
📩 <b>NOUVEAU MESSAGE SUR LE TCHAT !</b>
━━━━━━━━━━━━━━━━━━
👤 <b>De :</b> ${escapeHtml(userName || userEmail || 'Utilisateur')} (${roleLabel})
📝 <b>Conversation :</b> ${escapeHtml(subject || 'Support')}
💬 <b>Réponse :</b>
<i>"${escapeHtml(truncate(messagePreview, 280))}"</i>

⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

💡 <i>Faites "Répondre" (Reply) à ce message pour lui répondre directement !</i>
${tag}
`.trim();

  const inline_keyboard = [
    [
      {
        text: '💬 Ouvrir la Discussion',
        url: `https://www.frettalent.fr/dashboard/admin/chat?id=${conversationId || ''}`,
      },
    ],
  ];

  if (conversationId) {
    inline_keyboard[0].push({
      text: '🔒 Clôturer',
      callback_data: `resolve_conv:${conversationId}`,
    });
  }

  return sendTelegramMessage(message, { reply_markup: { inline_keyboard } });
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
`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: '📊 Voir les Transactions',
          url: 'https://www.frettalent.fr/dashboard/admin/finance',
        },
      ],
    ],
  };

  return sendTelegramMessage(message, { reply_markup });
}

/**
 * 7. Briefing Matinal Automatique Quotidien (8h00)
 */
export async function sendDailyMorningBriefing() {
  try {
    const supabaseAdmin = getAdminClient();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Chauffeurs
    const { count: totalCandidates } = await supabaseAdmin
      .from('candidates')
      .select('*', { count: 'exact', head: true });

    const { count: newCandidates24h } = await supabaseAdmin
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday);

    const { count: pendingCandidates } = await supabaseAdmin
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('validated', false);

    // 2. Entreprises
    const { count: totalCompanies } = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact', head: true });

    const { count: newCompanies24h } = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday);

    // 3. Offres
    const { count: pendingJobs } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);

    // 4. Déblocages 24h
    const { data: unlocks24h } = await supabaseAdmin
      .from('unlocks')
      .select('amount_charged')
      .gte('created_at', yesterday);

    const revenue24h = (unlocks24h || []).reduce((acc, u) => acc + (u.amount_charged || 200), 0) / 100;

    // 5. Support ouvert
    const { count: openSupport } = await supabaseAdmin
      .from('support_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    const dateStr = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Paris',
    });

    const message = `
☀️ <b>BRIEFING MATINAL FRETTALENT</b>
📅 <i>${capitalize(dateStr)}</i>
━━━━━━━━━━━━━━━━━━━━

📊 <b>Activité des Dernières 24 Heures :</b>
• 🚛 <b>+${newCandidates24h || 0}</b> nouveau(x) chauffeur(s) inscrit(s)
• 🏢 <b>+${newCompanies24h || 0}</b> nouvelle(s) entreprise(s)
• 💰 <b>+${revenue24h.toFixed(2)} €</b> de revenus Stripe générés

⚡ <b>Actions Requises Aujourd'hui :</b>
• ⚠️ <b>${pendingCandidates || 0}</b> dossier(s) chauffeur en attente de vérification
• 💼 <b>${pendingJobs || 0}</b> offre(s) d'emploi à modérer
• 💬 <b>${openSupport || 0}</b> ticket(s) support ouvert(s)

🌐 <b>Réseau Global FretTalent :</b>
• 🚛 <b>${totalCandidates || 0}</b> Chauffeurs inscrits au total
• 🏢 <b>${totalCompanies || 0}</b> Entreprises de transport actives

Bonne journée et bon pilotage ! 🚀
`.trim();

    const reply_markup = {
      inline_keyboard: [
        [
          { text: '🛡️ Centre de Pilotage', url: 'https://www.frettalent.fr/dashboard/admin' },
          { text: '⏳ Dossiers en Attente', url: 'https://www.frettalent.fr/dashboard/admin/candidates?status=pending' },
        ],
      ],
    };

    return sendTelegramMessage(message, { reply_markup });
  } catch (error) {
    console.error('Erreur sendDailyMorningBriefing:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 8. Message de test Telegram
 */
export async function notifyTelegramTest() {
  const message = `
🚀 <b>TEST BOT TELEGRAM FRETTALENT RÉUSSI !</b>
━━━━━━━━━━━━━━━━━━
✅ Votre robot Telegram est parfaitement connecté et opérationnel.
Toutes les commandes interactives sont actives :
• 📊 <b>/stats</b> : Métriques & Chiffres clés en direct
• ⏳ <b>/attente</b> : Chauffeurs à valider en 1 clic
• 🏢 <b>/entreprises</b> : Dernières sociétés inscrites
• 💬 <b>/support</b> : Tickets en attente de réponse
• 💳 <b>/ventes</b> : Dernières transactions Stripe
• ☀️ <b>/briefing</b> : Recevoir le rapport matinal

⏱ <b>Date du test :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '📊 Stats en Direct', callback_data: 'cmd_stats' },
        { text: '⏳ À Valider', callback_data: 'cmd_attente' },
      ],
      [
        { text: '🌐 Ouvrir Admin', url: 'https://www.frettalent.fr/dashboard/admin' },
      ],
    ],
  };

  return sendTelegramMessage(message, { reply_markup });
}

/**
 * Envoie une alerte Telegram instantanée à l'admin lors d'une soumission de formulaire de contact
 */
export async function sendTelegramContactNotification({
  name,
  email,
  phone,
  role,
  subject,
  message,
}) {
  const roleEmoji = role === 'recruiter' ? '🏢' : role === 'candidate' ? '🚚' : '🤝';
  const roleLabel =
    role === 'recruiter'
      ? 'Entreprise / Transporteur'
      : role === 'candidate'
      ? 'Chauffeur / Candidat'
      : 'Partenaire / Autre';

  const telegramMsg = `📬 <b>NOUVEAU MESSAGE DE CONTACT SUR FRETTALENT</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>De :</b> ${escapeHtml(name)} (${roleEmoji} <i>${roleLabel}</i>)
✉️ <b>Email :</b> <code>${escapeHtml(email)}</code>
📞 <b>Téléphone :</b> <code>${escapeHtml(phone || 'Non renseigné')}</code>
🎯 <b>Sujet :</b> <b>${escapeHtml(subject)}</b>

💬 <b>Message :</b>
<i>"${escapeHtml(truncate(message, 400))}"</i>
━━━━━━━━━━━━━━━━━━━━
📅 <i>Reçu le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</i>`;

  const inlineKeyboard = [
    [
      { text: '✉️ Répondre par Email', url: `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}` },
    ],
  ];

  if (phone) {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    inlineKeyboard[0].push({ text: '📞 Appeler', url: `tel:${cleanPhone}` });
  }

  inlineKeyboard.push([
    { text: '🌐 Espace Admin FretTalent', url: 'https://www.frettalent.fr/dashboard/admin' },
  ]);

  return sendTelegramMessage(telegramMsg, {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
}

/**
 * Alerte Telegram Admin : Achat Forfait Auto-Candidature Premium (19,99 €)
 */
export async function sendTelegramPremiumPurchaseNotification({
  candidateName,
  candidateCity,
  candidatePostalCode,
  companiesCount,
  amount = '19,99 €',
}) {
  const telegramMsg = `🚀 <b>NOUVELLE AUTO-CANDIDATURE PREMIUM (19,99 €)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Chauffeur :</b> ${escapeHtml(candidateName)}
📍 <b>Localisation :</b> ${escapeHtml(candidatePostalCode || '')} ${escapeHtml(candidateCity || 'France')}
🏢 <b>Entreprises ciblées (50 km) :</b> <b>${companiesCount} transporteurs</b>
💳 <b>Montant encaissé :</b> <b>${amount}</b>
⭐ <b>Badge :</b> Actif 48h sur la carte
━━━━━━━━━━━━━━━━━━━━
📅 <i>${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</i>`;

  const inlineKeyboard = [
    [
      { text: '📊 Dashboard Admin', url: 'https://www.frettalent.fr/dashboard/admin' },
      { text: '🚚 Voir Candidats', url: 'https://www.frettalent.fr/dashboard/admin/candidates' },
    ],
  ];

  return sendTelegramMessage(telegramMsg, {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
}

/**
 * Alerte Telegram Admin : Une entreprise a ouvert une candidature Premium
 */
export async function sendTelegramCandidatureOpenedNotification({
  companyName,
  companyCity,
  candidateName,
}) {
  const telegramMsg = `👁️ <b>CANDIDATURE PREMIUM OUVERTE !</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Entreprise :</b> <b>${escapeHtml(companyName)}</b> (${escapeHtml(companyCity || 'France')})
👤 <b>Chauffeur consulté :</b> <b>${escapeHtml(candidateName)}</b>
✉️ <b>Accusé :</b> Transmis automatiquement par email au chauffeur
━━━━━━━━━━━━━━━━━━━━
📅 <i>${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</i>`;

  return sendTelegramMessage(telegramMsg);
}

/**
 * Alerte Telegram Admin UNIVERSELLE : Un email envoyé a été ouvert (Entreprise, Chauffeur ou Contact)
 */
export async function notifyTelegramEmailOpened({
  recipientEmail,
  recipientName,
  recipientRole = 'unknown', // 'candidate' | 'recruiter' | 'contact' | 'unknown'
  emailSubject,
  emailType,
  companyName,
  candidateName,
  openCount = 1,
  ip,
  userAgent,
}) {
  const roleBadge =
    recipientRole === 'recruiter'
      ? '🏢 Entreprise / Recruteur'
      : recipientRole === 'candidate'
      ? '🚛 Chauffeur / Candidat'
      : recipientRole === 'contact'
      ? '👤 Contact Externe'
      : '✉️ Destinataire';

  const countBadge = openCount > 1 ? ` (Ouverture N°${openCount})` : ' 🟢 Première lecture';

  const details = [];
  if (companyName) details.push(`🏢 <b>Entreprise :</b> ${escapeHtml(companyName)}`);
  if (candidateName) details.push(`👤 <b>Chauffeur :</b> ${escapeHtml(candidateName)}`);
  if (emailSubject) details.push(`📌 <b>Objet :</b> ${escapeHtml(emailSubject)}`);
  if (emailType) details.push(`🏷️ <b>Type :</b> <code>${escapeHtml(emailType)}</code>`);

  const detailsBlock = details.length > 0 ? `\n${details.join('\n')}` : '';

  const displayRecipient = recipientName && recipientEmail && recipientName !== recipientEmail && recipientName !== 'Destinataire' && recipientName !== 'Chauffeur / Candidat'
    ? `<b>${escapeHtml(recipientName)}</b> &lt;<code>${escapeHtml(recipientEmail)}</code>&gt;`
    : recipientEmail
    ? `<code>${escapeHtml(recipientEmail)}</code>`
    : `<b>${escapeHtml(recipientName || 'Destinataire')}</b>`;

  const telegramMsg = `📬 <b>EMAIL OUVERT &amp; LU !</b>${countBadge}
━━━━━━━━━━━━━━━━━━━━
${roleBadge}
📧 <b>Destinataire :</b> ${displayRecipient}
${detailsBlock}
⏱ <b>Heure de lecture :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
━━━━━━━━━━━━━━━━━━━━
🌐 <i>FretTalent Tracking Système</i>`;

  return sendTelegramMessage(telegramMsg);
}

/**
 * Alerte Telegram Admin : Publication d'une Nouvelle Offre d'Emploi (avec approbation 1-clic)
 */
export async function notifyTelegramNewJob({
  jobId,
  jobTitle,
  companyName,
  city,
  contractType = 'CDI',
  salary,
  licenseRequired,
}) {
  const telegramMsg = `💼 <b>NOUVELLE OFFRE D'EMPLOI DÉPOSÉE !</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Entreprise :</b> ${escapeHtml(companyName || 'Transporteur')}
📌 <b>Poste :</b> ${escapeHtml(jobTitle || 'Chauffeur Routier')}
📍 <b>Ville :</b> ${escapeHtml(city || 'France')}
📄 <b>Contrat :</b> ${escapeHtml(contractType)} ${salary ? `• 💰 ${escapeHtml(salary)}` : ''}
🪪 <b>Permis exigé :</b> ${escapeHtml(licenseRequired || 'Permis C/CE')}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
━━━━━━━━━━━━━━━━━━━━
👉 <i>Modérez et validez l'offre immédiatement en 1-clic ci-dessous :</i>`.trim();

  const inlineKeyboard = [];

  if (jobId) {
    inlineKeyboard.push([
      { text: '✅ Approuver l\'Offre (1 Clic)', callback_data: `approve_job:${jobId}` },
    ]);
    inlineKeyboard.push([
      { text: '🔍 Voir les Offres Admin', url: 'https://www.frettalent.fr/dashboard/admin/jobs' },
    ]);
  }

  return sendTelegramMessage(telegramMsg, {
    reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
  });
}

/**
 * Alerte Telegram Admin : Annulation d'Abonnement Stripe
 */
export async function notifyTelegramSubscriptionCancelled({
  companyName,
  email,
  planName = 'Pro Illimité',
  reason,
}) {
  const telegramMsg = `⚠️ <b>RÉSILUATION D'ABONNEMENT STRIPE</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Entreprise :</b> ${escapeHtml(companyName || 'Société')}
📧 <b>E-mail :</b> <code>${escapeHtml(email || '—')}</code>
📦 <b>Formule résiliée :</b> ${escapeHtml(planName)}
${reason ? `💬 <b>Motif :</b> <i>"${escapeHtml(reason)}"</i>\n` : ''}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '📊 Dashboard Finance', url: 'https://www.frettalent.fr/dashboard/admin/finance' },
      ],
    ],
  };

  return sendTelegramMessage(telegramMsg, { reply_markup });
}

/**
 * Alerte Telegram Admin : Échec de Paiement Stripe
 */
export async function notifyTelegramPaymentFailed({
  companyName,
  email,
  amount = '39,99 €',
  reason = 'Carte rejetée / Fonds insuffisants',
}) {
  const telegramMsg = `❌ <b>ÉCHEC DE PAIEMENT STRIPE !</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Entreprise :</b> ${escapeHtml(companyName || 'Société')}
📧 <b>E-mail :</b> <code>${escapeHtml(email || '—')}</code>
💰 <b>Montant échoué :</b> ${escapeHtml(amount)}
⚠️ <b>Raison :</b> ${escapeHtml(reason)}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '📊 Revoir la Transaction', url: 'https://www.frettalent.fr/dashboard/admin/finance' },
      ],
    ],
  };

  return sendTelegramMessage(telegramMsg, { reply_markup });
}

/**
 * Alerte Telegram Admin : Inscription d'un Candidat "Super Chauffeur" (Haute qualification)
 */
export async function notifyTelegramSuperCandidate({
  candidateName,
  candidateId,
  city,
  licenses = [],
  experienceYears,
}) {
  const licensesStr = licenses.join(', ') || 'Permis CE + ADR';

  const telegramMsg = `⭐ <b>PROFIL CHAUFFEUR PREMIUM INSCRIT !</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Candidat :</b> ${escapeHtml(candidateName)}
📍 <b>Ville :</b> ${escapeHtml(city || 'France')}
🪪 <b>Permis & Habilitations :</b> ${escapeHtml(licensesStr)}
💼 <b>Expérience :</b> ${experienceYears ? `${experienceYears} ans` : 'Confirmée'}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
━━━━━━━━━━━━━━━━━━━━
💡 <i>Profil hautement qualifié à proposer en priorité aux transporteurs !</i>`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '🔍 Consulter la Fiche', url: `https://www.frettalent.fr/dashboard/admin/candidates/${candidateId}` },
      ],
    ],
  };

  return sendTelegramMessage(telegramMsg, { reply_markup });
}

/**
 * Alerte Telegram Admin : Demande de suppression de compte (RGPD)
 */
export async function notifyTelegramAccountDeleted({
  userName,
  email,
  role = 'candidate',
  reason,
}) {
  const roleLabel = role === 'recruiter' ? '🏢 Entreprise' : '🚛 Chauffeur';

  const telegramMsg = `🗑️ <b>SUPPRESSION DE COMPTE (${roleLabel})</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Utilisateur :</b> ${escapeHtml(userName)}
📧 <b>E-mail :</b> <code>${escapeHtml(email)}</code>
${reason ? `💬 <b>Raison :</b> <i>"${escapeHtml(reason)}"</i>\n` : ''}
⏱ <b>Date :</b> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`.trim();

  return sendTelegramMessage(telegramMsg);
}

/**
 * Alerte / Notification Broadcast envoyée depuis l'Admin Push Center vers Telegram
 */
export async function sendTelegramAdminPushBroadcast({ title, message, link }) {
  const telegramMsg = `📢 <b>ANNONCE FRETTALENT</b>
━━━━━━━━━━━━━━━━━━━━
<b>${escapeHtml(title)}</b>

${escapeHtml(message)}
━━━━━━━━━━━━━━━━━━━━
📅 <i>${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</i>`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '🌐 Ouvrir l\'annonce / FretTalent', url: link || 'https://www.frettalent.fr/dashboard/candidate' },
      ],
    ],
  };

  return sendTelegramMessage(telegramMsg, { reply_markup });
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

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
