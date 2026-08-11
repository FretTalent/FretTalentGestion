"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Send, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminMail() {
  const router = useRouter();
  
  const [target, setTarget] = useState("specific"); // 'all_candidates', 'all_companies', 'specific'
  const [specificEmails, setSpecificEmails] = useState("");
  
  const [type, setType] = useState("update"); // 'promo', 'update', 'custom'
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!window.confirm("Êtes-vous sûr de vouloir envoyer cet e-mail ?")) return;
    
    setLoading(true);
    setStatus(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        target,
        specificEmails,
        type,
        subject,
        title,
        message,
        ctaText,
        ctaLink
      };

      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: "success", message: data.message || "E-mail envoyé avec succès" });
        // Optionnel : réinitialiser le formulaire
        // setMessage("");
      } else {
        setStatus({ type: "error", message: data.error || "Erreur lors de l'envoi" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Envoi d'E-mails (Marketing)</h2>
        <p className="text-sm text-slate-500 mt-1">Créez et envoyez de belles campagnes d'e-mails à vos utilisateurs.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSend} className="p-6 md:p-8 space-y-8">
          
          {/* Section: Destinataires */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">1. Destinataires</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-colors ${target === 'all_candidates' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="target" value="all_candidates" checked={target === 'all_candidates'} onChange={() => setTarget("all_candidates")} className="text-orange-600 focus:ring-orange-500" />
                <span className="text-sm font-bold text-slate-700">Tous les Candidats</span>
              </label>
              
              <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-colors ${target === 'all_companies' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="target" value="all_companies" checked={target === 'all_companies'} onChange={() => setTarget("all_companies")} className="text-orange-600 focus:ring-orange-500" />
                <span className="text-sm font-bold text-slate-700">Toutes les Entreprises</span>
              </label>
              
              <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-colors ${target === 'specific' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="target" value="specific" checked={target === 'specific'} onChange={() => setTarget("specific")} className="text-orange-600 focus:ring-orange-500" />
                <span className="text-sm font-bold text-slate-700">Spécifique</span>
              </label>
            </div>
            
            {target === 'specific' && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">Adresses e-mail (séparées par des virgules)</label>
                <input 
                  type="text" 
                  value={specificEmails} 
                  onChange={(e) => setSpecificEmails(e.target.value)}
                  placeholder="exemple1@mail.com, exemple2@mail.com"
                  required={target === 'specific'}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          {/* Section: Modèle et Contenu */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">2. Modèle et Contenu</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Type de modèle</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="update">🚀 Mise à jour / Nouveauté</option>
                    <option value="promo">🎉 Promotion / Offre spéciale</option>
                    <option value="custom">📝 Message classique (Neutre)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Objet de l'e-mail (Sujet)</label>
                  <input 
                    type="text" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Découvrez notre nouvelle fonctionnalité..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Titre dans l'e-mail (H1)</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Grosse nouveauté sur FretTalent !"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Texte du bouton (optionnel)</label>
                    <input 
                      type="text" 
                      value={ctaText} 
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="En savoir plus"
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Lien du bouton (URL)</label>
                    <input 
                      type="url" 
                      value={ctaLink} 
                      onChange={(e) => setCtaLink(e.target.value)}
                      placeholder="https://frettalent.fr/..."
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Message principal</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={13}
                  placeholder="Rédigez votre message ici. Les retours à la ligne seront conservés."
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Status and Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex-1">
              {status && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {status.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "Envoi en cours..." : "Envoyer la campagne"}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
