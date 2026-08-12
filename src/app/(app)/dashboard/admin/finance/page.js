'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function AdminFinance() {
  const router = useRouter();
  const [unlocks, setUnlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

      // Fetch all unlocks
      const { data, error } = await supabase
        .from('unlocks')
        .select(`
          id,
          amount_charged,
          created_at,
          stripe_payment_intent_id,
          companies ( name, siret, bce ),
          candidates ( full_name, email, city )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur unlocks:', error);
      }
      setUnlocks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const totalRevenue = unlocks.reduce((sum, item) => sum + (item.amount_charged || 0), 0) / 100;
  const totalUnlocksCount = unlocks.length;

  const filteredUnlocks = unlocks.filter((u) => {
    const companyName = u.companies?.name?.toLowerCase() || '';
    const candidateName = u.candidates?.full_name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return companyName.includes(search) || candidateName.includes(search);
  });

  const exportToCSV = () => {
    if (filteredUnlocks.length === 0) return;
    const headers = ['ID Transaction', 'Date', 'Entreprise Recruteur', 'Candidat Débloqué', 'Montant TTC', 'Stripe Payment Intent'];
    const rows = filteredUnlocks.map(u => [
      u.id,
      u.created_at ? new Date(u.created_at).toLocaleString('fr-FR') : '',
      `"${u.companies?.name || ''}"`,
      `"${u.candidates?.full_name || ''}"`,
      `${((u.amount_charged || 0) / 100).toFixed(2)} €`,
      u.stripe_payment_intent_id || '—'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finance-frettalent-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Chargement des données financières...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Finances & Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Suivi des déblocages et abonnements Stripe</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Exporter (CSV)
          </button>
          <button
            onClick={fetchFinanceData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires Total</div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {totalRevenue.toFixed(2)} €
            <div className="bg-orange-50 p-2.5 rounded-2xl">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium">Paiements sécurisés Stripe</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Déblocages Ventes</div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {totalUnlocksCount}
            <div className="bg-blue-50 p-2.5 rounded-2xl">
              <CreditCard className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Mise en relation directe 2,00 €</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Panier Moyen</div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {totalUnlocksCount > 0 ? (totalRevenue / totalUnlocksCount).toFixed(2) : '0.00'} €
            <div className="bg-emerald-50 p-2.5 rounded-2xl">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Revenu moyen par transaction</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par entreprise ou candidat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-slate-50"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Historique des Transactions ({filteredUnlocks.length})</h2>
        </div>
        {filteredUnlocks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Aucune transaction trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Entreprise Recruteur</th>
                  <th className="py-3.5 px-4">Candidat Débloqué</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnlocks.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {u.created_at ? new Date(u.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-orange-500" />
                        {u.companies?.name || 'Entreprise inconnue'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        {u.candidates?.full_name || 'Candidat inconnu'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-950">
                      {((u.amount_charged || 0) / 100).toFixed(2)} €
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Payé Stripe
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
