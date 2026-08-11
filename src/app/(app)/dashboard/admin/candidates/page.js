'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, CheckCircle, XCircle, Search, Eye } from 'lucide-react';

// Vérification directe des données candidates
const verifyCandidates = async () => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*');

    if (error) {
      console.error('Erreur lors de la vérification des candidats:', error);
      return [];
    }
    console.log('Vérification directe des candidats:', data);
    return data || [];
  } catch (err) {
    console.error('Erreur inattendue:', err);
    return [];
  }
};


export default function AdminCandidates() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Vérification initiale des données
  useEffect(() => {
    const verifyInitialData = async () => {
      const data = await verifyCandidates();
      if (data.length > 0) {
        console.log('Données initiales vérifiées:', data.length, 'candidats');
      } else {
        console.warn('Aucun candidat trouvé dans la base de données');
      }
    };
    verifyInitialData();
  }, []);
  
  // Vérification des permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Utilisateur non authentifié');
        return;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
      } else if (profile?.role !== 'admin') {
        console.warn('Utilisateur non admin:', profile?.role);
      } else {
        console.log('Permissions vérifiées: Utilisateur admin');
      }
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // Récupérer les candidats avec une requête complète
      const { data, error } = await supabase
        .from('candidates')
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des candidats:', error);
        setCandidates([]);
      } else {
        console.log('Candidats récupérés:', data);
        console.log('Nombre total de candidats:', data?.length || 0);
        setCandidates(data || []);
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

  // Vérification des données récupérées
  useEffect(() => {
    console.log('Candidates state:', candidates);
  }, [candidates]);

  // Vérification des erreurs potentielles
  useEffect(() => {
    if (candidates.length === 0 && !loading) {
      console.warn('Aucun candidat trouvé, vérifiez la base de données');
      alert('Aucun candidat trouvé. Vérifiez les logs de la console pour plus d’informations.');
    }
  }, [candidates, loading]);

  // Vérification initiale des données
  useEffect(() => {
    const checkInitialData = async () => {
      const initialData = await verifyCandidates();
      if (initialData.length > 0) {
        console.log('Données initiales vérifiées:', initialData.length, 'candidats');
      } else {
        console.warn('Aucun candidat trouvé dans la vérification initiale');
      }
    };
    checkInitialData();
  }, []);

  // Vérification des données candidates dans le contexte
  useEffect(() => {
    const verifyContext = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*');

      if (error) {
        console.error('Erreur lors de la vérification des données:', error);
      } else {
        console.log('Vérification dans le contexte:', data?.length || 0, 'candidats');
      }
    };
    verifyContext();
  }, []);

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
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => alert('Vérifiez les logs de la console pour plus d’informations')}
              className="text-orange-500 hover:underline"
            >
              Voir les logs de debug
            </button>
          </div>
        </div>
      ) : (
        candidates.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Liste des candidats ({candidates.length})</h2>
            <p className="text-sm text-slate-500 mb-4">Voici la liste complète des {candidates.length} candidats enregistrés.</p>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-sm font-medium">Succès: {candidates.length} candidats trouvés dans la base de données.</p>
            </div>
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
              <p className="text-red-600 font-bold">Aucun candidat trouvé.</p>
              <p className="text-sm text-slate-500 mt-2">Il semble qu'il n'y ait aucun candidat enregistré.</p>
              <p className="text-sm text-slate-500">Vérifiez que des candidats ont bien été créés via l'inscription.</p>
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="text-orange-500 hover:underline"
                >
                  Accéder au tableau de bord Supabase
                </button>
                <button
                  onClick={() => alert('Vérifiez les logs de la console pour plus d’informations')}
                  className="text-orange-500 hover:underline"
                >
                  Voir les logs de debug
                </button>
              </div>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700">Astuce: Vérifiez que les candidats ont été créés avec succès et que leur statut est 'is_active: true'.</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
