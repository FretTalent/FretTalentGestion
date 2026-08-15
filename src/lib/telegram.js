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

export async function sendTelegramMessage(htmlMessage, options = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId || process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] Token ou Chat ID manquant.');
    return { success: false, reason: 'Variables d\'environnement non configurées' };
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
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
 * 3. Alerte : Dépôt de documents avec boutons d'action rapide (Valider en 1 clic !)
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

${isComplete ? '👉 <i>Le dossier est complet et prêt pour certification !</i>\n' : ''}
`.trim();

  const inline_keyboard = [];

  if (candidateId) {
    if (isComplete) {
      inline_keyboard.push([
        {
          text: '🛡️ Valider le Chauffeur (1 Clic)',
          callback_data: `validate_cand:${candidateId}`,
        },
      ]);
    }

    inline_keyboard.push([
      {
        text: '📂 Consulter le Dossier',
        url: `https://www.frettalent.fr/dashboard/admin/candidates/${candidateId}`,
      },
      {
        text: '📧 Relancer Pièces',
        callback_data: `remind_docs:${candidateId}`,
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
