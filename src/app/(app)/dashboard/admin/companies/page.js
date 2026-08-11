'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Search, Eye } from 'lucide-react';

export default function AdminCompanies() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
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
        .select('id, name, email, phone, validated, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-slate-950">Entreprises</h1>
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Nom</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Téléphone</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Statut</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="border-b border-slate-100">
                <td className="py-3 px-4">{company.name || '—'}</td>
                <td className="py-3 px-4">{company.email || '—'}</td>
                <td className="py-3 px-4">{company.phone || '—'}</td>
                <td className="py-3 px-4 text-center">
                  {company.validated ? (
                    <span className="text-green-600 font-medium">Validée</span>
                  ) : (
                    <span className="text-red-600 font-medium">En attente</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => router.push(`/dashboard/admin/companies/${company.id}`)}
                    className="p-1 text-slate-600 hover:text-orange-500 transition-colors"
                    title="Voir le profil"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
