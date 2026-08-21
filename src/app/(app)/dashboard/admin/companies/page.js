'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  Search,
  Download,
  Building2,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
  MapPin,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all'); // 'all' | 'FR' | 'BE' | 'LU' | 'CH'
  const [filterPlan, setFilterPlan] = useState('all'); // 'all' | 'premium_monthly' | 'pay_per_unlock'

  const exportToCSV = () => {
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
        ? 'Pro Illimité (39.99 EUR)'
        : 'Paiement à l\'acte (4.99 EUR)',
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

      // Recruteurs inscrits (companies)
      const { data: compData, error: compErr } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (compErr) console.error(compErr);
      setCompanies(compData || []);
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
              Répertoire Entreprises Recruteurs
            </span>
            <span className="text-xs font-bold text-slate-600">• Comptes Inscrits ({companies.length})</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comptes Entreprises & Transporteurs
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Consultez la liste des comptes recruteurs inscrits et gérez leurs formules d'abonnement.
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

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              Recruteurs Inscrits
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {companies.length}
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-2">
              Comptes transporteurs actifs
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Abonnés Pro Illimité
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 font-mono tracking-tight">
              {vipCount}
            </div>
            <p className="text-xs text-emerald-700 font-bold mt-2">
              Formule Pro 39,99 € / mois
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Paiement à l'acte
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-600 font-mono tracking-tight">
              {companies.length - vipCount}
            </div>
            <p className="text-xs text-orange-700 font-bold mt-2">
              Déblocage 4,99 € / candidat
            </p>
          </div>
        </div>
      </div>

      {/* 3. FILTRES & RECHERCHE */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, e-mail, SIRET, BCE, RCS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7A00] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filtre Pays */}
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="all">🌍 Tous les Pays</option>
              <option value="FR">🇫🇷 France</option>
              <option value="BE">🇧🇪 Belgique</option>
              <option value="LU">🇱🇺 Luxembourg</option>
              <option value="CH">🇨🇭 Suisse</option>
            </select>

            {/* Filtre Formule */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="all">📋 Toutes les Formules</option>
              <option value="premium_monthly">⭐ Pro Illimité (39,99€)</option>
              <option value="pay_per_unlock">💳 Paiement à l'acte (4,99€)</option>
            </select>
          </div>
        </div>

        {/* LISTE RECRUTEURS INSCRITS */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6">Entreprise</th>
                <th className="py-4 px-6">Contact & Identifiant</th>
                <th className="py-4 px-6">Pays</th>
                <th className="py-4 px-6">Formule</th>
                <th className="py-4 px-6">Date Inscription</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-600 font-bold">
                    Aucune entreprise recruteur trouvée.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  const countryFlag = c.country === 'BE' || c.bce ? '🇧🇪' : c.country === 'LU' ? '🇱🇺' : c.country === 'CH' ? '🇨🇭' : '🇫🇷';
                  const isPro = c.subscription_plan === 'premium_monthly' || c.subscription_plan === 'premium_plus_monthly';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.name || 'Entreprise'}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-mono text-slate-800">{c.siret || c.bce || c.rcs_lux || c.ide_ch || c.registration_number || 'Non renseigné'}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{c.phone || 'Pas de tél'}</p>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm">{countryFlag}</span>
                      </td>

                      <td className="py-4 px-6">
                        {isPro ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-600" /> Pro Illimité (39,99€)
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Paiement à l'acte (4,99€)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-500 font-normal">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => router.push(`/dashboard/admin/companies/${c.id}`)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
