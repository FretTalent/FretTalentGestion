'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Send, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminMail() {
  const router = useRouter();

  const predefinedTemplates = {
    update: {
      name: '🚀 Mise à jour / Nouveauté',
      type: 'update',
      subject: 'Découvrez les nouveautés sur FretTalent',
      title: 'De nouvelles fonctionnalités sont en ligne !',
      message:
        "Bonjour,\n\nNous sommes ravis de vous annoncer que de nouvelles fonctionnalités ont été ajoutées sur FretTalent pour améliorer votre expérience.\n\nConnectez-vous dès maintenant pour les découvrir !\n\nL'équipe FretTalent",
      ctaText: 'Se connecter',
      ctaLink: 'https://fret-talent-gestion.vercel.app/login',
    },
    promo: {
      name: '🎉 Promotion / Offre spéciale',
      type: 'promo',
      subject: 'Offre exceptionnelle sur FretTalent',
      title: 'Profitez de notre offre limitée !',
      message:
        "Bonjour,\n\nPour une durée limitée, profitez d'une offre exclusive sur vos prochains recrutements avec FretTalent.\n\nNe manquez pas cette occasion de trouver les meilleurs chauffeurs au meilleur prix.\n\nA très vite sur FretTalent !",
      ctaText: "Voir l'offre",
      ctaLink: 'https://fret-talent-gestion.vercel.app/tarifs',
    },
    missing_doc: {
      name: '⚠️ Documents manquants (Candidat)',
      type: 'custom',
      subject: 'Action requise : Documents manquants sur votre profil',
      title: 'Mettez à jour votre profil',
      message:
        "Bonjour,\n\nNous avons remarqué qu'il manque certains documents obligatoires sur votre profil FretTalent (Permis, FIMO, etc.).\n\nAfin que votre profil soit visible par les recruteurs, merci de vous connecter et de télécharger les documents manquants au plus vite.\n\nCordialement,\nL'équipe FretTalent",
      ctaText: 'Mettre à jour mon profil',
      ctaLink: 'https://fret-talent-gestion.vercel.app/dashboard/candidate',
    },
    new_candidates: {
      name: '🚛 Nouveaux chauffeurs disponibles (Entreprise)',
      type: 'update',
      subject: 'De nouveaux chauffeurs sont disponibles !',
      title: 'Découvrez les nouveaux talents',
      message:
        "Bonjour,\n\nDe nouveaux chauffeurs qualifiés viennent de s'inscrire sur FretTalent dans votre région.\n\nConnectez-vous dès maintenant pour consulter leurs profils et entrer en contact avec eux avant vos concurrents !\n\nL'équipe FretTalent",
      ctaText: 'Voir les chauffeurs',
      ctaLink: 'https://fret-talent-gestion.vercel.app/dashboard/recruiter',
    },
    custom: {
      name: '📝 Message classique (Personnalisé)',
      type: 'custom',
      subject: '',
      title: '',
      message: '',
      ctaText: '',
      ctaLink: '',
    },
  };

  const [target, setTarget] = useState('specific');
  const [specificEmails, setSpecificEmails] = useState('');

  const [selectedTemplateKey, setSelectedTemplateKey] = useState('custom');
  const [type, setType] = useState('custom');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleTemplateChange = e => {
    const key = e.target.value;
    setSelectedTemplateKey(key);
    const tpl = predefinedTemplates[key];
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
      toast.error(
        'Veuillez remplir au minimum le sujet, le titre et le message.',
      );
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const payload = {
        target,
        specificEmails,
        type,
        subject,
        title,
        message,
        ctaText,
        ctaLink,
      };

      const res = await fetch('/api/admin/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      toast.success(
        `E-mail envoyé avec succès ! (${data.count} destinataires)`,
      );
      setStatus({
        type: 'success',
        message: `E-mail envoyé avec succès ! (${data.count} destinataires)`,
      });

      if (target === 'specific') {
        setSpecificEmails('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'envoi de l'e-mail");
      setStatus({
        type: 'error',
        message: err.message || "Erreur lors de l'envoi de l'e-mail",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Envoi d'E-mails (Marketing)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Créez et envoyez de belles campagnes d'e-mails à vos utilisateurs.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={requestSend} className="p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              1. Destinataires
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-colors ${target === 'all_candidates' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <input
                  type="radio"
                  name="target"
                  value="all_candidates"
                  checked={target === 'all_candidates'}
                  onChange={() => setTarget('all_candidates')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-bold text-slate-700">
                  Tous les Candidats
                </span>
              </label>

              <label
                className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-colors ${target === 'all_companies' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <input
                  type="radio"
                  name="target"
                  value="all_companies"
                  checked={target === 'all_companies'}
                  onChange={() => setTarget('all_companies')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-bold text-slate-700">
                  Toutes les Entreprises
                </span>
              </label>

              <label
                className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-colors ${target === 'specific' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <input
                  type="radio"
                  name="target"
                  value="specific"
                  checked={target === 'specific'}
                  onChange={() => setTarget('specific')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-bold text-slate-700">
                  Spécifique
                </span>
              </label>
            </div>

            {target === 'specific' && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Adresses e-mail (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={specificEmails}
                  onChange={e => setSpecificEmails(e.target.value)}
                  placeholder="exemple1@mail.com, exemple2@mail.com"
                  required={target === 'specific'}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              2. Modèle et Contenu
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Charger un modèle (Auto-remplissage)
                  </label>
                  <select
                    value={selectedTemplateKey}
                    onChange={handleTemplateChange}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium"
                  >
                    {Object.entries(predefinedTemplates).map(([key, tpl]) => (
                      <option key={key} value={key}>
                        {tpl.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Design de l'e-mail
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="update">Bleu - Nouveauté / Info</option>
                    <option value="promo">Violet - Promotion / Offre</option>
                    <option value="custom">Orange - Message classique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Objet de l'e-mail (Sujet)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    placeholder="Découvrez notre nouvelle fonctionnalité..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Titre dans l'e-mail (H1)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="Grosse nouveauté sur FretTalent !"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Texte du bouton (optionnel)
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={e => setCtaText(e.target.value)}
                      placeholder="En savoir plus"
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Lien du bouton (URL)
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Message principal
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={13}
                  placeholder="Rédigez votre message ici. Les retours à la ligne seront conservés."
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              {status && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {status.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? 'Envoi en cours...' : 'Envoyer la campagne'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Confirmation d'envoi"
        message={`Êtes-vous sûr de vouloir envoyer cet e-mail (${target === 'all_candidates' ? 'à tous les candidats' : target === 'all_companies' ? 'à toutes les entreprises' : 'aux adresses spécifiées'}) ?`}
        onConfirm={executeSendMail}
        onCancel={() => setConfirmModal({ isOpen: false })}
        variant="warning"
        confirmText="Oui, envoyer"
      />
    </div>
  );
}
