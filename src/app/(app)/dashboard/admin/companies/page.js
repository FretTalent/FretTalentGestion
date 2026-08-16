'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Search, Eye, Download, Building2, CreditCard, Sparkles, Zap, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

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
        : 'Paiement a l acte (2 EUR)',
      c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `entreprises-frettalent-${new Date().toISOString().split('T')[0]}.csv`);
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
    <div className="max-w-[1600px] mx-auto space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* HEADER EXECUTIVE */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Carrier & Corporate Directory
            </span>
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {companies.length} comptes
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
            Entreprises & Transporteurs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision des comptes recruteurs, abonnements Pro VIP (39,99 €) et vérification légale SIRET/BCE.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Exporter CSV</span>
          </button>
          
          <button
            onClick={fetchCompanies}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* QUICK SCORECARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Entreprises</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{companies.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Abonnés VIP Pro (39,99€)</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{vipCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pay-per-unlock (2€)</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{companies.length - vipCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transfrontaliers (BE/LU/CH)</span>
          <div className="text-2xl font-black text-teal-700 mt-1">
            {companies.filter(c => c.country && c.country !== 'FR').length}
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d'entreprise, e-mail, SIRET, BCE, IDE..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/70"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">💳 Toutes Formules</option>
            <option value="premium_monthly">⭐ Pro Illimité (39,99 €)</option>
            <option value="pay_per_unlock">⚡ Pay-per-unlock (2 €)</option>
          </select>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Entreprise & Pays</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Identifiant Légal</th>
                <th className="py-3 px-4">Formule Stripe</th>
                <th className="py-3 px-4">Inscrit le</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCompanies.map((c) => {
                const flag = c.country === 'BE' ? '🇧🇪' : c.country === 'LU' ? '🇱🇺' : c.country === 'CH' ? '🇨🇭' : '🇫🇷';
                const isVip = c.subscription_plan === 'premium_monthly' || c.subscription_plan === 'premium_plus_monthly';
                const idLabel = c.siret || c.bce || c.rcs_lux || c.ide_ch || c.registration_number || '—';

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.name?.charAt(0)?.toUpperCase() || 'E'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span>{c.name || 'Nom non renseigné'}</span>
                            <span>{flag}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {c.id?.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{c.email || '—'}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c.phone || '—'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {idLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isVip ? (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 font-extrabold px-2.5 py-1 rounded-md text-[10px] border border-purple-200">
                          <Sparkles className="h-3 w-3 text-purple-600" />
                          Pro Illimité (39,99 €/m)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md text-[10px] border border-slate-200">
                          <Zap className="h-3 w-3 text-amber-500" />
                          Pay-per-unlock (2 €)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => router.push(`/dashboard/admin/companies/${c.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Détails</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
