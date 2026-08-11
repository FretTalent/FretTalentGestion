'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Truck,
  MapPin,
  Calendar,
  FileText,
  ChevronRight,
  RefreshCw,
  Briefcase,
} from 'lucide-react';

export default function PublicJobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedJobs();
  }, []);

  const fetchApprovedJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setJobs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-grow max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-655 text-xs font-semibold">
            <Briefcase className="h-4 w-4" /> Emplois du transport routier
          </div>
          <h1 className="text-4xl font-extrabold text-slate-950 tracking-tight">
            Offres d'emploi Actives
          </h1>
          <p className="text-slate-600">
            Trouvez les meilleures opportunités proches de chez vous. Postulez
            directement en partageant votre profil qualifié.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-2">
            <Briefcase className="h-8 w-8 mx-auto text-slate-300" />
            <p>Aucune offre d'emploi n'est publiée pour le moment.</p>
            <p className="text-xs">
              Revenez très bientôt pour de nouvelles opportunités !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-700">
                      {job.contract_type}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {job.title}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500">
                      {job.companies?.name || 'Entreprise Partenaire'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-400" />{' '}
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        💶 Rémunération : {job.salary}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-slate-400" /> Publiée le{' '}
                      {new Date(job.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 max-w-3xl">
                    {job.description}
                  </p>
                </div>

                <div className="w-full md:w-auto">
                  <Link
                    href="/login"
                    className="w-full md:w-auto inline-flex items-center justify-center px-5 py-3 rounded-2xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/10 hover:shadow-orange-600/20 transition-all gap-1"
                  >
                    Postuler à cette offre
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
