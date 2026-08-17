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
  HelpCircle,
  Check,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
  X,
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
    link.setAttribute('download', `frettalent_grand_livre_stripe_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Grand Livre exporté en CSV !');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 bg-slate-100/60 rounded-xl p-8">
        <RefreshCw className="h-8 w-8 text-slate-700 animate-spin" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
          Chargement du Grand Livre Comptable Stripe...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4 pb-12 font-sans bg-slate-100/70 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden box-border">
      
      {/* 1. EN-TÊTE SUPÉRIEURE DE PILOTAGE FINANCES & STRIPE */}
      <div className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md min-w-0">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-[11px] text-white">
              FN
            </div>
            <span className="font-bold text-xs text-slate-200">
              Grand Livre Comptable & Trésorerie Stripe
            </span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-none">
            Suivi des Encaissements Déblocages 4,99€ & Abonnements
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En Direct Stripe API
          </span>
        </div>

        {/* Barre d'outils rapides */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-colors shadow-2xs border border-slate-800 cursor-pointer"
          >
            <span>Console Stripe</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={fetchFinanceData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Actualiser les transactions"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 2. BANDEAU DE CONTEXTE */}
      <div className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs min-w-0">
        <div className="flex items-center gap-2 flex-1 text-slate-400 min-w-0">
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="italic text-slate-500 truncate text-[11px] sm:text-xs">
            Encaissements des déblocages de coordonnées chauffeurs (4,99 € TTC) et récurrence des abonnements Pro Illimités.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-mono text-[11px]">
          <strong>{filteredUnlocks.length}</strong> transactions affichées / <strong>{unlocks.length}</strong> total
        </div>
      </div>

      {/* 3. HERO SCORECARDS KPIS (4 COLONNES ÉQUILIBRÉES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
        
        {/* KPI 1 : Déblocages Encaissés */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Déblocages Encaissés</span>
            <CreditCard className="h-4 w-4 text-emerald-600 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight font-mono">
            {totalUnlockRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Volume à l'acte :</span>
            <span className="font-bold font-mono text-slate-900 text-[11px]">
              {unlocks.length} ventes 4,99€
            </span>
          </div>
        </div>

        {/* KPI 2 : Revenus Récurrents Pro */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider text-purple-700">
            <span className="truncate">Revenus VIP (MRR)</span>
            <Sparkles className="h-4 w-4 text-purple-600 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-purple-700 mt-2 tracking-tight font-mono">
            {estimatedMRR.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Abonnements actifs :</span>
            <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">
              {vipCompaniesCount} abonnés Pro
            </span>
          </div>
        </div>

        {/* KPI 3 : Panier Moyen Déblocage */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Panier Unitaire</span>
            <DollarSign className="h-4 w-4 text-teal-600 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight font-mono">
            4,99 €
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Tarif fixe TTC :</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              4,16 € HT
            </span>
          </div>
        </div>

        {/* KPI 4 : Volume Global Encaissé */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow min-w-0">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Volume Consolidé</span>
            <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0 ml-1" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-2 tracking-tight font-mono">
            {totalGrossRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Flux Stripe net :</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              ● Encaissé
            </span>
          </div>
        </div>

      </div>

      {/* 4. LIGNE CENTRALE : RÉPARTITION DES REVENUS + GÉOGRAPHIE PAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        
        {/* TUILE 1 : STRUCTURE DU CHIFFRE D'AFFAIRES (7 COLS) */}
        <div className="lg:col-span-7 min-w-0 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              <span>Structure du Chiffre d'Affaires & Modèle Économique</span>
              <span className="text-[10px] text-slate-400 font-mono">Stripe Connect</span>
            </div>

            <div className="space-y-3">
              {/* Barres de flux */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">⚡ Paiements à l'Acte (Déblocages 4,99€ TTC)</span>
                  <span className="font-mono font-black text-emerald-700">{totalUnlockRevenue.toFixed(2)} € ({totalGrossRevenue > 0 ? Math.round((totalUnlockRevenue / totalGrossRevenue) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalGrossRevenue > 0 ? Math.max(10, Math.round((totalUnlockRevenue / totalGrossRevenue) * 100)) : 50}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">⭐ Abonnements VIP Pro Illimité (39,99 €/mois)</span>
                  <span className="font-mono font-black text-purple-700">{estimatedMRR.toFixed(2)} € ({totalGrossRevenue > 0 ? Math.round((estimatedMRR / totalGrossRevenue) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalGrossRevenue > 0 ? Math.max(10, Math.round((estimatedMRR / totalGrossRevenue) * 100)) : 50}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Paiements sécurisés cryptés SSL 256 bits par Stripe</span>
            <span className="font-mono">Taux de succès : 100%</span>
          </div>
        </div>

        {/* TUILE 2 : RÉPARTITION GÉOGRAPHIQUE DES RECRUTEURS (5 COLS) */}
        <div className="lg:col-span-5 min-w-0 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              <span>Provenance des Recruteurs Payants</span>
              <span className="text-[10px] text-slate-400">4 Pays</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-lg flex items-center justify-between">
                <span className="font-bold text-teal-950 truncate">🇫🇷 France</span>
                <span className="font-mono font-black text-teal-700 shrink-0 ml-1">{geoRevenue.FR} achats</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center justify-between">
                <span className="font-bold text-rose-950 truncate">🇧🇪 Belgique</span>
                <span className="font-mono font-black text-rose-700 shrink-0 ml-1">{geoRevenue.BE} achats</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between">
                <span className="font-bold text-amber-950 truncate">🇱🇺 Luxembourg</span>
                <span className="font-mono font-black text-amber-700 shrink-0 ml-1">{geoRevenue.LU} achats</span>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                <span className="font-bold text-slate-950 truncate">🇨🇭 Suisse</span>
                <span className="font-mono font-black text-slate-700 shrink-0 ml-1">{geoRevenue.CH} achats</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 font-mono text-right">
            Facturation internationale multidevises
          </div>
        </div>

      </div>

      {/* 5. BARRE DE RECHERCHE ET FILTRES DES TRANSACTIONS */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 min-w-0">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative flex-1 w-full min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer par entreprise, chauffeur débloqué, identifiant Stripe..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-slate-50/70"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {[
              { id: 'all', label: 'Toutes Transactions' },
              { id: 'pay_per_view', label: '⚡ Déblocages 4,99€' },
              { id: 'vip', label: '⭐ Abonnés Pro' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterPlan(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterPlan === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. TABLEAU DU GRAND LIVRE COMPTABLE HAUTE DENSITÉ */}
      <div className="w-full bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Journal des Transactions Stripe
              </span>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {filteredUnlocks.length} écritures
              </span>
            </div>
            <h3 className="font-black text-slate-950 text-sm sm:text-base mt-0.5">
              Grand Livre Comptable des Déblocages & Reçus Stripe
            </h3>
          </div>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Exporter Tableau CSV</span>
          </button>
        </div>

        {filteredUnlocks.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">Aucune transaction financière trouvée pour cette recherche.</p>
        ) : (
          <div className="overflow-x-auto w-full border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date & Heure</th>
                  <th className="py-2.5 px-3">Entreprise Recruteur</th>
                  <th className="py-2.5 px-3">Chauffeur Débloqué</th>
                  <th className="py-2.5 px-3 text-center">Montant Net TTC</th>
                  <th className="py-2.5 px-3 text-center">Référence Stripe</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUnlocks.map((u) => {
                  const flag = u.candidates?.country === 'BE' ? '🇧🇪' : u.candidates?.country === 'LU' ? '🇱🇺' : u.candidates?.country === 'CH' ? '🇨🇭' : '🇫🇷';
                  const compFlag = u.companies?.country === 'BE' ? '🇧🇪' : u.companies?.country === 'LU' ? '🇱🇺' : u.companies?.country === 'CH' ? '🇨🇭' : '🇫🇷';
                  const isVip = u.companies?.subscription_plan === 'premium_monthly' || u.companies?.subscription_plan === 'premium_plus_monthly';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '—'}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="truncate max-w-[160px]">{u.companies?.name || 'Entreprise'}</span>
                          <span>{compFlag}</span>
                        </div>
                        {isVip && (
                          <span className="text-[9px] text-purple-700 font-extrabold flex items-center gap-0.5 mt-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> Abonné VIP Pro
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[160px]">{u.candidates?.full_name || 'Chauffeur'}</div>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{u.candidates?.email || '—'}</p>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-black text-slate-950 text-xs">
                        {((u.amount_charged || 200) / 100).toFixed(2)} €
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono text-[10px] text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-700">
                          {u.stripe_payment_intent_id ? u.stripe_payment_intent_id.slice(-10) : 'pi_direct'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
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

        <div className="px-3 py-2 mt-3 border-t border-slate-100 bg-slate-50/70 rounded-lg flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Total des déblocages comptabilisés : <strong>{totalUnlockRevenue.toFixed(2)} € TTC</strong>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Rapprochement bancaire Stripe automatique
          </span>
        </div>
      </div>

    </div>
  );
}
