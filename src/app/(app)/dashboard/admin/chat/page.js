'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Building2,
  Trash2,
  Search,
  Filter,
  ShieldCheck,
  Check,
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import toast from 'react-hot-toast';

export default function AdminChatPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'candidate' | 'recruiter' | 'open' | 'resolved'

  // Modal suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    convId: null,
    subject: '',
  });

  // Modal nouveau tchat initié par l'admin
  const [showNewModal, setShowNewModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [adminSubject, setAdminSubject] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [creatingAdminConv, setCreatingAdminConv] = useState(false);
  const [userSearch, setUserSearch] = useState('');

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

  // 1. Vérifier le rôle Admin et charger les conversations
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
      console.error('Erreur chargement conversations admin:', err);
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

  // 3. Charger la liste des utilisateurs pour démarrer un tchat
  const fetchUsersForChat = async () => {
    setLoadingUsers(true);
    try {
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id, full_name, email')
        .limit(100);

      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .limit(100);

      const list = [
        ...(candidates || []).map((c) => ({
          id: c.id,
          name: c.full_name || c.email,
          email: c.email,
          role: 'candidate',
        })),
        ...(companies || []).map((comp) => ({
          id: comp.id,
          name: comp.name,
          email: 'Entreprise',
          role: 'recruiter',
        })),
      ];

      setUsersList(list);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoadingUsers(false);
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

  // Polling automatique discret toutes les 5 secondes (sans faire clignoter ni sauter le tchat)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConvId) {
        fetchMessages(activeConvId, true);
      }
      fetchConversations(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  // Scroll automatique UNIQUEMENT lorsqu'un nouveau message arrive ou lors du premier affichage
  useEffect(() => {
    if (messages.length > 0) {
      const latestMsgId = messages[messages.length - 1]?.id;
      if (latestMsgId !== lastMessageIdRef.current) {
        lastMessageIdRef.current = latestMsgId;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // 4. Envoyer un message en tant qu'admin
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

  // 5. Supprimer définitivement une conversation (Admin uniquement)
  const handleDeleteConversation = async () => {
    if (!deleteModal.convId) return;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/support/conversations?id=${deleteModal.convId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Conversation supprimée avec succès.');
        setDeleteModal({ isOpen: false, convId: null, subject: '' });
        
        // Mettre à jour la liste locale
        const updated = conversations.filter((c) => c.id !== deleteModal.convId);
        setConversations(updated);
        setActiveConvId(updated.length > 0 ? updated[0].id : null);
      } else {
        toast.error(data.error || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      toast.error('Erreur réseau lors de la suppression.');
    }
  };

  // 6. Changer le statut (Ouvert / Résolu)
  const handleToggleStatus = async () => {
    if (!activeConv) return;
    const newStatus = activeConv.status === 'resolved' ? 'open' : 'resolved';

    try {
      const { error } = await supabase
        .from('support_conversations')
        .update({ status: newStatus })
        .eq('id', activeConv.id);

      if (!error) {
        toast.success(newStatus === 'resolved' ? 'Marqué comme résolu' : 'Marqué comme ouvert');
        fetchConversations(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Créer une nouvelle conversation par l'admin
  const handleCreateAdminConversation = async (e) => {
    e.preventDefault();
    if (!selectedTargetUser || !adminSubject.trim() || !adminMessage.trim()) {
      toast.error('Veuillez sélectionner un destinataire et renseigner sujet et message.');
      return;
    }

    setCreatingAdminConv(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/support/conversations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          targetUserId: selectedTargetUser.id,
          subject: adminSubject.trim(),
          message: adminMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.conversation) {
        toast.success('Conversation ouverte et e-mail envoyé à l\'utilisateur !');
        setShowNewModal(false);
        setAdminSubject('');
        setAdminMessage('');
        setSelectedTargetUser(null);
        await fetchConversations(true);
        setActiveConvId(data.conversation.id);
      } else {
        toast.error(data.error || 'Erreur lors de la création.');
      }
    } catch (err) {
      toast.error('Erreur réseau.');
    } finally {
      setCreatingAdminConv(false);
    }
  };

  // Filtrer les conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user_email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'candidate') return c.user_role === 'candidate';
    if (roleFilter === 'recruiter') return c.user_role === 'recruiter';
    if (roleFilter === 'open') return c.status === 'open';
    if (roleFilter === 'resolved') return c.status === 'resolved';

    return true;
  });

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête Administration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Tchat & Support Direct
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Gestion centralisée des échanges en direct avec les chauffeurs et les entreprises.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowNewModal(true);
            fetchUsersForChat();
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Initier un tchat</span>
        </button>
      </div>

      {/* Interface Tchat Admin */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Colonne Gauche : Liste des Conversations */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50/60">
          {/* Recherche & Filtres */}
          <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, email ou sujet..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'candidate', label: 'Chauffeurs' },
                { id: 'recruiter', label: 'Entreprises' },
                { id: 'open', label: 'En cours' },
                { id: 'resolved', label: 'Résolus' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                    roleFilter === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste Scrollable */}
          <div className="flex-1 overflow-y-auto max-h-[550px] p-2 space-y-1.5">
            {loadingConv ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-orange-500" />
                Chargement...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">Aucune conversation trouvée.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const isCandidate = conv.user_role === 'candidate';

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-white border-orange-500/40 shadow-sm ring-1 ring-orange-500/20'
                        : 'bg-white/70 border-slate-100 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isCandidate ? 'bg-orange-500' : 'bg-blue-500'
                          }`}
                        />
                        <span className="text-xs font-black text-slate-900 truncate">
                          {conv.user_name}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          conv.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {conv.status === 'resolved' ? 'Résolu' : 'En cours'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 line-clamp-1 mb-1">
                      {conv.subject}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate max-w-[150px]">{conv.user_email}</span>
                      <span className="shrink-0">
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

        {/* Colonne Droite : Fil de Discussion Tchat */}
        <div className="lg:col-span-7 flex flex-col h-[620px] bg-slate-50/30">
          {activeConv ? (
            <>
              {/* Barre supérieure conversation */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeConv.user_role === 'candidate'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {activeConv.user_role === 'candidate' ? 'Chauffeur' : 'Entreprise'}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {activeConv.user_name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    <strong>Sujet :</strong> {activeConv.subject} ({activeConv.user_email})
                  </p>
                </div>

                {/* Actions Admin (Statut + Suppression complète) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleStatus}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border ${
                      activeConv.status === 'resolved'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Changer de statut"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{activeConv.status === 'resolved' ? 'Résolu' : 'Marquer résolu'}</span>
                  </button>

                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        convId: activeConv.id,
                        subject: activeConv.subject,
                      })
                    }
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 hover:border-red-300 transition-colors"
                    title="Supprimer définitivement cette conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-orange-500" />
                    Chargement des échanges...
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
                          isAdminMsg ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold ${
                            isAdminMsg
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-slate-800 text-white'
                          }`}
                        >
                          {isAdminMsg ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        {/* Bulle */}
                        <div className="space-y-1">
                          <div
                            className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${
                              isAdminMsg ? 'justify-end' : ''
                            }`}
                          >
                            <span className="font-bold text-slate-600">
                              {isAdminMsg ? 'Support FretTalent' : msg.sender_name}
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
                                ? 'bg-orange-500 text-white rounded-tr-sm shadow-md shadow-orange-500/10'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-xs'
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

              {/* Zone de saisie Admin */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Répondre en direct au client..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm shrink-0"
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
                  Sélectionnez une conversation
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Choisissez une demande client dans la liste pour consulter l&apos;historique et répondre en direct.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Confirmation de Suppression (Admin Only) */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Supprimer définitivement la conversation ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la conversation « ${deleteModal.subject} » ? Tous les messages associés seront purgés.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        onConfirm={handleDeleteConversation}
        onCancel={() => setDeleteModal({ isOpen: false, convId: null, subject: '' })}
      />

      {/* Modal Nouveau Tchat Initié par l'Admin */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Initier un Tchat avec un utilisateur
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminConversation} className="space-y-3.5">
              {/* Choix du destinataire */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  1. Sélectionner le destinataire *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filtrer les chauffeurs ou entreprises..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
                  />
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-1.5 space-y-1 bg-slate-50">
                    {loadingUsers ? (
                      <div className="p-3 text-center text-xs text-slate-400">Chargement...</div>
                    ) : (
                      usersList
                        .filter(
                          (u) =>
                            u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.email?.toLowerCase().includes(userSearch.toLowerCase())
                        )
                        .slice(0, 30)
                        .map((u) => {
                          const isSelected = selectedTargetUser?.id === u.id;
                          return (
                            <div
                              key={u.id}
                              onClick={() => setSelectedTargetUser(u)}
                              className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                                isSelected
                                  ? 'bg-orange-500 text-white font-bold'
                                  : 'hover:bg-white text-slate-700'
                              }`}
                            >
                              <span className="truncate">{u.name} ({u.email})</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : u.role === 'candidate'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {u.role === 'candidate' ? 'Chauffeur' : 'Entreprise'}
                              </span>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
                {selectedTargetUser && (
                  <p className="text-xs text-green-600 font-bold mt-1">
                    ✓ Destinataire sélectionné : {selectedTargetUser.name}
                  </p>
                )}
              </div>

              {/* Sujet */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  2. Sujet du message *
                </label>
                <input
                  type="text"
                  required
                  value={adminSubject}
                  onChange={(e) => setAdminSubject(e.target.value)}
                  placeholder="Ex : Information sur vos documents / Recrutement"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  3. Premier message *
                </label>
                <textarea
                  required
                  rows={3}
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Votre message d'ouverture..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-[11px] text-orange-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>
                  Un e-mail de notification sera immédiatement envoyé au destinataire avec le lien direct vers son espace.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingAdminConv || !selectedTargetUser}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  {creatingAdminConv ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Envoyer et Ouvrir le Tchat</span>
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
