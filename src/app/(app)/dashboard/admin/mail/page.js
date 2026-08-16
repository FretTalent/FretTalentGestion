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
    name: '⚡ Conquête Transporteurs (Offre Choc)',
    emoji: '🚛',
    badge: 'Acquisition B2B',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    description: 'Pitch percutant, comparatif agences/intérim et offre 2€ / 39,99€ (100% Chauffeurs)',
    icon: Truck,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    type: 'promo',
    subject: '🚛 Marre des camions à l\'arrêt et des frais d\'intérim exorbitants ? — FretTalent',
    title: 'La 1ère Plateforme 100% Dédiée au Recrutement de Chauffeurs Routiers',
    message: `Bonjour Madame, Monsieur,

En tant que dirigeant ou responsable d'exploitation dans le transport routier, vous le savez : un camion immobilisé dans votre cour par manque de chauffeur vous coûte entre 500 € et 1 000 € par jour.

Pourtant, les solutions traditionnelles de recrutement sont devenues inadaptées et hors de prix :
❌ Agences d'intérim : des marges de +40% à +60% sur chaque heure travaillée (800 € à 1 500 €/mois de surcoût par conducteur).
❌ Jobboards généralistes (Indeed, etc.) : des centaines de candidatures hors sujet sans permis ni FIMO.
❌ Cabinets de recrutement : des honoraires de 1 500 € à 3 000 € par embauche.

───────────────────────────────
🎯 LA SOLUTION FRETTALENT : 100% NICHE TRANSPORT
───────────────────────────────
FretTalent est la plateforme N°1 créée exclusivement pour connecter directement les transporteurs avec des chauffeurs routiers qualifiés et immédiatement disponibles.

✅ 100% SPÉCIALISÉ TRANSPORT : Permis C, CE, SPL, FIMO / FCO, Carte Conducteur Chronotachygraphe, ADR Citerne/Base, Bâché, Frigo, Benne TP, Citerne, Messagerie.
✅ PROFILS 100% CONTRÔLÉS : Tous les justificatifs officiels sont vérifiés par nos équipes avant validation (badge "Chauffeur Vérifié ✓").
✅ RÉSEAU 4 PAYS : Accédez à des conducteurs qualifiés en France 🇫🇷, Belgique 🇧🇪, Luxembourg 🇱🇺 et Suisse 🇨🇭.
✅ SANS INTERMÉDIAIRE : Vous accédez directement au numéro de téléphone, à l'e-mail et aux documents complets du chauffeur.

───────────────────────────────
💰 UNE TARIFICATION TRANSPARENTE ET IMBATTABLE
───────────────────────────────
Fini les commissions cachées et les abonnements contraignants :

🔹 OPTION 1 : PAIEMENT À L'ACTE — Seulement 2,00 € TTC par contact débloqué. Zéro engagement, vous ne payez que les profils qui vous intéressent.
🔹 OPTION 2 : ABONNEMENT PRO ILLIMITÉ — 39,99 € HT / mois pour débloquer tous les chauffeurs de la plateforme en illimité et publier vos offres d'emploi en priorité.

👉 Économisez jusqu'à 90% sur vos coûts de recrutement dès aujourd'hui !

Consultez dès maintenant les chauffeurs disponibles dans votre région et contactez vos futurs conducteurs en quelques clics.

Cordialement,
L'équipe FretTalent
Service Recrutement & Partenariats Transport
🌐 www.frettalent.fr | ✉️ support@frettalent.fr`,
    ctaText: "Découvrir les Chauffeurs Disponibles",
    ctaLink: 'https://www.frettalent.fr/entreprises',
  },

  promo_entreprise: {
    name: '🏢 Promotion Entreprise',
    emoji: '🏢',
    badge: 'Entreprises',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: 'Présentez FretTalent aux entreprises de transport',
    icon: Building2,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    type: 'promo',
    subject: '🚛 Trouvez vos chauffeurs qualifiés en 48h — FretTalent',
    title: 'La solution N°1 pour recruter vos chauffeurs routiers',
    message: `Bonjour,

Vous êtes à la recherche de chauffeurs qualifiés en France, Belgique, Luxembourg ou Suisse ? FretTalent est la plateforme de recrutement dédiée au transport routier qui vous connecte directement avec des profils vérifiés et disponibles.

✅ Accès immédiat à des centaines de chauffeurs certifiés
✅ Profils vérifiés avec documents contrôlés (FIMO, permis, carte chrono)
✅ Réseau 4 pays — France, Belgique, Luxembourg et Suisse
✅ Gain de temps : filtrez par spécialité, permis, disponibilité
✅ Tarification simple et transparente

Plus besoin d'agences intermédiaires. Recrutez directement les meilleurs talents du transport.

Essayez FretTalent dès aujourd'hui et publiez votre première offre.

Cordialement,
L'équipe FretTalent`,
    ctaText: "Découvrir FretTalent",
    ctaLink: 'https://www.frettalent.fr/entreprises',
  },

  invitation_candidat: {
    name: '📨 Invitation Candidat',
    emoji: '📨',
    badge: 'Candidats',
    badgeColor: 'bg-orange-100 text-orange-700',
    description: 'Invitez un chauffeur à rejoindre FretTalent',
    icon: UserPlus,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    type: 'custom',
    subject: '🚛 Rejoignez FretTalent — Trouvez votre prochain emploi de chauffeur',
    title: 'Votre prochain emploi de chauffeur routier vous attend',
    message: `Bonjour,

Vous êtes chauffeur routier et vous cherchez un poste qui vous correspond vraiment ? FretTalent est la plateforme de recrutement transport N°1 en France et en Belgique, créée spécialement pour les professionnels comme vous.

🎯 Pourquoi rejoindre FretTalent ?
• Accès à des offres d'emploi exclusives dans le transport
• Visibilité directe auprès de centaines d'entreprises de transport
• Inscription gratuite — aucun frais pour les chauffeurs
• Créez votre profil en 5 minutes
• Déposez vos documents une seule fois (FIMO, permis, carte chrono)
• Obtenez le badge "Chauffeur Vérifié ✓" pour vous démarquer

Disponible en France, Belgique, Luxembourg et Suisse

Ne laissez pas passer les meilleures opportunités. Créez votre profil gratuitement dès aujourd'hui et soyez visible par les recruteurs de votre région.

À très vite sur FretTalent !
L'équipe FretTalent`,
    ctaText: "Créer mon profil gratuitement",
    ctaLink: 'https://www.frettalent.fr/register',
  },

  nouveautes: {
    name: '🚀 Mise à jour / Nouveauté',
    emoji: '🚀',
    badge: 'Info',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: 'Annoncez une nouveauté ou mise à jour de la plateforme',
    icon: Sparkles,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    type: 'update',
    subject: '✨ Découvrez les nouveautés sur FretTalent',
    title: 'De nouvelles fonctionnalités sont en ligne !',
    message: `Bonjour,

Nous sommes ravis de vous annoncer que de nouvelles fonctionnalités ont été ajoutées sur FretTalent pour améliorer votre expérience.

Connectez-vous dès maintenant pour les découvrir !

L'équipe FretTalent`,
    ctaText: 'Se connecter',
    ctaLink: 'https://www.frettalent.fr/login',
  },

  offre_speciale: {
    name: '🎉 Promotion / Offre spéciale',
    emoji: '🎉',
    badge: 'Promo',
    badgeColor: 'bg-pink-100 text-pink-700',
    description: 'Envoyez une offre promotionnelle à vos utilisateurs',
    icon: Tag,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    type: 'promo',
    subject: '🎁 Offre exceptionnelle sur FretTalent',
    title: 'Profitez de notre offre limitée !',
    message: `Bonjour,

Pour une durée limitée, profitez d'une offre exclusive sur vos prochains recrutements avec FretTalent.

Ne manquez pas cette occasion de trouver les meilleurs chauffeurs au meilleur prix.

À très vite sur FretTalent !`,
    ctaText: "Voir l'offre",
    ctaLink: 'https://www.frettalent.fr/tarifs',
  },

  documents_manquants: {
    name: '⚠️ Documents manquants (Candidat)',
    emoji: '⚠️',
    badge: 'Candidats',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    description: 'Relancez les candidats avec des documents incomplets',
    icon: FileText,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50',
    type: 'custom',
    subject: '⚠️ Action requise : Documents manquants sur votre profil FretTalent',
    title: 'Complétez votre profil pour être visible',
    message: `Bonjour,

Nous avons remarqué qu'il manque certains documents obligatoires sur votre profil FretTalent (Permis, FIMO, Carte Chronotachygraphe, etc.).

Votre profil n'est pas encore visible par les recruteurs tant que ces documents ne sont pas déposés.

Merci de vous connecter et de télécharger les documents manquants au plus vite pour ne rater aucune opportunité d'emploi.

Cordialement,
L'équipe FretTalent`,
    ctaText: 'Mettre à jour mon profil',
    ctaLink: 'https://www.frettalent.fr/dashboard/candidate',
  },

  nouveaux_chauffeurs: {
    name: '🚛 Nouveaux chauffeurs disponibles (Entreprise)',
    emoji: '🚛',
    badge: 'Entreprises',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: 'Informez les entreprises de nouveaux profils disponibles',
    icon: Truck,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    type: 'update',
    subject: '🚛 De nouveaux chauffeurs qualifiés sont disponibles sur FretTalent !',
    title: 'Découvrez les nouveaux talents disponibles',
    message: `Bonjour,

De nouveaux chauffeurs qualifiés viennent de s'inscrire sur FretTalent dans votre région.

Connectez-vous dès maintenant pour consulter leurs profils et entrer en contact avec eux avant vos concurrents !

L'équipe FretTalent`,
    ctaText: 'Voir les chauffeurs',
    ctaLink: 'https://www.frettalent.fr/chauffeurs',
  },

  custom: {
    name: '📝 Message personnalisé',
    emoji: '📝',
    badge: 'Libre',
    badgeColor: 'bg-slate-100 text-slate-600',
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
        .select('id, full_name, email, country, city')
        .limit(200);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, company_name, role')
        .limit(200);

      const candidateList = (candidates || []).filter(c => c.email).map(c => ({
        id: c.id,
        name: c.full_name || 'Chauffeur',
        email: c.email,
        role: 'candidate',
        city: c.city || 'France',
        country: c.country || 'FR',
      }));

      const recruiterProfiles = (profiles || []).filter(p => p.role === 'recruiter' && p.email).map(p => ({
        id: p.id,
        name: p.company_name || 'Entreprise',
        email: p.email,
        role: 'recruiter',
        city: '',
        country: 'FR',
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
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
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
    <div className="w-full max-w-full space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden box-border">
      
      {/* 1. EN-TÊTE SUPÉRIEURE DE PILOTAGE MESSAGERIE & MAILING */}
      <div className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md min-w-0">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-[11px] text-white">
              EM
            </div>
            <span className="font-bold text-xs text-slate-200">
              Centre de Messagerie & Campagnes E-mails
            </span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-none">
            Diffusion Officielle & Relances Automatisées
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Expéditeur : support@frettalent.fr
          </span>
        </div>

        {/* Action Rapide */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={fetchDirectoryUsers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Actualiser les contacts"
          >
            <RefreshCw className={`h-3 w-3 ${loadingUsers ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser contacts</span>
          </button>
        </div>
      </div>

      {/* 2. BANDEAU DE CONTEXTE */}
      <div className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs min-w-0">
        <div className="flex items-center gap-2 flex-1 text-slate-400 min-w-0">
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="italic text-slate-500 truncate text-[11px] sm:text-xs">
            Envoi d'e-mails sécurisés avec rendu HTML professionnel certifié DKIM / SPF (support@frettalent.fr).
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-mono text-[11px]">
          <strong>{usersList.length}</strong> contacts répertoriés
        </div>
      </div>

      {/* 3. HERO SCORECARDS KPI (4 COLONNES ÉQUILIBRÉES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
        
        {/* KPI 1 : Chauffeurs Joignables */}
        <div
          onClick={() => {
            setTarget('all_candidates');
            setSelectedUser(null);
          }}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            target === 'all_candidates'
              ? 'bg-orange-500 text-white border-orange-600 shadow-md ring-2 ring-orange-500/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-80">
            <span className="truncate">Chauffeurs Joignables</span>
            <Users className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-2 tracking-tight font-mono">
            {totalCandidateCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-current/10 flex items-center justify-between text-xs opacity-80">
            <span className="text-[11px]">Candidats conducteurs</span>
            <span className="font-bold text-[10px]">1 Clic</span>
          </div>
        </div>

        {/* KPI 2 : Entreprises Joignables */}
        <div
          onClick={() => {
            setTarget('all_companies');
            setSelectedUser(null);
          }}
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer min-w-0 ${
            target === 'all_companies'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-600/20'
              : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-600">
            <span className="truncate">Entreprises Joignables</span>
            <Building2 className="h-4 w-4 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-600 mt-2 tracking-tight font-mono">
            {totalCompanyCount}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Transporteurs inscrits</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
              1 Clic
            </span>
          </div>
        </div>

        {/* KPI 3 : Modèles Prêts */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Modèles Pré-rédigés</span>
            <Sparkles className="h-4 w-4 text-purple-600 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight font-mono">
            {Object.keys(TEMPLATES).length}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Thèmes & Campagnes</span>
            <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">
              Prêts
            </span>
          </div>
        </div>

        {/* KPI 4 : Délivrabilité */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Serveur d'Envoi</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 ml-1" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-2 tracking-tight font-mono truncate">
            100% DKIM
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Anti-Spam Garanti :</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              Certifié
            </span>
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

      {/* 4. CHOIX DU MODÈLE D'E-MAIL (7 CARTES HAUTE DENSITÉ) */}
      <div className="w-full bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Étape 1 : Choisir un Modèle Pré-Rédigé
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Modèle actif : {selectedTpl?.name}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {Object.entries(TEMPLATES).map(([key, tpl]) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplateKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTemplateSelect(key)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${isSelected ? 'bg-white/20 text-white' : tpl.iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : tpl.iconColor}`} />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : tpl.badgeColor}`}>
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-[11px] font-bold leading-tight truncate">
                  {tpl.name.replace(/^[^\s]+\s/, '')}
                </p>
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
