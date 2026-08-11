"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RefreshCw } from "lucide-react";

export default function AdminUsers() {
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, role, created_at")
        .order("created_at", { ascending: false });

      if (profiles) setUsersList(profiles);
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
      setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
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
    </div>
  );
}
