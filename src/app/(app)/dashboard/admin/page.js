'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Truck, Users, Key, BarChart3, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  // KPIs
  const [stats, setStats] = useState({
    candidatesCount: 0,
    companiesCount: 0,
    unlocksCount: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Valider le rôle admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      // Charger les métriques KPIs
      const { count: candCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });
      const { count: compCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      const { data: unlocks } = await supabase
        .from('unlocks')
        .select('amount_charged');

      const uCount = unlocks ? unlocks.length : 0;
      const totalRev = unlocks
        ? unlocks.reduce((acc, curr) => acc + curr.amount_charged, 0) / 100
        : 0;

      setStats({
        candidatesCount: candCount || 0,
        companiesCount: compCount || 0,
        unlocksCount: uCount,
        totalRevenue: totalRev,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">
            Chauffeurs Inscrits
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {stats.candidatesCount}
            <Truck className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">
            Entreprises Actives
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {stats.companiesCount}
            <Users className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">
            Déblocages Effectués
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {stats.unlocksCount}
            <Key className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">
            Chiffre d'Affaires
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
            {stats.totalRevenue} €
            <BarChart3 className="h-6 w-6 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
