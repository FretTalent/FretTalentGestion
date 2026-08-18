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
  Check,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFinance() {
  const router = useRouter();
  const [unlocks, setUnlocks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all'); // 'all' | 'vip' | 'pay_per_view'

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
        .select('id, name, country, subscription_plan, created_at');

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

  // Calculs géographiques des recruteurs payants
  const geoRevenue = useMemo(() => {
    const counts = { FR: 0, BE: 0, LU: 0, CH: 0 };
    unlocks.forEach(u => {
      const country = u.companies?.country || 'FR';
      if (counts[country] !== undefined) counts[country]++;
      else counts.FR++;
    });
    return counts;
  }, [unlocks]);

  const filteredUnlocks = unlocks.filter((u) => {
    const isVip = u.companies?.subscription_plan === 'premium_monthly' || u.companies?.subscription_plan === 'premium_plus_monthly';
    if (filterPlan === 'vip' && !isVip) return false;
    if (filterPlan === 'pay_per_view' && isVip) return false;

    if (searchTerm.trim()) {
      const companyName = u.companies?.name?.toLowerCase() || '';
      const candidateName = u.candidates?.full_name?.toLowerCase() || '';
      const stripeRef = u.stripe_payment_intent_id?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return companyName.includes(search) || candidateName.includes(search) || stripeRef.includes(search);
    }
    return true;
  });

  const exportToCSV = () => {
    if (filteredUnlocks.length === 0) {
      toast.error('Aucune transaction à exporter.');
      return;
    }
    const headers = ['ID Transaction', 'Date', 'Entreprise Recruteur', 'Pays', 'Chauffeur Débloqué', 'Montant TTC', 'Stripe Payment Intent ID'];
    const rows = filteredUnlocks.map(u => [
      u.id,
      u.created_at ? new Date(u.created_at).toLocaleString('fr-FR') : '',
      `"${u.companies?.name || ''}"`,
      u.companies?.country || 'FR',
      `"${u.candidates?.full_name || ''}"`,
      `${((u.amount_charged || 499) / 100).toFixed(2)} €`,
      u.stripe_payment_intent_id || 'pi_auto_unlock'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `frettalent_transactions_stripe_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export des transactions Stripe téléchargé !');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Chargement des finances Stripe...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. HEADER HERO FINANCES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#43A047] text-[11px] font-black uppercase tracking-wider border border-emerald-200/60 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Grand Livre Stripe Live
            </span>
            <span className="text-xs font-bold text-slate-600">• Déblocages à l'acte (4,99€) & Abonnements (39,99€)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Trésorerie & Transactions Financières
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Supervision des encaissements automatisés par carte bancaire, TVA européenne et ventilation par pays.
          </p>
        </div>

        {/* Actions d'export & Refresh */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={fetchFinanceData}
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
            <span>Exporter CSV Comptable</span>
          </button>
        </div>
      </div>

      {/* 2. KPI CARDS : 4 INDICATEURS FINANCIERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 : CA Brut Total */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Chiffre d'Affaires Brut
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#43A047] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalGrossRevenue.toFixed(2)} €
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                Paiements Stripe validés
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2 : Déblocages Chauffeurs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Déblocages Chauffeurs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalUnlockRevenue.toFixed(2)} €
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="bg-orange-50 text-[#FF7A00] px-2 py-0.5 rounded-md font-bold">
                {unlocks.length} achats à 4,99 €
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3 : Abonnements MRR */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              MRR Abonnements
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {estimatedMRR.toFixed(2)} €
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                {vipCompaniesCount} recruteurs Pro (39,99€)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4 : Panier Moyen */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Ticket Moyen
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {unlocks.length > 0 ? (totalUnlockRevenue / unlocks.length).toFixed(2) : '4.99'} €
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold">
                Par transaction
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. TABLEAU DES TRANSACTIONS AVEC FILTRES & RECHERCHE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        {/* En-tête filtre & recherche */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FF7A00]" />
              Journal des Déblocages & Facturations
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Historique complet des achats de coordonnées effectués par les entreprises.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'pay_per_view', label: 'À l’acte (4,99€)' },
              { key: 'vip', label: 'Abonnés Pro' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterPlan(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterPlan === f.key
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par entreprise, chauffeur ou ID Stripe..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
          />
        </div>

        {/* Table des transactions */}
        {filteredUnlocks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-600">
            Aucune transaction trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Entreprise Recruteur</th>
                  <th className="py-3 px-3">Chauffeur</th>
                  <th className="py-3 px-3 text-center">Formule</th>
                  <th className="py-3 px-3 text-right">Montant</th>
                  <th className="py-3 px-3 text-center">Réf. Stripe</th>
                  <th className="py-3 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUnlocks.map(unlock => {
                  const isVip = unlock.companies?.subscription_plan === 'premium_monthly' || unlock.companies?.subscription_plan === 'premium_plus_monthly';

                  return (
                    <tr key={unlock.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {unlock.created_at ? new Date(unlock.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '—'}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{unlock.companies?.name || 'Entreprise'}</span>
                          <span className="text-[10px] text-slate-600 font-normal">
                            ({unlock.companies?.country || 'FR'})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{unlock.candidates?.full_name || 'Chauffeur'}</span>
                          <span className="text-[10px] text-slate-600 font-normal">
                            - {unlock.candidates?.city || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isVip ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            Pro Illimité
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-[#FF7A00] border border-orange-200">
                            À l'acte
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                        {((unlock.amount_charged || 499) / 100).toFixed(2)} €
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[10px] text-slate-600">
                        {unlock.stripe_payment_intent_id ? unlock.stripe_payment_intent_id.slice(-8) : 'pi_auto'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Check className="h-2.5 w-2.5" /> Payé
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
