'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Globe,
  Sparkles,
  Star,
  CheckCircle2,
  Trash2,
  Compass,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanyProfile() {
  const router = useRouter();
  const params = useParams();
  const [company, setCompany] = useState(null);
  const [isCarnet, setIsCarnet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [params.id]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      // 1. Essai de récupération dans la table 'entreprises'
      const { data: entData } = await supabase
        .from('entreprises')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (entData) {
        setCompany(entData);
        setIsCarnet(true);
        return;
      }

      // 2. Essai de récupération dans la table 'companies' (Recruteurs Inscrits)
      const { data: compData, error: compErr } = await supabase
        .from('companies')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (compErr || !compData) {
        throw new Error('Entreprise introuvable dans la base');
      }

      setCompany(compData);
      setIsCarnet(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Impossible de charger les données de l'entreprise");
    } finally {
      setLoading(false);
    }
  };

  const handleGeocode = async () => {
    if (!company?.city && !company?.postal_code && !company?.address) {
      toast.error('Veuillez renseigner au moins une ville ou un code postal');
      return;
    }
    setGeocodingLoading(true);
    try {
      const query = [company.address, company.postal_code, company.city, company.country || 'France'].filter(Boolean).join(', ');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { 'User-Agent': 'FretTalent-Admin-Geocoding/1.0' }
      });
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCompany({ ...company, latitude: lat, longitude: lon });
        toast.success(`Coordonnées trouvées : ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      } else {
        toast.error('Aucune coordonnée GPS trouvée pour cette adresse');
      }
    } catch (err) {
      toast.error('Erreur lors du géocodage');
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isCarnet) {
        const { error } = await supabase
          .from('entreprises')
          .update({
            name: company.name,
            email: company.email,
            phone: company.phone || null,
            siret: company.siret || null,
            address: company.address || null,
            postal_code: company.postal_code,
            city: company.city,
            country: company.country || 'FR',
            latitude: company.latitude ? parseFloat(company.latitude) : null,
            longitude: company.longitude ? parseFloat(company.longitude) : null,
            is_partner: Boolean(company.is_partner),
            specialties: Array.isArray(company.specialties) ? company.specialties : [company.specialties].filter(Boolean),
            notes: company.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', params.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('companies')
          .update({
            name: company.name,
            email: company.email,
            phone: company.phone || null,
            siret: company.siret || null,
            has_payment_method: Boolean(company.has_payment_method),
            country: company.country || 'FR',
          })
          .eq('id', params.id);

        if (error) throw error;
      }

      toast.success('Fiche entreprise mise à jour avec succès !');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement "${company.name}" ?`)) return;
    try {
      const table = isCarnet ? 'entreprises' : 'companies';
      const { error } = await supabase.from(table).delete().eq('id', params.id);
      if (error) throw error;
      toast.success('Entreprise supprimée avec succès.');
      router.push('/dashboard/admin/companies');
    } catch (err) {
      toast.error('Erreur lors de la suppression : ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-[#FF7A00] animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chargement de la fiche...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">Entreprise introuvable</h2>
        <p className="text-xs text-slate-500">Cette entreprise n'existe pas ou a été supprimée.</p>
        <button
          onClick={() => router.push('/dashboard/admin/companies')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Retour aux entreprises
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/admin/companies')}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isCarnet 
                  ? 'bg-orange-50 text-[#FF7A00] border border-orange-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {isCarnet ? 'Registre Transporteur (19,99€)' : 'Recruteur Inscrit'}
              </span>
              {company.is_partner && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Partenaire Prioritaire
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{company.name || 'Sans Nom'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Supprimer définitivement"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Supprimer</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 bg-[#FF7A00] hover:bg-orange-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* FICHE DETAILS FORM */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            1. Informations Générales & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Raison Sociale / Nom *</label>
              <input
                type="text"
                required
                value={company.name || ''}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">E-mail Officiel (Obligatoire) *</label>
              <input
                type="email"
                required
                value={company.email || ''}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Téléphone</label>
              <input
                type="text"
                value={company.phone || ''}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                placeholder="Ex: 01 23 45 67 89"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Numéro SIRET / Identification Légale</label>
              <input
                type="text"
                value={company.siret || ''}
                onChange={(e) => setCompany({ ...company, siret: e.target.value })}
                placeholder="14 chiffres"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* ADRESSE ET LOCALISATION */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            2. Adresse & Géolocalisation GPS (Rayon 50 km)
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Adresse complète</label>
              <input
                type="text"
                value={company.address || ''}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                placeholder="Ex: 12 Rue des Transporteurs, Zone Logistique"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Code Postal *</label>
                <input
                  type="text"
                  required
                  value={company.postal_code || ''}
                  onChange={(e) => setCompany({ ...company, postal_code: e.target.value })}
                  placeholder="02000"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ville *</label>
                <input
                  type="text"
                  required
                  value={company.city || ''}
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                  placeholder="Laon"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pays *</label>
                <select
                  value={company.country || 'FR'}
                  onChange={(e) => setCompany({ ...company, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50/50 focus:outline-none cursor-pointer"
                >
                  <option value="FR">🇫🇷 France</option>
                  <option value="BE">🇧🇪 Belgique</option>
                  <option value="LU">🇱🇺 Luxembourg</option>
                  <option value="CH">🇨🇭 Suisse</option>
                </select>
              </div>
            </div>

            {/* Barre de géocodage */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF7A00]" />
                <span>Calcul automatique des coordonnées GPS pour le ciblage 50 km :</span>
              </div>
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocodingLoading}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Compass className={`h-3.5 w-3.5 ${geocodingLoading ? 'animate-spin' : ''}`} />
                <span>{geocodingLoading ? 'Calcul...' : 'Recalculer GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Latitude</label>
                <input
                  type="text"
                  value={company.latitude || ''}
                  onChange={(e) => setCompany({ ...company, latitude: e.target.value })}
                  placeholder="Ex: 48.8566"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Longitude</label>
                <input
                  type="text"
                  value={company.longitude || ''}
                  onChange={(e) => setCompany({ ...company, longitude: e.target.value })}
                  placeholder="Ex: 2.3522"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STATUT ET OPTIONS AVANCÉES */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            3. Statut & Candidatures
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Statut Partenaire Prioritaire</p>
                <p className="text-[11px] text-slate-500">Reçoit en premier les candidatures des chauffeurs</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(company.is_partner)}
                onChange={(e) => setCompany({ ...company, is_partner: e.target.checked })}
                className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Candidatures reçues</p>
                <p className="text-[11px] text-slate-500">Volume total envoyé par FretTalent</p>
              </div>
              <span className="text-base font-black font-mono text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200">
                {company.candidatures_received_count || 0}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Notes internes / Spécialités</label>
            <textarea
              rows={2}
              value={company.notes || ''}
              onChange={(e) => setCompany({ ...company, notes: e.target.value })}
              placeholder="Ex: Transport frigorifique, semi-remorque, régional..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
