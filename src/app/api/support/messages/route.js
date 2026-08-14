import { NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { sendSupportNewMessageUser, sendSupportNewMessageAdmin } from '@/lib/email-service';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getAuthUser(req) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      const supabaseAdmin = getAdminClient();
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) return user;
    }
  }

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

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversation manquant' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    // Vérifier les permissions
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';

    const { data: conv, error: convError } = await supabaseAdmin
      .from('support_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      return NextResponse.json(
        { error: 'Conversation introuvable' },
        { status: 404 }
      );
    }

    if (!isAdmin && conv.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    // Récupérer les messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    // Marquer les messages non lus comme lus
    if (isAdmin) {
      await supabaseAdmin
        .from('support_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_role', 'admin')
        .eq('is_read', false);
    } else {
      await supabaseAdmin
        .from('support_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_role', 'admin')
        .eq('is_read', false);
    }

    return NextResponse.json({
      conversation: conv,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Erreur GET messages:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des messages' },
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

    const { conversation_id, content } = await req.json();

    if (!conversation_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'ID de conversation et contenu obligatoires.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    // 1. Récupérer profil de l'expéditeur
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';

    // 2. Récupérer la conversation
    const { data: conv, error: convError } = await supabaseAdmin
      .from('support_conversations')
      .select('*')
      .eq('id', conversation_id)
      .single();

    if (convError || !conv) {
      return NextResponse.json(
        { error: 'Conversation introuvable' },
        { status: 404 }
      );
    }

    if (!isAdmin && conv.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    // 3. Déterminer nom de l'expéditeur
    let senderName = 'Utilisateur';
    let senderRole = profile?.role || 'candidate';

    if (isAdmin) {
      senderName = 'Support FretTalent';
      senderRole = 'admin';
    } else {
      senderName = conv.user_name || user.email;
    }

    // 4. Insérer le message
    const { data: newMsg, error: msgError } = await supabaseAdmin
      .from('support_messages')
      .insert([
        {
          conversation_id: conv.id,
          sender_id: user.id,
          sender_role: senderRole,
          sender_name: senderName,
          content: content.trim(),
          is_read: false,
        },
      ])
      .select()
      .single();

    if (msgError) throw msgError;

    // 5. Mettre à jour la date du dernier message et réactiver la conversation si besoin
    const updatePayload = {
      last_message_at: new Date(),
      updated_at: new Date(),
    };

    if (!isAdmin && conv.status !== 'open') {
      updatePayload.status = 'open';
    }

    // 6. Gestion du mail unique anti-spam si l'admin répond
    let shouldSendEmail = false;
    if (isAdmin && !conv.notified_first_reply) {
      shouldSendEmail = true;
      updatePayload.notified_first_reply = true;
    }

    await supabaseAdmin
      .from('support_conversations')
      .update(updatePayload)
      .eq('id', conv.id);

    // 7. Envoi de l'e-mail de notification
    if (isAdmin) {
      // Si l'admin répond, envoi unique anti-spam au candidat/recruteur
      if (shouldSendEmail) {
        try {
          await sendSupportNewMessageUser({
            userEmail: conv.user_email,
            userName: conv.user_name,
            userRole: conv.user_role,
            subject: conv.subject,
            previewMessage: content.trim(),
          });
        } catch (mailErr) {
          console.error('Erreur envoi email support user:', mailErr);
        }
      }
    } else {
      // Si un candidat ou recruteur envoie un message / répond -> Notifier l'admin par email
      try {
        await sendSupportNewMessageAdmin({
          userName: conv.user_name || senderName,
          userEmail: conv.user_email,
          userRole: conv.user_role,
          subject: conv.subject,
          previewMessage: content.trim(),
        });
      } catch (mailErr) {
        console.error('Erreur envoi email support admin:', mailErr);
      }
    }

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error) {
    console.error('Erreur POST message:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
