'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Send,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Mail,
  Users,
  Building2,
  UserPlus,
  Sparkles,
  FileText,
  Truck,
  Bell,
  Tag,
  Eye,
  ChevronRight,
  HelpCircle,
  Search,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const TEMPLATES = {
  prospection_transporteur: {
    name: '⚡ Conquête Transporteurs (Pitch Court)',
    emoji: '🚛',
    badge: 'Acquisition B2B',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    category: 'recruiter',
    description: 'Pitch rapide (15s) : stop aux camions à l\'arrêt, niche 100% chauffeurs & tarifs 4,99€ / 39,99€',
    icon: Truck,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    type: 'promo',
    subject: '🚛 Marre des camions à l\'arrêt et des frais d\'intérim ? — FretTalent',
    title: 'Recrutez vos chauffeurs routiers sans intermédiaire',
    message: `Bonjour,

Un camion immobilisé vous coûte entre 500 € et 1 000 € par jour. Pourquoi continuer à payer des marges de +50% aux agences d'intérim ?

FretTalent est la plateforme N°1 dédiée 100% au recrutement de chauffeurs routiers :

✅ Chauffeurs Qualifiés : Permis C, CE, SPL, FIMO/FCO, Carte Chrono, ADR, Frigo, Bâché, Benne TP, Messagerie.
✅ Profils 100% Contrôlés : Justificatifs et permis vérifiés par nos équipes avant validation.
✅ Réseau 4 Pays : France 🇫🇷, Belgique 🇧🇪, Luxembourg 🇱🇺, Suisse 🇨🇭.
✅ Tarifs Imbattables : 4,99 € TTC par chauffeur débloqué OU 39,99 €/mois en illimité (économisez 90% sur vos coûts RH).

Accédez directement aux coordonnées et CV des conducteurs disponibles dès aujourd'hui :

Cordialement,
L'équipe FretTalent
www.frettalent.fr | support@frettalent.fr`,
    ctaText: "Voir les Chauffeurs Disponibles",
    ctaLink: 'https://www.frettalent.fr/entreprises',
  },

  promo_entreprise: {
    name: '🏢 Promotion Entreprise',
    emoji: '🏢',
    badge: 'Entreprises',
    badgeColor: 'bg-blue-100 text-blue-700',
    category: 'recruiter',
    description: 'Présentez FretTalent aux entreprises de transport',
    icon: Building2,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    type: 'promo',
    subject: '🚛 Trouvez vos chauffeurs qualifiés en 48h — FretTalent',
    title: 'La solution N°1 pour recruter vos chauffeurs routiers',
    message: `Bonjour,

Vous cherchez des chauffeurs qualifiés en France, Belgique, Luxembourg ou Suisse ? FretTalent est la plateforme dédiée qui vous connecte en direct avec des profils vérifiés et disponibles.

✅ Accès immédiat à des centaines de chauffeurs certifiés (Permis, FIMO, Carte Chrono)
✅ Réseau 4 pays : France, Belgique, Luxembourg et Suisse
✅ Tarifs simples : 4,99 € par déblocage ou 39,99 €/mois en illimité

Plus besoin d'agences intermédiaires coûteuses. Recrutez directement vos talents.

Cordialement,
L'équipe FretTalent`,
    ctaText: "Découvrir FretTalent",
    ctaLink: 'https://www.frettalent.fr/entreprises',
  },

  nouveaux_chauffeurs: {
    name: '🚛 Nouveaux Chauffeurs Dispos',
    emoji: '🚛',
    badge: 'Entreprises',
    badgeColor: 'bg-blue-100 text-blue-700',
    category: 'recruiter',
    description: 'Informez les entreprises de nouveaux profils disponibles dans leur région',
    icon: Truck,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    type: 'update',
    subject: '🚛 De nouveaux chauffeurs qualifiés sont disponibles sur FretTalent !',
    title: 'Découvrez les nouveaux profils disponibles',
    message: `Bonjour,

De nouveaux chauffeurs routiers qualifiés et vérifiés viennent de s'inscrire sur FretTalent dans votre région.

Connectez-vous pour consulter leurs profils et entrer en contact avec eux en direct !

L'équipe FretTalent`,
    ctaText: 'Voir les Chauffeurs',
    ctaLink: 'https://www.frettalent.fr/chauffeurs',
  },

  offre_speciale: {
    name: '🎉 Offre Spéciale Recrutement',
    emoji: '🎉',
    badge: 'Promo B2B',
    badgeColor: 'bg-pink-100 text-pink-700',
    category: 'recruiter',
    description: 'Envoyez une offre promotionnelle aux entreprises',
    icon: Tag,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    type: 'promo',
    subject: '🎁 Offre exclusive sur vos recrutements de chauffeurs — FretTalent',
    title: 'Profitez de notre offre Pro Illimité',
    message: `Bonjour,

Pour une durée limitée, profitez de notre abonnement Pro Illimité à 39,99 €/mois pour recruter vos chauffeurs sans limite et publier vos annonces en priorité.

Ne manquez pas cette occasion de trouver les meilleurs chauffeurs au meilleur tarif.

À très vite sur FretTalent !`,
    ctaText: "Voir l'Offre",
    ctaLink: 'https://www.frettalent.fr/tarifs',
  },

  invitation_candidat: {
    name: '📨 Invitation Chauffeur',
    emoji: '📨',
    badge: 'Candidats',
    badgeColor: 'bg-orange-100 text-orange-700',
    category: 'candidate',
    description: 'Invitez un chauffeur à rejoindre FretTalent gratuitement',
    icon: UserPlus,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    type: 'custom',
    subject: '🚛 Rejoignez FretTalent — Trouvez votre prochain emploi de chauffeur',
    title: 'Votre prochain poste de chauffeur routier vous attend',
    message: `Bonjour,

Vous êtes chauffeur routier ? FretTalent est la plateforme dédiée qui vous connecte directement avec des centaines d'entreprises de transport qui recrutent en France et en Belgique.

🎯 Pourquoi s'inscrire ?
• Inscription 100% gratuite pour les chauffeurs
• Profil créé en 5 minutes
• Déposez vos pièces (Permis, FIMO, Carte Chrono) et obtenez le badge "Vérifié ✓"
• Soyez contacté en direct par les recruteurs de votre région

À très vite sur FretTalent !`,
    ctaText: "Créer mon profil gratuitement",
    ctaLink: 'https://www.frettalent.fr/register',
  },

  documents_manquants: {
    name: '⚠️ Relance Pièces Manquantes',
    emoji: '⚠️',
    badge: 'Candidats',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    category: 'candidate',
    description: 'Relancez les chauffeurs ayant des pièces incomplètes',
    icon: FileText,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50',
    type: 'custom',
    subject: '⚠️ Action requise : Complétez vos documents sur FretTalent',
    title: 'Faites certifier votre profil chauffeur',
    message: `Bonjour,

Il manque certains justificatifs obligatoires sur votre profil FretTalent (Permis, FIMO, Carte Chrono).

Votre profil sera visible en priorité par les recruteurs dès que vos pièces seront validées.

Merci de vous connecter pour ajouter vos documents au plus vite.

Cordialement,
L'équipe FretTalent`,
    ctaText: 'Mettre à jour mon profil',
    ctaLink: 'https://www.frettalent.fr/dashboard/candidate',
  },

  nouveautes: {
    name: '🚀 Mise à Jour / Nouveauté',
    emoji: '🚀',
    badge: 'Annonce',
    badgeColor: 'bg-purple-100 text-purple-700',
    category: 'general',
    description: 'Annoncez une nouveauté ou mise à jour de la plateforme',
    icon: Sparkles,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    type: 'update',
    subject: '✨ Découvrez les nouveautés sur FretTalent',
    title: 'De nouvelles fonctionnalités sont en ligne !',
    message: `Bonjour,

Nous sommes ravis de vous annoncer que de nouvelles fonctionnalités ont été ajoutées sur FretTalent pour simplifier votre expérience.

Connectez-vous dès maintenant pour les découvrir !

L'équipe FretTalent`,
    ctaText: 'Se connecter',
    ctaLink: 'https://www.frettalent.fr/login',
  },

  custom: {
    name: '📝 Message Libre Personnalisé',
    emoji: '📝',
    badge: 'Libre',
    badgeColor: 'bg-slate-100 text-slate-600',
    category: 'general',
    description: 'Rédigez un message entièrement personnalisé',
    icon: Mail,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
    type: 'custom',
    subject: '',
    title: '',
    message: '',
    ctaText: '',
    ctaLink: '',
  },
};

export default function AdminMail() {
  const [target, setTarget] = useState('specific'); // 'all_candidates' | 'all_companies' | 'specific'
  const [specificEmails, setSpecificEmails] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Annuaire chauffeurs & entreprises pour sélection 1-clic
  const [usersList, setUsersList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all' | 'candidate' | 'recruiter'
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [totalCandidateCount, setTotalCandidateCount] = useState(0);
  const [totalCompanyCount, setTotalCompanyCount] = useState(0);
  const [incompleteCandidateCount, setIncompleteCandidateCount] = useState(0);

  const [templateCategory, setTemplateCategory] = useState('recruiter'); // 'recruiter' | 'candidate' | 'general' | 'all'
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('prospection_transporteur');
  const [type, setType] = useState('promo');
  const [subject, setSubject] = useState(TEMPLATES.prospection_transporteur.subject);
  const [title, setTitle] = useState(TEMPLATES.prospection_transporteur.title);
  const [message, setMessage] = useState(TEMPLATES.prospection_transporteur.message);
  const [ctaText, setCtaText] = useState(TEMPLATES.prospection_transporteur.ctaText);
  const [ctaLink, setCtaLink] = useState(TEMPLATES.prospection_transporteur.ctaLink);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Charger les statistiques et utilisateurs pour la sélection
  const fetchDirectoryUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id, full_name, email, country, city, documents, validated')
        .limit(300);

      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, email, country, city')
        .limit(300);

      const incomplete = (candidates || []).filter(c => {
        const docs = c.documents || {};
        const count = ['cv', 'permis_recto', 'permis_verso', 'chrono_recto', 'chrono_verso', 'fimo_recto', 'fimo_verso'].filter(k => !!docs[k]).length;
        return count < 7;
      }).length;
      setIncompleteCandidateCount(incomplete);

      const candidateList = (candidates || []).filter(c => c.email).map(c => ({
        id: c.id,
        name: c.full_name || 'Chauffeur',
        email: c.email,
        role: 'candidate',
        city: c.city || 'France',
        country: c.country || 'FR',
      }));

      const recruiterProfiles = (companies || []).filter(p => p.email).map(p => ({
        id: p.id,
        name: p.name || 'Entreprise',
        email: p.email,
        role: 'recruiter',
        city: p.city || '',
        country: p.country || 'FR',
      }));

      setTotalCandidateCount(candidateList.length);
      setTotalCompanyCount(recruiterProfiles.length);
      setUsersList([...candidateList, ...recruiterProfiles]);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchDirectoryUsers();
  }, []);

  const handleTemplateSelect = (key) => {
    setSelectedTemplateKey(key);
    const tpl = TEMPLATES[key];
    if (tpl) {
      setType(tpl.type);
      setSubject(tpl.subject);
      setTitle(tpl.title);
      setMessage(tpl.message);
      setCtaText(tpl.ctaText);
      setCtaLink(tpl.ctaLink);
    }
  };

  const handleSelectUserFromPicker = (user) => {
    setSelectedUser(user);
    setTarget('specific');
    setSpecificEmails(user.email);
    toast.success(`Destinataire sélectionné : ${user.name} (${user.email})`);
  };

  const requestSend = (e) => {
    e.preventDefault();
    if (!subject || !title || !message) {
      toast.error('Veuillez remplir au minimum le sujet, le titre et le message.');
      return;
    }
    if (target === 'specific' && !specificEmails) {
      toast.error('Veuillez indiquer au moins une adresse e-mail.');
      return;
    }
    setConfirmModal({ isOpen: true });
  };

  const executeSendMail = async () => {
    setConfirmModal({ isOpen: false });
    setLoading(true);
    setStatus(null);

    try {
      let token = null;
      const { data: sessionData } = await supabase.auth.getSession();
      token = sessionData?.session?.access_token;

      if (!token) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
        }
        // Force refresh session
        const { data: refreshData } = await supabase.auth.refreshSession();
        token = refreshData?.session?.access_token;
      }

      if (!token) {
        throw new Error('Impossible de récupérer le jeton de sécurité. Veuillez actualiser la page.');
      }

      const res = await fetch('/api/admin/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target, specificEmails, type, subject, title, message, ctaText, ctaLink }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");

      toast.success(`E-mail envoyé avec succès ! (${data.count} destinataires)`);
      setStatus({ type: 'success', message: `✅ ${data.message || `E-mail envoyé avec succès à ${data.count} destinataire(s)`}` });

      if (target === 'specific' && !selectedUser) setSpecificEmails('');
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'envoi de l'e-mail");
      setStatus({ type: 'error', message: err.message || "Erreur lors de l'envoi de l'e-mail" });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (userRoleFilter === 'candidate' && u.role !== 'candidate') return false;
    if (userRoleFilter === 'recruiter' && u.role !== 'recruiter') return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.city || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedTpl = TEMPLATES[selectedTemplateKey];

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. EN-TÊTE HERO MAILS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#FF7A00] text-[11px] font-black uppercase tracking-wider border border-orange-200/60 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Centre de Messagerie & Campagnes E-mails
            </span>
            <span className="text-xs font-bold text-slate-600">• Expéditeur support@frettalent.fr</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campagnes d'Emails & Relances Ciblées
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Diffusion de modèles officiels, prospection transporteurs et relance de complétion de dossiers chauffeurs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={fetchDirectoryUsers}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            <span>Actualiser les Contacts</span>
          </button>
        </div>
      </div>

      {/* 2. KPI CARDS CIBLAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Chauffeurs */}
        <div
          onClick={() => {
            setTarget('all_candidates');
            setSelectedUser(null);
          }}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            target === 'all_candidates'
              ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-md ring-2 ring-orange-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">
              Tous les Chauffeurs
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${target === 'all_candidates' ? 'bg-white/10 text-white' : 'bg-orange-50 text-[#FF7A00]'}`}>
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {totalCandidateCount}
            </div>
            <p className="text-xs mt-2 opacity-90 font-semibold">
              Campagne générale conducteurs
            </p>
          </div>
        </div>

        {/* Entreprises */}
        <div
          onClick={() => {
            setTarget('all_companies');
            setSelectedUser(null);
          }}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            target === 'all_companies'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-600/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">
              Toutes les Entreprises
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${target === 'all_companies' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              {totalCompanyCount}
            </div>
            <p className="text-xs mt-2 opacity-90 font-semibold">
              Campagne B2B transporteurs
            </p>
          </div>
        </div>

        {/* Chauffeurs Incomplets */}
        <div
          onClick={() => {
            setTarget('candidates_incomplete_docs');
            setSelectedUser(null);
          }}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            target === 'candidates_incomplete_docs'
              ? 'bg-[#E53935] text-white border-[#E53935] shadow-md ring-2 ring-red-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#E53935]">
              Chauffeurs Incomplets
            </span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E53935] flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight text-[#E53935]">
              {incompleteCandidateCount}
            </div>
            <p className="text-xs mt-2 text-red-600 font-bold">
              Relance dépôt des 7 pièces
            </p>
          </div>
        </div>

        {/* Email Individuel */}
        <div
          onClick={() => {
            setTarget('single');
          }}
          className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            target === 'single'
              ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
              : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-75">
              Destinataire Unique
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${target === 'single' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tracking-tight">
              1
            </div>
            <p className="text-xs mt-2 opacity-75 font-semibold">
              Envoi direct ciblé
            </p>
          </div>
        </div>

      </div>

      {status && (
        <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* 4. CHOIX DU MODÈLE D'E-MAIL (SÉLECTEUR CATÉGORISÉ & ERGONOMIQUE) */}
      <div className="w-full bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Étape 1 : Choisir un Modèle d&apos;E-mail
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Sélectionnez une catégorie ou choisissez directement dans la liste
            </p>
          </div>

          {/* Sélecteur Déroulant Rapide 1-Clic */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 hidden sm:inline">Modèle :</span>
            <select
              value={selectedTemplateKey}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer max-w-[280px] sm:max-w-none truncate"
            >
              <optgroup label="🏢 Entreprises & Transporteurs">
                <option value="prospection_transporteur">⚡ Conquête Transporteurs (Pitch Court)</option>
                <option value="promo_entreprise">🏢 Présentation Standard Entreprise</option>
                <option value="nouveaux_chauffeurs">🚛 Nouveaux Chauffeurs Disponibles</option>
                <option value="offre_speciale">🎉 Offre Spéciale Recrutement</option>
              </optgroup>
              <optgroup label="🚚 Chauffeurs & Candidats">
                <option value="invitation_candidat">📨 Invitation Chauffeur</option>
                <option value="documents_manquants">⚠️ Relance Pièces Manquantes</option>
              </optgroup>
              <optgroup label="📢 Annonces & Libre">
                <option value="nouveautes">🚀 Mise à Jour / Nouveauté</option>
                <option value="custom">📝 Message Libre Personnalisé</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Onglets de Catégories de Modèles */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'recruiter', label: '🏢 Entreprises & Transporteurs (4)' },
            { id: 'candidate', label: '🚚 Chauffeurs & Candidats (2)' },
            { id: 'general', label: '📢 Annonces & Libre (2)' },
            { id: 'all', label: '📋 Tous les Modèles (8)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setTemplateCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                templateCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grille spacieuse des modèles de la catégorie active */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {Object.entries(TEMPLATES)
            .filter(([_, tpl]) => templateCategory === 'all' || tpl.category === templateCategory)
            .map(([key, tpl]) => {
              const Icon = tpl.icon;
              const isSelected = selectedTemplateKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTemplateSelect(key)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${isSelected ? 'bg-white/20 text-white' : tpl.iconBg}`}>
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : tpl.iconColor}`} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : tpl.badgeColor}`}>
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-tight mb-1">
                      {tpl.name}
                    </p>
                    <p className={`text-[11px] leading-snug line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {tpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* 5. ÉDITEUR D'E-MAIL & SÉLECTEUR DE DESTINATAIRES (GRILLE 12 COLS) */}
      <form onSubmit={requestSend} className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        
        {/* COLONNE GAUCHE : DESTINATAIRE & CONTENU (7 COLS) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          
          {/* CARTE DESTINATAIRES */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Étape 2 : Destinataires</span>
              <span className="text-[10px] text-slate-400">Ciblage précis ou en masse</span>
            </div>

            {/* Sélecteur de mode d'envoi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: 'all_candidates', label: '🚚 Tous les Chauffeurs', desc: `${totalCandidateCount} conducteurs` },
                { value: 'all_companies', label: '🏢 Toutes les Entreprises', desc: `${totalCompanyCount} transporteurs` },
                { value: 'specific', label: '🎯 Contact Spécifique', desc: 'Choix dans la liste ou saisie' },
              ].map(opt => {
                const isActive = target === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setTarget(opt.value);
                      if (opt.value !== 'specific') setSelectedUser(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-white text-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className={`text-[10px] mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Annuaire de recherche si Contact Spécifique */}
            {target === 'specific' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Choisir un chauffeur ou une entreprise dans l'annuaire :</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    {['all', 'candidate', 'recruiter'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setUserRoleFilter(role)}
                        className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                          userRoleFilter === role ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {role === 'all' ? 'Tous' : role === 'candidate' ? 'Chauffeurs' : 'Entreprises'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champ de recherche dans l'annuaire */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Tapez un nom, prénom, entreprise ou e-mail..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                  />
                </div>

                {/* Liste rapide sélectionnable */}
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-1 space-y-1 bg-white">
                  {loadingUsers ? (
                    <div className="p-3 text-center text-xs text-slate-400">Chargement de l'annuaire...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">Aucun contact trouvé.</div>
                  ) : (
                    filteredUsers.slice(0, 30).map((u) => {
                      const isSelected = selectedUser?.id === u.id || specificEmails === u.email;
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleSelectUserFromPicker(u)}
                          className={`p-2 rounded-md cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-slate-900 text-white font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate min-w-0 pr-2">
                            <span className="font-bold">{u.name}</span>
                            <span className={`text-[11px] ml-1.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              ({u.email})
                            </span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 font-bold ${
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

                {/* Champ E-mail manuel ou pré-rempli */}
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Adresse(s) e-mail finale(s) (ou plusieurs séparées par des virgules) :
                  </label>
                  <input
                    type="text"
                    value={specificEmails}
                    onChange={(e) => {
                      setSpecificEmails(e.target.value);
                      setSelectedUser(null);
                    }}
                    placeholder="chauffeur@email.fr, transport@societe.com"
                    required={target === 'specific'}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CARTE CONTENU DE L'E-MAIL */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Étape 3 : Rédiger le Message</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="promo">🟣 Thème Promo / Recrutement</option>
                <option value="update">🔵 Thème Nouveauté / Info</option>
                <option value="custom">🟠 Thème Classique FretTalent</option>
              </select>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Objet de l&apos;e-mail (Sujet visible dans la boîte) *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : 🚛 Opportunités d'emploi chauffeur en direct"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Titre d&apos;en-tête (Grand titre dans l&apos;e-mail) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Vos prochains recrutements facilités"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Corps du Message *
                </label>
                <textarea
                  required
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Rédigez votre message ici..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-normal font-sans"
                />
              </div>

              {/* Bouton d'Action (CTA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Texte du Bouton d&apos;action
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Ex : Se connecter / Voir l'offre"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lien Web du Bouton
                  </label>
                  <input
                    type="url"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="https://www.frettalent.fr/..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
            </div>

            {/* Bouton d'envoi final */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Notification automatique certifiée anti-spam.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Envoyer la Campagne</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* COLONNE DROITE : APERÇU EN DIRECT (5 COLS) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Aperçu en Direct</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold font-mono">
                Boîte de Réception
              </span>
            </div>

            {/* Simulation d'e-mail client */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-slate-50">
              
              {/* En-tête client mail */}
              <div className="bg-slate-900 text-white p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span>De : <strong>FretTalent</strong> &lt;support@frettalent.fr&gt;</span>
                  <span className="font-mono">À l'instant</span>
                </div>
                <div className="text-xs font-bold truncate">
                  {subject || 'Sans objet'}
                </div>
              </div>

              {/* Corps de l'email */}
              <div className="p-4 sm:p-5 bg-white space-y-4 text-xs">
                
                {/* Logo & Titre */}
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs">
                    FT
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                      Fret<span className="text-orange-500">Talent</span>
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">Plateforme N°1 Recrutement Transport</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-slate-950 text-sm leading-tight">
                    {title || 'Titre de votre e-mail'}
                  </h4>
                  <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {message || 'Le corps de votre message apparaîtra ici...'}
                  </div>
                </div>

                {ctaText && (
                  <div className="pt-2 text-center">
                    <span className={`inline-block px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-sm ${
                      type === 'promo' ? 'bg-purple-600' : type === 'update' ? 'bg-blue-600' : 'bg-orange-500'
                    }`}>
                      {ctaText}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-0.5">
                  <p>© {new Date().getFullYear()} FretTalent. Tous droits réservés.</p>
                  <p>France • Belgique • Luxembourg • Suisse</p>
                </div>

              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-1">
              Rendu responsive optimisé pour smartphones, tablettes et ordinateurs.
            </div>
          </div>
        </div>

      </form>

      {/* Modal de Confirmation d'envoi */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Confirmer l'envoi de l'e-mail ?"
        message={`Êtes-vous sûr de vouloir envoyer cet e-mail à : ${
          target === 'all_candidates' ? `tous les candidats chauffeurs (${totalCandidateCount})` :
          target === 'all_companies' ? `toutes les entreprises transporteurs (${totalCompanyCount})` :
          `« ${specificEmails} »`
        } ?`}
        confirmText="Envoyer immédiatement"
        cancelText="Annuler"
        variant="primary"
        onConfirm={executeSendMail}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />

    </div>
  );
}
