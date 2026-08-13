/**
 * Configuration et utilitaires des pays supportés par FretTalent :
 * - France (FR 🇫🇷)
 * - Belgique (BE 🇧🇪)
 * - Luxembourg (LU 🇱🇺)
 * - Suisse (CH 🇨🇭)
 */

export const COUNTRIES = {
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    idLabel: 'Numéro SIRET',
    idPlaceholder: '14 chiffres (ex: 12345678901234)',
    idExample: '123 456 789 01234',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '+33',
    postalCodeRegex: /^[0-9]{5}$/,
    postalCodePlaceholder: '75001',
  },
  BE: {
    code: 'BE',
    name: 'Belgique',
    flag: '🇧🇪',
    idLabel: 'Numéro BCE',
    idPlaceholder: '10 chiffres (ex: 0123456789 ou 0123.456.789)',
    idExample: '0123.456.789',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '+32',
    postalCodeRegex: /^[0-9]{4}$/,
    postalCodePlaceholder: '1000',
  },
  LU: {
    code: 'LU',
    name: 'Luxembourg',
    flag: '🇱🇺',
    idLabel: 'RCS ou Numéro TVA',
    idPlaceholder: 'RCS (ex: B123456) ou TVA (ex: LU12345678)',
    idExample: 'B123456 / LU12345678',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '+352',
    postalCodeRegex: /^[0-9]{4}$/,
    postalCodePlaceholder: '1234',
  },
  CH: {
    code: 'CH',
    name: 'Suisse',
    flag: '🇨🇭',
    idLabel: 'Numéro IDE / UID',
    idPlaceholder: 'ex: CHE-123.456.789 ou CHE123456789',
    idExample: 'CHE-123.456.789',
    currency: 'CHF',
    currencySymbol: 'CHF',
    phonePrefix: '+41',
    postalCodeRegex: /^[0-9]{4}$/,
    postalCodePlaceholder: '8001',
  },
};

export const COUNTRY_LIST = [
  COUNTRIES.FR,
  COUNTRIES.BE,
  COUNTRIES.LU,
  COUNTRIES.CH,
];

/**
 * Nettoie une chaîne d'identifiant d'entreprise
 */
export function cleanIdentifier(id) {
  if (!id) return '';
  return id.toString().trim().toUpperCase().replace(/[\s.-]/g, '');
}

/**
 * Détecte automatiquement le pays selon le format de l'identifiant d'entreprise saisi
 * @param {string} idInput 
 * @returns {'FR' | 'BE' | 'LU' | 'CH' | null}
 */
export function detectCountryFromId(idInput) {
  if (!idInput) return null;
  const raw = idInput.trim().toUpperCase();
  const clean = cleanIdentifier(raw);

  // Suisse : commence par CHE ou format CHE-xxx.xxx.xxx
  if (raw.startsWith('CHE') || clean.startsWith('CHE')) {
    return 'CH';
  }

  // Luxembourg TVA : commence par LU suivi de 8 chiffres
  if (clean.startsWith('LU') && /^LU\d{8}$/.test(clean)) {
    return 'LU';
  }

  // Luxembourg RCS : 1 lettre (A, B, C, D, E, F, G, J) + 1 à 6 chiffres (ex: B123456, A12345)
  if (/^[A-Z]\d{1,6}$/.test(clean) && !/^\d+$/.test(clean)) {
    return 'LU';
  }

  // Belgique BCE : 10 chiffres (commençant souvent par 0 ou 1) ou format 0123.456.789
  const digitsOnly = raw.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return 'BE';
  }

  // France SIRET : 14 chiffres
  if (digitsOnly.length === 14) {
    return 'FR';
  }

  return null;
}

/**
 * Valide le format de l'identifiant d'entreprise selon le pays
 */
export function validateCompanyIdFormat(countryCode, idValue) {
  if (!idValue) return { valid: false, message: "L'identifiant est obligatoire." };
  const clean = cleanIdentifier(idValue);
  const digitsOnly = idValue.replace(/\D/g, '');

  switch (countryCode) {
    case 'FR': {
      if (digitsOnly.length !== 14) {
        return { valid: false, message: 'Le numéro SIRET doit contenir exactement 14 chiffres.' };
      }
      return { valid: true, cleanValue: digitsOnly, type: 'SIRET' };
    }

    case 'BE': {
      if (digitsOnly.length !== 10) {
        return { valid: false, message: 'Le numéro BCE doit contenir exactement 10 chiffres.' };
      }
      return { valid: true, cleanValue: digitsOnly, type: 'BCE' };
    }

    case 'LU': {
      // Cas 1 : Numéro TVA (LU + 8 chiffres)
      if (/^LU\d{8}$/.test(clean)) {
        return { valid: true, cleanValue: clean, type: 'TVA_LU' };
      }
      // Cas 2 : RCS Luxembourg (Lettre + 1 à 6 chiffres, ex: B123456)
      if (/^[A-Z]\d{1,6}$/.test(clean)) {
        return { valid: true, cleanValue: clean, type: 'RCS_LU' };
      }
      // Cas 3 : 8 chiffres saisis pour la TVA sans préfixe LU
      if (/^\d{8}$/.test(clean)) {
        return { valid: true, cleanValue: `LU${clean}`, type: 'TVA_LU' };
      }
      return {
        valid: false,
        message: 'Format invalide. Saisissez un RCS (ex: B123456) ou un numéro de TVA (ex: LU12345678).',
      };
    }

    case 'CH': {
      // Format Suisse IDE : CHE-123.456.789 ou CHE123456789
      if (/^CHE\d{9}(TVA|MWST|IVA)?$/.test(clean)) {
        const baseDigits = clean.replace(/^CHE/, '').slice(0, 9);
        const formatted = `CHE-${baseDigits.slice(0, 3)}.${baseDigits.slice(3, 6)}.${baseDigits.slice(6, 9)}`;
        return { valid: true, cleanValue: formatted, type: 'IDE_CH' };
      }
      // 9 chiffres purs saisis
      if (/^\d{9}$/.test(clean)) {
        const formatted = `CHE-${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}`;
        return { valid: true, cleanValue: formatted, type: 'IDE_CH' };
      }
      return {
        valid: false,
        message: 'Le numéro IDE Suisse doit être au format CHE-123.456.789 (9 chiffres).',
      };
    }

    default:
      return { valid: false, message: 'Pays non supporté.' };
  }
}

/**
 * Formate un identifiant pour un affichage propre
 */
export function formatCompanyIdentifier(countryCode, rawId) {
  if (!rawId) return '';
  const clean = cleanIdentifier(rawId);
  const digits = rawId.replace(/\D/g, '');

  switch (countryCode) {
    case 'FR':
      if (digits.length === 14) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 14)}`;
      }
      return rawId;
    case 'BE':
      if (digits.length === 10) {
        return `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7, 10)}`;
      }
      return rawId;
    case 'LU':
      return clean;
    case 'CH':
      if (/^CHE\d{9}/.test(clean)) {
        const d = clean.replace(/^CHE/, '').slice(0, 9);
        return `CHE-${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}`;
      }
      return rawId;
    default:
      return rawId;
  }
}
