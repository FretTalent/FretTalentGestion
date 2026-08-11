'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';
import { REQUIRED_DOCUMENT_TYPES } from '@/lib/validation/candidateValidation';

export default function CandidateProfile() {
  const router = useRouter();
  const params = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          full_name: candidate.full_name,
          email: candidate.email,
          phone: candidate.phone,
          validated: candidate.validated,
        })
        .eq('id', params.id);

      if (error) throw error;
      alert('Profil mis à jour');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!confirm('Valider ce candidat ?')) return;

    try {
      const response = await fetch(`/api/candidates/${params.id}/validate`, {
        method: 'POST',
      });
      const result = await response.json();

      if (response.ok) {
        setCandidate({ ...candidate, validated: true, validated_at: new Date().toISOString() });
      } else {
        alert(result.error || 'Erreur lors de la validation');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return <div className="text-center py-12">Candidat non trouvé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/admin/candidates')}
          className="p-2 text-slate-600 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-950">Profil du candidat</h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
            <input
              type="text"
              value={candidate.full_name || ''}
              onChange={(e) => setCandidate({ ...candidate, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={candidate.email || ''}
              onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
            <input
              type="text"
              value={candidate.phone || ''}
              onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
            <select
              value={candidate.validated ? 'validated' : 'pending'}
              onChange={(e) => setCandidate({ ...candidate, validated: e.target.value === 'validated' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="pending">En attente</option>
              <option value="validated">Validée</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <div>
            {candidate.validated ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" /> Validé le {new Date(candidate.validated_at).toLocaleDateString()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" /> Non validé
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {!candidate.validated && (
              <button
                onClick={handleValidate}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Valider le candidat
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
