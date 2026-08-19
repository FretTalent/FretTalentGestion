'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Layers,
  MapPin,
  Mail,
  ShieldCheck,
  History,
  Play,
  Square,
  ChevronRight,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportHistoryItem {
  id: string;
  naf_code: string;
  imported_count: number;
  skipped_count: number;
  emails_found_count: number;
  errors_count: number;
  details: {
    page?: number;
    perPage?: number;
    totalResults?: number;
    department?: string;
    sampleImported?: string[];
    errors?: string[];
  };
  status: string;
  created_at: string;
}

const NAF_OPTIONS = [
  { code: '49.41A', label: '49.41A — Transports routiers de fret interurbains' },
  { code: '49.41B', label: '49.41B — Transports routiers de fret de proximité' },
  { code: '52.10A', label: '52.10A — Entreposage et stockage frigorifique' },
  { code: '52.29A', label: '52.29A — Messagerie, fret express' },
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
  const [selectedNafCodes, setSelectedNafCodes] = useState<string[]>([
    '49.41A',
    '49.41B',
    '52.29A',
  ]);
  const [department, setDepartment] = useState<string>('');
  const [perPage, setPerPage] = useState<number>(25);
  const [enrichEmails, setEnrichEmails] = useState<boolean>(true);

  // Stats & Historique
  const [totalInRegister, setTotalInRegister] = useState<number>(0);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // État de l'importation en cours
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [abortRequested, setAbortRequested] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sessionImported, setSessionImported] = useState<number>(0);
  const [sessionSkipped, setSessionSkipped] = useState<number>(0);
  const [sessionEmailsFound, setSessionEmailsFound] = useState<number>(0);
  const [sessionErrors, setSessionErrors] = useState<string[]>([]);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
  };

  const fetchHistoryAndStats = async () => {
    setLoadingHistory(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/entreprises/import', { headers });
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
        setTotalInRegister(data.totalCompaniesInRegister || 0);
      }
    } catch (err) {
      console.error('Erreur chargement historique import:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistoryAndStats();
    }
  }, [isOpen]);

  const toggleNaf = (code: string) => {
    if (selectedNafCodes.includes(code)) {
      if (selectedNafCodes.length > 1) {
        setSelectedNafCodes(selectedNafCodes.filter((c) => c !== code));
      } else {
        toast.error('Au moins un code NAF doit être sélectionné');
      }
    } else {
      setSelectedNafCodes([...selectedNafCodes, code]);
    }
  };

  // Lance l'import automatique par lot
  const handleStartImport = async () => {
    if (selectedNafCodes.length === 0) {
      toast.error('Veuillez sélectionner au moins un code NAF');
      return;
    }

    setIsRunning(true);
    setAbortRequested(false);
    setSessionImported(0);
    setSessionSkipped(0);
    setSessionEmailsFound(0);
    setSessionErrors([]);
    setCurrentPage(1);

    toast.loading('Démarrage de la synchronisation SIRENE...', { id: 'import-toast' });

    let page = 1;
    let hasMore = true;
    let totalImp = 0;
    let totalSkip = 0;
    let totalEmails = 0;
    const errorsAccumulator: string[] = [];

    while (hasMore && !abortRequested) {
      try {
        setCurrentPage(page);
        const headers = await getAuthHeaders();
        const res = await fetch('/api/admin/entreprises/import', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            nafCodes: selectedNafCodes,
            page,
            perPage,
            department: department.trim() || undefined,
            enrichEmails,
          }),
        });

        const rawText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          throw new Error(
            res.status === 504 || rawText.includes('timeout')
              ? 'Le traitement du lot a pris trop de temps (timeout serveur). Réduisez la taille du lot.'
              : `Erreur serveur (${res.status}): ${rawText.substring(0, 80)}`
          );
        }

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Erreur lors du traitement du lot');
        }

        totalImp += data.importedCount || 0;
        totalSkip += data.skippedCount || 0;
        totalEmails += data.emailsFoundCount || 0;
        setTotalAvailable(data.totalResults || 0);

        setSessionImported(totalImp);
        setSessionSkipped(totalSkip);
        setSessionEmailsFound(totalEmails);

        if (data.errors && data.errors.length > 0) {
          errorsAccumulator.push(...data.errors);
          setSessionErrors([...errorsAccumulator]);
        }

        toast.loading(
          `Lot ${page} traité : +${data.importedCount} importées (${totalImp} total)`,
          { id: 'import-toast' }
        );

        hasMore = data.hasMore && page < 20; // Limite de sécurité à 20 pages par exécution directe (1000 entreprises)
        page++;

        // Pause de 200ms entre les requêtes pour respecter les quotas API SIRENE
      } catch (err: any) {
        console.error(`Erreur sur le lot ${page}:`, err);
        const errMsg = err.message || 'Erreur réseau ou serveur';
        errorsAccumulator.push(`Lot ${page}: ${errMsg}`);
        setSessionErrors([...errorsAccumulator]);
        toast.error(`Erreur sur le lot ${page} : ${errMsg}`, { id: 'import-toast', duration: 6000 });
        break;
      }
    }

    setIsRunning(false);

    if (totalImp > 0) {
      toast.success(`🎉 +${totalImp} entreprises avec email valide importées dans le registre !`, { duration: 5000 });
    } else if (totalSkip > 0) {
      toast('Toutes les entreprises analysées sont déjà existantes ou sans email valide.', {
        icon: 'ℹ️',
        duration: 5000,
      });
    } else if (errorsAccumulator.length === 0) {
      toast.error('Aucune entreprise trouvée pour ces critères.');
    }

    fetchHistoryAndStats();
    if (onImportCompleted) {
      onImportCompleted();
    }
  };

  const handleStop = () => {
    setAbortRequested(true);
    toast.error('Arrêt de l’importation demandé...');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#FF7A00] text-[10px] font-black uppercase tracking-wider border border-orange-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                API SIRENE & Gouv.fr
              </span>
              <span className="text-xs text-slate-300 font-bold">
                • Registre Candidature Rapide (19,99 €)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#FF7A00]" />
              <span>Importateur Autonome d'Entreprises de Transport</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* CORPS DE LA MODALE SCROLLABLE */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          
          {/* BANDEAU SCORE TOTAL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
                  Total dans votre Registre
                </p>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {totalInRegister}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Importées cette session
                </p>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  +{sessionImported}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  Doublons ignorés (SIRET)
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

          {/* CONFIGURATION DE L'IMPORTATION */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-orange-500" />
              <span>1. Filtres & Codes NAF Transport Routier</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {NAF_OPTIONS.map((opt) => {
                const isSelected = selectedNafCodes.includes(opt.code);
                return (
                  <div
                    key={opt.code}
                    onClick={() => !isRunning && toggleNaf(opt.code)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isSelected ? '✓ Inclus' : '+ Ajouter'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Département (optionnel) :
                </label>
                <input
                  type="text"
                  placeholder="Ex : 75, 59, 13, 69..."
                  value={department}
                  disabled={isRunning}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Taille du lot par page :
                </label>
                <select
                  value={perPage}
                  disabled={isRunning}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                >
                  <option value={10}>10 entreprises / lot</option>
                  <option value={20}>20 entreprises / lot</option>
                  <option value={25}>25 entreprises / lot (Max officiel)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Enrichissement Email API :
                </label>
                <div
                  onClick={() => !isRunning && setEnrichEmails(!enrichEmails)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                    enrichEmails
                      ? 'bg-purple-50 border-purple-300 text-purple-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <span>Clearbit / Dropcontact</span>
                  <span className="text-[10px] font-black">{enrichEmails ? 'ACTIF' : 'DÉSACTIVÉ'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORIQUE ET LOGS D'IMPORTATION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>2. Historique des Synchronisations SIRENE</span>
              </h3>

              <button
                type="button"
                onClick={fetchHistoryAndStats}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingHistory ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white">
              {history.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  Aucun import précédent enregistré. Cliquez sur le bouton ci-dessous pour lancer votre première synchronisation !
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>NAF : {item.naf_code}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          +{item.imported_count} ajoutées
                        </span>
                        {item.skipped_count > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                            {item.skipped_count} ignorées
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleString('fr-FR')} • {item.details?.department || 'France entière'}
                      </p>
                    </div>

                    <div className="text-right font-mono text-[11px] font-bold text-slate-700">
                      {item.status === 'completed' ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Succès
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Erreur
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ERREURS ÉVENTUELLES SESSION EN COURS */}
          {sessionErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Erreurs rencontrées ({sessionErrors.length}) :</span>
              </p>
              <ul className="list-disc list-inside text-[11px] max-h-24 overflow-y-auto space-y-0.5 text-rose-700">
                {sessionErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            {isRunning ? (
              <span className="font-bold text-orange-600 flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Synchronisation lot {currentPage} en cours... (+{sessionImported} ajoutées)
              </span>
            ) : (
              <span>Le processus évite automatiquement les doublons grâce au numéro SIRET.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isRunning ? (
              <button
                type="button"
                onClick={handleStop}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Arrêter</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleStartImport}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white text-xs font-black shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Importer toutes les entreprises de France</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
