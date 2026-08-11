"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Search, Trash2, FileText, Download, X } from "lucide-react";

export default function AdminUsers() {
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocsUser, setSelectedDocsUser] = useState(null);

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
        .select(`
          id, 
          role, 
          created_at,
          candidates(full_name, documents),
          companies(name)
        `)
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

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de "${name}" ? Cette action est irréversible.`)) {
      return;
    }
    
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUsersList(usersList.filter((u) => u.id !== userId));
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDocument = async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from('candidate-documents')
        .createSignedUrl(path, 60);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la récupération du document.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Filtrage
  const filteredUsers = usersList.filter((usr) => {
    const term = searchTerm.toLowerCase();
    let name = "";
    if (usr.role === "candidate" && usr.candidates) name = usr.candidates.full_name || "";
    if (usr.role === "recruiter" && usr.companies) name = usr.companies.name || "";
    if (usr.role === "admin") name = "admin";
    
    return name.toLowerCase().includes(term) || usr.id.includes(term) || usr.role.includes(term);
  });

  // Groupement
  const groupedUsers = {
    recruiter: filteredUsers.filter((u) => u.role === "recruiter"),
    candidate: filteredUsers.filter((u) => u.role === "candidate"),
    admin: filteredUsers.filter((u) => u.role === "admin"),
  };

  const renderTable = (users, title) => {
    if (users.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-md font-bold text-slate-800 mb-4 px-2">{title} ({users.length})</h3>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Utilisateur</th>
                  <th className="p-4">Date d'inscription</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((usr) => {
                  let displayName = "Admin / Inconnu";
                  if (usr.role === "candidate" && usr.candidates) {
                    displayName = usr.candidates.full_name || "Candidat sans nom";
                  } else if (usr.role === "recruiter" && usr.companies) {
                    displayName = usr.companies.name;
                  }

                  return (
                    <tr key={usr.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-sm">{displayName}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{usr.id}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(usr.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {usr.role === "candidate" && usr.candidates?.documents && Object.keys(usr.candidates.documents).length > 0 && (
                          <button
                            onClick={() => setSelectedDocsUser(usr)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors inline-flex items-center gap-1"
                            title="Voir les documents"
                          >
                            <FileText className="w-3 h-3" /> Docs
                          </button>
                        )}
                        {usr.role !== "admin" && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleToggleRole(usr.id, usr.role)}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              Basculer
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleDeleteUser(usr.id, displayName)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                              title="Supprimer le compte"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Utilisateurs inscrits</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez les comptes et les accès à la plateforme.</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all"
            placeholder="Rechercher un nom, ID, rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <>
            {renderTable(groupedUsers.recruiter, "🏢 Entreprises")}
            {renderTable(groupedUsers.candidate, "🚛 Candidats")}
            {renderTable(groupedUsers.admin, "🛡️ Administrateurs")}
          </>
        )}
      </div>

      {/* Modal Documents Candidat */}
      {selectedDocsUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                Documents de {selectedDocsUser.candidates?.full_name}
              </h3>
              <button 
                onClick={() => setSelectedDocsUser(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(selectedDocsUser.candidates.documents).map(([key, doc]) => (
                <button
                  key={key}
                  onClick={() => handleDownloadDocument(doc.path)}
                  className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-orange-500 hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <div className="truncate">
                      <span className="text-sm font-bold text-slate-700 block truncate uppercase">{key}</span>
                      <span className="text-xs text-slate-400 block truncate">{doc.name}</span>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-slate-300 group-hover:text-orange-500 flex-shrink-0" />
                </button>
              ))}
            </div>
            
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDocsUser(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
