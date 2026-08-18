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
  CheckCheck,
  HelpCircle,
  X,
  Sparkles,
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

  // Polling automatique discret toutes les 5 secondes (sans faire sauter le tchat)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConvId) {
        fetchMessages(activeConvId, true);
      }
      fetchConversations(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  // Scroll automatique lorsqu'un nouveau message arrive
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

  // Compteurs
  const openCount = conversations.filter((c) => c.status === 'open').length;
  const candidateCount = conversations.filter((c) => c.user_role === 'candidate').length;
  const recruiterCount = conversations.filter((c) => c.user_role === 'recruiter').length;

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. EN-TÊTE HERO SUPPORT TCHAT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-wider border border-indigo-200/60 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Messagerie Instantanée Client
            </span>
            <span className="text-xs font-bold text-slate-600">• Chauffeurs & Transporteurs</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Support & Tchat en Direct
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Échanges directs, assistance aux dépôts de documents et notifications automatiques par email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => {
              setShowNewModal(true);
              fetchUsersForChat();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Initier un Nouveau Tchat</span>
          </button>

          <button
            onClick={() => fetchConversations(true)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Actualiser les messages"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Discussions */}
        <div
          onClick={() => setRoleFilter('all')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            roleFilter === 'all'
              ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-75">
              Total Discussions
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${roleFilter === 'all' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {conversations.length}
            </div>
            <p className="text-xs mt-2 opacity-75 font-semibold">
              Historique global
            </p>
          </div>
        </div>

        {/* En Cours (Amber) */}
        <div
          onClick={() => setRoleFilter('open')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            roleFilter === 'open'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">
              En Cours (Ouverts)
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${roleFilter === 'open' ? 'bg-white/10 text-white' : 'bg-amber-50 text-amber-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {openCount}
            </div>
            <p className="text-xs mt-2 opacity-90 font-semibold">
              Réponse attendue
            </p>
          </div>
        </div>

        {/* Chauffeurs (Orange) */}
        <div
          onClick={() => setRoleFilter('candidate')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            roleFilter === 'candidate'
              ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-md ring-2 ring-orange-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">
              Chauffeurs
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${roleFilter === 'candidate' ? 'bg-white/10 text-white' : 'bg-orange-50 text-[#FF7A00]'}`}>
              <User className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {candidateCount}
            </div>
            <p className="text-xs mt-2 opacity-90 font-semibold">
              Aide CV & Justificatifs
            </p>
          </div>
        </div>

        {/* Entreprises (Bleu) */}
        <div
          onClick={() => setRoleFilter('recruiter')}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            roleFilter === 'recruiter'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-600/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">
              Entreprises
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${roleFilter === 'recruiter' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {recruiterCount}
            </div>
            <p className="text-xs mt-2 opacity-90 font-semibold">
              Recrutement & Facturation
            </p>
          </div>
        </div>

      </div>

      {/* 3. INTERFACE PRINCIPALE DE TCHAT (GRILLE 12 COLONNES) */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        
        {/* COLONNE GAUCHE : LISTE DES CONVERSATIONS (5 COLS) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50/50">
          
          {/* Recherche & Filtres rapides */}
          <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, email, sujet..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-slate-50/70"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'open', label: 'En cours' },
                { id: 'candidate', label: 'Chauffeurs' },
                { id: 'recruiter', label: 'Entreprises' },
                { id: 'resolved', label: 'Résolus' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-2 py-1 rounded-md font-bold shrink-0 transition-colors cursor-pointer ${
                    roleFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste Scrollable des conversations */}
          <div className="flex-1 overflow-y-auto max-h-[520px] p-2 space-y-1.5">
            {loadingConv ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-600" />
                Chargement des conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Aucune conversation trouvée.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const isCandidate = conv.user_role === 'candidate';

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900/10'
                        : 'bg-white/80 border-slate-200/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isCandidate ? 'bg-orange-500' : 'bg-blue-600'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {conv.user_name}
                        </span>
                        {conv.unread_count > 0 && (
                          <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shrink-0 animate-pulse">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {conv.last_message_sender === 'admin' && (
                          conv.admin_last_message_read ? (
                            <span className="text-blue-600 text-[10px] flex items-center gap-0.5 font-bold" title="Vu par l'utilisateur">
                              <CheckCheck className="w-3 h-3 text-blue-600" />
                              <span>Vu</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] flex items-center gap-0.5" title="Non lu par l'utilisateur">
                              <Check className="w-3 h-3 text-slate-400" />
                            </span>
                          )
                        )}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            conv.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {conv.status === 'resolved' ? 'Résolu' : 'En cours'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 mb-0.5">
                      {conv.subject}
                    </p>

                    {conv.last_message_content && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-1 italic">
                        {conv.last_message_sender === 'admin' ? 'Vous : ' : ''}
                        {conv.last_message_content}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span className="truncate max-w-[140px]">{conv.user_email}</span>
                      <span className="shrink-0 font-mono">
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

        {/* COLONNE DROITE : FIL DE DISCUSSION TCHAT (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col h-[620px] bg-slate-50/20">
          {activeConv ? (
            <>
              {/* Barre supérieure conversation */}
              <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeConv.user_role === 'candidate'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {activeConv.user_role === 'candidate' ? 'Chauffeur' : 'Entreprise'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {activeConv.user_name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    <strong>Sujet :</strong> {activeConv.subject} ({activeConv.user_email})
                  </p>
                </div>

                {/* Actions Admin (Statut + Suppression) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleToggleStatus}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border cursor-pointer ${
                      activeConv.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
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
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer"
                    title="Supprimer définitivement cette conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-slate-600" />
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
                        className={`flex gap-2 max-w-[85%] ${
                          isAdminMsg ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold ${
                            isAdminMsg
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {isAdminMsg ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>

                        {/* Bulle */}
                        <div className="space-y-1">
                          <div
                            className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${
                              isAdminMsg ? 'justify-end' : ''
                            }`}
                          >
                            <span className="font-bold text-slate-700">
                              {isAdminMsg ? 'Support FretTalent' : msg.sender_name}
                            </span>
                            <span>•</span>
                            <span className="font-mono">
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isAdminMsg && (
                              <>
                                <span>•</span>
                                {msg.is_read ? (
                                  <span
                                    className="flex items-center gap-0.5 text-blue-600 font-bold bg-blue-50 px-1 py-0.2 rounded border border-blue-100"
                                    title="L'utilisateur a ouvert et lu ce message"
                                  >
                                    <CheckCheck className="w-3 h-3 text-blue-600" />
                                    <span>Vu</span>
                                  </span>
                                ) : (
                                  <span
                                    className="flex items-center gap-0.5 text-slate-400 font-medium bg-slate-100 px-1 py-0.2 rounded"
                                    title="Message distribué (en attente de lecture)"
                                  >
                                    <Check className="w-3 h-3 text-slate-400" />
                                    <span>Non lu</span>
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div
                            className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                              isAdminMsg
                                ? 'bg-slate-900 text-white rounded-tr-xs shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
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

              {/* Barre de Réponses Types 1-Clic */}
              <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1 overflow-x-auto text-[11px]">
                <span className="font-bold text-slate-500 text-[10px] uppercase shrink-0 mr-1">
                  ⚡ Réponses Rapides :
                </span>
                {[
                  {
                    label: '📑 Pièces manquantes',
                    text: 'Bonjour, afin de certifier votre profil avec le badge 100% Vérifié, merci de déposer vos justificatifs officiels (Permis de conduire, Carte Chrono, FIMO/FCO) dans votre espace Mes Documents.',
                  },
                  {
                    label: '🔓 Déblocage & Contact',
                    text: 'Bonjour, dès confirmation du paiement ou avec votre abonnement Pro Illimité, vous bénéficiez d\'un accès immédiat aux coordonnées complètes et documents officiels du chauffeur.',
                  },
                  {
                    label: '💳 Facturation Stripe',
                    text: 'Bonjour, vos factures et reçus de paiement sont disponibles et téléchargeables à tout moment depuis votre tableau de bord ou l\'espace de facturation Stripe.',
                  },
                  {
                    label: '🛡️ Profil 100% Validé',
                    text: 'Bonjour, nous venons de contrôler vos documents. Votre profil est désormais 100% Validé et bénéficie d\'une visibilité prioritaire auprès de toutes les entreprises partenaires.',
                  },
                ].map((canned, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewMessage(canned.text)}
                    className="px-2 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                  >
                    {canned.label}
                  </button>
                ))}
              </div>

              {/* Zone de saisie Admin */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Répondre en direct au client..."
                  disabled={sending}
                  className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer"
                >
                  {sending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Envoyer</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
              <Headphones className="w-10 h-10 text-slate-300" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">
                  Sélectionnez une conversation
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Initier un Tchat avec un utilisateur
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminConversation} className="space-y-3">
              {/* Choix du destinataire */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  1. Sélectionner le destinataire *
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filtrer les chauffeurs ou entreprises..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-1 space-y-1 bg-slate-50">
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
                              className={`p-1.5 rounded-md cursor-pointer flex items-center justify-between text-xs transition-colors ${
                                isSelected
                                  ? 'bg-slate-900 text-white font-bold'
                                  : 'hover:bg-white text-slate-700'
                              }`}
                            >
                              <span className="truncate">{u.name} ({u.email})</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded ${
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
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">
                    ✓ Destinataire sélectionné : {selectedTargetUser.name}
                  </p>
                )}
              </div>

              {/* Sujet */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  2. Sujet du message *
                </label>
                <input
                  type="text"
                  required
                  value={adminSubject}
                  onChange={(e) => setAdminSubject(e.target.value)}
                  placeholder="Ex : Information sur vos documents / Recrutement"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  3. Premier message *
                </label>
                <textarea
                  required
                  rows={3}
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Votre message d'ouverture..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                />
              </div>

              <div className="p-2.5 bg-orange-50 rounded-lg border border-orange-200 text-[11px] text-orange-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>
                  Un e-mail de notification sera immédiatement envoyé au destinataire avec le lien direct vers son espace.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingAdminConv || !selectedTargetUser}
                  className="px-4 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  {creatingAdminConv ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Envoyer et Ouvrir</span>
                      <Send className="w-3 h-3" />
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
