'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ShieldCheck,
  FileText,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  Truck,
  Badge,
  Clock,
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { key: 'cv', label: 'CV', required: true },
  { key: 'permis', label: 'Permis de conduire', required: true },
  { key: 'chrono', label: 'Carte Chronotachygraphe', required: true },
  { key: 'fimo', label: 'FIMO / FCO', required: true },
  { key: 'adr', label: 'Carte ADR', required: false },
  { key: 'formation', label: 'Attestation de formation', required: false },
  { key: 'autre', label: 'Autre document', required: false },
];

export default function CandidateAdminProfile() {
  const router = useRouter();
  const params = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [docLoading, setDocLoading] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchCandidate();
  }, [params.id]);

  const fetchCandidate = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setCandidate(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setShowConfirm(false);
    try {
      const response = await fetch(`/api/candidates/${params.id}/validate`, {
        method: 'POST',
      });
      const result = await response.json();

      if (response.ok) {
        setCandidate(prev => ({
          ...prev,
          validated: true,
          validated_at: new Date().toISOString(),
        }));
      } else {
        alert(result.error || 'Erreur lors de la validation');
      }
    } catch (err) {
      alert('Erreur réseau');
    } finally {
      setValidating(false);
    }
  };

  const handleRevokeValidation = async () => {
    if (!confirm('Révoquer la validation de ce candidat ?')) return;
    setValidating(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ validated: false, validated_at: null })
        .eq('id', params.id);
      if (error) throw error;
      setCandidate(prev => ({ ...prev, validated: false, validated_at: null }));
    } catch (err) {
      alert('Erreur lors de la révocation');
    } finally {
      setValidating(false);
    }
  };

  const handleOpenDoc = async (path, name) => {
    setDocLoading(path);
    try {
      const { data, error } = await supabase.storage
        .from('candidate-documents')
        .createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      alert("Impossible d'ouvrir le document.");
    } finally {
      setDocLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Chargement du profil...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-medium">Candidat non trouvé</p>
        <button
          onClick={() => router.push('/dashboard/admin/candidates')}
          className="mt-4 text-orange-500 hover:underline text-sm"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const docs = candidate.documents || {};
  const REQUIRED_KEYS = ['cv', 'permis', 'chrono', 'fimo'];
  const uploadedRequired = REQUIRED_KEYS.filter(k => docs[k]).length;
  const allRequiredUploaded = uploadedRequired === REQUIRED_KEYS.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/admin/candidates')}
          className="p-2 rounded-xl text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-950">
            {candidate.full_name || 'Candidat sans nom'}
          </h1>
          <p className="text-sm text-slate-500">
            Fiche candidat — ID: {candidate.id?.slice(0, 8)}...
          </p>
        </div>
        {/* Badge statut global */}
        {candidate.validated ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-2xl font-bold text-sm">
            <ShieldCheck className="h-5 w-5" />
            Profil Vérifié
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 px-4 py-2 rounded-2xl font-bold text-sm">
            <Clock className="h-5 w-5" />
            En attente de validation
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Infos profil */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar + Identité */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-3xl">
                {candidate.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="font-extrabold text-slate-950 text-lg">
                  {candidate.full_name || '—'}
                </h2>
                {candidate.validated && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Candidat Vérifié ✓
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700 truncate">{candidate.email || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">{candidate.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">
                  {candidate.city || '—'} {candidate.postal_code ? `(${candidate.postal_code})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">
                  Inscrit le{' '}
                  {candidate.created_at
                    ? new Date(candidate.created_at).toLocaleDateString('fr-FR')
                    : '—'}
                </span>
              </div>
              {candidate.license_types && (
                <div className="flex items-start gap-3 text-sm">
                  <Truck className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">
                    {Array.isArray(candidate.license_types)
                      ? candidate.license_types.join(', ')
                      : candidate.license_types}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action de validation */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Validation du profil
            </h3>

            {candidate.validated ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Profil validé</p>
                    {candidate.validated_at && (
                      <p className="text-xs text-green-600">
                        Le {new Date(candidate.validated_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ce candidat possède le badge <strong>Candidat Vérifié ✓</strong> visible sur la carte de France.
                </p>
                <button
                  onClick={handleRevokeValidation}
                  disabled={validating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {validating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Révoquer la validation
                </button>
              </div>
            ) : showConfirm ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-amber-800 mb-1">Confirmer la validation ?</p>
                  <p className="text-xs text-amber-700">
                    Le candidat recevra le badge <strong>Candidat Vérifié ✓</strong> et sera visible
                    sur la carte de France avec une icône verte.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {validating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Confirmer
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
                  <Clock className="h-6 w-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-orange-800">En attente</p>
                    <p className="text-xs text-orange-600">Profil non encore validé</p>
                  </div>
                </div>
                {!allRequiredUploaded && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 font-medium">
                    ⚠ {uploadedRequired}/{REQUIRED_KEYS.length} documents obligatoires déposés. Il est conseillé d'attendre la complétion.
                  </div>
                )}
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={validating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-500/20 disabled:opacity-50"
                >
                  {validating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                  Valider le profil
                </button>
                <p className="text-xs text-slate-500 text-center">
                  Attribue le badge <strong>Candidat Vérifié ✓</strong> visible sur l'accueil
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Documents justificatifs
              </h2>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  allRequiredUploaded
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {uploadedRequired}/{REQUIRED_KEYS.length} obligatoires
              </span>
            </div>

            {/* Barre de progression globale */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Complétude des documents</span>
                <span>
                  {Math.round(
                    (Object.keys(docs).length /
                      DOCUMENT_TYPES.length) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (Object.keys(docs).length / DOCUMENT_TYPES.length) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Liste des documents */}
            <div className="space-y-3">
              {DOCUMENT_TYPES.map(docType => {
                const doc = docs[docType.key];
                const isUploaded = !!doc;

                return (
                  <div
                    key={docType.key}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                      isUploaded
                        ? 'bg-green-50/50 border-green-200'
                        : docType.required
                        ? 'bg-red-50/30 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl flex-shrink-0 ${
                          isUploaded
                            ? 'bg-green-100 text-green-600'
                            : docType.required
                            ? 'bg-red-100 text-red-500'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isUploaded ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {docType.label}
                          {docType.required && (
                            <span className="text-orange-500 ml-1">*</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isUploaded ? (
                            <span className="text-green-600 font-medium">
                              Déposé le{' '}
                              {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                            </span>
                          ) : docType.required ? (
                            <span className="text-red-500">Document manquant</span>
                          ) : (
                            'Non déposé (optionnel)'
                          )}
                        </p>
                      </div>
                    </div>
                    {isUploaded && (
                      <button
                        onClick={() => handleOpenDoc(doc.path, doc.name)}
                        disabled={docLoading === doc.path}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-400 hover:text-orange-500 text-slate-600 rounded-xl text-xs font-bold transition-all"
                      >
                        {docLoading === doc.path ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                        Ouvrir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Champs complémentaires du profil */}
          {(candidate.experience_years || candidate.availability || candidate.license_types) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                Informations métier
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {candidate.experience_years !== undefined && candidate.experience_years !== null && (
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                      Expérience
                    </p>
                    <p className="text-lg font-black text-slate-950">
                      {candidate.experience_years} an{candidate.experience_years > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {candidate.availability && (
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                      Disponibilité
                    </p>
                    <p className="text-sm font-bold text-slate-950">{candidate.availability}</p>
                  </div>
                )}
                {candidate.license_types && (
                  <div className="bg-slate-50 rounded-2xl p-4 col-span-2">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                      Permis
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(candidate.license_types)
                        ? candidate.license_types
                        : [candidate.license_types]
                      ).map(lt => (
                        <span
                          key={lt}
                          className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full"
                        >
                          {lt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
