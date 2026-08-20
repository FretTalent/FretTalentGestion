'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Handshake,
  GraduationCap,
  Laptop,
  Truck,
  ShieldCheck,
  Building2,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Mail,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PartenariatPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    partnerType: 'Centre de Formation / FIMO-FCO',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Veuillez remplir les champs obligatoires (Nom, E-mail, Message).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/partenariat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la demande.');
      }

      setSubmitted(true);
      toast.success('Demande de partenariat transmise avec succès !');
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        partnerType: 'Centre de Formation / FIMO-FCO',
        message: '',
      });
    } catch (err) {
      console.error('Erreur partenariat:', err);
      toast.error(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const partnerTypes = [
    {
      icon: GraduationCap,
      title: 'Centres de Formation & Auto-Écoles',
      desc: 'Valorisez et placez vos diplômés (FIMO, FCO, Permis C, CE, ADR) directement auprès des entreprises de transport en recherche active.',
    },
    {
      icon: Laptop,
      title: 'Éditeurs de Logiciels Transport & TMS',
      desc: 'Connectez votre solution RH, TMS ou ERP à l\'API FretTalent pour la synchronisation automatique des candidatures et documents.',
    },
    {
      icon: Truck,
      title: 'Constructeurs & Loueurs Poids Lourd',
      desc: 'Proposez des offres exclusives, des véhicules modernes et des avantages aux transporteurs et chauffeurs indépendants du réseau.',
    },
    {
      icon: ShieldCheck,
      title: 'Assureurs & Services au Transport',
      desc: 'Offrez des solutions d\'assurance flotte, protection juridique et prévoyance adaptées aux exigences des professionnels du transport.',
    },
    {
      icon: Building2,
      title: 'Cabinet de Recrutement & Intérim',
      desc: 'Bénéficiez d\'un accès privilégié à la CV-thèque chauffeurs qualifiés et vérifiés pour accélérer vos recrutements urgents.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Background ambient glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider animate-fade-in">
            <Handshake className="w-4 h-4 text-orange-500" />
            <span>Écosystème & Partenariats Stratégiques</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Devenez Partenaire Officiel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">FretTalent</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Formateurs, éditeurs TMS, équipementiers, assureurs et spécialistes du transport : unissons nos forces pour transformer le recrutement des chauffeurs routiers en France, Belgique, Luxembourg et Suisse.
          </p>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400">Dédié au Transport Routier</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-orange-400">4 Pays</div>
              <div className="text-xs text-slate-400">FR • BE • LU • CH</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-white">Direct</div>
              <div className="text-xs text-slate-400">Mise en relation sans intermédiaire</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-emerald-400">✓ Certifié</div>
              <div className="text-xs text-slate-400">Système de Vérification Pièces</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÉGORIES DE PARTENARIAT */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Des Synergies Gagnant-Gagnant
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Nous concevons des partenariats sur-mesure adaptés à votre cœur de métier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerTypes.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 transition-all duration-300 group space-y-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORMULAIRE DE DEMANDE DE PARTENARIAT */}
      <section className="py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="text-center space-y-2 border-b border-slate-800 pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-black uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Formulaire Officiel</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Proposez un Partenariat
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Remplissez ce formulaire. Votre demande sera transmise à <strong>support@frettalent.fr</strong> et notre direction vous recontactera sous 24h.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Demande reçue avec succès !</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Un e-mail de confirmation vous a été envoyé. Notre responsable partenariats examine votre proposition et reviendra vers vous rapidement.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                >
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nom complet */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Nom / Prénom *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Jean Dupont"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Entreprise */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Nom de l&apos;Entreprise / Organisme
                    </label>
                    <input
                      type="text"
                      placeholder="ex: AFTRAL, Transports Martin, Silae..."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Adresse E-mail Professionnelle *
                    </label>
                    <input
                      type="email"
                      placeholder="ex: contact@entreprise.fr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Numéro de Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="ex: 06 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Type de Partenariat */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Type de Partenariat Souhaité
                  </label>
                  <select
                    value={formData.partnerType}
                    onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="Centre de Formation / FIMO-FCO">🎓 Centre de Formation / Auto-École (FIMO, FCO, ADR)</option>
                    <option value="Logiciel Transport / TMS / API">💻 Éditeur de Logiciel Transport (TMS / ERP / API)</option>
                    <option value="Constructeur / Loueur Poids Lourd">🚛 Constructeur, Équipementier ou Loueur PL/SPL</option>
                    <option value="Assurance / Services au Transporteur">🛡️ Assurance, Mutuelle ou Prévoyance Transport</option>
                    <option value="Cabinet Recrutement / ETT">🏢 Agence d&apos;Intérim ou Cabinet RH Spécialisé</option>
                    <option value="Partenariat Média / Presse / Événement">📰 Média Transport, Presse ou Événement</option>
                    <option value="Autre Partenariat">🤝 Autre type de partenariat</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Votre Proposition / Message *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Présentez brièvement votre entreprise et votre idée de partenariat ou de synergie..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Transmission en cours...' : 'Envoyer ma Demande de Partenariat'}</span>
                </button>
              </form>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>E-mail direct : <strong>support@frettalent.fr</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>Support Téléphone & Telegram 7j/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA BANNER */}
      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Vous avez des questions sur nos intégrations ?</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Consultez également nos offres d&apos;emploi et la CV-thèque en direct.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold border border-slate-800 transition-all flex items-center gap-2"
          >
            <span>Nous contacter</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
          </Link>
        </div>
      </section>
    </div>
  );
}
