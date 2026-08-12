'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw } from 'lucide-react';
import CandidateDocuments from '@/components/CandidateDocuments';

export default function CandidateDocumentsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData?.role === 'recruiter') {
        router.push('/dashboard/recruiter');
        return;
      }
      if (profileData?.role === 'admin') {
        router.push('/dashboard/admin');
        return;
      }

      setProfile(profileData || { id: user.id, role: 'candidate' });

      // Load candidate documents
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('documents')
        .eq('id', user.id)
        .maybeSingle();

      if (candidateData && typeof candidateData.documents === 'object' && candidateData.documents !== null) {
        setDocuments(candidateData.documents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Mes documents
        </h1>
        <p className="text-sm text-slate-500">
          Gérez ici l'ensemble des pièces justificatives liées à votre profil
          professionnel.
        </p>
      </div>

      <CandidateDocuments
        candidateId={profile?.id}
        documents={documents}
        onUpdate={newDocs => setDocuments(newDocs)}
      />
    </div>
  );
}
