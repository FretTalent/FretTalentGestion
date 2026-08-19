'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Globe,
  Trash2,
  Play,
  Square,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransportImporterModal({
  isOpen,
  onClose,
  onImportCompleted,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted?: () => void;
}) {
  const [department, setDepartment] = useState<string>('02');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [abortRequested, setAbortRequested] = useState<boolean>(false);

  // Statistiques en direct de la session
  const [importedCompanies, setImportedCompanies] = useState<any[]>([]);
  const [sessionImported, setSessionImported] = useState<number>(0);
  const [sessionSkipped, setSessionSkipped] = useState<number>(0);
  const [totalDatabaseCount, setTotalDatabaseCount] = useState<number>(0);
  const [isPurging, setIsPurging] = useState<boolean>(false);

  // Charger le nombre d'entreprises actuel
  const fetchCurrentCount = async () => {
    try {
      const { count } = await supabase.from('entreprises').select('*', { count: 'exact', head: true });
      setTotalDatabaseCount(count || 0);
    } catch (err) {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentCount();
    }
  }, [isOpen]);

  const getAuthHeaders = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      Authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
    };
  };

  // Réinitialiser la base de données (Purge)
  const handlePurgeDatabase = async () => {
    if (!confirm('⚠️ Voulez-vous vraiment vider tout le registre des entreprises pour repartir à 0 ?')) {
      return;
    }
    setIsPurging(true);
    try {
      const { error } = await supabase.from('entreprises').delete().not('id', 'is', null);
      if (error) throw error;
      toast.success('Le registre a été entièrement vidé (0 entreprise)');
      setTotalDatabaseCount(0);
      setImportedCompanies([]);
      setSessionImported(0);
      setSessionSkipped(0);
      if (onImportCompleted) onImportCompleted();
    } catch (err: any) {
      toast.error('Erreur lors de la réinitialisation: ' + err.message);
    } finally {
      setIsPurging(false);
    }
  };

  // Lancer l'extraction directe du département
  const handleStartImport = async () => {
    setIsRunning(true);
    setAbortRequested(false);
    setImportedCompanies([]);
    setSessionImported(0);
    setSessionSkipped(0);

    const targetDeptLabel = department.trim() ? `du département ${department.trim()}` : 'de France entière';
    toast.loading(`Extraction des transporteurs ${targetDeptLabel}...`, { id: 'import-toast' });

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/entreprises/import', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          page: 1,
          perPage: 50,
          department: department.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur lors de l\'extraction');
      }

      const { importedCount, skippedCount, companies } = json.data;

      setSessionImported(importedCount);
      setSessionSkipped(skippedCount);
      setImportedCompanies(companies || []);
      await fetchCurrentCount();

      toast.success(`🎉 Extraction terminée : +${importedCount} transporteurs enregistrés avec leurs coordonnées complètes !`, { id: 'import-toast' });
      if (onImportCompleted) onImportCompleted();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'importation', { id: 'import-toast' });
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Robot d'Extraction Directe
              </span>
              <span className="text-xs text-slate-300 font-bold">
                • Registre Candidature Rapide (19,99 €)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#FF7A00]" />
              <span>Importateur Direct de Transporteurs Routiers</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* CONTENU MODAL SCROLLABLE */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* BANDEAU STATISTIQUES EN TEMPS RÉEL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total en base active
                </p>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {totalDatabaseCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Nouveaux importés
                </p>
                <p className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                  +{sessionImported}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  Doublons évités
                </p>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {sessionSkipped}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* PANNEAU DE CONFIGURATION ULTRA-SIMPLE */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF7A00]" />
                <span>Zone d'Extraction :</span>
              </label>

              {department && (
                <button
                  type="button"
                  onClick={() => setDepartment('')}
                  className="text-xs text-[#FF7A00] hover:underline font-bold"
                >
                  🇫🇷 Passer en France entière
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tapez un département (ex: 02, 01, 08, 59, 75...) ou laissez vide pour toute la France"
                  value={department}
                  disabled={isRunning}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00] text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* BOUTON LANCER L'EXTRACTION */}
              <button
                type="button"
                onClick={handleStartImport}
                disabled={isRunning}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-black text-sm shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extraction en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Lancer l'Extraction</span>
                  </>
                )}
              </button>
            </div>

            {/* SUGGESTIONS RAPIDES */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Accès rapide :</span>
              {['02', '01', '08', '59', '51', '60', '75', '69', '13', '31', '33'].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  disabled={isRunning}
                  onClick={() => setDepartment(dept)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    department === dept
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Dpt {dept}
                </button>
              ))}
            </div>
          </div>

          {/* LISTE DES TRANSPORTEURS TROUVÉS EN DIRECT */}
          {importedCompanies.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Transporteurs détectés et analysés ({importedCompanies.length})</span>
                <span className="text-emerald-600 font-bold text-[11px]">✓ Scoring MX, SIRENE & Web</span>
              </h3>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {importedCompanies.map((c, idx) => {
                  const isValidated = c.validationStatus === 'validated' || (c.score && c.score >= 70);
                  return (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="font-black text-slate-900 flex flex-wrap items-center gap-2">
                          <span>{c.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#FF7A00] font-bold text-[10px]">
                            {c.postalCode} {c.city}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                              isValidated
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            <span>{c.score || 0} pts</span>
                            <span>•</span>
                            <span>{isValidated ? 'Validé' : 'Revue Manuelle'}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium text-[11px]">
                          <span className="flex items-center gap-1 text-slate-800 font-bold">
                            <Mail className="w-3.5 h-3.5 text-emerald-600" />
                            {c.email}
                          </span>
                          {c.phone && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-blue-500" />
                              {c.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {c.site && (
                        <a
                          href={c.site}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF7A00] hover:underline self-start sm:self-center"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Site Web</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePurgeDatabase}
            disabled={isRunning || isPurging || totalDatabaseCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
            title="Supprime toutes les entreprises actuelles pour repartir de zéro"
          >
            <Trash2 className={`w-4 h-4 ${isPurging ? 'animate-spin' : ''}`} />
            <span>Vider tout le registre (Remise à 0)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
