'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  CreditCard,
  TrendingUp,
  DollarSign,
  Search,
  Download,
  Calendar,
  Building2,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function AdminFinance() {
  const router = useRouter();
  const [unlocks, setUnlocks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unlock' | 'subscription'

  const fetchFinanceData = async () => {
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

      // 1. Fetch unlocks
      const { data: unlocksData, error: uError } = await supabase
        .from('unlocks')
        .select(`
          id,
          amount_charged,
          created_at,
          stripe_payment_intent_id,
          companies ( id, name, siret, bce, country, subscription_plan ),
          candidates ( id, full_name, email, city, country )
        `)
        .order('created_at', { ascending: false });

      if (uError) console.error('Erreur unlocks:', uError);
      setUnlocks(unlocksData || []);

      // 2. Fetch companies to track subscriptions
      const { data: compData } = await supabase
        .from('companies')
        .select('id, name, subscription_plan, created_at');

      setCompanies(compData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const totalUnlockRevenue = unlocks.reduce((sum, item) => sum + (item.amount_charged || 0), 0) / 100;
  const vipCompaniesCount = companies.filter(c => c.subscription_plan === 'premium_monthly' || c.subscription_plan === 'premium_plus_monthly').length;
  const estimatedMRR = vipCompaniesCount * 39.99;
  const totalGrossRevenue = totalUnlockRevenue + estimatedMRR;

  const filteredUnlocks = unlocks.filter((u) => {
    const companyName = u.companies?.name?.toLowerCase() || '';
    const candidateName = u.candidates?.full_name?.toLowerCase() || '';
    const stripeRef = u.stripe_payment_intent_id?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return companyName.includes(search) || candidateName.includes(search) || stripeRef.includes(search);
  });

  const exportToCSV = () => {
    if (filteredUnlocks.length === 0) return;
    const headers = ['ID Transaction', 'Date', 'Entreprise Recruteur', 'Chauffeur Débloqué', 'Montant TTC', 'Stripe Payment Intent ID'];
    const rows = filteredUnlocks.map(u => [
      u.id,
      u.created_at ? new Date(u.created_at).toLocaleString('fr-FR') : '',
      `"${u.companies?.name || ''}"`,
      `"${u.candidates?.full_name || ''}"`,
      `${((u.amount_charged || 200) / 100).toFixed(2)} €`,
      u.stripe_payment_intent_id || 'pi_auto_unlock'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `frettalent_grand_livre_stripe_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-slate-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* EXECUTIVE HEADER */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Grand Livre Comptable & Trésorerie Stripe
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              Stripe En Direct
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
            Grand Livre Financier & Encaissements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des flux Stripe : Déblocages de chauffeurs à 2,00 € TTC et abonnements récurrents VIP (39,99 €/mois).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <span>Console Stripe</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={fetchFinanceData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SCORECARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Déblocages Encaissés</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono">
            {totalUnlockRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{unlocks.length} transactions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenus Récurrents VIP (39,99 €)</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 mt-1 font-mono">
            {estimatedMRR.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <span className="text-[11px] text-purple-600 mt-1 block font-semibold">{vipCompaniesCount} abonnés actifs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Panier Moyen Déblocage</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono">
            2,00 €
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">TVA incluse</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volume Global Encaissé</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 font-mono">
            {totalGrossRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Flux consolidé</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrer par entreprise, chauffeur débloqué, identifiant Stripe..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/70"
          />
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredUnlocks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            Aucune transaction financière trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Entreprise Recruteur</th>
                  <th className="py-3 px-4">Chauffeur Débloqué</th>
                  <th className="py-3 px-4">Montant Net TTC</th>
                  <th className="py-3 px-4">Stripe Reference</th>
                  <th className="py-3 px-4 text-right">Statut Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUnlocks.map((u) => {
                  const flag = u.candidates?.country === 'BE' ? '🇧🇪' : u.candidates?.country === 'LU' ? '🇱🇺' : u.candidates?.country === 'CH' ? '🇨🇭' : '🇫🇷';
                  const compFlag = u.companies?.country === 'BE' ? '🇧🇪' : u.companies?.country === 'LU' ? '🇱🇺' : u.companies?.country === 'CH' ? '🇨🇭' : '🇫🇷';
                  const isVip = u.companies?.subscription_plan === 'premium_monthly' || u.companies?.subscription_plan === 'premium_plus_monthly';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleString('fr-FR') : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{u.companies?.name || 'Entreprise'}</span>
                          <span>{compFlag}</span>
                        </div>
                        {isVip && (
                          <span className="text-[10px] text-purple-700 font-extrabold flex items-center gap-0.5 mt-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> Client Abonné Pro
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{u.candidates?.full_name || 'Chauffeur'}</span>{' '}
                        <span className="text-slate-400 text-[11px]">({u.candidates?.city || '—'} {flag})</span>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.candidates?.email || '—'}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-slate-950 text-sm">
                        {((u.amount_charged || 200) / 100).toFixed(2)} €
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-700">
                          {u.stripe_payment_intent_id || 'pi_direct_unlock'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Payé & Validé
                        </span>
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
