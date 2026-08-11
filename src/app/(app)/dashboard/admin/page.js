'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Truck, Users, Key, BarChart3, RefreshCw, FileText } from 'lucide-react';

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
      // Vérification directe du nombre de candidats
      // Vérification directe des candidats
      const { data: candidates, error: candError } = await supabase
        .from('candidates')
        .select('*');

      const candCount = candidates ? candidates.length : 0;

      if (candError) {
        console.error('Erreur lors de la récupération des candidats:', candError);
      } else {
        console.log('Candidats trouvés dans le dashboard:', candCount);
        if (candCount > 0) {
          console.log('Exemple de candidat:', candidates[0]);
        }
      }
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
        candidatesCount: candCount,
        companiesCount: compCount || 0,
        unlocksCount: uCount,
        totalRevenue: totalRev,
      });

      console.log('KPIs:', { candidatesCount: candCount, companiesCount: compCount });
      console.log('Exemple de candidat:', candidates?.[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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
          <button
            onClick={() => router.push('/dashboard/admin/candidates')}
            className="text-sm text-orange-500 hover:underline mt-2"
          >
            Voir les détails
          </button>
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

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
                      onClick={() => router.push('/dashboard/admin/candidates')}
                      className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Gérer les candidats</span>
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/admin/companies')}
                      className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Users className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Gérer les entreprises</span>
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/admin/users')}
                      className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Users className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Gérer les utilisateurs</span>
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/admin/jobs')}
                      className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <BarChart3 className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Gérer les offres</span>
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/admin/mail')}
                      className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Key className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Gérer les mails</span>
                    </button>
        </div>
      </div>
    </div>
  );
}
