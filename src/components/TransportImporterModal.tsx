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

const FRENCH_DEPARTMENTS = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '23', '24', '25', '26', '27', '28', '29',
  '2A', '2B', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '90', '91', '92', '93', '94', '95'
];

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
  const [currentScanDept, setCurrentScanDept] = useState<string>('');
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);
  const [scanTotalSteps, setScanTotalSteps] = useState<number>(0);
  const abortRef = React.useRef<boolean>(false);

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

  // Interrompre le scan
  const handleStopImport = () => {
    abortRef.current = true;
    toast.error('Interruption demandée... Arrêt du scan après ce département.', { id: 'import-toast' });
  };

  // Lancer l'extraction séquentielle département par département
  const handleStartImport = async (forceNational: boolean = false) => {
    setIsRunning(true);
    abortRef.current = false;
    setImportedCompanies([]);
    setSessionImported(0);
    setSessionSkipped(0);

    const targetDeptInput = department.trim();
    const deptsToScan = forceNational || !targetDeptInput
      ? FRENCH_DEPARTMENTS
      : [targetDeptInput];

    setScanTotalSteps(deptsToScan.length);
    setScanStepIndex(0);

    let totalNewAdded = 0;
    let totalDuplicatesSkipped = 0;

    try {
      const headers = await getAuthHeaders();

      for (let i = 0; i < deptsToScan.length; i++) {
        if (abortRef.current) {
          toast.error(`⛔ Scan interrompu à l'étape ${i}/${deptsToScan.length}.`, { id: 'import-toast' });
          break;
        }

        const deptCode = deptsToScan[i];
        setCurrentScanDept(deptCode);
        setScanStepIndex(i + 1);

        const statusMsg = deptsToScan.length > 1
          ? `🤖 Extraction Dpt ${deptCode} (${i + 1}/${deptsToScan.length})...`
          : `Extraction des transporteurs du département ${deptCode}...`;

        toast.loading(statusMsg, { id: 'import-toast' });

        const res = await fetch('/api/admin/entreprises/import', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            page: 1,
            perPage: 50,
            department: deptCode,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success && json.data) {
          const { importedCount, skippedCount, companies } = json.data;

          totalNewAdded += importedCount || 0;
          totalDuplicatesSkipped += skippedCount || 0;

          setSessionImported(totalNewAdded);
          setSessionSkipped(totalDuplicatesSkipped);

          if (companies && companies.length > 0) {
            setImportedCompanies(prev => {
              const existingEmails = new Set(prev.map(c => c.email.toLowerCase()));
              const newUniques = companies.filter((c: any) => !existingEmails.has(c.email.toLowerCase()));
              return [...newUniques, ...prev];
            });
          }
          await fetchCurrentCount();
        }
      }

      if (!abortRef.current) {
        if (deptsToScan.length > 1) {
          toast.success(`🎉 Scan national terminé ! +${totalNewAdded} nouveaux transporteurs enregistrés (${totalDuplicatesSkipped} doublons évités).`, { id: 'import-toast', duration: 6000 });
        } else if (totalNewAdded > 0) {
          toast.success(`🎉 Extraction terminée : +${totalNewAdded} transporteurs enregistrés ! (${totalDuplicatesSkipped} déjà en base)`, { id: 'import-toast' });
        } else if (totalDuplicatesSkipped > 0) {
          toast.success(`ℹ️ ${totalDuplicatesSkipped} transporteurs analysés pour le dpt ${deptsToScan[0]} : ils sont déjà tous enregistrés dans votre registre.`, { id: 'import-toast', duration: 5000 });
        } else {
          toast.error(`Aucun transporteur trouvé pour le département ${deptsToScan[0]}`, { id: 'import-toast' });
        }
      }

      if (onImportCompleted) onImportCompleted();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'importation', { id: 'import-toast' });
    } finally {
      setIsRunning(false);
      setCurrentScanDept('');
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

          {/* PANNEAU DE CONFIGURATION & SCAN NATIONALE SÉQUENTIEL */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF7A00]" />
                <span>Mode d'Extraction :</span>
              </label>

              {department && (
                <button
                  type="button"
                  onClick={() => setDepartment('')}
                  className="text-xs text-[#FF7A00] hover:underline font-bold cursor-pointer"
                >
                  🇫🇷 Passer en mode Scan National (01 → 95)
                </button>
              )}
            </div>

            {/* BARRE DE PROGRESSION EN DIRECT */}
            {isRunning && scanTotalSteps > 1 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-[#FF7A00] animate-spin" />
                    <span>Scan National en cours : Dpt {currentScanDept} ({scanStepIndex}/{scanTotalSteps})</span>
                  </span>
                  <span className="text-[#FF7A00] font-mono">{Math.round((scanStepIndex / scanTotalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#FF7A00] to-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.round((scanStepIndex / scanTotalSteps) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Département spécifique (ex: 02, 01, 08, 59, 75...) ou vide pour Scan National"
                  value={department}
                  disabled={isRunning}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00] text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {isRunning ? (
                <button
                  type="button"
                  onClick={handleStopImport}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Interrompre le Scan</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartImport(false)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-black text-sm shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{department.trim() ? `Extraire Dpt ${department.trim()}` : 'Lancer l\'Extraction'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartImport(true)}
                    className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Scan National (01 → 95)</span>
                  </button>
                </div>
              )}
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
