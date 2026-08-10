"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Truck, Users, Key, BarChart3, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  // Onglet courant : "users" ou "jobs"
  const [activeTab, setActiveTab] = useState("users");

  // KPIs
  const [stats, setStats] = useState({
    candidatesCount: 0,
    companiesCount: 0,
    unlocksCount: 0,
    totalRevenue: 0,
  });

  // Utilisateurs à modérer
  const [usersList, setUsersList] = useState([]);

  // Offres d'emploi en attente
  const [pendingJobs, setPendingJobs] = useState([]);

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

      // Récupérer les offres d'emploi en attente de modération
      const { data: jobs } = await supabase
        .from("jobs")
        .select("*, companies(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (jobs) {
        setPendingJobs(jobs);
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

  // Valider (Approuver) ou Rejeter une offre d'emploi
  const handleModerateJob = async (jobId, newStatus) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      // Mettre à jour l'état local
      setPendingJobs(pendingJobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
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
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-sans tracking-tight">Console d'Administration</h1>
          <p className="text-sm text-slate-500">Supervisez l'activité globale de FretTalent en temps réel.</p>
        </div>
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

        {/* Onglets interactifs */}
        <div className="flex border-b border-slate-200 gap-6">
          <button 
            onClick={() => setActiveTab("users")}
            className={`pb-4 px-1 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "users" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            👥 Comptes Utilisateurs
          </button>
          <button 
            onClick={() => setActiveTab("jobs")}
            className={`pb-4 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "jobs" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            💼 Modération Annonces ({pendingJobs.length})
          </button>
        </div>

        {activeTab === "users" ? (
          /* Table de modération utilisateurs */
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
                            ? "bg-blue-100 text-blue-700" 
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
        ) : (
          /* Table de modération des jobs */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Offres en attente de modération</h2>
              <p className="text-xs text-slate-500 mt-1">Validez ou rejetez les annonces saisies par les entreprises.</p>
            </div>

            {pendingJobs.length === 0 ? (
              <p className="text-slate-400 text-sm p-12 text-center">Aucune offre d'emploi n'est en attente de modération.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingJobs.map((job) => (
                  <div key={job.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700">
                          {job.contract_type}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                        <p className="text-xs font-semibold text-slate-500">Entreprise : {job.companies?.name || "Inconnue"}</p>
                      </div>
                      <div className="text-xs text-slate-500">
                        📍 Localisation : {job.location} {job.salary && ` | 💶 Salaire : ${job.salary}`}
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 max-w-4xl">{job.description}</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleModerateJob(job.id, "approved")}
                        disabled={actionLoading}
                        className="w-1/2 md:w-auto inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors gap-1"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleModerateJob(job.id, "rejected")}
                        disabled={actionLoading}
                        className="w-1/2 md:w-auto inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors gap-1"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
