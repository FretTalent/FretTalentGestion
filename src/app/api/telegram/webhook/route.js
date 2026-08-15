import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendTelegramMessage,
  answerTelegramCallbackQuery,
  editTelegramMessageText,
  sendDailyMorningBriefing,
} from '@/lib/telegram';
import { sendAccountVerifiedEmail, sendMissingDocumentsEmail } from '@/lib/email-service';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(req) {
  try {
    const update = await req.json();
    const adminChatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || '');

    // 1. GESTION DES CALLBACK QUERIES (Clics sur boutons Inline)
    if (update.callback_query) {
      const cb = update.callback_query;
      const fromId = String(cb.from?.id || '');

      // Sécurité : Seul l'admin enregistré peut cliquer sur les boutons de modération
      if (adminChatId && fromId !== adminChatId) {
        await answerTelegramCallbackQuery(cb.id, '⛔ Action non autorisée.', true);
        return NextResponse.json({ ok: true });
      }

      const data = cb.data || '';
      const supabaseAdmin = getAdminClient();

      // Action 1: Valider un chauffeur en 1 clic
      if (data.startsWith('validate_cand:')) {
        const candidateId = data.replace('validate_cand:', '').trim();
        const { data: cand, error: candErr } = await supabaseAdmin
          .from('candidates')
          .select('id, full_name, email')
          .eq('id', candidateId)
          .single();

        if (candErr || !cand) {
          await answerTelegramCallbackQuery(cb.id, 'Chauffeur introuvable.', true);
          return NextResponse.json({ ok: true });
        }

        // Valider en base
        await supabaseAdmin
          .from('candidates')
          .update({ validated: true })
          .eq('id', candidateId);

        // Envoyer email de confirmation au chauffeur
        if (cand.email) {
          try {
            await sendAccountVerifiedEmail(cand.email, cand.full_name || 'Chauffeur');
          } catch (e) {
            console.error('Erreur email verification:', e);
          }
        }

        await answerTelegramCallbackQuery(cb.id, `✅ ${cand.full_name || 'Chauffeur'} est validé et certifié 100% ! 🛡️`, true);

        // Modifier le message Telegram pour afficher le statut validé
        if (cb.message) {
          const currentText = cb.message.text || '';
          const updatedText = `${currentText}\n\n✅ <b>VALIDÉ PAR L'ADMIN VIA TELEGRAM LE ${new Date().toLocaleDateString('fr-FR')} !</b>`;
          await editTelegramMessageText(cb.message.chat.id, cb.message.message_id, updatedText, {
            inline_keyboard: [
              [
                { text: '📂 Ouvrir la Fiche Chauffeur', url: `https://www.frettalent.fr/dashboard/admin/candidates/${candidateId}` },
              ],
            ],
          });
        }

        return NextResponse.json({ ok: true });
      }

      // Action 2: Relancer un chauffeur pour pièces manquantes
      if (data.startsWith('remind_docs:')) {
        const candidateId = data.replace('remind_docs:', '').trim();
        const { data: cand } = await supabaseAdmin
          .from('candidates')
          .select('id, full_name, email')
          .eq('id', candidateId)
          .single();

        if (cand?.email) {
          await sendMissingDocumentsEmail(
            cand.email,
            cand.full_name || 'Chauffeur',
            ['Permis de conduire', 'Carte chronotachygraphe', 'FIMO/FCO', 'CV']
          );
          await answerTelegramCallbackQuery(cb.id, `📧 Email de rappel envoyé à ${cand.full_name} !`, true);
        } else {
          await answerTelegramCallbackQuery(cb.id, 'Impossible de relancer ce candidat.', true);
        }
        return NextResponse.json({ ok: true });
      }

      // Action 3: Clôturer / Marquer résolu un ticket de support
      if (data.startsWith('resolve_conv:')) {
        const convId = data.replace('resolve_conv:', '').trim();
        await supabaseAdmin
          .from('support_conversations')
          .update({ status: 'resolved' })
          .eq('id', convId);

        await answerTelegramCallbackQuery(cb.id, '🔒 Ticket de support marqué comme résolu !', true);

        if (cb.message) {
          const currentText = cb.message.text || '';
          const updatedText = `${currentText}\n\n🔒 <b>TICKET RÉSOLU PAR L'ADMINISTRATEUR</b>`;
          await editTelegramMessageText(cb.message.chat.id, cb.message.message_id, updatedText, {
            inline_keyboard: [
              [
                { text: '💬 Voir la Conversation', url: `https://www.frettalent.fr/dashboard/admin/chat?id=${convId}` },
              ],
            ],
          });
        }
        return NextResponse.json({ ok: true });
      }

      // Bouton rapide : Stats
      if (data === 'cmd_stats') {
        await answerTelegramCallbackQuery(cb.id);
        await handleStatsCommand(cb.from.id);
        return NextResponse.json({ ok: true });
      }

      // Bouton rapide : Attente
      if (data === 'cmd_attente') {
        await answerTelegramCallbackQuery(cb.id);
        await handleAttenteCommand(cb.from.id);
        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(cb.id);
      return NextResponse.json({ ok: true });
    }

    // 2. GESTION DES MESSAGES TEXTES / COMMANDES / RÉPONSES
    if (update.message) {
      const msg = update.message;
      const fromId = String(msg.from?.id || '');
      const chatId = msg.chat?.id;
      const text = (msg.text || '').trim();

      // Sécurité : Seul l'admin enregistré peut interagir avec le bot
      if (adminChatId && fromId !== adminChatId) {
        await sendTelegramMessage(
          '⛔ <b>Accès restreint.</b> Ce robot est réservé à l\'administrateur de FretTalent.',
          { chatId }
        );
        return NextResponse.json({ ok: true });
      }

      // A. GESTION DE LA RÉPONSE À UN TICKET DE TCHAT SUPPORT (Reply to message)
      if (msg.reply_to_message && msg.reply_to_message.text) {
        const repliedText = msg.reply_to_message.text;
        const matchTicket = repliedText.match(/#ticket_([a-f0-9\-]+)/i);

        if (matchTicket && matchTicket[1]) {
          const conversationId = matchTicket[1];
          const replyContent = text;
          const supabaseAdmin = getAdminClient();

          // Récupérer la conversation
          const { data: conv, error: convErr } = await supabaseAdmin
            .from('support_conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

          if (!convErr && conv) {
            // Insérer le message en base dans le tchat support
            await supabaseAdmin.from('support_messages').insert([
              {
                conversation_id: conv.id,
                sender_id: conv.user_id, // Identifiant rattaché
                sender_role: 'admin',
                sender_name: 'Support FretTalent',
                content: replyContent,
                is_read: false,
              },
            ]);

            // Mettre à jour la date de dernier message
            await supabaseAdmin
              .from('support_conversations')
              .update({
                last_message_at: new Date(),
                updated_at: new Date(),
              })
              .eq('id', conv.id);

            await sendTelegramMessage(
              `✅ <b>Votre réponse a été envoyée sur le tchat FretTalent !</b>\n\n👤 <b>Destinataire :</b> ${conv.user_name || conv.user_email}\n💬 <b>Message transmis :</b>\n<i>"${replyContent}"</i>`,
              {
                chatId,
                reply_to_message_id: msg.message_id,
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: '💬 Ouvrir la Discussion', url: `https://www.frettalent.fr/dashboard/admin/chat?id=${conv.id}` },
                    ],
                  ],
                },
              }
            );

            return NextResponse.json({ ok: true });
          }
        }
      }

      // B. COMMANDES TELEGRAM
      const command = text.toLowerCase().split(' ')[0];

      switch (command) {
        case '/start':
        case '/help':
        case '/menu':
          await handleHelpCommand(chatId);
          break;

        case '/stats':
        case '/bilan':
          await handleStatsCommand(chatId);
          break;

        case '/attente':
        case '/validation':
        case '/moderation':
          await handleAttenteCommand(chatId);
          break;

        case '/entreprises':
        case '/societes':
          await handleEntreprisesCommand(chatId);
          break;

        case '/support':
        case '/tchat':
        case '/tickets':
          await handleSupportCommand(chatId);
          break;

        case '/ventes':
        case '/stripe':
        case '/revenus':
          await handleVentesCommand(chatId);
          break;

        case '/briefing':
          await sendDailyMorningBriefing();
          break;

        default:
          await sendTelegramMessage(
            `❓ Commande non reconnue. Tapez <b>/help</b> pour voir la liste des commandes disponibles.`,
            { chatId }
          );
          break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erreur API Telegram Webhook:', error);
    return NextResponse.json({ ok: true });
  }
}

// 1. COMMANDE /HELP
async function handleHelpCommand(chatId) {
  const message = `
🤖 <b>CENTRE DE CONTRÔLE TELEGRAM FRETTALENT</b>
━━━━━━━━━━━━━━━━━━━━

Voici la liste de vos commandes interactives :

📊 <b>/stats</b> : Chiffres clés, candidats, revenus Stripe en direct
⏳ <b>/attente</b> : Chauffeurs à valider en 1 clic
🏢 <b>/entreprises</b> : Dernières sociétés de transport inscrites
💬 <b>/support</b> : Tickets et messages tchat en attente
💳 <b>/ventes</b> : Derniers déblocages de contacts (2€)
☀️ <b>/briefing</b> : Recevoir le rapport matinal immédiatement

💡 <b>Astuce Tchat :</b> Pour répondre à un client, faites simplement <b>"Répondre" (Reply)</b> au message d'alerte Telegram !
`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '📊 Statistiques', callback_data: 'cmd_stats' },
        { text: '⏳ À Valider', callback_data: 'cmd_attente' },
      ],
      [
        { text: '🌐 Ouvrir l\'Espace Admin', url: 'https://www.frettalent.fr/dashboard/admin' },
      ],
    ],
  };

  await sendTelegramMessage(message, { chatId, reply_markup });
}

// 2. COMMANDE /STATS
async function handleStatsCommand(chatId) {
  const supabaseAdmin = getAdminClient();

  const [
    { count: totalCand },
    { count: valCand },
    { count: frCand },
    { count: beCand },
    { count: chCand },
    { count: luCand },
    { count: totalComp },
    { count: totalJobs },
    { count: openSupp },
    { data: unlocks },
  ] = await Promise.all([
    supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('validated', true),
    supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('country', 'FR'),
    supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('country', 'BE'),
    supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('country', 'CH'),
    supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('country', 'LU'),
    supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('support_conversations').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabaseAdmin.from('unlocks').select('amount_charged'),
  ]);

  const totalRev = (unlocks || []).reduce((acc, u) => acc + (u.amount_charged || 200), 0) / 100;
  const pendingCand = (totalCand || 0) - (valCand || 0);

  const message = `
📊 <b>MÉTRIQUES EN DIRECT FRETTALENT</b>
━━━━━━━━━━━━━━━━━━━━

🚛 <b>Chauffeurs Inscrits :</b> <b>${totalCand || 0}</b>
• 🛡️ <b>${valCand || 0}</b> certifiés (100% Vérifiés)
• ⚠️ <b>${pendingCand}</b> en attente de validation
• Répartition : 🇫🇷 ${frCand || 0} | 🇧🇪 ${beCand || 0} | 🇨🇭 ${chCand || 0} | 🇱🇺 ${luCand || 0}

🏢 <b>Entreprises :</b> <b>${totalComp || 0}</b>
💼 <b>Offres d'Emploi :</b> <b>${totalJobs || 0}</b>
💬 <b>Support Ouvert :</b> <b>${openSupp || 0}</b> ticket(s)
💰 <b>Revenus Déblocages :</b> <b>${totalRev.toFixed(2)} €</b> (Stripe)

⏱ <i>Mis à jour le ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}</i>
`.trim();

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '⏳ Voir les Dossiers en Attente', callback_data: 'cmd_attente' },
      ],
      [
        { text: '🛡️ Dashboard Complet', url: 'https://www.frettalent.fr/dashboard/admin' },
      ],
    ],
  };

  await sendTelegramMessage(message, { chatId, reply_markup });
}

// 3. COMMANDE /ATTENTE
async function handleAttenteCommand(chatId) {
  const supabaseAdmin = getAdminClient();
  const { data: candidates } = await supabaseAdmin
    .from('candidates')
    .select('id, full_name, city, country, postal_code, documents, created_at')
    .eq('validated', false)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!candidates || candidates.length === 0) {
    await sendTelegramMessage(
      `🎉 <b>Aucun dossier en attente !</b>\nTous les chauffeurs inscrits ont été vérifiés et validés.`,
      { chatId }
    );
    return;
  }

  let message = `⏳ <b>CHAUFFEURS EN ATTENTE DE VALIDATION (${candidates.length}) :</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  const inline_keyboard = [];

  candidates.forEach((c, idx) => {
    const docs = c.documents || {};
    const docCount = Object.keys(docs).length;
    const flag = c.country === 'BE' ? '🇧🇪' : c.country === 'LU' ? '🇱🇺' : c.country === 'CH' ? '🇨🇭' : '🇫🇷';

    message += `<b>${idx + 1}. ${c.full_name || 'Chauffeur'}</b> (${c.city || '—'}) ${flag}\n`;
    message += `📄 Pièces déposées : <b>${docCount}/7</b>\n\n`;

    inline_keyboard.push([
      { text: `✅ Valider ${c.full_name ? c.full_name.split(' ')[0] : `#${idx+1}`}`, callback_data: `validate_cand:${c.id}` },
      { text: '📂 Ouvrir', url: `https://www.frettalent.fr/dashboard/admin/candidates/${c.id}` },
    ]);
  });

  await sendTelegramMessage(message.trim(), {
    chatId,
    reply_markup: { inline_keyboard },
  });
}

// 4. COMMANDE /ENTREPRISES
async function handleEntreprisesCommand(chatId) {
  const supabaseAdmin = getAdminClient();
  const { data: companies } = await supabaseAdmin
    .from('companies')
    .select('id, name, country, city, siret, bce, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!companies || companies.length === 0) {
    await sendTelegramMessage(`Aucune entreprise enregistrée pour le moment.`, { chatId });
    return;
  }

  let message = `🏢 <b>DERNIÈRES ENTREPRISES INSCRITES :</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  companies.forEach((c, idx) => {
    const flag = c.country === 'BE' ? '🇧🇪' : c.country === 'LU' ? '🇱🇺' : c.country === 'CH' ? '🇨🇭' : '🇫🇷';
    const idNum = c.siret || c.bce || '—';
    message += `<b>${idx + 1}. ${c.name || 'Société'}</b> ${flag}\n`;
    message += `📍 ${c.city || 'Non renseigné'} | ID : <code>${idNum}</code>\n\n`;
  });

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '🏢 Gérer les Entreprises', url: 'https://www.frettalent.fr/dashboard/admin/companies' },
      ],
    ],
  };

  await sendTelegramMessage(message.trim(), { chatId, reply_markup });
}

// 5. COMMANDE /SUPPORT
async function handleSupportCommand(chatId) {
  const supabaseAdmin = getAdminClient();
  const { data: convs } = await supabaseAdmin
    .from('support_conversations')
    .select('*')
    .eq('status', 'open')
    .order('last_message_at', { ascending: false })
    .limit(5);

  if (!convs || convs.length === 0) {
    await sendTelegramMessage(`🎉 <b>Aucun ticket de support ouvert !</b> Tout est à jour.`, { chatId });
    return;
  }

  let message = `💬 <b>TICKETS TCHAT SUPPORT OUVERTS (${convs.length}) :</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  const inline_keyboard = [];

  convs.forEach((c, idx) => {
    const roleIcon = c.user_role === 'recruiter' ? '🏢' : '🚛';
    message += `<b>${idx + 1}. ${roleIcon} ${c.user_name || c.user_email}</b>\n`;
    message += `📝 Sujet : <i>"${c.subject || 'Assistance'}"</i>\n\n`;

    inline_keyboard.push([
      { text: `💬 Répondre à ${c.user_name ? c.user_name.split(' ')[0] : `#${idx+1}`}`, url: `https://www.frettalent.fr/dashboard/admin/chat?id=${c.id}` },
      { text: '🔒 Clôturer', callback_data: `resolve_conv:${c.id}` },
    ]);
  });

  await sendTelegramMessage(message.trim(), {
    chatId,
    reply_markup: { inline_keyboard },
  });
}

// 6. COMMANDE /VENTES
async function handleVentesCommand(chatId) {
  const supabaseAdmin = getAdminClient();
  const { data: unlocks } = await supabaseAdmin
    .from('unlocks')
    .select(`
      id,
      amount_charged,
      created_at,
      companies ( name ),
      candidates ( full_name, city )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!unlocks || unlocks.length === 0) {
    await sendTelegramMessage(`Aucune transaction enregistrée pour le moment.`, { chatId });
    return;
  }

  let message = `💳 <b>5 DERNIÈRES TRANSACTIONS STRIPE :</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  unlocks.forEach((u, idx) => {
    const compName = u.companies?.name || 'Entreprise';
    const candName = u.candidates?.full_name || 'Chauffeur';
    const candCity = u.candidates?.city || '—';
    const amount = ((u.amount_charged || 200) / 100).toFixed(2);
    const date = new Date(u.created_at).toLocaleDateString('fr-FR');

    message += `<b>${idx + 1}. +${amount} €</b> — ${compName}\n`;
    message += `👤 Contact : ${candName} (${candCity}) • <i>${date}</i>\n\n`;
  });

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '📊 Dashboard Finances', url: 'https://www.frettalent.fr/dashboard/admin/finance' },
      ],
    ],
  };

  await sendTelegramMessage(message.trim(), { chatId, reply_markup });
}
