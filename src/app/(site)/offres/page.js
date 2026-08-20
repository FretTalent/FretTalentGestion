'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Search,
  Filter,
  X,
  Sparkles,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  ArrowUpDown,
  Navigation,
} from 'lucide-react';

// Références géographiques détaillées par pays
const REGIONS_DATA = {
  FR: {
    label: 'Département (France)',
    allLabel: 'Tous les départements (FR)',
    options: [
      { code: '01', name: '01 - Ain' },
      { code: '02', name: '02 - Aisne' },
      { code: '03', name: '03 - Allier' },
      { code: '04', name: '04 - Alpes-de-Haute-Provence' },
      { code: '05', name: '05 - Hautes-Alpes' },
      { code: '06', name: '06 - Alpes-Maritimes' },
      { code: '07', name: '07 - Ardèche' },
      { code: '08', name: '08 - Ardennes' },
      { code: '09', name: '09 - Ariège' },
      { code: '10', name: '10 - Aube' },
      { code: '11', name: '11 - Aude' },
      { code: '12', name: '12 - Aveyron' },
      { code: '13', name: '13 - Bouches-du-Rhône' },
      { code: '14', name: '14 - Calvados' },
      { code: '15', name: '15 - Cantal' },
      { code: '16', name: '16 - Charente' },
      { code: '17', name: '17 - Charente-Maritime' },
      { code: '18', name: '18 - Cher' },
      { code: '19', name: '19 - Corrèze' },
      { code: '21', name: "21 - Côte-d'Or" },
      { code: '22', name: "22 - Côtes-d'Armor" },
      { code: '23', name: '23 - Creuse' },
      { code: '24', name: '24 - Dordogne' },
      { code: '25', name: '25 - Doubs' },
      { code: '26', name: '26 - Drôme' },
      { code: '27', name: '27 - Eure' },
      { code: '28', name: '28 - Eure-et-Loir' },
      { code: '29', name: '29 - Finistère' },
      { code: '2A', name: '2A - Corse-du-Sud' },
      { code: '2B', name: '2B - Haute-Corse' },
      { code: '30', name: '30 - Gard' },
      { code: '31', name: '31 - Haute-Garonne' },
      { code: '32', name: '32 - Gers' },
      { code: '33', name: '33 - Gironde' },
      { code: '34', name: '34 - Hérault' },
      { code: '35', name: '35 - Ille-et-Vilaine' },
      { code: '36', name: '36 - Indre' },
      { code: '37', name: '37 - Indre-et-Loire' },
      { code: '38', name: '38 - Isère' },
      { code: '39', name: '39 - Jura' },
      { code: '40', name: '40 - Landes' },
      { code: '41', name: '41 - Loir-et-Cher' },
      { code: '42', name: '42 - Loire' },
      { code: '43', name: '43 - Haute-Loire' },
      { code: '44', name: '44 - Loire-Atlantique' },
      { code: '45', name: '45 - Loiret' },
      { code: '46', name: '46 - Lot' },
      { code: '47', name: '47 - Lot-et-Garonne' },
      { code: '48', name: '48 - Lozère' },
      { code: '49', name: '49 - Maine-et-Loire' },
      { code: '50', name: '50 - Manche' },
      { code: '51', name: '51 - Marne' },
      { code: '52', name: '52 - Haute-Marne' },
      { code: '53', name: '53 - Mayenne' },
      { code: '54', name: '54 - Meurthe-et-Moselle' },
      { code: '55', name: '55 - Meuse' },
      { code: '56', name: '56 - Morbihan' },
      { code: '57', name: '57 - Moselle' },
      { code: '58', name: '58 - Nièvre' },
      { code: '59', name: '59 - Nord' },
      { code: '60', name: '60 - Oise' },
      { code: '61', name: '61 - Orne' },
      { code: '62', name: '62 - Pas-de-Calais' },
      { code: '63', name: '63 - Puy-de-Dôme' },
      { code: '64', name: '64 - Pyrénées-Atlantiques' },
      { code: '65', name: '65 - Hautes-Pyrénées' },
      { code: '66', name: '66 - Pyrénées-Orientales' },
      { code: '67', name: '67 - Bas-Rhin' },
      { code: '68', name: '68 - Haut-Rhin' },
      { code: '69', name: '69 - Rhône' },
      { code: '70', name: '70 - Haute-Saône' },
      { code: '71', name: '71 - Saône-et-Loire' },
      { code: '72', name: '72 - Sarthe' },
      { code: '73', name: '73 - Savoie' },
      { code: '74', name: '74 - Haute-Savoie' },
      { code: '75', name: '75 - Paris' },
      { code: '76', name: '76 - Seine-Maritime' },
      { code: '77', name: '77 - Seine-et-Marne' },
      { code: '78', name: '78 - Yvelines' },
      { code: '79', name: '79 - Deux-Sèvres' },
      { code: '80', name: '80 - Somme' },
      { code: '81', name: '81 - Tarn' },
      { code: '82', name: '82 - Tarn-et-Garonne' },
      { code: '83', name: '83 - Var' },
      { code: '84', name: '84 - Vaucluse' },
      { code: '85', name: '85 - Vendée' },
      { code: '86', name: '86 - Vienne' },
      { code: '87', name: '87 - Haute-Vienne' },
      { code: '88', name: '88 - Vosges' },
      { code: '89', name: '89 - Yonne' },
      { code: '90', name: '90 - Territoire de Belfort' },
      { code: '91', name: '91 - Essonne' },
      { code: '92', name: '92 - Hauts-de-Seine' },
      { code: '93', name: '93 - Seine-Saint-Denis' },
      { code: '94', name: '94 - Val-de-Marne' },
      { code: '95', name: '95 - Val-d\'Oise' },
    ],
  },
  BE: {
    label: 'Province (Belgique)',
    allLabel: 'Toutes les provinces (BE)',
    options: [
      { code: 'Bruxelles', name: 'Bruxelles-Capitale' },
      { code: 'Anvers', name: 'Anvers (Antwerpen)' },
      { code: 'Liège', name: 'Liège' },
      { code: 'Hainaut', name: 'Hainaut (Charleroi, Mons)' },
      { code: 'Flandre-Orientale', name: 'Flandre-Orientale (Gent)' },
      { code: 'Flandre-Occidentale', name: 'Flandre-Occidentale (Bruges, Courtrai)' },
      { code: 'Brabant-Wallon', name: 'Brabant wallon (Wavre, Nivelles)' },
      { code: 'Brabant-Flamand', name: 'Brabant flamand (Leuven)' },
      { code: 'Namur', name: 'Namur' },
      { code: 'Limbourg', name: 'Limbourg (Hasselt, Genk)' },
      { code: 'Luxembourg', name: 'Luxembourg belge (Arlon, Bastogne)' },
    ],
  },
  LU: {
    label: 'Canton / Région (Luxembourg)',
    allLabel: 'Tous les cantons (LU)',
    options: [
      { code: 'Luxembourg', name: 'Luxembourg-Ville / Centre' },
      { code: 'Esch', name: 'Esch-sur-Alzette / Sud' },
      { code: 'Diekirch', name: 'Diekirch / Nord' },
      { code: 'Grevenmacher', name: 'Grevenmacher / Est' },
      { code: 'Capellen', name: 'Capellen' },
      { code: 'Mersch', name: 'Mersch' },
      { code: 'Remich', name: 'Remich' },
      { code: 'Wiltz', name: 'Wiltz' },
      { code: 'Clervaux', name: 'Clervaux' },
      { code: 'Echternach', name: 'Echternach' },
      { code: 'Redange', name: 'Redange' },
      { code: 'Vianden', name: 'Vianden' },
    ],
  },
  CH: {
    label: 'Canton (Suisse)',
    allLabel: 'Tous les cantons (CH)',
    options: [
      { code: 'Genève', name: 'Genève (GE)' },
      { code: 'Vaud', name: 'Vaud (VD - Lausanne)' },
      { code: 'Valais', name: 'Valais (VS - Sion)' },
      { code: 'Fribourg', name: 'Fribourg (FR)' },
      { code: 'Neuchâtel', name: 'Neuchâtel (NE)' },
      { code: 'Jura', name: 'Jura (JU - Delémont)' },
      { code: 'Berne', name: 'Berne (BE)' },
      { code: 'Bâle', name: 'Bâle (BS / BL)' },
      { code: 'Zurich', name: 'Zurich (ZH)' },
      { code: 'Tessin', name: 'Tessin (TI)' },
    ],
  },
};

export default function PublicJobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres de recherche
  const [keyword, setKeyword] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState('ALL');
  const [selectedLicense, setSelectedLicense] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [salaryFilter, setSalaryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'salary'

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
      console.error('Erreur chargement des offres:', err);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le département quand le pays change
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedDepartment('ALL');
  };

  // Helper pour extraire un montant numérique approximatif d'un salaire
  const extractSalaryNumber = (salaryStr) => {
    if (!salaryStr) return 0;
    const matches = salaryStr.replace(/\s/g, '').match(/\d+/g);
    if (!matches || matches.length === 0) return 0;
    const numbers = matches.map((n) => parseInt(n, 10)).filter((n) => n > 100);
    return numbers.length > 0 ? Math.max(...numbers) : 0;
  };

  // Obtenir la configuration des subdivisions pour le pays sélectionné
  const currentRegionConfig = useMemo(() => {
    if (selectedCountry !== 'ALL' && REGIONS_DATA[selectedCountry]) {
      return REGIONS_DATA[selectedCountry];
    }
    // Par défaut si ALL, proposer les départements français
    return {
      label: 'Département / Région',
      allLabel: 'Tous départements / régions',
      options: REGIONS_DATA.FR.options,
    };
  }, [selectedCountry]);

  // Filtrage multi-critères
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const fullText = `${job.title} ${job.description} ${job.companies?.name || ''}`.toLowerCase();
        const jobLoc = (job.location || '').toLowerCase();
        const jobContract = (job.contract_type || '').toUpperCase();

        // 1. Mot-clé (titre, description, entreprise)
        if (keyword.trim()) {
          const kw = keyword.toLowerCase().trim();
          if (!fullText.includes(kw) && !jobLoc.includes(kw)) return false;
        }

        // 2. Lieu texte libre
        if (locationQuery.trim()) {
          const loc = locationQuery.toLowerCase().trim();
          if (!jobLoc.includes(loc) && !fullText.includes(loc)) return false;
        }

        // 3. Contrat
        if (selectedContract !== 'ALL') {
          if (!jobContract.includes(selectedContract.toUpperCase())) return false;
        }

        // 4. Permis requis
        if (selectedLicense !== 'ALL') {
          if (selectedLicense === 'CE') {
            const hasCE = /permis\s*ce|spl|super\s*poids\s*lourd|semi|tracteur/i.test(fullText);
            if (!hasCE) return false;
          } else if (selectedLicense === 'C') {
            const hasC = /permis\s*c\b|poids\s*lourd|\bpl\b|porteur/i.test(fullText);
            if (!hasC) return false;
          } else if (selectedLicense === 'B') {
            const hasB = /permis\s*b|véhicule\s*léger|\bvl\b|utilitaire|fourgon/i.test(fullText);
            if (!hasB) return false;
          } else if (selectedLicense === 'ADR') {
            const hasADR = /adr|matières\s*dangereuses|citerne\s*adr/i.test(fullText);
            if (!hasADR) return false;
          }
        }

        // 5. Pays
        if (selectedCountry !== 'ALL') {
          if (selectedCountry === 'FR') {
            const isFR = /france|\(?(0[1-9]|[1-8][0-9]|9[0-5]|97[1-6]|2[AB])\)?|paris|lyon|marseille|lille|toulouse|bordeaux|nantes/i.test(jobLoc);
            if (!isFR && !jobLoc.includes('france')) return false;
          } else if (selectedCountry === 'BE') {
            const isBE = /belgique|belgium|bruxelles|brussels|liege|liège|charleroi|namur|mons|anvers|antwerpen/i.test(jobLoc);
            if (!isBE) return false;
          } else if (selectedCountry === 'LU') {
            const isLU = /luxembourg|esch|differdange|dudelange/i.test(jobLoc);
            if (!isLU) return false;
          } else if (selectedCountry === 'CH') {
            const isCH = /suisse|switzerland|schweiz|genève|geneve|lausanne|fribourg|valais|neuchâtel|neuchatel|zurich/i.test(jobLoc);
            if (!isCH) return false;
          }
        }

        // 6. Département / Province / Canton précis
        if (selectedDepartment !== 'ALL') {
          const deptCode = selectedDepartment.toLowerCase();
          
          // Recherche code département (ex: "69", "02") ou nom province/canton (ex: "Bruxelles", "Genève")
          let deptMatch = false;
          
          if (/^\d{2}$|^2[AB]$/i.test(selectedDepartment)) {
            // Département français (ex: 69 -> cherche "69", "(69)", "Rhône")
            const frOption = REGIONS_DATA.FR.options.find((o) => o.code === selectedDepartment);
            const deptName = frOption ? frOption.name.split(' - ')[1]?.toLowerCase() : '';
            
            const regexCode = new RegExp(`\\b${selectedDepartment}\\b|\\(${selectedDepartment}\\)|${selectedDepartment}\\d{3}`, 'i');
            deptMatch = regexCode.test(jobLoc) || (deptName && (jobLoc.includes(deptName) || fullText.includes(deptName)));
          } else {
            // Province / Canton par nom (ex: "Liège", "Bruxelles", "Vaud", "Genève")
            const cleanQuery = deptCode.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const cleanLoc = jobLoc.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const cleanText = fullText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            deptMatch = cleanLoc.includes(cleanQuery) || cleanText.includes(cleanQuery);
          }

          if (!deptMatch) return false;
        }

        // 7. Spécialité / Matériel
        if (selectedSpecialty !== 'ALL') {
          if (selectedSpecialty === 'FRIGO' && !/frigo|frigorifique|température\s*dirigée/i.test(fullText)) return false;
          if (selectedSpecialty === 'BENNE' && !/benne|tp|travaux\s*publics|enrobé/i.test(fullText)) return false;
          if (selectedSpecialty === 'TAUTLINER' && !/tautliner|bâché|bache|savoyarde/i.test(fullText)) return false;
          if (selectedSpecialty === 'CITERNE' && !/citerne|pulvé|vrac|liquide/i.test(fullText)) return false;
          if (selectedSpecialty === 'PLATEAU' && !/plateau/i.test(fullText)) return false;
          if (selectedSpecialty === 'PORTE_VOITURE' && !/porte[\s-]*voiture|auto/i.test(fullText)) return false;
          if (selectedSpecialty === 'CONVOI' && !/convoi|porte[\s-]*char|exceptionnel/i.test(fullText)) return false;
          if (selectedSpecialty === 'MESSAGERIE' && !/messagerie|distribution|livraison/i.test(fullText)) return false;
        }

        // 8. Filtre Salaire
        if (salaryFilter !== 'ALL') {
          if (salaryFilter === 'WITH_SALARY') {
            if (!job.salary || !job.salary.trim()) return false;
          } else {
            const minSal = parseInt(salaryFilter, 10);
            const num = extractSalaryNumber(job.salary);
            if (num < minSal) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'salary') {
          return extractSalaryNumber(b.salary) - extractSalaryNumber(a.salary);
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [jobs, keyword, locationQuery, selectedContract, selectedLicense, selectedCountry, selectedDepartment, selectedSpecialty, salaryFilter, sortBy]);

  const hasActiveFilters =
    keyword.trim() !== '' ||
    locationQuery.trim() !== '' ||
    selectedContract !== 'ALL' ||
    selectedLicense !== 'ALL' ||
    selectedCountry !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    selectedSpecialty !== 'ALL' ||
    salaryFilter !== 'ALL';

  const clearFilters = () => {
    setKeyword('');
    setLocationQuery('');
    setSelectedContract('ALL');
    setSelectedLicense('ALL');
    setSelectedCountry('ALL');
    setSelectedDepartment('ALL');
    setSelectedSpecialty('ALL');
    setSalaryFilter('ALL');
    setSortBy('recent');
  };

  // Helper pour badge de contrat
  const getContractBadge = (contract) => {
    const c = (contract || '').toUpperCase();
    if (c.includes('CDI')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (c.includes('CDD')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (c.includes('INTÉR') || c.includes('INTER')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-orange-50 text-orange-700 border-orange-200';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white gap-3">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Chargement des offres d&apos;emploi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <section className="hero-section text-center">
        <div className="hero-pattern" />
        <div className="max-w-3xl mx-auto space-y-3 relative z-10 px-4">
          <div className="hero-badge">
            <Briefcase className="h-4 w-4 text-orange-500" />
            <span>Offres de Recrutement Direct Transport</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Offres d&apos;Emploi Chauffeurs Routiers
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Trouvez les meilleures opportunités en CDI, CDD et missions en <strong>France</strong>, <strong>Belgique</strong>, <strong>Luxembourg</strong> et <strong>Suisse</strong>. Filtrez précisément par département et postulez en direct.
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">

        {/* PANNEAU DE RECHERCHE & FILTRES MULTI-CRITÈRES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Barre principale 2 champs : Mot-clé & Ville */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            
            {/* Champ 1 : Métier / Mots-clés */}
            <div className="md:col-span-7 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Métier, mot-clé, entreprise (ex: Conducteur SPL, Frigo, Benne...)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-slate-50/50 focus:bg-white"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Champ 2 : Ville ou Code postal */}
            <div className="md:col-span-5 relative">
              <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Ville précise (ex: Lyon, Lille, Bruxelles, Genève...)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-slate-50/50 focus:bg-white"
              />
              {locationQuery && (
                <button
                  onClick={() => setLocationQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Rangée de Sélecteurs / Filtres Spécialisés avec Pays et Département */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2 border-t border-slate-100 text-xs">
            
            {/* Filtre 1 : Pays */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                🌍 Pays
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="ALL">Tous les pays</option>
                <option value="FR">France 🇫🇷</option>
                <option value="BE">Belgique 🇧🇪</option>
                <option value="LU">Luxembourg 🇱🇺</option>
                <option value="CH">Suisse 🇨🇭</option>
              </select>
            </div>

            {/* Filtre 2 : Département / Province / Canton dynamique */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1 truncate" title={currentRegionConfig.label}>
                <Navigation className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="truncate">{selectedCountry === 'BE' ? 'Province' : selectedCountry === 'CH' || selectedCountry === 'LU' ? 'Canton' : 'Département'}</span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer ${
                  selectedDepartment !== 'ALL'
                    ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <option value="ALL">{currentRegionConfig.allLabel}</option>
                {currentRegionConfig.options.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre 3 : Permis */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-orange-500" /> Permis
              </label>
              <select
                value={selectedLicense}
                onChange={(e) => setSelectedLicense(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="ALL">Tous les permis</option>
                <option value="CE">Permis CE (SPL)</option>
                <option value="C">Permis C (PL)</option>
                <option value="B">Permis B (VL)</option>
                <option value="ADR">ADR / Citerne</option>
              </select>
            </div>

            {/* Filtre 4 : Type de Contrat */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-orange-500" /> Contrat
              </label>
              <select
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="ALL">Tous contrats</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="INTERIM">Intérim</option>
              </select>
            </div>

            {/* Filtre 5 : Spécialité Matériel */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                📦 Spécialité
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="ALL">Toutes</option>
                <option value="TAUTLINER">Tautliner</option>
                <option value="FRIGO">Frigorifique</option>
                <option value="BENNE">Benne / TP</option>
                <option value="CITERNE">Citerne / Vrac</option>
                <option value="PLATEAU">Plateau</option>
                <option value="PORTE_VOITURE">Porte-voiture</option>
                <option value="CONVOI">Convoi exceptionnel</option>
                <option value="MESSAGERIE">Messagerie</option>
              </select>
            </div>

            {/* Filtre 6 : Salaire minimum */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                💶 Salaire
              </label>
              <select
                value={salaryFilter}
                onChange={(e) => setSalaryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="ALL">Tous</option>
                <option value="WITH_SALARY">Affiché</option>
                <option value="2200">&gt; 2 200 €</option>
                <option value="2600">&gt; 2 600 €</option>
                <option value="3000">&gt; 3 000 €</option>
              </select>
            </div>

            {/* Filtre 7 : Tri */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-orange-500" /> Tri
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="recent">Plus récentes</option>
                <option value="salary">Salaire max</option>
              </select>
            </div>

          </div>

          {/* Barre d'état des résultats & Réinitialisation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {filteredJobs.length} {filteredJobs.length > 1 ? 'offres trouvées' : 'offre trouvée'}
              </span>
              {hasActiveFilters && (
                <span className="text-slate-400">• avec filtres appliqués</span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-bold hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                <span>Réinitialiser tous les filtres</span>
              </button>
            )}
          </div>

        </div>

        {/* LISTE DES OFFRES D'EMPLOI */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white p-12 sm:p-16 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <Briefcase className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Aucune offre ne correspond à vos critères
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Essayez d&apos;élargir votre recherche en modifiant le département, le pays, ou la tranche de salaire.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>Effacer tous les filtres</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const contractBadgeClass = getContractBadge(job.contract_type);
              const formattedDate = new Date(job.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={job.id}
                  className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group"
                >
                  {/* Détails du poste */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${contractBadgeClass}`}
                      >
                        {job.contract_type}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.companies?.name || 'Entreprise Partenaire FretTalent'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-950 group-hover:text-orange-600 transition-colors">
                        {job.title}
                      </h3>
                    </div>

                    {/* Informations clés : Lieu, Salaire, Date */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl">
                        <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        {job.location}
                      </span>

                      {job.salary ? (
                        <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-xl">
                          💶 Rémunération : {job.salary}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Salaire selon profil</span>
                      )}

                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3.5 w-3.5" /> Publiée le {formattedDate}
                      </span>
                    </div>

                    {/* Description courte */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed max-w-3xl pt-1">
                      {job.description}
                    </p>
                  </div>

                  {/* Bouton de candidature */}
                  <div className="w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
                    <Link
                      href="/register?role=candidate"
                      className="w-full lg:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full text-xs font-black text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105 transition-all gap-2"
                    >
                      <span>Postuler en direct</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bannière Communauté Facebook */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 rounded-3xl p-7 sm:p-9 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-blue-800/40">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Alertes Offres Facebook
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Ne manquez aucune nouvelle offre d&apos;emploi
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Toutes les nouvelles annonces de transporteurs sont également publiées sur notre page Facebook officielle.
            </p>
          </div>
          <a
            href="https://www.facebook.com/profile.php?id=61593021909293"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold px-6 py-3.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Rejoindre la page Facebook
          </a>
        </div>

      </main>
    </div>
  );
}
