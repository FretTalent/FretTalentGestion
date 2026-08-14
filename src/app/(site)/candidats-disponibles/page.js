'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function CandidatsDisponiblesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('ALL'); // 'ALL', 'FR', 'BE', 'LU', 'CH', 'VERIFIED'
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
        const uniqueKeys = [...new Set(data.map(c => `${c.country || 'FR'}_${c.postal_code}`))];

        await Promise.all(
          uniqueKeys.map(async key => {
            const [cCountry, pc] = key.split('_');
            if (!pc || pc === '00000') return;
            try {
              if (cCountry === 'BE' || cCountry === 'LU' || cCountry === 'CH') {
                const countryCodeParam = cCountry.toLowerCase();
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pc)}&format=json&countrycodes=${countryCodeParam}&limit=1`,
                  { headers: { 'User-Agent': 'FretTalentApp/1.0 (contact@frettalent.fr)' } }
                );
                if (!res.ok) return;
                const json = await res.json();
                if (json && json.length > 0) {
                  coordsCache[key] = { lon: parseFloat(json[0].lon), lat: parseFloat(json[0].lat) };
                }
              } else {
                const res = await fetch(
                  `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(pc)}&type=municipality&limit=1`,
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

        // Bounding box géographique multi-pays (France, Belgique, Luxembourg, Suisse)
        const minLon = -5.5;
        const maxLon = 10.6;
        const minLat = 41.2;
        const maxLat = 51.8;

        const mappedCandidates = data
          .map(c => {
            const key = `${c.country || 'FR'}_${c.postal_code}`;
            const coords = coordsCache[key];
            if (!coords) return null;

            const x = ((coords.lon - minLon) / (maxLon - minLon)) * 100;
            const y = 100 - ((coords.lat - minLat) / (maxLat - minLat)) * 100;

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
              x: Math.max(4, Math.min(96, x)),
              y: Math.max(4, Math.min(96, y)),
              fullVerified,
              licenses: c.licenses || [],
              experience: c.experience_years ? `${c.experience_years} an(s)` : 'Expérimenté',
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

  // Filtrage selon l'onglet actif
  const filteredCandidates = candidates.filter(c => {
    if (activeCountry === 'ALL') return true;
    if (activeCountry === 'VERIFIED') return c.fullVerified;
    return c.country === activeCountry;
  });

  // Statistiques par pays
  const countFR = candidates.filter(c => c.country === 'FR').length;
  const countBE = candidates.filter(c => c.country === 'BE').length;
  const countLU = candidates.filter(c => c.country === 'LU').length;
  const countCH = candidates.filter(c => c.country === 'CH').length;
  const countVerified = candidates.filter(c => c.fullVerified).length;

  return (
    <div className="bg-slate-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* EN-TÊTE PRINCIPAL */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100/80 text-orange-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-orange-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
            </span>
            Réseau Temps Réel
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Chauffeurs Routiers Disponibles en Direct
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Consultez la géolocalisation en temps réel de nos conducteurs poids lourds (PL & SPL) qualifiés en <strong>France</strong>, <strong>Belgique</strong>, <strong>Luxembourg</strong> et <strong>Suisse</strong>.
          </p>

          {/* COMPTEURS RAPIDES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-slate-950">{loading ? '...' : candidates.length}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Chauffeurs inscrits</div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm text-center bg-gradient-to-br from-white to-emerald-50/40">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center justify-center gap-1">
                {loading ? '...' : countVerified}
                <ShieldCheck className="h-5 w-5 text-emerald-500 inline" />
              </div>
              <div className="text-xs text-emerald-800 font-semibold mt-0.5">100% Vérifiés</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-xl sm:text-2xl font-black text-slate-950">{loading ? '...' : countFR} <span className="text-xs text-slate-400 font-medium">FR</span> | {loading ? '...' : countBE} <span className="text-xs text-slate-400 font-medium">BE</span></div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">France & Belgique</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-xl sm:text-2xl font-black text-slate-950">{loading ? '...' : countLU} <span className="text-xs text-slate-400 font-medium">LU</span> | {loading ? '...' : countCH} <span className="text-xs text-slate-400 font-medium">CH</span></div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Luxembourg & Suisse</div>
            </div>
          </div>
        </div>

        {/* BARRE D'ONGLETS / FILTRES PAYS */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'ALL', label: 'Tous les pays', count: candidates.length },
            { id: 'FR', label: 'France', count: countFR },
            { id: 'BE', label: 'Belgique', count: countBE },
            { id: 'LU', label: 'Luxembourg', count: countLU },
            { id: 'CH', label: 'Suisse', count: countCH },
            { id: 'VERIFIED', label: '100% Vérifiés', count: countVerified },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCountry(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeCountry === tab.id
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeCountry === tab.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* SECTION CARTE ET LISTE INTERACTIVE */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-8 shadow-xl shadow-slate-200/50 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* CARTE INTERACTIVE SVG (7 COLONNES) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-[560px] aspect-square relative rounded-3xl bg-slate-900/95 border border-slate-800 p-4 shadow-2xl overflow-hidden">
                
                {/* Image SVG de la carte */}
                <img
                  src="/france-belgique-map.svg"
                  alt="Carte de France, Belgique, Luxembourg et Suisse"
                  className="w-full h-full object-contain opacity-70 select-none pointer-events-none filter drop-shadow-md"
                />

                {/* Légende en haut de la carte */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    100% Vérifié
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                    Chauffeur actif
                  </span>
                </div>

                {/* Points géolocalisés des candidats */}
                {!loading &&
                  filteredCandidates.map(candidate => {
                    const isHovered = hoveredCandidate?.id === candidate.id;
                    const isSelected = selectedCandidate?.id === candidate.id;
                    const isActive = isHovered || isSelected;

                    // Positionnement intelligent de l'info-bulle pour éviter tout rognage par les bords
                    const isTop = candidate.y < 35; // Au Nord (Lille, Belgique...) -> bulle vers le bas
                    const isLeft = candidate.x < 22; // À l'Ouest (Brest...) -> alignement gauche
                    const isRight = candidate.x > 78; // À l'Est (Strasbourg, frontière suisse...) -> alignement droite

                    const verticalPos = isTop ? 'top-full mt-3' : 'bottom-full mb-3';
                    let horizontalPos = 'left-1/2 -translate-x-1/2';
                    if (isLeft) {
                      horizontalPos = 'left-0 translate-x-0';
                    } else if (isRight) {
                      horizontalPos = 'right-0 translate-x-0';
                    }

                    return (
                      <div
                        key={candidate.id}
                        style={{ left: `${candidate.x}%`, top: `${candidate.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                          isActive ? 'z-50' : 'z-10'
                        }`}
                        onMouseEnter={() => setHoveredCandidate(candidate)}
                        onMouseLeave={() => setHoveredCandidate(null)}
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        {/* Onde radar animée */}
                        <div
                          className={`absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none ${
                            candidate.fullVerified ? 'bg-emerald-400' : 'bg-orange-500'
                          }`}
                          style={{ width: '18px', height: '18px', left: '-5px', top: '-5px' }}
                        ></div>

                        {/* Pastille principale */}
                        <div
                          className={`relative rounded-full border-2 transition-transform duration-300 shadow-md ${
                            candidate.fullVerified
                              ? 'bg-emerald-500 border-white text-white'
                              : 'bg-orange-500 border-white text-white'
                          } ${isActive ? 'scale-150 ring-4 ring-orange-500/40 z-10' : 'scale-100 hover:scale-125'}`}
                          style={{ width: '14px', height: '14px' }}
                        ></div>

                        {/* Info-bulle flottante au survol */}
                        {isHovered && (
                          <div
                            className={`absolute ${verticalPos} ${horizontalPos} w-56 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-slate-700/80 text-xs pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-200`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-white truncate">{candidate.city}</span>
                              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">
                                {candidate.postalCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-300">
                              <MapPin className="h-3 w-3 text-orange-400 flex-shrink-0" />
                              <span>Mobilité : {candidate.radius}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-orange-400 truncate max-w-[120px]">
                                {candidate.licenses?.join(', ') || 'Permis C/CE'}
                              </span>
                              {candidate.fullVerified ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5 shrink-0">
                                  <ShieldCheck className="h-3 w-3" /> Vérifié
                                </span>
                              ) : (
                                <span className="text-slate-400 shrink-0">Disponible</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* VOLET DÉTAILS ET LISTE DE PROFILS (5 COLONNES) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  Exploration instantanée
                </span>
                <h2 className="text-2xl font-black text-slate-950 mt-2">
                  {activeCountry === 'ALL'
                    ? 'Tous les profils récents'
                    : activeCountry === 'VERIFIED'
                      ? 'Profils certifiés 100% Vérifiés'
                      : `Chauffeurs disponibles en ${
                          activeCountry === 'FR'
                            ? 'France'
                            : activeCountry === 'BE'
                              ? 'Belgique'
                              : activeCountry === 'LU'
                                ? 'Luxembourg'
                                : 'Suisse'
                        }`}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Survolez les points sur la carte ou parcourez la liste ci-dessous.
                </p>
              </div>

              {/* LISTE DES CANDIDATS */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredCandidates.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                    Aucun chauffeur disponible pour ce filtre actuellement.
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
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isHovered || isSelected
                            ? 'bg-orange-50/80 border-orange-300 shadow-md scale-[1.01]'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {c.country === 'BE' ? 'Belgique' : c.country === 'LU' ? 'Luxembourg' : c.country === 'CH' ? 'Suisse' : 'France'}
                              </span>
                              <h3 className="font-bold text-sm text-slate-900">
                                Chauffeur {c.city} ({c.postalCode})
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                                {c.licenses?.length > 0 ? c.licenses.join(', ') : 'Permis C/CE'}
                              </span>
                              <span>• Exp : {c.experience}</span>
                              <span>• Rayon : {c.radius}</span>
                            </div>
                          </div>

                          {c.fullVerified ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 flex-shrink-0">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              100% Vérifié
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0">
                              Disponible
                            </span>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">
                            Disponibilité : <strong className="text-slate-700">{c.availability}</strong>
                          </span>
                          <Link
                            href="/login"
                            className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 hover:underline"
                          >
                            <Lock className="h-3 w-3" />
                            Débloquer coordonnées
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* BOUTON CTA RECRUTEUR */}
              <div className="pt-2">
                <Link
                  href="/entreprises"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm"
                >
                  <Search className="h-4 w-4" />
                  <span>Accéder à la CVthèque complète & débloquer</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* LEXIQUE & GUIDE DES CRITÈRES DE VÉRIFICATION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
              <Info className="h-3.5 w-3.5" />
              Guide & Lexique FretTalent
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Comprendre les qualifications et garanties de nos chauffeurs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pour vous garantir des recrutements sereins et sans mauvaises surprises, chaque profil respecte un standard strict de qualification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            
            {/* CARTE 1 : 100% VÉRIFIÉ */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Badge « 100% Vérifié »
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ce badge certifie que notre équipe administrative a contrôlé manuellement les pièces officielles du conducteur : pièce d'identité, permis recto/verso, carte chrono active et attestation FIMO/FCO valide.
              </p>
            </div>

            {/* CARTE 2 : PERMIS C & CE */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Permis C & CE (PL / SPL)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Permis C</strong> : Véhicules isolés affectés au transport de marchandises de plus de 3,5 tonnes (Porteur).<br />
                <strong>Permis CE</strong> : Ensembles de véhicules articulés avec semi-remorque (Tracteur + Semi) ou train routier.
              </p>
            </div>

            {/* CARTE 3 : FIMO & FCO */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                FIMO & FCO Marchandises
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>FIMO</strong> : Formation Initiale Minimale Obligatoire pour débuter dans le transport de marchandises.<br />
                <strong>FCO</strong> : Formation Continue Obligatoire renouvelée tous les 5 ans pour actualiser les compétences de sécurité routière.
              </p>
            </div>

            {/* CARTE 4 : CARTE CHRONOTACHYGRAPHE */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Carte Chronotachygraphe
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Carte à puce nominative obligatoire enregistrant les temps de conduite, de repos et de travail effectif du chauffeur conformément à la réglementation européenne RSE.
              </p>
            </div>

            {/* CARTE 5 : HABILITATIONS ADR */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Certifications ADR
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Certificat de formation pour le transport de marchandises dangereuses : <strong>ADR de base</strong> (colis, fûts) et spécialisations <strong>ADR Citerne</strong> (carburants, produits chimiques, gaz).
              </p>
            </div>

            {/* CARTE 6 : RAYON DE MOBILITÉ */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Rayon de Mobilité & Découchés
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Définit le périmètre kilométrique d'intervention accepté autour du domicile du chauffeur (ex: 30 km, 50 km, Régional, National avec découchés ou International).
              </p>
            </div>

          </div>
        </div>

        {/* SECTION BANNIÈRE D'APPEL À L'ACTION (CTA DOUBLE) */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="bg-orange-500/20 text-orange-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-500/30">
                Vous recrutez ou cherchez un poste ?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Rejoignez le premier réseau de transport direct
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Zéro agence d'intérim, zéro commission sur salaire. Un accès direct aux coordonnées des chauffeurs pour les entreprises, et une visibilité gratuite pour les conducteurs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
              <Link
                href="/register?role=recruiter"
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-4 rounded-full text-sm transition-all shadow-lg shadow-orange-500/30 text-center hover:scale-105"
              >
                Inscription Entreprise (Recruter)
              </Link>
              <Link
                href="/register?role=candidate"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-6 py-4 rounded-full text-sm transition-all text-center hover:text-white"
              >
                Créer mon profil Chauffeur (Gratuit)
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
