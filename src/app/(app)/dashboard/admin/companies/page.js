'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  Search,
  Download,
  Building2,
  CreditCard,
  Sparkles,
  Zap,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('entreprises'); // 'entreprises' (Carnet 19,99€) | 'recruteurs' (Inscrits)
  const [companies, setCompanies] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all'); // 'all' | 'FR' | 'BE' | 'LU' | 'CH'
  const [filterPlan, setFilterPlan] = useState('all'); // 'all' | 'premium_monthly' | 'pay_per_unlock'

  const exportToCSV = () => {
    if (activeTab === 'entreprises') {
      if (filteredEntreprises.length === 0) return;
      const headers = ['ID', 'Nom Entreprise', 'Email', 'Téléphone', 'SIRET', 'Code Postal', 'Ville', 'Pays', 'Partenaire Prioritaire', 'Date Import'];
      const rows = filteredEntreprises.map(e => [
        e.id,
        `"${e.name || ''}"`,
        `"${e.email || ''}"`,
        `"${e.phone || ''}"`,
        `"${e.siret || ''}"`,
        `"${e.postal_code || ''}"`,
        `"${e.city || ''}"`,
        e.country || 'FR',
        e.is_partner ? 'OUI' : 'NON',
        e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : ''
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `registre-transporteurs-19.99-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export du carnet transporteurs téléchargé !');
      return;
    }

    if (filteredCompanies.length === 0) return;
    const headers = ['ID', 'Nom Entreprise', 'Email', 'Téléphone', 'Identifiant Entreprise', 'Pays', 'Formule Abonnement', 'Date Inscription'];
    const rows = filteredCompanies.map(c => [
      c.id,
      `"${c.name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.siret || c.bce || c.rcs_lux || c.ide_ch || c.registration_number || ''}"`,
      c.country || (c.bce ? 'BE' : 'FR'),
      c.subscription_plan === 'premium_monthly' || c.subscription_plan === 'premium_plus_monthly'
        ? 'Pro Illimite (39.99 EUR)'
        : 'Paiement a l acte (4.99 EUR)',
      c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `entreprises-recruteurs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export des recruteurs téléchargé !');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

      // 1. Recruteurs inscrits (companies)
      const { data: compData, error: compErr } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (compErr) console.error(compErr);
      setCompanies(compData || []);

      // 2. Registre transporteurs importés (entreprises)
      const { data: entData, error: entErr } = await supabase
        .from('entreprises')
        .select('*')
        .order('created_at', { ascending: false });

      if (entErr) console.error(entErr);
      setEntreprises(entData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.siret?.includes(searchTerm) ||
      c.bce?.includes(searchTerm) ||
      c.rcs_lux?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ide_ch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.registration_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const companyCountry = c.country || (c.bce ? 'BE' : 'FR');
    const matchesCountry = filterCountry === 'all' || companyCountry === filterCountry;
    
    let matchesPlan = true;
    if (filterPlan === 'premium_monthly') {
      matchesPlan = c.subscription_plan === 'premium_monthly' || c.subscription_plan === 'premium_plus_monthly';
    } else if (filterPlan === 'pay_per_unlock') {
      matchesPlan = c.subscription_plan !== 'premium_monthly' && c.subscription_plan !== 'premium_plus_monthly';
    }

    return matchesSearch && matchesCountry && matchesPlan;
  });

  const filteredEntreprises = entreprises.filter(e => {
    const matchesSearch =
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.postal_code?.includes(searchTerm) ||
      e.siret?.includes(searchTerm);
    const entCountry = e.country || 'FR';
    const matchesCountry = filterCountry === 'all' || entCountry === filterCountry;
    return matchesSearch && matchesCountry;
  });

  const vipCount = companies.filter(c => c.subscription_plan === 'premium_monthly' || c.subscription_plan === 'premium_plus_monthly').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Chargement des entreprises...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. HEADER HERO ENTREPRISES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#FF7A00] text-[11px] font-black uppercase tracking-wider border border-orange-200/60 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Répertoire National Transport
            </span>
            <span className="text-xs font-bold text-slate-600">• Entreprises & Recruteurs</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comptes & Registre Entreprises
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Consultez la liste des entreprises de transport importées (utilisées pour la Candidature Rapide 19,99€) ainsi que les comptes recruteurs inscrits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('entreprises')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'entreprises'
              ? 'bg-[#FF7A00] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Registre Transporteurs ({entreprises.length})</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">19,99 €</span>
        </button>

        <button
          onClick={() => setActiveTab('recruteurs')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'recruteurs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Recruteurs Inscrits ({companies.length})</span>
        </button>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF7A00]">
              Registre Transporteurs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {entreprises.length}
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-2">
              Entreprises ciblées (19,99€)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              Recruteurs Inscrits
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-600 font-mono tracking-tight">
              {companies.length}
            </div>
            <p className="text-xs text-blue-700 font-bold mt-2">
              {vipCount} abonnés Pro Illimité
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Avec Coordonnées GPS
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {entreprises.filter(e => e.latitude && e.longitude).length}
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-2">
              Prêtes pour ciblage 50 km
            </p>
          </div>
        </div>
      </div>

      {/* 3. TABLEAU */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder={activeTab === 'entreprises' ? "Rechercher par nom, email, ville, CP, SIRET..." : "Rechercher par nom, email, SIRET, BCE..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none cursor-pointer"
            >
              <option value="all">🌍 Tous les Pays</option>
              <option value="FR">🇫🇷 France</option>
              <option value="BE">🇧🇪 Belgique</option>
              <option value="LU">🇱🇺 Luxembourg</option>
              <option value="CH">🇨🇭 Suisse</option>
            </select>

            {activeTab === 'recruteurs' && (
              <select
                value={filterPlan}
                onChange={e => setFilterPlan(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes Formules</option>
                <option value="premium_monthly">Pro Illimité (39,99€)</option>
                <option value="pay_per_unlock">À l'acte (4,99€)</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: REGISTRE TRANSPORTEURS IMPORTES (19,99€) */}
        {activeTab === 'entreprises' && (
          <div>
            {filteredEntreprises.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-600">
                Aucune entreprise trouvée dans le registre.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Entreprise</th>
                      <th className="py-3 px-3">Email & Téléphone</th>
                      <th className="py-3 px-3">Localisation & GPS</th>
                      <th className="py-3 px-3 text-center">SIRET</th>
                      <th className="py-3 px-3 text-center">Partenaire</th>
                      <th className="py-3 px-3 text-right">Fiche Détaillée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredEntreprises.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center font-black text-xs shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900">{e.name || 'Sans nom'}</p>
                              {e.address && <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{e.address}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-800 font-mono text-[11px]">{e.email || '—'}</p>
                          {e.phone && <p className="text-slate-500 text-[10px] font-mono">{e.phone}</p>}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{e.postal_code} {e.city} ({e.country || 'FR'})</span>
                          </div>
                          {e.latitude && e.longitude ? (
                            <span className="text-[10px] text-emerald-600 font-mono font-bold">
                              📍 {Number(e.latitude).toFixed(3)}, {Number(e.longitude).toFixed(3)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-medium">⚠️ Pas de GPS</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                          {e.siret || '—'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {e.is_partner ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              Oui
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <a
                            href={`/dashboard/admin/companies/${e.id}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#FF7A00] hover:text-white bg-orange-50 hover:bg-[#FF7A00] transition-colors inline-flex items-center gap-1"
                          >
                            <span>Détails & Modifier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECRUTEURS INSCRITS */}
        {activeTab === 'recruteurs' && (
          <div>
            {filteredCompanies.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-600">
                Aucun recruteur inscrit trouvé.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Entreprise</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Identifiant Légal</th>
                      <th className="py-3 px-3 text-center">Pays</th>
                      <th className="py-3 px-3 text-center">Formule</th>
                      <th className="py-3 px-3 text-right">Inscription</th>
                      <th className="py-3 px-3 text-right">Fiche</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredCompanies.map(c => {
                      const isVip = c.subscription_plan === 'premium_monthly' || c.subscription_plan === 'premium_plus_monthly';
                      const country = c.country || (c.bce ? 'BE' : 'FR');
                      const flag = country === 'BE' ? '🇧🇪' : country === 'LU' ? '🇱🇺' : country === 'CH' ? '🇨🇭' : '🇫🇷';

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <span className="font-black text-slate-900">{c.name || 'Sans nom'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-medium text-slate-800">{c.email || '—'}</p>
                            <p className="text-slate-600 text-[10px] font-mono">{c.phone || '—'}</p>
                          </td>

                          <td className="py-3 px-3 font-mono text-slate-600">
                            {c.siret || c.bce || c.rcs_lux || c.ide_ch || c.registration_number || '—'}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="text-base">{flag}</span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            {isVip ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                                Pro Illimité (39,99€)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-[#FF7A00] border border-orange-200">
                                À l'acte (4,99€)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <a
                              href={`/dashboard/admin/companies/${c.id}`}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                            >
                              <span>Voir</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
