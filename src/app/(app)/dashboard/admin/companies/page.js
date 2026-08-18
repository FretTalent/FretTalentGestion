'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  Search,
  Eye,
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
  ExternalLink,
  X,
  Compass,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const router = useRouter();
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all'); // 'all' | 'FR' | 'BE' | 'LU' | 'CH'
  const [filterPartner, setFilterPartner] = useState('all'); // 'all' | 'true' | 'false'

  // Modal Ajout / Modification
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formData, setFormData] = useState({
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

  // Modal Historique Candidatures Reçues
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCompanyHistory, setSelectedCompanyHistory] = useState(null);
  const [companyCandidatures, setCompanyCandidatures] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const fetchEntreprises = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/entreprises');
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/dashboard/admin');
          return;
        }
        throw new Error('Erreur de chargement');
      }
      const data = await res.json();
      setEntreprises(data.entreprises || []);
    } catch (err) {
      console.error('Erreur fetchEntreprises:', err);
      toast.error('Impossible de charger le registre des entreprises.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
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
    setModalOpen(true);
  };

  const handleOpenEditModal = (comp) => {
    setEditingCompany(comp);
    setFormData({
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
    setModalOpen(true);
  };

  const handleGeocode = async () => {
    if (!formData.postal_code && !formData.city) {
      toast.error('Veuillez renseigner au moins le code postal et la ville.');
      return;
    }
    setGeocodingLoading(true);
    try {
      const query = [formData.address, formData.postal_code, formData.city].filter(Boolean).join(' ');
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].geometry.coordinates;
          setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lon.toFixed(6),
          }));
          toast.success(`📍 Coordonnées trouvées : ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          return;
        }
      }
      toast.error('Impossible de trouver les coordonnées exactes. Vous pouvez les saisir manuellement.');
    } catch (err) {
      toast.error('Erreur lors du géocodage.');
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.postal_code || !formData.city) {
      toast.error('Veuillez remplir les champs obligatoires (Nom, Email, CP, Ville).');
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
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

      toast.success(editingCompany ? '✅ Entreprise mise à jour !' : '✅ Entreprise ajoutée au registre !');
      setModalOpen(false);
      fetchEntreprises();
    } catch (err) {
      toast.error(err.message || 'Erreur d’enregistrement');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteCompany = async (comp) => {
    if (!confirm(`Supprimer définitivement l'entreprise "${comp.name}" du registre ?`)) return;
    try {
      const res = await fetch(`/api/admin/entreprises/${comp.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      toast.success('Entreprise supprimée.');
      setEntreprises(prev => prev.filter(e => e.id !== comp.id));
    } catch (err) {
      toast.error(err.message || 'Erreur suppression');
    }
  };

  const handleViewHistory = async (comp) => {
    setSelectedCompanyHistory(comp);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/entreprises/${comp.id}`);
      if (res.ok) {
        const data = await res.json();
        setCompanyCandidatures(data.candidaturesReceived || []);
      }
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredEntreprises = entreprises.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.postal_code?.includes(q) ||
      c.siret?.includes(q) ||
      c.phone?.includes(q);

    const matchesCountry = filterCountry === 'all' || (c.country || 'FR') === filterCountry;
    const matchesPartner =
      filterPartner === 'all' ||
      (filterPartner === 'true' && c.is_partner) ||
      (filterPartner === 'false' && !c.is_partner);

    return matchesSearch && matchesCountry && matchesPartner;
  });

  const partnerCount = entreprises.filter(e => e.is_partner).length;
  const totalCandidaturesReceived = entreprises.reduce((acc, curr) => acc + (curr.candidatures_received_count || 0), 0);
  const totalCandidaturesOpened = entreprises.reduce((acc, curr) => acc + (curr.candidatures_opened_count || 0), 0);

  const exportToCSV = () => {
    if (filteredEntreprises.length === 0) return;
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Adresse', 'CP', 'Ville', 'Pays', 'Latitude', 'Longitude', 'Partenaire', 'Candidatures Reçues', 'Candidatures Ouvertes'];
    const rows = filteredEntreprises.map(c => [
      c.id,
      `"${c.name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.address || ''}"`,
      `"${c.postal_code || ''}"`,
      `"${c.city || ''}"`,
      c.country || 'FR',
      c.latitude || '',
      c.longitude || '',
      c.is_partner ? 'OUI' : 'NON',
      c.candidatures_received_count || 0,
      c.candidatures_opened_count || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registre-entreprises-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Chargement du registre des entreprises...
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
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Administration & Ciblage
            </span>
            <span className="bg-orange-500/10 text-orange-600 border border-orange-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {entreprises.length} entreprises
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Registre des Entreprises & Auto-Candidatures
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Annuaire des transporteurs ciblés par les forfaits Auto-Candidature Premium (50 km).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une Entreprise</span>
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={fetchEntreprises}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. 4 CARTES SCORECARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Entreprises</span>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{entreprises.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Registre actif</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Partenaires Prioritaires</span>
          <div className="text-3xl font-black text-amber-600 mt-2 font-mono">{partnerCount}</div>
          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1 font-bold">
            Priorité rayon 50 km
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Candidatures Transmises</span>
          <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">{totalCandidaturesReceived}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Emails Premium envoyés</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Candidatures Ouvertes</span>
          <div className="text-3xl font-black text-purple-600 mt-2 font-mono">{totalCandidaturesOpened}</div>
          <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1 font-bold">
            {totalCandidaturesReceived > 0 ? Math.round((totalCandidaturesOpened / totalCandidaturesReceived) * 100) : 0}% taux d&apos;ouverture
          </span>
        </div>
      </div>

      {/* 3. BARRE DE RECHERCHE ET FILTRES */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, code postal, email, SIRET..."
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
            <option value="true">⭐ Partenaires Uniquement</option>
            <option value="false">Non Partenaires</option>
          </select>
        </div>
      </div>

      {/* 4. TABLEAU DES ENTREPRISES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredEntreprises.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Aucune entreprise trouvée</p>
            <p className="text-xs text-slate-400">Ajoutez des entreprises ou modifiez vos critères de recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Entreprise</th>
                  <th className="py-3 px-4">Localisation & GPS</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Partenaire</th>
                  <th className="py-3 px-4 text-center">Candidatures</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEntreprises.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nom */}
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
                                ⭐ Partenaire
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

                    {/* Localisation */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
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
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="truncate max-w-[200px]">{comp.email}</span>
                        </div>
                        {comp.phone && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                            <Phone className="h-2.5 w-2.5 text-slate-400" />
                            <span>{comp.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Partenaire */}
                    <td className="py-3.5 px-4 text-center">
                      {comp.is_partner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          Oui
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Candidatures */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => handleViewHistory(comp)}
                          className="font-mono font-bold text-slate-900 text-xs hover:text-orange-600 underline cursor-pointer"
                          title="Voir l'historique des candidatures"
                        >
                          {comp.candidatures_received_count || 0} reçue(s)
                        </button>
                        <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                          {comp.candidatures_opened_count || 0} ouverte(s)
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(comp)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Modifier l'entreprise"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(comp)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
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

      {/* MODAL : AJOUT / MODIFICATION ENTREPRISE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-1">
              {editingCompany ? 'Modifier l’Entreprise' : 'Ajouter une Entreprise au Registre'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Ces coordonnées seront ciblées automatiquement par le module Auto-Candidature Premium.
            </p>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Nom de l&apos;Entreprise *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Transports Dubois & Fils"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Email de Réception *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="recrutement@transports-dubois.fr"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Téléphone Direct</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="04 78 00 00 00"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">SIRET / BCE / IDE</label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={e => setFormData({ ...formData, siret: e.target.value })}
                    placeholder="14 chiffres"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Pays *</label>
                  <select
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none"
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
                  <label className="text-xs font-bold text-slate-700 uppercase block">Adresse postale</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="12 rue des Transporteurs"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase block">Code Postal *</label>
                    <input
                      type="text"
                      required
                      value={formData.postal_code}
                      onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="69000"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase block">Ville *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Lyon"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                {/* Bouton géocodage */}
                <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] text-slate-600 font-medium">
                    Calcul automatique des coordonnées GPS (Haversine)
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
                      value={formData.latitude}
                      onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="Ex: 45.7640"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase block">Longitude</label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="Ex: 4.8357"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Case Partenaire */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_partner"
                  checked={formData.is_partner}
                  onChange={e => setFormData({ ...formData, is_partner: e.target.checked })}
                  className="h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="is_partner" className="text-xs font-bold text-slate-800 cursor-pointer">
                  ⭐ Marquer comme Entreprise Partenaire (Prioritaire dans les 50 km)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                >
                  {formSaving ? 'Enregistrement...' : editingCompany ? 'Mettre à jour' : 'Ajouter au Registre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : HISTORIQUE DES CANDIDATURES REÇUES PAR L'ENTREPRISE */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-black text-slate-900">
                {selectedCompanyHistory?.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Historique des candidatures Premium transmises à cette entreprise ({selectedCompanyHistory?.city}).
            </p>

            {historyLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="h-6 w-6 text-orange-500 animate-spin mx-auto" />
              </div>
            ) : companyCandidatures.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 rounded-xl">
                Aucune candidature transmise pour le moment à cette entreprise.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {companyCandidatures.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{c.candidates?.full_name || 'Chauffeur'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • {c.distance_km ? `${c.distance_km} km` : ''} ({c.candidates?.city})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Permis : {(c.candidates?.licenses || []).join(', ')} • Envoyé le {c.sent_at ? new Date(c.sent_at).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {c.opened_at ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          Ouvert ({c.open_count}x)
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
                onClick={() => setHistoryModalOpen(false)}
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
