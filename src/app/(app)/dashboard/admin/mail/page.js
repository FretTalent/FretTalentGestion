'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const TEMPLATES = {
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
  const [target, setTarget] = useState('specific');
  const [specificEmails, setSpecificEmails] = useState('');

  const [selectedTemplateKey, setSelectedTemplateKey] = useState('custom');
  const [type, setType] = useState('custom');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

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

  const requestSend = e => {
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
      setStatus({ type: 'success', message: `✅ E-mail envoyé avec succès à ${data.count} destinataire(s)` });

      if (target === 'specific') setSpecificEmails('');
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'envoi de l'e-mail");
      setStatus({ type: 'error', message: err.message || "Erreur lors de l'envoi de l'e-mail" });
    } finally {
      setLoading(false);
    }
  };

  const selectedTpl = TEMPLATES[selectedTemplateKey];

  const targetLabel =
    target === 'all_candidates' ? 'tous les candidats'
    : target === 'all_companies' ? 'toutes les entreprises'
    : 'les adresses spécifiées';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 flex items-center gap-2">
            <Mail className="h-6 w-6 text-orange-500" />
            Gestion des E-mails
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Créez et envoyez des campagnes d&apos;e-mail à vos utilisateurs
          </p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? 'Masquer aperçu' : 'Aperçu e-mail'}
        </button>
      </div>

      {/* Template Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
          Choisir un modèle
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(TEMPLATES).map(([key, tpl]) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplateKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTemplateSelect(key)}
                className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className={`w-9 h-9 rounded-xl ${tpl.iconBg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${tpl.iconColor}`} />
                </div>
                <p className="text-xs font-bold text-slate-900 leading-tight mb-1">{tpl.name}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${tpl.badgeColor}`}>
                  {tpl.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={requestSend} className="space-y-6">
        {/* Destinataires */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
            Destinataires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'all_candidates', icon: Users, label: 'Tous les Candidats', color: 'orange' },
              { value: 'all_companies', icon: Building2, label: 'Toutes les Entreprises', color: 'blue' },
              { value: 'specific', icon: Mail, label: 'Adresses spécifiques', color: 'slate' },
            ].map(opt => {
              const Icon = opt.icon;
              const isActive = target === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`cursor-pointer border-2 p-4 rounded-xl flex items-center gap-3 transition-all ${
                    isActive
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="target"
                    value={opt.value}
                    checked={isActive}
                    onChange={() => setTarget(opt.value)}
                    className="text-orange-600 focus:ring-orange-500 accent-orange-500"
                  />
                  <Icon className={`h-5 w-5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                </label>
              );
            })}
          </div>

          {target === 'specific' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Adresses e-mail (séparées par des virgules)
              </label>
              <input
                type="text"
                value={specificEmails}
                onChange={e => setSpecificEmails(e.target.value)}
                placeholder="contact@entreprise.fr, chauffeur@mail.com"
                required={target === 'specific'}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
            Contenu de l&apos;e-mail
          </h3>

          {selectedTpl && selectedTpl.description && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xl">{selectedTpl.emoji}</span>
              <div>
                <p className="text-xs font-bold text-slate-700">{selectedTpl.name}</p>
                <p className="text-xs text-slate-500">{selectedTpl.description}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Design */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Design de l&apos;e-mail
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="update">🔵 Bleu — Nouveauté / Info</option>
                  <option value="promo">🟣 Violet — Promotion / Offre</option>
                  <option value="custom">🟠 Orange — Message classique</option>
                </select>
              </div>

              {/* Sujet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Objet de l&apos;e-mail
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  placeholder="Ex : Trouvez vos chauffeurs avec FretTalent"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Titre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Titre principal (H1)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Ex : La solution N°1 pour recruter vos chauffeurs"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Texte bouton (optionnel)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    placeholder="Ex : Découvrir FretTalent"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Lien bouton (URL)
                  </label>
                  <input
                    type="url"
                    value={ctaLink}
                    onChange={e => setCtaLink(e.target.value)}
                    placeholder="https://frettalent.fr/..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Corps du message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={14}
                placeholder="Rédigez votre message ici. Les retours à la ligne seront conservés dans l'e-mail."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono"
              />
              <p className="text-xs text-slate-400 mt-1">{message.length} caractères</p>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        {showPreview && title && message && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-500" />
              Aperçu de l&apos;e-mail
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-w-2xl mx-auto">
              {/* Email header */}
              <div className={`p-6 text-center ${type === 'update' ? 'bg-blue-600' : type === 'promo' ? 'bg-purple-600' : 'bg-orange-500'}`}>
                <p className="text-white font-black text-xl tracking-tight">Fret<span className="text-white/80">Talent</span></p>
              </div>
              <div className="p-8 bg-white">
                <h2 className="text-2xl font-black text-slate-900 mb-4">{title}</h2>
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{message}</div>
                {ctaText && ctaLink && (
                  <div className="mt-6 text-center">
                    <span className={`inline-block px-6 py-3 rounded-xl font-bold text-sm text-white ${type === 'update' ? 'bg-blue-600' : type === 'promo' ? 'bg-purple-600' : 'bg-orange-500'}`}>
                      {ctaText} →
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-400">FretTalent — Réseau N°1 du Recrutement Transport (France, Belgique, Luxembourg, Suisse)</p>
              </div>
            </div>
          </div>
        )}

        {/* Envoi */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              {status && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  {status.message}
                </div>
              )}
              {!status && (
                <div className="text-sm text-slate-500">
                  Destinataire : <strong className="text-slate-800">{targetLabel}</strong>
                  {subject && <> · Sujet : <strong className="text-slate-800">&ldquo;{subject.slice(0, 50)}{subject.length > 50 ? '…' : ''}&rdquo;</strong></>}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-orange-500/20"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? 'Envoi en cours...' : 'Envoyer la campagne'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Confirmation d'envoi"
        message={`Êtes-vous sûr de vouloir envoyer cet e-mail à ${targetLabel} ?`}
        onConfirm={executeSendMail}
        onCancel={() => setConfirmModal({ isOpen: false })}
        variant="warning"
        confirmText="Oui, envoyer"
      />
    </div>
  );
}
