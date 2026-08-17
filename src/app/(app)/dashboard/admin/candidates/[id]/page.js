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
  Clock,
  Bell,
  Send,
} from 'lucide-react';
import { calculateAge } from '@/lib/country';

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
  { key: 'autre', label: 'Autre document', required: false },
];

export default function CandidateAdminProfile() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params?.id;

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [docLoading, setDocLoading] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [reminding, setReminding] = useState(false);
  const [remindMessage, setRemindMessage] = useState(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState(false);

  const handleSendReminder = async () => {
    if (!candidate?.email) {
      alert("Ce candidat n'a pas d'adresse e-mail renseignée.");
      return;
    }
    if (!confirm(`Envoyer un e-mail de rappel à ${candidate.email} pour l'inviter à déposer ses documents ?`)) return;
    setReminding(true);
    setRemindMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/candidates/${candidateId}/remind`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Erreur lors de la relance');
      }
      setCandidate(prev => ({
        ...prev,
        reminders_count: result.reminders_count ?? ((prev?.reminders_count || 0) + 1),
        last_reminded_at: result.last_reminded_at || new Date().toISOString(),
      }));
      setRemindMessage({ type: 'success', text: result.message || 'E-mail de rappel envoyé avec succès !' });
    } catch (err) {
      setRemindMessage({ type: 'error', text: err.message });
    } finally {
      setReminding(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    if (!candidate?.email) return;
    if (!confirm(`Renvoyer le lien de confirmation d'e-mail à ${candidate.email} via Resend (support@frettalent.fr) ?`)) return;
    setResendingEmail(true);
    setRemindMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/candidates/${candidateId}/resend-confirmation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erreur lors de l'envoi");
      setRemindMessage({ type: 'success', text: result.message || 'Lien de confirmation renvoyé avec succès !' });
    } catch (err) {
      setRemindMessage({ type: 'error', text: err.message });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleManualEmailConfirm = async () => {
    if (!confirm(`Valider manuellement l'adresse e-mail de ${candidate.full_name || candidate.email} sans attendre qu'il clique sur le lien ?`)) return;
    setConfirmingEmail(true);
    setRemindMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/candidates/${candidateId}/confirm-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur lors de la validation');
      setCandidate(prev => ({
        ...prev,
        email_confirmed_at: result.email_confirmed_at || new Date().toISOString(),
      }));
      setRemindMessage({ type: 'success', text: result.message || 'E-mail validé avec succès !' });
    } catch (err) {
      setRemindMessage({ type: 'error', text: err.message });
    } finally {
      setConfirmingEmail(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  const fetchCandidate = async () => {
    if (!candidateId) return;
    setLoading(true);
    setFetchError(null);
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
        .maybeSingle();

      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      // 1. Tenter l'appel API admin
      const { data: { session } } = await supabase.auth.getSession();
      let fetchedCandidate = null;

      try {
        const response = await fetch(`/api/admin/candidates/${candidateId}`, {
          headers: {
            Authorization: `Bearer ${session?.access_token || ''}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          fetchedCandidate = result.candidate;
        }
      } catch (e) {
        console.warn('API route failed, trying direct Supabase query...');
      }

      // 2. Fallback direct via client Supabase si l'API route n'a pas répondu
      if (!fetchedCandidate) {
        const { data: directData, error: directErr } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', candidateId)
          .maybeSingle();

        if (directErr) throw directErr;
        fetchedCandidate = directData;
      }

      if (!fetchedCandidate) {
        setFetchError('Candidat introuvable');
      } else {
        setCandidate(fetchedCandidate);
      }
    } catch (err) {
      console.error('Error fetching candidate:', err);
      setFetchError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setShowConfirm(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/candidates/${params.id}/validate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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

  const docs = (candidate && typeof candidate.documents === 'object' && candidate.documents !== null) ? candidate.documents : {};
  
  // Validation flexible : accepte soit l'ancien champ (ex: 'permis'), soit le nouveau 'permis_recto'
  const isDocPresent = (key, legacyKey) => !!docs[key] || (legacyKey && !!docs[legacyKey]);
  
  const hasCv = isDocPresent('cv');
  const hasPermisRecto = isDocPresent('permis_recto', 'permis');
  const hasPermisVerso = isDocPresent('permis_verso', 'permis');
  const hasChronoRecto = isDocPresent('chrono_recto', 'chrono');
  const hasChronoVerso = isDocPresent('chrono_verso', 'chrono');
  const hasFimoRecto = isDocPresent('fimo_recto', 'fimo');
  const hasFimoVerso = isDocPresent('fimo_verso', 'fimo');
  
  const requiredDocs = [
    hasCv,
    hasPermisRecto,
    hasPermisVerso,
    hasChronoRecto,
    hasChronoVerso,
    hasFimoRecto,
    hasFimoVerso,
  ];

  const allRequiredUploaded = requiredDocs.every(Boolean);
  const uploadedRequiredCount = requiredDocs.filter(Boolean).length;

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
        {/* Actions & Badges */}
        <div className="flex items-center gap-2">
          {/* Badge Compteur Relances */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs border ${
              (candidate.reminders_count || 0) > 0
                ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title={
              candidate.last_reminded_at
                ? `Dernière relance le ${new Date(candidate.last_reminded_at).toLocaleString('fr-FR')}`
                : 'Aucune relance effectuée'
            }
          >
            <Bell className={`h-3.5 w-3.5 ${(candidate.reminders_count || 0) > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>{(candidate.reminders_count || 0)} relance{(candidate.reminders_count || 0) > 1 ? 's' : ''}</span>
          </div>

          {!allRequiredUploaded && candidate.email && (
            <button
              onClick={handleSendReminder}
              disabled={reminding}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span>{reminding ? 'Envoi...' : 'Relancer par e-mail'}</span>
            </button>
          )}

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
      </div>

      {/* Message de confirmation ou erreur de relance */}
      {remindMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold text-center ${
            remindMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {remindMessage.text}
        </div>
      )}

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
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-900 font-semibold truncate text-xs">{candidate.email || '—'}</span>
                  </div>
                  {candidate.email_confirmed_at ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      E-mail Validé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                      <Clock className="h-3 w-3 text-amber-600" />
                      Non Confirmé
                    </span>
                  )}
                </div>

                {!candidate.email_confirmed_at && candidate.email && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 mt-1">
                    <button
                      onClick={handleResendConfirmationEmail}
                      disabled={resendingEmail}
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      {resendingEmail ? 'Envoi...' : '📩 Renvoyer le lien'}
                    </button>
                    <button
                      onClick={handleManualEmailConfirm}
                      disabled={confirmingEmail}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      {confirmingEmail ? 'Validation...' : '⚡ Valider maintenant'}
                    </button>
                  </div>
                )}
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
                  {candidate.birth_date
                    ? `Né le ${new Date(candidate.birth_date).toLocaleDateString('fr-FR')} (${calculateAge(candidate.birth_date)} ans)`
                    : 'Âge non renseigné'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">
                  Inscrit le{' '}
                  {candidate.created_at
                    ? new Date(candidate.created_at).toLocaleDateString('fr-FR')
                    : '—'}
                </span>
              </div>
              {(candidate.licenses || candidate.license_types) && (
                <div className="flex items-start gap-3 text-sm">
                  <Truck className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">
                    {Array.isArray(candidate.licenses || candidate.license_types)
                      ? (candidate.licenses || candidate.license_types).join(', ')
                      : (candidate.licenses || candidate.license_types)}
                  </span>
                </div>
              )}

              {/* Suivi des relances candidat */}
              <div className="border-t border-slate-100 pt-3 mt-3 bg-slate-50/80 p-3 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-orange-500" />
                    Relances e-mail :
                  </span>
                  <span className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
                    (candidate.reminders_count || 0) > 0
                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(candidate.reminders_count || 0)} relance{(candidate.reminders_count || 0) > 1 ? 's' : ''}
                  </span>
                </div>
                {candidate.last_reminded_at ? (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                    Dernière : {new Date(candidate.last_reminded_at).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">
                    Aucune relance envoyée
                  </p>
                )}
              </div>
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
                    ⚠ {uploadedRequiredCount}/7 documents obligatoires déposés. Il est conseillé d'attendre la complétion.
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
                {uploadedRequiredCount}/7 documents obligatoires
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

            {/* Alerte Documents Manquants & Relances */}
            {!allRequiredUploaded && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </span>
                    <p className="text-xs font-extrabold text-amber-950">
                      {7 - uploadedRequiredCount} pièce{7 - uploadedRequiredCount > 1 ? 's' : ''} obligatoire{7 - uploadedRequiredCount > 1 ? 's' : ''} manquante{7 - uploadedRequiredCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    {(candidate.reminders_count || 0) === 0 ? (
                      <span className="italic">Aucune relance par e-mail n'a été effectuée pour ce candidat.</span>
                    ) : (
                      <>
                        <strong>{(candidate.reminders_count || 0)} relance{(candidate.reminders_count || 0) > 1 ? 's' : ''} e-mail envoyée{(candidate.reminders_count || 0) > 1 ? 's' : ''}</strong>
                        {candidate.last_reminded_at && (
                          <span className="text-amber-700">
                            {' '}(dernière le {new Date(candidate.last_reminded_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })})
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                {candidate.email && (
                  <button
                    onClick={handleSendReminder}
                    disabled={reminding}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs transition-all shadow-sm shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{reminding ? 'Envoi...' : 'Envoyer une relance'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Liste des documents */}
            <div className="space-y-3">
              {/* Prise en compte des anciens documents legacy */}
              {Object.keys(docs).map(key => {
                if (DOCUMENT_TYPES.some(d => d.key === key)) return null;
                const legacyDoc = docs[key];
                if (!legacyDoc) return null;

                const legacyLabels = {
                  permis: 'Permis de conduire (Ancien dépôt)',
                  chrono: 'Carte Chronotachygraphe (Ancien dépôt)',
                  fimo: 'FIMO / FCO (Ancien dépôt)',
                  adr: 'Carte ADR (Ancien dépôt)',
                };
                const label = legacyLabels[key] || `Document (${key})`;

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-2xl border border-green-200 bg-green-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl flex-shrink-0 bg-green-100 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500">
                          <span className="text-green-600 font-medium">
                            Déposé le{' '}
                            {legacyDoc.uploaded_at
                              ? new Date(legacyDoc.uploaded_at).toLocaleDateString('fr-FR')
                              : 'Reçu'}
                          </span>
                        </p>
                      </div>
                    </div>
                    {legacyDoc.path && (
                      <button
                        onClick={() => handleOpenDoc(legacyDoc.path, legacyDoc.name)}
                        disabled={docLoading === legacyDoc.path}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-400 hover:text-orange-500 text-slate-600 rounded-xl text-xs font-bold transition-all"
                      >
                        {docLoading === legacyDoc.path ? (
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
                              {doc.uploaded_at
                                ? new Date(doc.uploaded_at).toLocaleDateString('fr-FR')
                                : 'Reçu'}
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
          {(candidate.experience_years !== undefined || candidate.availability || candidate.licenses || candidate.license_types || candidate.certifications) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                Informations métier
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {(candidate.licenses || candidate.license_types) && (
                  <div className="bg-slate-50 rounded-2xl p-4 md:col-span-2">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                      Permis détenus
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(candidate.licenses || candidate.license_types)
                        ? (candidate.licenses || candidate.license_types)
                        : [candidate.licenses || candidate.license_types]
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
                {candidate.certifications && candidate.certifications.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 md:col-span-2">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                      Certifications & Formations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.certifications.map(c => (
                        <span
                          key={c}
                          className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full"
                        >
                          {c}
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
