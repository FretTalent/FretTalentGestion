"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RefreshCw } from "lucide-react";

export default function AdminJobs() {
  const router = useRouter();
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") return router.push("/");

      const { data: jobs } = await supabase
        .from("jobs")
        .select("*, companies(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (jobs) setPendingJobs(jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateJob = async (jobId, newStatus) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;
      setPendingJobs(pendingJobs.filter((j) => j.id !== jobId));
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
    </div>
  );
}
