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
} from 'lucide-react';

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
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
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

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
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
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-slate-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* HEADER EXECUTIVE */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Comptes Recruteurs Inscrits
            </span>
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {companies.length} recruteurs
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1 tracking-tight">
            Entreprises & Recruteurs Plateforme
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Supervision des comptes recruteurs inscrits, formules d&apos;abonnement Pro VIP (39,99 €) et vérification légale SIRET/BCE/IDE.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Exporter CSV</span>
          </button>
          
          <button
            onClick={fetchCompanies}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* QUICK SCORECARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Recruteurs</span>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{companies.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Abonnés VIP Pro (39,99 €)</span>
          <div className="text-3xl font-black text-purple-700 mt-2 font-mono">{vipCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paiement à l&apos;Acte (4,99 €)</span>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{companies.length - vipCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transfrontaliers (BE / LU / CH)</span>
          <div className="text-3xl font-black text-teal-700 mt-2 font-mono">
            {companies.filter(c => c.country && c.country !== 'FR').length}
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d'entreprise, e-mail, SIRET, BCE, IDE..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">🌍 Tous les Pays</option>
            <option value="FR">🇫🇷 France (SIRET)</option>
            <option value="BE">🇧🇪 Belgique (BCE)</option>
            <option value="LU">🇱🇺 Luxembourg (RCS)</option>
            <option value="CH">🇨🇭 Suisse (IDE)</option>
          </select>

          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">💳 Toutes les Formules</option>
            <option value="premium_monthly">⭐ Pro Illimité (39,99 €)</option>
            <option value="pay_per_unlock">⚡ Paiement à l&apos;Acte (4,99 €)</option>
          </select>
        </div>
      </div>

      {/* TABLE DES ENTREPRISES RECRUTEURS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Aucun recruteur trouvé</p>
            <p className="text-xs text-slate-400">Modifiez vos critères de recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Entreprise & SIRET</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Formule</th>
                  <th className="py-3 px-4 text-center">Pays</th>
                  <th className="py-3 px-4 text-right">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCompanies.map((c) => {
                  const isVip = c.subscription_plan === 'premium_monthly' || c.subscription_plan === 'premium_plus_monthly';
                  const countryCode = c.country || (c.bce ? 'BE' : 'FR');

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Nom */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {isVip && (
                                <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                                  VIP PRO
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {c.siret ? `SIRET: ${c.siret}` : c.bce ? `BCE: ${c.bce}` : c.rcs_lux ? `RCS: ${c.rcs_lux}` : c.ide_ch ? `IDE: ${c.ide_ch}` : c.registration_number || 'Non renseigné'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{c.email}</span>
                          </div>
                          {c.phone && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                              <Phone className="h-2.5 w-2.5 text-slate-400" />
                              <span>{c.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Formule */}
                      <td className="py-3.5 px-4">
                        {isVip ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                            <Sparkles className="h-2.5 w-2.5 fill-purple-500 text-purple-500" />
                            Pro Illimité (39,99 €)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            <CreditCard className="h-2.5 w-2.5 text-slate-400" />
                            À l&apos;acte (4,99 €)
                          </span>
                        )}
                      </td>

                      {/* Pays */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {countryCode === 'FR' ? '🇫🇷 FR' : countryCode === 'BE' ? '🇧🇪 BE' : countryCode === 'LU' ? '🇱🇺 LU' : countryCode === 'CH' ? '🇨🇭 CH' : countryCode}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-[10px] text-slate-400 font-mono">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
