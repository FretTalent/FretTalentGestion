'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, ArrowLeft, Save } from 'lucide-react';

export default function CompanyProfile() {
  const router = useRouter();
  const params = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [params.id]);

  const fetchCompany = async () => {
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
        .from('companies')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setCompany(data);
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
        .from('companies')
        .update({
          name: company.name,
          siret: company.siret,
          has_payment_method: company.has_payment_method,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return <div className="text-center py-12">Entreprise non trouvée</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/admin/companies')}
          className="p-2 text-slate-600 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-950">Profil de l'entreprise</h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
            <input
              type="text"
              value={company.name || ''}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">SIRET</label>
            <input
              type="text"
              value={company.siret || ''}
              onChange={(e) => setCompany({ ...company, siret: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Paiement</label>
            <select
              value={company.has_payment_method ? 'yes' : 'no'}
              onChange={(e) => setCompany({ ...company, has_payment_method: e.target.value === 'yes' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="no">Non configuré</option>
              <option value="yes">Configuré</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
