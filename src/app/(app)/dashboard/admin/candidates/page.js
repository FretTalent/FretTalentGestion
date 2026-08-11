'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, CheckCircle, XCircle, Search, Eye } from 'lucide-react';


export default function AdminCandidates() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // Récupérer tous les candidats sans filtre
      const { data: allCandidates, error: fetchError } = await supabase
        .from('candidates')
        .select('*');

      if (fetchError) {
        console.error('Erreur lors de la récupération des candidats:', fetchError);
        setCandidates([]);
      } else {
        console.log('Nombre total de candidats:', allCandidates?.length || 0);
        console.log('Exemple de candidat:', allCandidates?.[0]);
        setCandidates(allCandidates || []);
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);
  const handleValidate = async (candidateId) => {
    if (!confirm('Valider ce candidat ?')) return;

    try {
      const response = await fetch(`/api/candidates/${candidateId}/validate`, {
        method: 'POST',
      });
      const result = await response.json();

      if (response.ok) {
        setCandidates(candidates.map(c =>
          c.id === candidateId
            ? { ...c, validated: true, validated_at: new Date().toISOString() }
            : c
        ));
      } else {
        alert(result.error || 'Erreur lors de la validation');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  const filteredCandidates = candidates.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Afficher les candidats dans la console


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-950">Candidats</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Chargement des candidats...</p>
        </div>
      ) : (
        candidates.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Liste des candidats ({candidates.length})</h2>
            <p className="text-sm text-slate-500 mb-4">Affichage de tous les candidats enregistrés</p>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Nom</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Téléphone</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Statut</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Profil</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b border-slate-100">
                <td className="py-3 px-4">{candidate.full_name || '—'}</td>
                <td className="py-3 px-4">{candidate.email || '—'}</td>
                <td className="py-3 px-4">{candidate.phone || '—'}</td>
                <td className="py-3 px-4 text-center">
                  {candidate.validated ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" /> Validé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" /> En attente
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleValidate(candidate.id)}
                    className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {candidate.validated ? 'Déjà validé' : 'Valider'}
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => router.push(`/dashboard/admin/candidates/${candidate.id}`)}
                    className="p-1 text-slate-600 hover:text-orange-500 transition-colors"
                    title="Voir le profil"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        )) : (
            <div className="text-center py-8">
              <p>Aucun candidat trouvé.</p>
              <p className="text-sm text-slate-500">Vérifiez que des candidats sont enregistrés dans la base de données.</p>
              <button
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="mt-4 text-orange-500 hover:underline"
              >
                Accéder au tableau de bord Supabase
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
