import { NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { sendSupportNewConversationAdmin, sendSupportNewMessageUser } from '@/lib/email-service';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getAuthUser(req) {
  // 1. Try Bearer token from header
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      const supabaseAdmin = getAdminClient();
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) return user;
    }
  }

  // 2. Try cookie-based session
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (user) return user;
  } catch (err) {
    // ignore
  }

  return null;
}

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';

    let query = supabaseAdmin
      .from('support_conversations')
      .select(`
        id,
        user_id,
        user_role,
        user_name,
        user_email,
        subject,
        status,
        last_message_at,
        created_at,
        updated_at
      `)
      .order('last_message_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: conversations, error } = await query;
    if (error) throw error;

    // Récupérer les statuts de lecture et derniers messages pour chaque conversation
    const convIds = (conversations || []).map((c) => c.id);
    let messagesByConv = {};
    if (convIds.length > 0) {
      const { data: allMsgs } = await supabaseAdmin
        .from('support_messages')
        .select('id, conversation_id, sender_role, content, is_read, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: true });

      if (allMsgs) {
        allMsgs.forEach((m) => {
          if (!messagesByConv[m.conversation_id]) {
            messagesByConv[m.conversation_id] = [];
          }
          messagesByConv[m.conversation_id].push(m);
        });
      }
    }

    const enriched = (conversations || []).map((c) => {
      const msgs = messagesByConv[c.id] || [];
      const lastMsg = msgs[msgs.length - 1];
      const unreadCount = msgs.filter((m) =>
        isAdmin ? m.sender_role !== 'admin' && !m.is_read : m.sender_role === 'admin' && !m.is_read
      ).length;
      
      const adminMessages = msgs.filter((m) => m.sender_role === 'admin');
      const userMessages = msgs.filter((m) => m.sender_role !== 'admin');
      const lastAdminMsg = adminMessages[adminMessages.length - 1];
      const lastUserMsg = userMessages[userMessages.length - 1];

      return {
        ...c,
        unread_count: unreadCount,
        last_message_content: lastMsg?.content || '',
        last_message_sender: lastMsg?.sender_role || '',
        admin_last_message_read: lastAdminMsg ? !!lastAdminMsg.is_read : null,
        user_last_message_read: lastUserMsg ? !!lastUserMsg.is_read : null,
      };
    });

    return NextResponse.json({ conversations: enriched });
  } catch (error) {
    console.error('Erreur GET conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du chargement des conversations' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { subject, message, targetUserId } = await req.json();

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Le sujet et le message sont obligatoires.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    // Check sender profile
    const { data: senderProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = senderProfile?.role === 'admin';

    let conversationUserId = user.id;
    let conversationUserRole = senderProfile?.role || 'candidate';
    let conversationUserName = user.email;
    let conversationUserEmail = user.email;

    if (isAdmin && targetUserId) {
      // L'admin ouvre une conversation pour un utilisateur cible
      conversationUserId = targetUserId;
      const { data: targetProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', targetUserId)
        .single();
      
      conversationUserRole = targetProfile?.role || 'candidate';

      if (conversationUserRole === 'candidate') {
        const { data: cand } = await supabaseAdmin
          .from('candidates')
          .select('full_name, email')
          .eq('id', targetUserId)
          .maybeSingle();
        if (cand) {
          conversationUserName = cand.full_name || cand.email;
          conversationUserEmail = cand.email;
        }
      } else if (conversationUserRole === 'recruiter') {
        const { data: comp } = await supabaseAdmin
          .from('companies')
          .select('name')
          .eq('id', targetUserId)
          .maybeSingle();
        if (comp) {
          conversationUserName = comp.name;
        }
      }
    } else {
      // Utilisateur ouvrant sa propre conversation
      if (conversationUserRole === 'candidate') {
        const { data: cand } = await supabaseAdmin
          .from('candidates')
          .select('full_name, email')
          .eq('id', user.id)
          .maybeSingle();
        if (cand) {
          conversationUserName = cand.full_name || user.email;
          conversationUserEmail = cand.email || user.email;
        }
      } else if (conversationUserRole === 'recruiter') {
        const { data: comp } = await supabaseAdmin
          .from('companies')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();
        if (comp) {
          conversationUserName = comp.name || user.email;
        }
      }
    }

    // 1. Créer la conversation
    const { data: conv, error: convError } = await supabaseAdmin
      .from('support_conversations')
      .insert([
        {
          user_id: conversationUserId,
          user_role: conversationUserRole,
          user_name: conversationUserName,
          user_email: conversationUserEmail,
          subject: subject.trim(),
          status: 'open',
          last_message_at: new Date(),
          notified_new_conversation: !isAdmin, // Si utilisateur, on envoie l'alerte admin
          notified_first_reply: isAdmin, // Si admin a initié, le premier mail est envoyé
        },
      ])
      .select()
      .single();

    if (convError) throw convError;

    // 2. Insérer le premier message
    const senderName = isAdmin ? 'Support FretTalent' : conversationUserName;
    const senderRole = isAdmin ? 'admin' : conversationUserRole;

    const { error: msgError } = await supabaseAdmin
      .from('support_messages')
      .insert([
        {
          conversation_id: conv.id,
          sender_id: user.id,
          sender_role: senderRole,
          sender_name: senderName,
          content: message.trim(),
          is_read: isAdmin ? false : true,
        },
      ]);

    if (msgError) throw msgError;

    // 3. Envoi des e-mails d'alerte (sans bloquer en cas d'erreur SMTP)
    try {
      if (isAdmin) {
        // L'admin a initié la conversation -> Notifier l'utilisateur
        await sendSupportNewMessageUser({
          userEmail: conversationUserEmail,
          userName: conversationUserName,
          userRole: conversationUserRole,
          subject: subject.trim(),
          previewMessage: message.trim(),
          isNewConversation: true,
        });
      } else {
        // L'utilisateur a initié la conversation -> Notifier l'administrateur
        await sendSupportNewConversationAdmin({
          userName: conversationUserName,
          userEmail: conversationUserEmail,
          userRole: conversationUserRole,
          subject: subject.trim(),
          previewMessage: message.trim(),
        });
      }
    } catch (mailErr) {
      console.error('Erreur envoi email support:', mailErr);
    }

    return NextResponse.json({ success: true, conversation: conv });
  } catch (error) {
    console.error('Erreur POST conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    // STRICT CHECK : SEUL L'ADMIN PEUT SUPPRIMER
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Action non autorisée. Seul l\'administrateur peut supprimer une conversation.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de conversation manquant' },
        { status: 400 }
      );
    }

    // Supprimer la conversation (les messages sont supprimés en cascade ON DELETE CASCADE)
    const { error } = await supabaseAdmin
      .from('support_conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Conversation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur DELETE conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
