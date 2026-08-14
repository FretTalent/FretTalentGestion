'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  MessageSquare,
  Plus,
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Headphones,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function CandidateSupportPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Modal nouvelle conversation
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [creatingConv, setCreatingConv] = useState(false);
  const [formError, setFormError] = useState(null);

  const messagesEndRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  const getAuthHeaders = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    };
  };

  // 1. Charger la liste des conversations
  const fetchConversations = async (keepActive = true) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/support/conversations', { headers });
      const data = await res.json();
      if (data.conversations) {
        setConversations((prev) => {
          const incoming = data.conversations;
          if (
            prev.length === incoming.length &&
            prev.every(
              (c, i) =>
                c.id === incoming[i].id &&
                c.last_message_at === incoming[i].last_message_at &&
                c.status === incoming[i].status
            )
          ) {
            return prev;
          }
          return incoming;
        });

        if (data.conversations.length > 0) {
          if (!keepActive || !activeConvId) {
            setActiveConvId(data.conversations[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  // 2. Charger les messages d'une conversation
  const fetchMessages = async (convId, isBackground = false) => {
    if (!convId) return;
    if (!isBackground) setLoadingMessages(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/support/messages?conversation_id=${convId}`, { headers });
      const data = await res.json();
      if (data.messages) {
        setMessages((prev) => {
          const incoming = data.messages;
          if (
            prev.length === incoming.length &&
            prev[prev.length - 1]?.id === incoming[incoming.length - 1]?.id
          ) {
            return prev;
          }
          return incoming;
        });
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    } finally {
      if (!isBackground) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations(false);
  }, []);

  useEffect(() => {
    if (activeConvId) {
      lastMessageIdRef.current = null;
      fetchMessages(activeConvId, false);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Polling automatique discret toutes les 6 secondes pour le direct
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConvId) {
        fetchMessages(activeConvId, true);
      }
      fetchConversations(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  // Scroll en bas des messages UNIQUEMENT lorsqu'un nouveau message arrive
  useEffect(() => {
    if (messages.length > 0) {
      const latestMsgId = messages[messages.length - 1]?.id;
      if (latestMsgId !== lastMessageIdRef.current) {
        lastMessageIdRef.current = latestMsgId;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // 3. Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversation_id: activeConvId,
          content,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
    } finally {
      setSending(false);
    }
  };

  // 4. Créer une nouvelle conversation
  const handleCreateConversation = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newSubject.trim() || !initialMessage.trim()) {
      setFormError('Veuillez remplir le motif et votre premier message.');
      return;
    }

    setCreatingConv(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/support/conversations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject: newSubject.trim(),
          message: initialMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.conversation) {
        setShowModal(false);
        setNewSubject('');
        setInitialMessage('');
        await fetchConversations(true);
        setActiveConvId(data.conversation.id);
      } else {
        setFormError(data.error || 'Erreur lors de la création.');
      }
    } catch (err) {
      setFormError('Erreur réseau.');
    } finally {
      setCreatingConv(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Support & Assistance Directe
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Échangez en direct avec l&apos;équipe FretTalent pour toute question sur votre profil ou vos missions.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setFormError(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle conversation</span>
        </button>
      </div>

      {/* Interface Tchat */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Liste des conversations (Gauche) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mes Échanges ({conversations.length})
            </span>
            <button
              onClick={() => fetchConversations(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] lg:max-h-[600px] p-2 space-y-1.5">
            {loadingConv ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-orange-500" />
                Chargement...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  Aucune conversation pour le moment.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Démarrer un échange
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-white border-orange-500/40 shadow-sm ring-1 ring-orange-500/20'
                        : 'bg-white/60 border-slate-100 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 line-clamp-1">
                        {conv.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          conv.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {conv.status === 'resolved' ? 'Résolu' : 'En cours'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.last_message_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Espace Tchat Direct (Droite) */}
        <div className="lg:col-span-8 flex flex-col h-[580px] bg-slate-50/30">
          {activeConv ? (
            <>
              {/* Header Tchat */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {activeConv.subject}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeConv.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {activeConv.status === 'resolved' ? 'Résolu' : 'En direct avec le support'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ticket #{activeConv.id.slice(0, 8)} • Ouvert le{' '}
                    {new Date(activeConv.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Fil de discussion */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-orange-500" />
                    Chargement des messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-10">
                    Aucun message dans cette conversation.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdminMsg = msg.sender_role === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[85%] ${
                          isAdminMsg ? 'mr-auto' : 'ml-auto flex-row-reverse'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold ${
                            isAdminMsg
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {isAdminMsg ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        {/* Bulle */}
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${!isAdminMsg && 'justify-end'}`}>
                            <span className="font-bold text-slate-600">
                              {isAdminMsg ? 'Support FretTalent' : 'Moi'}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div
                            className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                              isAdminMsg
                                ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-xs'
                                : 'bg-orange-500 text-white rounded-tr-sm shadow-md shadow-orange-500/10'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Envoyer</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
              <Headphones className="w-12 h-12 text-slate-300" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  Aucune conversation sélectionnée
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Choisissez une conversation existante dans la colonne de gauche ou démarrez un nouvel échange avec notre équipe.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Ouvrir une nouvelle demande</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouvelle Conversation */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Nouvelle conversation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateConversation} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Motif / Sujet *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex : Question sur la validation de mon permis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Votre message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Expliquez en quelques mots votre situation ou votre demande..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
                />
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-[11px] text-orange-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>
                  Notre équipe reçoit immédiatement une alerte et vous répondra directement dans cet espace.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingConv}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                >
                  {creatingConv ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Démarrer l&apos;échange</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
