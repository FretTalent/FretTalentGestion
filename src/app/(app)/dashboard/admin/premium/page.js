'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  Search,
  Download,
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Star,
  X,
  Compass,
  Clock,
  Send,
  Users,
  CreditCard,
  ShieldCheck,
  Zap,
  Eye,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPremiumDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('candidats'); // 'candidats' | 'preview' | 'entreprises' | 'journal'
  const [loading, setLoading] = useState(true);

  // Données
  const [candidatures, setCandidatures] = useState([]);
  const [allCandidatesList, setAllCandidatesList] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [emailsLog, setEmailsLog] = useState([]);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    totalRevenue: 0,
    totalCompanies: 0,
    partnerCompanies: 0,
    totalSent: 0,
    totalOpened: 0,
  });

  // Filtres carnet d'adresses
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterPartner, setFilterPartner] = useState('all');

  // État onglet Prévisualisation & Simulation 50 km
  const [previewCandidateId, setPreviewCandidateId] = useState('');
  const [previewCompanyId, setPreviewCompanyId] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [dispatchingLive, setDispatchingLive] = useState(false);

  // Modal Ajout/Modif Entreprise
  const [modalCompanyOpen, setModalCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    phone: '',
    siret: '',
    vat_number: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'FR',
    latitude: '',
    longitude: '',
    is_partner: false,
    notes: '',
  });

  // Modal Détails Envois d'un Chauffeur
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [candidatureEmails, setCandidatureEmails] = useState([]);
  const [candidatureEmailsLoading, setCandidatureEmailsLoading] = useState(false);

  // État relances
  const [runningRelance, setRunningRelance] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      setTestEmailRecipient(user.email || 'support@frettalent.fr');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        router.push('/dashboard/admin');
        return;
      }

      // 1. Récupérer les candidatures achetées avec les infos du candidat
      const { data: candsData, error: candsErr } = await supabase
        .from('candidatures')
        .select(`
          *,
          candidates (
            id,
            full_name,
            email,
            phone,
            city,
            postal_code,
            licenses,
            experience_years
          )
        `)
        .order('created_at', { ascending: false });

      if (candsErr) console.warn('Erreur chargement candidatures:', candsErr);
      setCandidatures(candsData || []);

      // 2. Récupérer tous les candidats pour le sélecteur de prévisualisation
      const { data: allCands } = await supabase
        .from('candidates')
        .select('id, full_name, postal_code, city, licenses, experience_years')
        .order('full_name', { ascending: true });
      setAllCandidatesList(allCands || []);

      if (allCands && allCands.length > 0 && !previewCandidateId) {
        setPreviewCandidateId(candsData?.[0]?.candidate_id || allCands[0].id);
      }

      // 3. Récupérer le registre des entreprises
      const resEnt = await fetch('/api/admin/entreprises');
      if (resEnt.ok) {
        const entData = await resEnt.json();
        setEntreprises(entData.entreprises || []);
      }

      // 4. Récupérer le journal des 100 derniers emails envoyés
      const { data: emailsData, error: emailsErr } = await supabase
        .from('candidature_emails')
        .select(`
          *,
          candidates ( full_name, city, postal_code )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (emailsErr) console.warn('Erreur chargement logs emails:', emailsErr);
      setEmailsLog(emailsData || []);

      // 5. Calculer les statistiques
      const totalSubs = candsData?.length || 0;
      const totalRev = totalSubs * 19.99;
      const totalComp = entreprises?.length || 0;
      const partComp = entreprises?.filter(e => e.is_partner).length || 0;
      const totSent = candsData?.reduce((acc, curr) => acc + (curr.sent_count || 0), 0) || 0;
      const totOpen = candsData?.reduce((acc, curr) => acc + (curr.opened_count || 0), 0) || 0;

      setStats({
        totalSubscriptions: totalSubs,
        totalRevenue: totalRev,
        totalCompanies: totalComp,
        partnerCompanies: partComp,
        totalSent: totSent,
        totalOpened: totOpen,
      });
    } catch (err) {
      console.error('Erreur fetchAllData:', err);
      toast.error('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  // Charger la prévisualisation du template d'email
  const loadEmailPreview = async (candId, compId = '') => {
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/admin/premium/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candId || previewCandidateId,
          companyId: compId || previewCompanyId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur chargement aperçu');
      setPreviewData(data);
    } catch (err) {
      console.error('Erreur loadEmailPreview:', err);
      toast.error('Impossible de générer l’aperçu de l’email.');
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'preview') {
      loadEmailPreview(previewCandidateId, previewCompanyId);
    }
  }, [activeTab, previewCandidateId, previewCompanyId]);

  // Envoyer un email de test à l'adresse de l'admin
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient) {
      toast.error('Veuillez renseigner une adresse email de réception.');
      return;
    }

    setSendingTestEmail(true);
    const toastId = toast.loading(`Envoi du test à ${testEmailRecipient}...`);
    try {
      const res = await fetch('/api/admin/premium/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: previewCandidateId,
          companyId: previewCompanyId,
          sendTestToEmail: testEmailRecipient,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.testSendResult?.error) {
        throw new Error(data.testSendResult?.error || data.error || 'Erreur lors de l’envoi');
      }

      toast.success(`✉️ Email de test reçu avec succès dans votre boîte (${testEmailRecipient}) !`, { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Échec de l’envoi de test', { id: toastId });
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Lancer la vraie diffusion aux entreprises trouvées dans les 50 km
  const handleLaunchLiveDispatch = async () => {
    if (!previewCandidateId) {
      toast.error('Veuillez sélectionner un chauffeur.');
      return;
    }
    const count = previewData?.nearbyCount || 0;
    if (!confirm(`Confirmer la transmission immédiate de la candidature à ${count} entreprise(s) située(s) dans le rayon de 50 km ?`)) return;

    setDispatchingLive(true);
    const toastId = toast.loading(`Envoi en cours à ${count} transporteur(s)...`);
    try {
      const res = await fetch('/api/premium/send-candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: previewCandidateId,
          amountPaid: 1999,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la diffusion');

      toast.success(`🚀 Candidature transmise à ${data.companiesContacted || 0} entreprises dans un rayon de 50 km !`, { id: toastId });
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la diffusion', { id: toastId });
    } finally {
      setDispatchingLive(false);
    }
  };

  // Déclencher manuellement l'envoi d'une candidature
  const handleTriggerDispatch = async (candidature) => {
    if (!confirm(`Relancer la diffusion automatique (50 km) pour ${candidature.candidates?.full_name || 'ce candidat'} ?`)) return;

    const toastId = toast.loading('Diffusion en cours...');
    try {
      const res = await fetch('/api/premium/send-candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidature.candidate_id,
          stripeSessionId: candidature.stripe_session_id,
          amountPaid: candidature.amount_paid || 1999,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’envoi');

      toast.success(`🚀 Candidature transmise à ${data.companiesContacted || 0} transporteurs !`, { id: toastId });
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la diffusion', { id: toastId });
    }
  };

  // Exécuter manuellement les relances J+7
  const handleRunRelances = async () => {
    setRunningRelance(true);
    const toastId = toast.loading('Traitement des relances J+7...');
    try {
      const res = await fetch('/api/premium/relance', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors des relances');

      toast.success(`📬 ${data.relancesSent || 0} relance(s) effectuée(s) avec succès !`, { id: toastId });
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Erreur traitement relances', { id: toastId });
    } finally {
      setRunningRelance(false);
    }
  };

  // Ouvrir modal de détails d'envois pour un chauffeur
  const handleViewCandidatureDetails = async (cand) => {
    setSelectedCandidature(cand);
    setDetailModalOpen(true);
    setCandidatureEmailsLoading(true);

    try {
      const { data } = await supabase
        .from('candidature_emails')
        .select('*')
        .eq('candidature_id', cand.id)
        .order('sent_at', { ascending: false });

      setCandidatureEmails(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCandidatureEmailsLoading(false);
    }
  };

  // Gestion formulaire Entreprise
  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm({
      name: '',
      email: '',
      phone: '',
      siret: '',
      vat_number: '',
      address: '',
      postal_code: '',
      city: '',
      country: 'FR',
      latitude: '',
      longitude: '',
      is_partner: false,
      notes: '',
    });
    setModalCompanyOpen(true);
  };

  const handleOpenEditCompany = (comp) => {
    setEditingCompany(comp);
    setCompanyForm({
      name: comp.name || '',
      email: comp.email || '',
      phone: comp.phone || '',
      siret: comp.siret || '',
      vat_number: comp.vat_number || '',
      address: comp.address || '',
      postal_code: comp.postal_code || '',
      city: comp.city || '',
      country: comp.country || 'FR',
      latitude: comp.latitude !== null ? String(comp.latitude) : '',
      longitude: comp.longitude !== null ? String(comp.longitude) : '',
      is_partner: Boolean(comp.is_partner),
      notes: comp.notes || '',
    });
    setModalCompanyOpen(true);
  };

  const handleGeocode = async () => {
    if (!companyForm.postal_code && !companyForm.city) {
      toast.error('Veuillez renseigner au moins le code postal et la ville.');
      return;
    }
    setGeocodingLoading(true);
    try {
      const query = [companyForm.address, companyForm.postal_code, companyForm.city].filter(Boolean).join(' ');
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].geometry.coordinates;
          setCompanyForm(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lon.toFixed(6),
          }));
          toast.success(`📍 Coordonnées trouvées : ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          return;
        }
      }
      toast.error('Coordonnées non trouvées automatiquement. Saisie manuelle possible.');
    } catch (err) {
      toast.error('Erreur lors du géocodage.');
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name || !companyForm.email || !companyForm.postal_code || !companyForm.city) {
      toast.error('Nom, Email, Code Postal et Ville sont obligatoires.');
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        ...companyForm,
        latitude: companyForm.latitude ? parseFloat(companyForm.latitude) : null,
        longitude: companyForm.longitude ? parseFloat(companyForm.longitude) : null,
      };

      const url = editingCompany ? `/api/admin/entreprises/${editingCompany.id}` : '/api/admin/entreprises';
      const method = editingCompany ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur lors de l’enregistrement');

      toast.success(editingCompany ? '✅ Entreprise mise à jour !' : '✅ Entreprise ajoutée au carnet d’adresses !');
      setModalCompanyOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Erreur d’enregistrement');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteCompany = async (comp) => {
    if (!confirm(`Supprimer définitivement l'entreprise "${comp.name}" du carnet d'adresses ?`)) return;
    try {
      const res = await fetch(`/api/admin/entreprises/${comp.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur suppression');
      toast.success('Entreprise supprimée.');
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Erreur');
    }
  };

  // Filtrage du carnet d'adresses
  const filteredEntreprises = entreprises.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.postal_code?.includes(q) ||
      c.siret?.includes(q);

    const matchesCountry = filterCountry === 'all' || (c.country || 'FR') === filterCountry;
    const matchesPartner =
      filterPartner === 'all' ||
      (filterPartner === 'true' && c.is_partner) ||
      (filterPartner === 'false' && !c.is_partner);

    return matchesSearch && matchesCountry && matchesPartner;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Chargement du module Auto-Candidatures...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* 1. EN-TÊTE PRINCIPALE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xs">
              Forfait 19,99 €
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Module Auto-Candidatures Premium
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Diffusion Auto-Candidatures & Registre Transporteurs (50 km)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gérez les chauffeurs souscrits, prévisualisez en direct le template d&apos;email envoyé, testez l&apos;envoi et alimentez votre carnet d&apos;adresses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('preview')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs shadow-orange-500/20 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>Voir Template & Envoyer Test</span>
          </button>

          <button
            onClick={handleOpenAddCompany}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-600" />
            <span>Ajouter Entreprise</span>
          </button>

          <button
            onClick={handleRunRelances}
            disabled={runningRelance}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            title="Exécuter les relances programmées à J+7"
          >
            <Send className={`h-4 w-4 ${runningRelance ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Relances J+7</span>
          </button>

          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Actualiser les données"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. 4 SCORECARDS KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chauffeurs Souscrits</span>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{candidatures.length}</div>
          <span className="text-[11px] text-orange-600 font-bold mt-1 block">
            {(candidatures.length * 19.99).toFixed(2)} € encaissés
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Entreprises au Registre</span>
          <div className="text-3xl font-black text-blue-600 mt-2 font-mono">{entreprises.length}</div>
          <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1 font-bold">
            {entreprises.filter(e => e.is_partner).length} partenaires prioritaires
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Emails Candidatures Envoyés</span>
          <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">
            {candidatures.reduce((acc, curr) => acc + (curr.sent_count || 0), 0)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Dans un rayon de 50 km</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Candidatures Ouvertes</span>
          <div className="text-3xl font-black text-purple-600 mt-2 font-mono">
            {candidatures.reduce((acc, curr) => acc + (curr.opened_count || 0), 0)}
          </div>
          <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1 font-bold">
            Accusés transmis par email
          </span>
        </div>
      </div>

      {/* 3. SÉLECTEUR D'ONGLETS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('candidats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'candidats'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Chauffeurs Souscrits ({candidatures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Simulation 50 km & Template Email (Live)</span>
        </button>

        <button
          onClick={() => setActiveTab('entreprises')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'entreprises'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Carnet d&apos;Adresses Entreprises ({entreprises.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'journal'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Journal des Envois & Tracking</span>
        </button>
      </div>

      {/* ONGLET 1 : CHAUFFEURS SOUSCRITS (19,99 €) */}
      {activeTab === 'candidats' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {candidatures.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucune souscription pour le moment</p>
              <p className="text-xs text-slate-400">Les achats de forfait 19,99 € apparaîtront ici automatiquement.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Chauffeur</th>
                    <th className="py-3 px-4">Localisation & Rayon</th>
                    <th className="py-3 px-4 text-center">Entreprises Ciblées</th>
                    <th className="py-3 px-4 text-center">Ouvertures</th>
                    <th className="py-3 px-4 text-center">Date & Paiement</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {candidatures.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {cand.candidates?.full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {cand.candidates?.full_name || 'Chauffeur'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Permis : {(cand.candidates?.licenses || []).join(', ') || 'SPL'} • {cand.candidates?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{cand.candidate_postal_code} {cand.candidate_city || cand.candidates?.city || 'France'}</span>
                        </div>
                        <span className="text-[10px] text-orange-600 font-bold">
                          Rayon {cand.radius_km || 50} km
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {cand.sent_count || cand.target_companies_count || 0} envoyés
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {cand.opened_count || 0} vues
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-semibold text-slate-900 font-mono">19,99 €</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(cand.created_at).toLocaleDateString('fr-FR')} à {new Date(cand.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPreviewCandidateId(cand.candidate_id);
                              setActiveTab('preview');
                            }}
                            className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            title="Voir l'aperçu du mail"
                          >
                            <Eye className="h-3 w-3 inline mr-1" />
                            Aperçu
                          </button>
                          <button
                            onClick={() => handleViewCandidatureDetails(cand)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Détail
                          </button>
                          <button
                            onClick={() => handleTriggerDispatch(cand)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            title="Relancer la diffusion"
                          >
                            ⚡ Diffuser
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ONGLET 2 : SIMULATION & PRÉVISUALISATION DU TEMPLATE EMAIL EN DIRECT */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          
          {/* Panneau de configuration de la simulation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  Simulateur & Calculateur Rayon 50 km
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1.5">
                  Sélection du Chauffeur & Ciblage des Entreprises
                </h2>
                <p className="text-xs text-slate-500">
                  Sélectionnez un profil pour calculer instantanément les transporteurs situés à 50 km et prévisualiser l&apos;email exact.
                </p>
              </div>

              {/* Action Envoi Test / Diffusion */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <input
                    type="email"
                    placeholder="Votre email de test..."
                    value={testEmailRecipient}
                    onChange={e => setTestEmailRecipient(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 w-48 sm:w-60"
                  />
                  <button
                    onClick={handleSendTestEmail}
                    disabled={sendingTestEmail || previewLoading}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Send className={`h-3 w-3 ${sendingTestEmail ? 'animate-spin' : ''}`} />
                    <span>{sendingTestEmail ? 'Envoi...' : 'M’envoyer un test'}</span>
                  </button>
                </div>

                <button
                  onClick={handleLaunchLiveDispatch}
                  disabled={dispatchingLive || previewLoading || !previewData?.nearbyCount}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Zap className={`h-4 w-4 ${dispatchingLive ? 'animate-spin' : ''}`} />
                  <span>Diffuser aux {previewData?.nearbyCount || 0} entreprises (50 km)</span>
                </button>
              </div>
            </div>

            {/* Sélecteurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase block">
                  👤 Chauffeur concerné :
                </label>
                <select
                  value={previewCandidateId}
                  onChange={e => setPreviewCandidateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  {allCandidatesList.map(cand => (
                    <option key={cand.id} value={cand.id}>
                      {cand.full_name} — {cand.postal_code} {cand.city} ({(cand.licenses || []).join('/') || 'SPL'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase block">
                  🏢 Entreprise exemple pour l&apos;aperçu :
                </label>
                <select
                  value={previewCompanyId}
                  onChange={e => setPreviewCompanyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  <option value="">-- Entreprise la plus proche du chauffeur --</option>
                  {(previewData?.nearbyCompanies || []).map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.is_partner ? '⭐ [Partenaire] ' : ''}{comp.name} — {comp.postal_code} {comp.city} ({comp.distance_km} km)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grille 2 colonnes : Liste des entreprises 50 km & Rendu Visuel WYSIWYG de l'Email */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Colonne Gauche (5 cols) : Entreprises trouvées dans le rayon */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Entreprises dans les 50 km ({previewData?.nearbyCount || 0})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Autour de {previewData?.candidate?.postal_code} {previewData?.candidate?.city}
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                  {previewData?.nearbyCount || 0} cibles
                </span>
              </div>

              {previewLoading ? (
                <div className="py-12 text-center">
                  <RefreshCw className="h-6 w-6 text-orange-500 animate-spin mx-auto" />
                  <span className="text-xs text-slate-400 mt-2 block font-medium">Calcul Haversine en cours...</span>
                </div>
              ) : (previewData?.nearbyCompanies || []).length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl space-y-2">
                  <Building2 className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Aucune entreprise dans les 50 km</p>
                  <p className="text-[11px] text-slate-400">
                    Ajoutez des entreprises dans l&apos;onglet Carnet d&apos;adresses pour ce secteur.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {previewData.nearbyCompanies.map((comp) => (
                    <div
                      key={comp.id}
                      onClick={() => setPreviewCompanyId(comp.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        previewCompanyId === comp.id || (!previewCompanyId && previewData.targetCompany?.id === comp.id)
                          ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                          : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{comp.name}</span>
                          {comp.is_partner && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">
                              ⭐ Partenaire
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-bold text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-200/60 text-[11px]">
                          {comp.distance_km} km
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>📍 {comp.postal_code} {comp.city}</span>
                        <span className="font-mono text-[10px] text-slate-400">{comp.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colonne Droite (7 cols) : Aperçu Visuel WYSIWYG de l'Email */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Aperçu Réel du Mail Destinataire</span>
                    <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                      HTML React Email
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Objet : ⭐ Candidature Directe : {previewData?.candidate?.full_name} ({(previewData?.candidate?.licenses || ['SPL']).join('/')}) à {previewData?.targetCompany?.distance_km || 14} km
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 font-mono">
                  <span>Pixel Tracking :</span>
                  <span className="text-emerald-600 font-extrabold">Actif (1x1)</span>
                </div>
              </div>

              {/* Conteneur Iframe / Rendu */}
              {previewLoading ? (
                <div className="py-24 text-center">
                  <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
                  <span className="text-xs text-slate-400 mt-2 block font-medium">Génération de l&apos;aperçu en cours...</span>
                </div>
              ) : previewData?.html ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100/60 p-2 sm:p-4">
                  <iframe
                    title="Aperçu Email Candidature"
                    srcDoc={previewData.html}
                    className="w-full h-[620px] rounded-lg bg-white border border-slate-200 shadow-sm"
                  />
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Impossible d&apos;afficher le template d&apos;email.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ONGLET 3 : CARNET D'ADRESSES ENTREPRISES */}
      {activeTab === 'entreprises' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise stockée (nom, ville, email, SIRET)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/60"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterCountry}
                onChange={e => setFilterCountry(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none cursor-pointer"
              >
                <option value="all">🌍 Tous Pays</option>
                <option value="FR">🇫🇷 France</option>
                <option value="BE">🇧🇪 Belgique</option>
                <option value="LU">🇱🇺 Luxembourg</option>
                <option value="CH">🇨🇭 Suisse</option>
              </select>

              <select
                value={filterPartner}
                onChange={e => setFilterPartner(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none cursor-pointer"
              >
                <option value="all">⭐ Tous Statuts</option>
                <option value="true">⭐ Partenaires Prioritaires</option>
                <option value="false">Non Partenaires</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredEntreprises.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Aucune entreprise dans le registre</p>
                <p className="text-xs text-slate-400">Ajoutez vos entreprises de transport partenaires pour les cibler automatiquement.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Entreprise</th>
                      <th className="py-3 px-4">Localisation & GPS</th>
                      <th className="py-3 px-4">Email & Téléphone</th>
                      <th className="py-3 px-4 text-center">Partenaire</th>
                      <th className="py-3 px-4 text-center">Candidatures</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredEntreprises.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {comp.name?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{comp.name}</span>
                                {comp.is_partner && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">
                                    ⭐ Prioritaire
                                  </span>
                                )}
                              </div>
                              {comp.siret && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  SIRET : {comp.siret}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{comp.postal_code} {comp.city} ({comp.country || 'FR'})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {comp.latitude && comp.longitude ? (
                              <span className="text-emerald-600 font-semibold">
                                📍 {comp.latitude.toFixed(4)}, {comp.longitude.toFixed(4)}
                              </span>
                            ) : (
                              <span className="text-amber-600">⚠️ Coordonnées manquantes</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{comp.email}</span>
                          </div>
                          {comp.phone && (
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5 text-slate-400" />
                              <span>{comp.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {comp.is_partner ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              Oui
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-slate-900">
                            {comp.candidatures_received_count || 0} reçue(s)
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditCompany(comp)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(comp)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONGLET 4 : JOURNAL DES ENVOIS & TRACKING */}
      {activeTab === 'journal' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {emailsLog.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Send className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucun envoi enregistré</p>
              <p className="text-xs text-slate-400">Le journal de diffusion des emails apparaîtra ici au fil des commandes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Chauffeur</th>
                    <th className="py-3 px-4">Entreprise Destinataire</th>
                    <th className="py-3 px-4 text-center">Distance</th>
                    <th className="py-3 px-4 text-center">Statut Envoi</th>
                    <th className="py-3 px-4 text-center">Consultation (Tracking)</th>
                    <th className="py-3 px-4 text-center">Relance J+7</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {emailsLog.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.candidates?.full_name || 'Chauffeur'}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {log.candidates?.city}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <span>{log.company_name}</span>
                          {log.is_partner && <span className="text-[9px] text-amber-600 font-extrabold">⭐</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {log.company_email}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        {log.distance_km ? `${log.distance_km} km` : '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {log.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            Envoyé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                            <AlertCircle className="h-3 w-3" />
                            Échec
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {log.opened_at ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                            <Eye className="h-3 w-3" />
                            Ouvert ({log.open_count}x)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Non ouvert</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {log.relance_status === 'sent' ? (
                          <span className="text-emerald-700 font-bold text-[10px]">✓ Relancé</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Programmée</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right text-[10px] text-slate-400 font-mono">
                        {log.sent_at ? new Date(log.sent_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL : AJOUT / MODIFICATION ENTREPRISE */}
      {modalCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setModalCompanyOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-1">
              {editingCompany ? 'Modifier l’Entreprise' : 'Ajouter une Entreprise au Carnet'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Ces coordonnées seront stockées dans votre registre pour les ciblages automatiques à 50 km.
            </p>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Nom de l&apos;Entreprise *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="Ex: Transports Dubois & Fils"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Email de Réception *</label>
                  <input
                    type="email"
                    required
                    value={companyForm.email}
                    onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                    placeholder="recrutement@transport.fr"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Téléphone Direct</label>
                  <input
                    type="text"
                    value={companyForm.phone}
                    onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    placeholder="04 78 00 00 00"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">SIRET / BCE / IDE</label>
                  <input
                    type="text"
                    value={companyForm.siret}
                    onChange={e => setCompanyForm({ ...companyForm, siret: e.target.value })}
                    placeholder="14 chiffres"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Pays *</label>
                  <select
                    value={companyForm.country}
                    onChange={e => setCompanyForm({ ...companyForm, country: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="LU">Luxembourg</option>
                    <option value="CH">Suisse</option>
                  </select>
                </div>
              </div>

              {/* Adresse & Géolocalisation */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Adresse</label>
                  <input
                    type="text"
                    value={companyForm.address}
                    onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                    placeholder="Zone industrielle / Rue"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase block">Code Postal *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.postal_code}
                      onChange={e => setCompanyForm({ ...companyForm, postal_code: e.target.value })}
                      placeholder="69000"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase block">Ville *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.city}
                      onChange={e => setCompanyForm({ ...companyForm, city: e.target.value })}
                      placeholder="Lyon"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                {/* Calcul GPS */}
                <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] text-slate-600 font-medium">
                    Calcul automatique des coordonnées GPS (Haversine 50 km)
                  </div>
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocodingLoading}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Compass className={`h-3.5 w-3.5 ${geocodingLoading ? 'animate-spin' : ''}`} />
                    <span>{geocodingLoading ? 'Calcul...' : 'Géocoder'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase block">Latitude</label>
                    <input
                      type="text"
                      value={companyForm.latitude}
                      onChange={e => setCompanyForm({ ...companyForm, latitude: e.target.value })}
                      placeholder="Ex: 45.7640"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase block">Longitude</label>
                    <input
                      type="text"
                      value={companyForm.longitude}
                      onChange={e => setCompanyForm({ ...companyForm, longitude: e.target.value })}
                      placeholder="Ex: 4.8357"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Partenaire */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_partner_modal"
                  checked={companyForm.is_partner}
                  onChange={e => setCompanyForm({ ...companyForm, is_partner: e.target.checked })}
                  className="h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="is_partner_modal" className="text-xs font-bold text-slate-800 cursor-pointer">
                  ⭐ Entreprise Partenaire (Cible prioritaire dans les 50 km)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCompanyOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                >
                  {formSaving ? 'Enregistrement...' : editingCompany ? 'Mettre à jour' : 'Ajouter au Carnet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : DÉTAIL DES ENVOIS POUR UN CHAUFFEUR */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-black text-slate-900">
                Diffusion : {selectedCandidature?.candidates?.full_name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Liste des entreprises ayant reçu la candidature ({selectedCandidature?.candidate_postal_code} {selectedCandidature?.candidate_city}).
            </p>

            {candidatureEmailsLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="h-6 w-6 text-orange-500 animate-spin mx-auto" />
              </div>
            ) : candidatureEmails.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 rounded-xl">
                Aucun email enregistré pour cette session.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {candidatureEmails.map((em) => (
                  <div
                    key={em.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{em.company_name}</span>
                        {em.is_partner && <span className="text-[9px] text-amber-600 font-extrabold">⭐ Partenaire</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {em.company_email} • Distance : {em.distance_km ? `${em.distance_km} km` : '—'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {em.opened_at ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                          <Eye className="h-3 w-3" />
                          Ouvert ({em.open_count}x)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                          <Clock className="h-3 w-3" />
                          Non ouvert
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end mt-4">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
