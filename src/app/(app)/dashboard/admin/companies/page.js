'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Search, Eye, Download, Building2 } from 'lucide-react';

export default function AdminCompanies() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all'); // 'all' | 'FR' | 'BE'

  const exportToCSV = () => {
    if (filteredCompanies.length === 0) return;
    const headers = ['ID', 'Nom Entreprise', 'Email', 'Numéro Identification (SIRET/BCE)', 'Pays', 'Moyen de Paiement', 'Date Inscription'];
    const rows = filteredCompanies.map(c => [
      c.id,
      `"${c.name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.siret || c.bce || ''}"`,
      c.country || (c.bce ? 'BE' : 'FR'),
      c.has_payment_method ? 'Configuré' : 'Non configuré',
      c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `entreprises-frettalent-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              .select('*')
              .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.siret?.includes(searchTerm) ||
      c.bce?.includes(searchTerm);
    const companyCountry = c.country || (c.bce ? 'BE' : 'FR');
    const matchesCountry = filterCountry === 'all' || companyCountry === filterCountry;
    return matchesSearch && matchesCountry;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Entreprises</h1>
          <p className="text-sm text-slate-500">{companies.length} entreprise{companies.length > 1 ? 's' : ''} inscrite{companies.length > 1 ? 's' : ''}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Exporter (CSV)
          </button>
          
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tous les Pays</option>
            <option value="FR">France (SIRET)</option>
            <option value="BE">Belgique (BCE)</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, SIRET, BCE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-slate-50"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Nom</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">SIRET</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Paiement</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="border-b border-slate-100">
                <td className="py-3 px-4">{company.name || '—'}</td>
                <td className="py-3 px-4">{company.siret || '—'}</td>
                                <td className="py-3 px-4 text-center">
                                  {company.has_payment_method ? (
                                    <span className="text-green-600 font-medium">Payante</span>
                                  ) : (
                                    <span className="text-orange-500 font-medium">À régler</span>
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
