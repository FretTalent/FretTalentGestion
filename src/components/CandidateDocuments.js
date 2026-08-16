'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  File,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const LEGACY_LABELS = {
  permis: 'Permis de conduire (Ancien dépôt)',
  chrono: 'Carte Chronotachygraphe (Ancien dépôt)',
  fimo: 'FIMO / FCO (Ancien dépôt)',
  adr: 'Carte ADR (Ancien dépôt)',
};

const DOCUMENT_TYPES = [
  { key: 'cv', label: 'CV', required: true },
  { key: 'permis_recto', label: 'Permis de conduire (Recto)', required: true },
  { key: 'permis_verso', label: 'Permis de conduire (Verso)', required: true },
  { key: 'chrono_recto', label: 'Carte Chronotachygraphe (Recto)', required: true },
  { key: 'chrono_verso', label: 'Carte Chronotachygraphe (Verso)', required: true },
  { key: 'fimo_recto', label: 'FIMO / FCO (Recto)', required: true },
  { key: 'fimo_verso', label: 'FIMO / FCO (Verso)', required: true },
  { key: 'adr_recto', label: 'Carte ADR (Recto)', required: false },
  { key: 'adr_verso', label: 'Carte ADR (Verso)', required: false },
  { key: 'formation', label: 'Attestation de formation', required: false },
  { key: 'autre', label: 'Autre document utile', required: false },
];

export default function CandidateDocuments({
  candidateId,
  documents = {},
  onUpdate,
}) {
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    docType: null,
  });

  const handleUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation taille (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`Le fichier ${file.name} dépasse la limite de 10 Mo.`);
      return;
    }

    setUploading(docType.key);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${docType.key}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${candidateId}/${fileName}`;

      // Upload dans le storage
      const { error: uploadError } = await supabase.storage
        .from('candidate-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique ou simplement stocker le chemin
      // Puisque le bucket est privé, on stocke juste le chemin du fichier.
      const newDocuments = {
        ...documents,
        [docType.key]: {
          path: filePath,
          name: file.name,
          uploaded_at: new Date().toISOString(),
        },
      };

      // Mettre à jour la table candidates
      const { error: dbError } = await supabase
        .from('candidates')
        .update({ documents: newDocuments })
        .eq('id', candidateId);

      if (dbError) throw dbError;

      onUpdate(newDocuments); // Mettre à jour l'état parent

      // Notification Telegram Admin UNIQUEMENT quand le dossier est 100% complet
      try {
        const isDocPresent = (k, legacyK) => !!newDocuments[k] || (legacyK && !!newDocuments[legacyK]);
        const requiredDocs = [
          isDocPresent('cv'),
          isDocPresent('permis_recto', 'permis'),
          isDocPresent('permis_verso', 'permis'),
          isDocPresent('chrono_recto', 'chrono'),
          isDocPresent('chrono_verso', 'chrono'),
          isDocPresent('fimo_recto', 'fimo'),
          isDocPresent('fimo_verso', 'fimo'),
        ];
        const uploadedCount = requiredDocs.filter(Boolean).length;
        const isComplete = uploadedCount === 7;

        // On ne notifie Telegram QUE si le dossier vient d'atteindre 100% de complétion
        if (isComplete) {
          const { data: candInfo } = await supabase
            .from('candidates')
            .select('full_name, city, country')
            .eq('id', candidateId)
            .maybeSingle();

          fetch('/api/notify/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'documents_uploaded',
              data: {
                candidateName: candInfo?.full_name || 'Candidat',
                candidateId: candidateId,
                city: candInfo?.city || '—',
                country: candInfo?.country || 'FR',
                uploadedCount: 7,
                totalRequired: 7,
                isComplete: true,
                docLabel: docType.label,
              },
            }),
          }).catch(err => console.error('Telegram notification error:', err));
        }
      } catch (notifErr) {
        console.error('Erreur préparation notification telegram:', notifErr);
      }
    } catch (err) {
      console.error(err);
      setError(`Erreur lors de l'upload de ${docType.label}: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  const requestDelete = docType => {
    setConfirmModal({ isOpen: true, docType });
  };

  const executeDelete = async () => {
    const docType = confirmModal.docType;
    setConfirmModal({ isOpen: false, docType: null });

    if (!docType) return;

    setUploading(docType.key);
    setError(null);

    try {
      const doc = documents[docType.key];
      if (doc && doc.path) {
        // Supprimer du storage
        await supabase.storage.from('candidate-documents').remove([doc.path]);
      }

      // Mettre à jour la BD
      const newDocuments = { ...documents };
      delete newDocuments[docType.key];

      const { error: dbError } = await supabase
        .from('candidates')
        .update({ documents: newDocuments })
        .eq('id', candidateId);

      if (dbError) throw dbError;

      onUpdate(newDocuments);
      toast.success(`${docType.label} supprimé avec succès`);
    } catch (err) {
      console.error(err);
      toast.error(`Erreur lors de la suppression de ${docType.label}`);
    } finally {
      setUploading(null);
    }
  };

  // Helper pour télécharger le document (génère une URL signée courte durée)
  const handleDownload = async (path, name) => {
    try {
      const { data, error } = await supabase.storage
        .from('candidate-documents')
        .createSignedUrl(path, 60); // valide 60 secondes

      if (error) throw error;

      // Ouvrir le document dans un nouvel onglet
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'ouvrir le document.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-500" /> Documents
          justificatifs
        </h2>
      </div>

      <p className="text-sm text-slate-500">
        Ces documents sont{' '}
        <strong className="text-orange-500">obligatoires</strong> pour la
        validation de votre profil par nos équipes. Une fois validés, ils ne
        seront accessibles qu'aux entreprises qui auront explicitement débloqué
        votre profil. Format PDF ou Image, max 10 Mo.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Prise en compte rétrocompatible des anciens fichiers s'ils existent */}
        {Object.keys(documents).map(key => {
          if (DOCUMENT_TYPES.some(d => d.key === key)) return null; // déjà géré
          const docData = documents[key];
          const label = LEGACY_LABELS[key] || `Document (${key})`;
          const isProcessing = uploading === key;

          return (
            <div
              key={key}
              className="p-4 rounded-2xl border border-green-200 bg-green-50/30 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-100 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{label}</h3>
                  <p className="text-xs text-slate-500">
                    <span className="text-green-600 font-medium">
                      Document transmis (
                      {new Date(docData.uploaded_at).toLocaleDateString()})
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isProcessing ? (
                  <div className="px-4 py-2 flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Traitement...
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleDownload(docData.path, docData.name)}
                      type="button"
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-orange-500 hover:border-orange-500 rounded-lg text-xs font-bold transition-colors"
                    >
                      Voir le fichier
                    </button>
                    <button
                      onClick={() => requestDelete({ key, label })}
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {DOCUMENT_TYPES.map(docType => {
          const isUploaded = !!documents?.[docType.key];
          const docData = documents?.[docType.key];
          const isProcessing = uploading === docType.key;

          return (
            <div
              key={docType.key}
              className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${isUploaded ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}
                >
                  {isUploaded ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <File className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {docType.label}
                    {docType.required && (
                      <span className="text-orange-500 ml-1">*</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUploaded ? (
                      <span className="text-green-600 font-medium">
                        Document transmis (
                        {new Date(docData.uploaded_at).toLocaleDateString()})
                      </span>
                    ) : docType.required ? (
                      'Document obligatoire requis'
                    ) : (
                      'Document optionnel'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isProcessing ? (
                  <div className="px-4 py-2 flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Traitement...
                  </div>
                ) : isUploaded ? (
                  <>
                    <button
                      onClick={() => handleDownload(docData.path, docData.name)}
                      type="button"
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-orange-500 hover:border-orange-500 rounded-lg text-xs font-bold transition-colors"
                    >
                      Voir le fichier
                    </button>
                    <button
                      onClick={() => requestDelete(docType)}
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div>
                    <input
                      type="file"
                      id={`file-${docType.key}`}
                      className="hidden"
                      accept=".pdf,image/jpeg,image/png"
                      onChange={e => handleUpload(e, docType)}
                    />
                    <label
                      htmlFor={`file-${docType.key}`}
                      className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                    >
                      <UploadCloud className="h-4 w-4" /> Uploader
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Supprimer ce document ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement votre ${confirmModal.docType?.label} ?`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, docType: null })}
        variant="danger"
        confirmText="Oui, supprimer"
      />
    </div>
  );
}
