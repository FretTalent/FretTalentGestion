'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';

export default function AddressAutocomplete({ 
  initialValue = '', 
  onAddressSelect,
  placeholder = "Saisissez une adresse complète...",
  required = false,
  className = ""
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
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchTerm)}&limit=5`);
      const data = await response.json();
      if (data && data.features) {
        setResults(data.features);
      }
    } catch (error) {
      console.error("Erreur API adresse:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    
    // Vider les données sélectionnées si l'utilisateur modifie
    if (onAddressSelect) {
      onAddressSelect({
        address: val, // on garde au moins ce qui est tapé manuellement
        city: '',
        postalCode: '',
        fullLabel: val
      });
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(val);
    }, 300);
  };

  const handleSelect = (feature) => {
    const { label, name, city, postcode } = feature.properties;
    setQuery(label);
    setIsOpen(false);
    
    if (onAddressSelect) {
      onAddressSelect({
        address: name, // Nom de voie + numéro
        city: city,
        postalCode: postcode,
        fullLabel: label
      });
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (query.length >= 3) setIsOpen(true); }}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all ${className}`}
        />
      </div>

      {isOpen && (query.length >= 3) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-center text-slate-500">Recherche...</div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((feature) => (
                <li
                  key={feature.properties.id}
                  onClick={() => handleSelect(feature)}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">
                      {feature.properties.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {feature.properties.postcode} {feature.properties.city}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-center text-slate-500">
              Aucune adresse trouvée
            </div>
          )}
        </div>
      )}
    </div>
  );
}
