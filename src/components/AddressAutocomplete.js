'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';

export default function AddressAutocomplete({ 
  initialValue = '', 
  onAddressSelect,
  placeholder = "Saisissez une adresse complète...",
  required = false,
  className = "",
  country = "FR" // "FR" | "BE" | "LU" | "CH"
}) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Mettre à jour si initialValue change depuis l'extérieur
  useEffect(() => {
    if (initialValue && initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Fermer au clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const countryUpper = (country || 'FR').toUpperCase();

      if (countryUpper === 'FR') {
        // France (API Data.gouv - ultra rapide et précise)
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchTerm)}&limit=5`
        );
        const data = await response.json();
        if (data && data.features) {
          const formatted = data.features.map((feature) => ({
            id: feature.properties.id || `${feature.properties.postcode}-${feature.properties.city}`,
            name: feature.properties.name,
            city: feature.properties.city,
            postcode: feature.properties.postcode,
            fullLabel: feature.properties.label,
          }));
          setResults(formatted);
        }
      } else {
        // Belgique (BE), Luxembourg (LU), Suisse (CH) via Nominatim OpenStreetMap
        const countryCodeParam = countryUpper.toLowerCase();
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&addressdetails=1&limit=6&countrycodes=${countryCodeParam}`,
          { headers: { 'User-Agent': 'FretTalentApp/1.0 (contact@frettalent.fr)' } }
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          const formatted = data.map((item, idx) => {
            const addr = item.address || {};
            const street = addr.road || addr.pedestrian || addr.footway || addr.suburb || addr.neighbourhood || item.name || '';
            const houseNum = addr.house_number ? `${addr.house_number} ` : '';
            const streetAddr = `${houseNum}${street}`.trim() || item.display_name.split(',')[0];
            const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
            const postcode = addr.postcode || '';
            
            let label = streetAddr;
            if (postcode && city) {
              label = `${streetAddr ? `${streetAddr}, ` : ''}${postcode} ${city}`;
            } else if (city) {
              label = `${streetAddr ? `${streetAddr}, ` : ''}${city}`;
            } else {
              label = item.display_name;
            }
            
            return {
              id: item.place_id || idx,
              name: streetAddr || city,
              city: city,
              postcode: postcode,
              fullLabel: label,
            };
          });
          setResults(formatted);
        }
      }
    } catch (error) {
      console.error("Erreur API adresse:", error);
    } finally {
      setLoading(false);
    }
  };

  const [isVerified, setIsVerified] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setIsVerified(false);
    setSelectedDetails(null);
    
    // Transmettre la valeur tapée non vérifiée
    if (onAddressSelect) {
      onAddressSelect({
        address: val,
        city: '',
        postalCode: '',
        fullLabel: val,
        isVerified: false,
      });
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(val);
    }, 300);
  };

  const handleSelect = (item) => {
    setQuery(item.fullLabel);
    setIsOpen(false);
    setIsVerified(true);
    setSelectedDetails({ city: item.city, postcode: item.postcode });
    
    if (onAddressSelect) {
      onAddressSelect({
        address: item.name || item.fullLabel,
        city: item.city,
        postalCode: item.postcode,
        fullLabel: item.fullLabel,
        isVerified: true,
      });
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (query.length >= 3) setIsOpen(true); }}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-9 pr-9 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
            isVerified
              ? 'border-green-500 bg-green-50/20 focus:ring-green-500/20 focus:border-green-500 text-slate-900'
              : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 text-slate-900'
          } ${className}`}
        />
        {isVerified && (
          <div className="absolute right-3 text-green-500" title="Adresse officielle validée">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {isVerified && selectedDetails?.city && (
        <p className="text-[11px] font-bold text-green-600 mt-1 flex items-center gap-1">
          <span>✓ Adresse officielle validée :</span>
          <span className="text-slate-700">{selectedDetails.city} ({selectedDetails.postcode})</span>
        </p>
      )}

      {isOpen && (query.length >= 3) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-center text-slate-500">Recherche d'adresse en cours...</div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              <li className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Cliquez pour valider votre adresse exacte :
              </li>
              {results.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-2.5 hover:bg-orange-50 cursor-pointer flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.name || item.fullLabel}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.postcode} {item.city}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-center text-slate-500">
              Aucune adresse trouvée. Veuillez vérifier l'orthographe.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
