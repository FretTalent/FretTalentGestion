'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Truck,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  Filter,
  Users,
  Search,
  Sparkles,
  Award,
  FileCheck,
  CreditCard,
  Clock,
  ChevronRight,
  ExternalLink,
  Info,
  HelpCircle,
  Zap,
  Globe,
  Check,
  X,
} from 'lucide-react';
import { calculateAge } from '@/lib/country';

// Projection mathématique exacte Lambert-93 (EPSG:2154) calibrée sur le SVG officiel
function lonLatToLambert93(lonDeg, latDeg) {
  const deg2rad = Math.PI / 180;
  const lon = lonDeg * deg2rad;
  const lat = latDeg * deg2rad;

  const a = 6378137.0;
  const e = 0.08181919106;
  const lat1 = 44 * deg2rad;
  const lat2 = 49 * deg2rad;
  const lat0 = 46.5 * deg2rad;
  const lon0 = 3.0 * deg2rad;
  const X0 = 700000;
  const Y0 = 6600000;

  function m(phi) {
    return Math.cos(phi) / Math.sqrt(1 - e * e * Math.sin(phi) * Math.sin(phi));
  }

  function t(phi) {
    return Math.tan(Math.PI / 4 - phi / 2) / Math.pow((1 - e * Math.sin(phi)) / (1 + e * Math.sin(phi)), e / 2);
  }

  const m1 = m(lat1);
  const m2 = m(lat2);
  const t1 = t(lat1);
  const t2 = t(lat2);
  const t0 = t(lat0);

  const n = Math.log(m1 / m2) / Math.log(t1 / t2);
  const c = m1 / (n * Math.pow(t1, n));
  const rho0 = a * c * Math.pow(t0, n);

  const rho = a * c * Math.pow(t(lat), n);
  const gamma = n * (lon - lon0);

  const x = X0 + rho * Math.sin(gamma);
  const y = Y0 + rho0 - rho * Math.cos(gamma);

  return { x, y };
}

// Paramètres de cadrage 100% alignés avec public/france-belgique-map.svg
const L93_BMIN_X = 58778.815;
const L93_BMAX_Y = 7195945.389;
const L93_MAX_SPAN = 1253092.953;
const L93_OFFSET_X = 0;
const L93_OFFSET_Y = 34091.822;

function projectToSvgPct(lon, lat) {
  const l93 = lonLatToLambert93(lon, lat);
  const svgX = ((l93.x - L93_BMIN_X + L93_OFFSET_X) / L93_MAX_SPAN) * 100;
  const svgY = ((L93_BMAX_Y - l93.y + L93_OFFSET_Y) / L93_MAX_SPAN) * 100;
  return {
    x: Math.max(2, Math.min(98, svgX)),
    y: Math.max(2, Math.min(98, svgY)),
  };
}

export default function CandidatsDisponiblesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('ALL'); // 'ALL', 'FR', 'BE', 'LU', 'CH', 'VERIFIED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLicenseFilter, setSelectedLicenseFilter] = useState('');
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data) {
          setCandidates([]);
          return;
        }

        // Cache géocodage pour les 4 pays
        const coordsCache = {};
        const uniqueKeys = [
          ...new Set(
            data.map(c => `${c.country || 'FR'}_${c.postal_code || ''}_${c.city || ''}`)
          ),
        ];

        await Promise.all(
          uniqueKeys.map(async key => {
            const [cCountry, pc, city] = key.split('_');
            const searchTerms = [];
            if (pc && pc !== '00000') searchTerms.push(pc);
            if (city && city !== 'Non renseigné' && city !== 'Ville non renseignée') searchTerms.push(city);

            if (searchTerms.length === 0) return;

            const query = searchTerms.join(' ');

            try {
              if (cCountry === 'BE' || cCountry === 'LU' || cCountry === 'CH') {
                const countryCodeParam = cCountry.toLowerCase();
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=${countryCodeParam}&limit=1`,
                  { headers: { 'User-Agent': 'FretTalentApp/1.0 (contact@frettalent.fr)' } }
                );
                if (!res.ok) return;
                const json = await res.json();
                if (json && json.length > 0) {
                  coordsCache[key] = { lon: parseFloat(json[0].lon), lat: parseFloat(json[0].lat) };
                }
              } else {
                const res = await fetch(
                  `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=1`,
                );
                if (!res.ok) return;
                const json = await res.json();
                if (json.features && json.features.length > 0) {
                  const [lon, lat] = json.features[0].geometry.coordinates;
                  coordsCache[key] = { lon, lat };
                }
              }
            } catch (e) {
              console.error('Erreur géocodage pour ' + key, e);
            }
          })
        );

        const postalCounts = {};

        const mappedCandidates = data
          .map(c => {
            const key = `${c.country || 'FR'}_${c.postal_code || ''}_${c.city || ''}`;
            const coords = coordsCache[key];
            if (!coords) return null;

            const proj = projectToSvgPct(coords.lon, coords.lat);

            // Décalage en rosace dorée pour éviter le chevauchement exact
            const idxInGroup = postalCounts[key] || 0;
            postalCounts[key] = idxInGroup + 1;

            let offsetX = 0;
            let offsetY = 0;
            if (idxInGroup > 0) {
              const angle = idxInGroup * 2.39996;
              const distance = 0.35 * Math.sqrt(idxInGroup);
              offsetX = Math.cos(angle) * distance;
              offsetY = Math.sin(angle) * distance;
            }

            const x = Math.max(3, Math.min(97, proj.x + offsetX));
            const y = Math.max(3, Math.min(97, proj.y + offsetY));

            const docs = c.documents || {};
            const isDocPresent = (k, legacyKey) => !!docs[k] || (legacyKey && !!docs[legacyKey]);
            const allDocsPresent =
              isDocPresent('cv') &&
              isDocPresent('permis_recto', 'permis') &&
              isDocPresent('permis_verso', 'permis') &&
              isDocPresent('chrono_recto', 'chrono') &&
              isDocPresent('chrono_verso', 'chrono') &&
              isDocPresent('fimo_recto', 'fimo') &&
              isDocPresent('fimo_verso', 'fimo');
            const isAvailable = c.is_active && c.availability && c.availability !== '';
            const fullVerified = c.validated && allDocsPresent && isAvailable;

            return {
              id: c.id,
              fullName: c.full_name || 'Chauffeur Routier',
              city: c.city || 'Ville non renseignée',
              postalCode: c.postal_code || '',
              country: c.country || 'FR',
              x,
              y,
              fullVerified,
              licenses: c.licenses || [],
              certifications: c.certifications || [],
              jobPreferences: c.job_preferences || [],
              experience: c.experience_years ? `${c.experience_years} an(s)` : 'Expérimenté',
              birthDate: c.birth_date,
              availability: c.availability || 'Disponible',
              radius: c.mobility_radius ? `${c.mobility_radius} km` : '50 km',
              adr: c.adr_basic || c.adr_tanker,
              fimo: !!c.fimo,
              created_at: c.created_at,
            };
          })
          .filter(Boolean);

        setCandidates(mappedCandidates);
      } catch (err) {
        console.error('Erreur chargement candidats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Filtrage combiné (Pays, Recherche texte, Permis)
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Filtre pays / vérifié
      if (activeCountry === 'VERIFIED' && !c.fullVerified) return false;
      if (activeCountry !== 'ALL' && activeCountry !== 'VERIFIED' && c.country !== activeCountry) return false;

      // Filtre permis
      if (selectedLicenseFilter && (!Array.isArray(c.licenses) || !c.licenses.includes(selectedLicenseFilter))) {
        return false;
      }

      // Filtre recherche textuelle (ville, code postal, spécialités)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const cityMatch = (c.city || '').toLowerCase().includes(query);
        const postalMatch = (c.postalCode || '').includes(query);
        const licenseMatch = (c.licenses || []).some(l => l.toLowerCase().includes(query));
        const certMatch = (c.certifications || []).some(cert => cert.toLowerCase().includes(query));
        const prefMatch = (c.jobPreferences || []).some(p => p.toLowerCase().includes(query));

        if (!cityMatch && !postalMatch && !licenseMatch && !certMatch && !prefMatch) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, activeCountry, selectedLicenseFilter, searchQuery]);

  // Statistiques par pays
  const countFR = candidates.filter(c => c.country === 'FR').length;
  const countBE = candidates.filter(c => c.country === 'BE').length;
  const countLU = candidates.filter(c => c.country === 'LU').length;
  const countCH = candidates.filter(c => c.country === 'CH').length;
  const countVerified = candidates.filter(c => c.fullVerified).length;
  const countSPL = candidates.filter(c => (c.licenses || []).includes('CE') || (c.licenses || []).includes('SPL')).length;

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* HERO SECTION DYNAMIQUE */}
      <section className="relative overflow-hidden py-14 md:py-20 bg-gradient-to-b from-orange-50/40 via-white to-white border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-orange-200 shadow-2xs animate-float">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
            </span>
            <span>Réseau Temps Réel • France, Suisse, Belgique & Luxembourg</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
            Chauffeurs Routiers Disponibles{' '}
            <span className="text-orange-500 relative">
              en Direct
              <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-200/60 -z-10 rounded-full" />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Visualisez et débloquez directement les conducteurs qualifiés (SPL, PL, Benne, Frigo, Citerne ADR) avec justificatifs vérifiés sans passer par une agence d&apos;intérim.
          </p>

          {/* COMPTEURS RAPIDES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 max-w-4xl mx-auto">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-center card-hover-effect">
              <div className="text-2xl sm:text-3xl font-black text-slate-950">{loading ? '...' : candidates.length}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Chauffeurs actifs</div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-2xs text-center bg-gradient-to-br from-white to-emerald-50/50 card-hover-effect">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center justify-center gap-1">
                {loading ? '...' : countVerified}
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-xs text-emerald-800 font-bold mt-0.5">100% Vérifiés 🛡️</div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-center card-hover-effect">
              <div className="text-2xl sm:text-3xl font-black text-orange-600">{loading ? '...' : countSPL}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Permis CE (SPL)</div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-center card-hover-effect">
              <div className="text-lg sm:text-xl font-black text-slate-950 flex items-center justify-center gap-1.5">
                <span>🇫🇷 {countFR}</span>
                <span>🇧🇪 {countBE}</span>
                <span>🇨🇭 {countCH}</span>
                <span>🇱🇺 {countLU}</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">4 Pays Couverts</div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION PRINCIPALE : FILTRES & CARTE */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* BARRE DE FILTRAGE MULTI-CRITÈRES */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Barre de recherche texte */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une ville, un code postal, une spécialité (ex: Frigo, 59, Benne)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sélecteur de Permis */}
            <div className="w-full md:w-56 shrink-0">
              <select
                value={selectedLicenseFilter}
                onChange={(e) => setSelectedLicenseFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">Tous les permis</option>
                <option value="CE">Permis CE (Super Poids Lourd - SPL)</option>
                <option value="C">Permis C (Poids Lourd - PL)</option>
                <option value="B">Permis B (Véhicule Léger)</option>
              </select>
            </div>

          </div>

          {/* Onglets rapides par pays */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {[
              { id: 'ALL', label: 'Tous les profils', count: candidates.length },
              { id: 'FR', label: '🇫🇷 France', count: countFR },
              { id: 'BE', label: '🇧🇪 Belgique', count: countBE },
              { id: 'LU', label: '🇱🇺 Luxembourg', count: countLU },
              { id: 'CH', label: '🇨🇭 Suisse', count: countCH },
              { id: 'VERIFIED', label: '🛡️ 100% Vérifiés', count: countVerified },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCountry(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeCountry === tab.id
                    ? 'bg-slate-950 text-white shadow-sm scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    activeCountry === tab.id ? 'bg-orange-500 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* CONTAINER CARTE + VOLET LISTE */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-8 shadow-xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CARTE INTERACTIVE SVG (7 COLONNES) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-[580px] aspect-square relative rounded-3xl bg-slate-950 border border-slate-800 p-2 sm:p-4 shadow-2xl overflow-hidden flex items-center justify-center">
                
                {/* Cadre 1:1 parfait pour synchroniser le SVG et les coordonnées GPS */}
                <div className="relative w-full h-full aspect-square">
                  
                  {/* SVG Carte */}
                  <img
                    src="/france-belgique-map.svg"
                    alt="Carte des chauffeurs routiers France, Belgique, Luxembourg et Suisse"
                    className="absolute inset-0 w-full h-full object-fill opacity-80 select-none pointer-events-none filter drop-shadow-md"
                  />

                  {/* Légende en haut de la carte */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-2.5 z-20 pointer-events-none shadow-md">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                      100% Vérifié
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(249,115,22,0.9)]" />
                      Chauffeur actif
                    </span>
                  </div>

                  {/* Radar points interactifs */}
                {!loading &&
                  filteredCandidates.map(candidate => {
                    const isHovered = hoveredCandidate?.id === candidate.id;
                    const isSelected = selectedCandidate?.id === candidate.id;
                    const isActive = isHovered || isSelected;

                    const isTop = candidate.y < 35;
                    const isLeft = candidate.x < 22;
                    const isRight = candidate.x > 78;

                    const verticalPos = isTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5';
                    let horizontalPos = 'left-1/2 -translate-x-1/2';
                    if (isLeft) horizontalPos = 'left-0 translate-x-0';
                    else if (isRight) horizontalPos = 'right-0 translate-x-0';

                    return (
                      <div
                        key={candidate.id}
                        style={{ left: `${candidate.x}%`, top: `${candidate.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2 -m-2 transition-all ${
                          isActive ? 'z-50' : 'z-10'
                        }`}
                        onMouseEnter={() => setHoveredCandidate(candidate)}
                        onMouseLeave={() => setHoveredCandidate(null)}
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        {/* Ping Radar */}
                        <div
                          className={`absolute inset-0 m-auto rounded-full animate-ping opacity-50 pointer-events-none ${
                            candidate.fullVerified ? 'bg-emerald-400' : 'bg-orange-500'
                          }`}
                          style={{ width: '14px', height: '14px' }}
                        />

                        {/* Pastille */}
                        <div
                          className={`relative rounded-full border border-white/95 transition-all duration-300 ${
                            candidate.fullVerified
                              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                              : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.9)]'
                          } ${
                            isActive
                              ? 'scale-175 ring-4 ring-orange-500/60 z-10'
                              : 'scale-100 hover:scale-150'
                          }`}
                          style={{ width: '8px', height: '8px' }}
                        />

                        {/* Bulle info survol */}
                        {isHovered && (
                          <div
                            className={`absolute ${verticalPos} ${horizontalPos} w-60 bg-slate-950 text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 text-xs pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-black text-white truncate">{candidate.city}</span>
                              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-orange-400 font-bold">
                                {candidate.postalCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-300">
                              <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
                              <span>Rayon de mobilité : {candidate.radius}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="font-bold text-orange-400">
                                {candidate.licenses?.join(', ') || 'Permis C/CE'}
                              </span>
                              {candidate.fullVerified ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5 shrink-0">
                                  <ShieldCheck className="h-3 w-3" /> Vérifié 🛡️
                                </span>
                              ) : (
                                <span className="text-slate-400 shrink-0">Actif</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* VOLET LISTE DE PROFILS (5 COLONNES) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    Candidats trouvés ({filteredCandidates.length})
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-2">
                    {activeCountry === 'ALL'
                      ? 'Tous les conducteurs disponibles'
                      : activeCountry === 'VERIFIED'
                      ? 'Conducteurs 100% Vérifiés 🛡️'
                      : `Conducteurs en ${
                          activeCountry === 'FR'
                            ? 'France'
                            : activeCountry === 'BE'
                            ? 'Belgique'
                            : activeCountry === 'LU'
                            ? 'Luxembourg'
                            : 'Suisse'
                        }`}
                  </h2>
                </div>
              </div>

              {/* LISTE DÉFILANTE */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredCandidates.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2">
                    <Users className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-semibold">Aucun chauffeur ne correspond à vos filtres actuels.</p>
                    <button
                      onClick={() => {
                        setActiveCountry('ALL');
                        setSearchQuery('');
                        setSelectedLicenseFilter('');
                      }}
                      className="text-orange-600 font-bold text-xs hover:underline"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  </div>
                ) : (
                  filteredCandidates.map(c => {
                    const isHovered = hoveredCandidate?.id === c.id;
                    const isSelected = selectedCandidate?.id === c.id;

                    return (
                      <div
                        key={c.id}
                        onMouseEnter={() => setHoveredCandidate(c)}
                        onMouseLeave={() => setHoveredCandidate(null)}
                        onClick={() => setSelectedCandidate(c)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer card-hover-effect ${
                          isHovered || isSelected
                            ? 'bg-orange-50/70 border-orange-400 shadow-md ring-2 ring-orange-500/20'
                            : 'bg-white border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                {c.country === 'BE' ? '🇧🇪 Belgique' : c.country === 'LU' ? '🇱🇺 Luxembourg' : c.country === 'CH' ? '🇨🇭 Suisse' : '🇫🇷 France'}
                              </span>
                              <h3 className="font-black text-sm text-slate-900">
                                Chauffeur {c.city} ({c.postalCode})
                              </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 pt-1">
                              {c.birthDate && calculateAge(c.birthDate) && (
                                <span className="bg-slate-100 text-slate-800 font-extrabold px-2 py-0.5 rounded-md text-[11px]">
                                  {calculateAge(c.birthDate)} ans
                                </span>
                              )}
                              <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                {c.licenses?.length > 0 ? c.licenses.join(', ') : 'Permis C/CE'}
                              </span>
                              <span>• Exp : <strong>{c.experience}</strong></span>
                              <span>• Rayon : <strong>{c.radius}</strong></span>
                            </div>
                          </div>

                          {c.fullVerified ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              100% Vérifié
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full shrink-0">
                              Disponible
                            </span>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 text-[11px]">
                            Disponibilité : <strong className="text-slate-800">{c.availability}</strong>
                          </span>
                          <Link
                            href="/login"
                            className="inline-flex items-center gap-1 text-orange-600 font-black text-xs hover:text-orange-700 hover:underline"
                          >
                            <Lock className="h-3 w-3" />
                            <span>Débloquer (2€)</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* BOUTON RECRUTEUR CTA */}
              <div className="pt-2">
                <Link
                  href="/register?role=recruiter"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider hover:scale-105"
                >
                  <Search className="h-4 w-4" />
                  <span>Accéder à la CVthèque complète & débloquer</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* LEXIQUE & GUIDE DES CRITÈRES DE VÉRIFICATION */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
              <Info className="h-3.5 w-3.5" />
              <span>Guide & Lexique Officiel FretTalent</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Des qualifications contrôlées pour des embauches sans risque
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pour vous garantir des recrutements sereins, chaque profil est modéré manuellement selon les normes du transport routier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* CARTE 1 : 100% VÉRIFIÉ */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 card-hover-effect">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Badge « 100% Vérifié » 🛡️
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ce badge certifie que notre équipe administrative a contrôlé manuellement les pièces officielles : pièce d&apos;identité, permis recto/verso, carte chrono active et attestation FIMO/FCO valide.
              </p>
            </div>

            {/* CARTE 2 : PERMIS C & CE */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 card-hover-effect">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Permis C & CE (PL / SPL)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Permis C</strong> : Véhicules isolés affectés au transport de marchandises &gt; 3,5 tonnes (Porteur).<br />
                <strong>Permis CE</strong> : Ensembles de véhicules articulés avec semi-remorque (Tracteur + Semi) ou train routier.
              </p>
            </div>

            {/* CARTE 3 : FIMO & FCO */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 card-hover-effect">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                FIMO & FCO Marchandises
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>FIMO</strong> : Formation Initiale Minimale Obligatoire pour débuter dans le transport.<br />
                <strong>FCO</strong> : Formation Continue Obligatoire renouvelée tous les 5 ans pour actualiser la sécurité routière.
              </p>
            </div>

            {/* CARTE 4 : CARTE CHRONOTACHYGRAPHE */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 card-hover-effect">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Carte Chronotachygraphe
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Carte à puce numérique nominative obligatoire enregistrant les temps de conduite, de repos et de travail effectif du conducteur selon la réglementation européenne RSE.
              </p>
            </div>

            {/* CARTE 5 : HABILITATIONS ADR */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 card-hover-effect">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Certifications ADR
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Certificat de formation pour le transport de marchandises dangereuses : <strong>ADR de base</strong> (colis, fûts) et spécialisations <strong>ADR Citerne</strong> (carburants, chimie, gaz).
              </p>
            </div>

            {/* CARTE 6 : RAYON DE MOBILITÉ */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 card-hover-effect">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Rayon de Mobilité & Découchés
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Définit le périmètre kilométrique d&apos;intervention accepté autour du domicile du chauffeur (ex: 30 km, 50 km, Régional, National avec découchés ou International).
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* BANNIÈRE FINALE DOUBLE CONVERSION */}
      <section className="py-16 bg-slate-950 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <span className="bg-orange-500/20 text-orange-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-500/30">
              Recrutement Direct & Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Rejoignez le réseau FretTalent aujourd&apos;hui
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Zéro agence d&apos;intérim, zéro commission sur salaire. Contact direct et réactif pour tous les professionnels du transport routier.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/register?role=recruiter"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-3.5 rounded-full text-xs transition-all shadow-xl shadow-orange-500/25 hover:scale-105 text-center"
            >
              Je recrute des chauffeurs
            </Link>
            <Link
              href="/register?role=candidate"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3.5 rounded-full text-xs transition-all text-center"
            >
              Je suis chauffeur (Gratuit)
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
