"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Truck, Users, Key, BarChart3, RefreshCw, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
  const router = useRouter();

  // KPIs
  const [stats, setStats] = useState({
    candidatesCount: 0,
    companiesCount: 0,
    unlocksCount: 0,
    totalRevenue: 0,
  });

  // Utilisateurs à modérer
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/login");
        return;
      }

      // Valider le rôle admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      // Charger les métriques KPIs
      const { count: candCount } = await supabase.from("candidates").select("*", { count: "exact", head: true });
      const { count: compCount } = await supabase.from("companies").select("*", { count: "exact", head: true });
      const { data: unlocks } = await supabase.from("unlocks").select("amount_charged");
      
      const uCount = unlocks ? unlocks.length : 0;
      const totalRev = unlocks ? unlocks.reduce((acc, curr) => acc + curr.amount_charged, 0) / 100 : 0;

      setStats({
        candidatesCount: candCount || 0,
        companiesCount: compCount || 0,
        unlocksCount: uCount,
        totalRevenue: totalRev,
      });

      // Récupérer la liste des profils utilisateur
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, role, created_at")
        .order("created_at", { ascending: false });

      if (profiles) {
        setUsersList(profiles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    setActionLoading(true);
    const newRole = currentRole === "candidate" ? "recruiter" : "candidate";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      
      if (error) throw error;
      
      setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-sans tracking-tight">Console d'Administration</h1>
            <p className="text-sm text-slate-500">Supervisez l'activité globale de FretTalent en temps réel.</p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase">Chauffeurs Inscrits</div>
            <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
              {stats.candidatesCount}
              <Truck className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase">Entreprises Actives</div>
            <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
              {stats.companiesCount}
              <Users className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase">Déblocages Effectués</div>
            <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
              {stats.unlocksCount}
              <Key className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase">Chiffre d'Affaires</div>
            <div className="text-3xl font-black text-slate-950 flex items-center justify-between">
              {stats.totalRevenue} €
              <BarChart3 className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Table de modération utilisateurs */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Utilisateurs inscrits</h2>
            <p className="text-xs text-slate-500 mt-1">Liste brute des comptes et rôle associé dans la base de données.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">UUID Utilisateur</th>
                  <th className="p-4">Rôle</th>
                  <th className="p-4">Date d'inscription</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-xs text-slate-600">{usr.id}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        usr.role === "admin" 
                          ? "bg-purple-100 text-purple-700" 
                          : usr.role === "recruiter" 
                          ? "bg-blue-100 text-blue-755" 
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {new Date(usr.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4 text-right">
                      {usr.role !== "admin" && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleRole(usr.id, usr.role)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          Changer le rôle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
