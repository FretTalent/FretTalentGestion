/**
 * Configuration et utilitaires des pays supportés par FretTalent :
 * - France (FR)
 * - Belgique (BE)
 * - Luxembourg (LU)
 * - Suisse (CH)
 */

export const COUNTRIES = {
  FR: {
    code: 'FR',
    name: 'France',
    flag: '',
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
    flag: '',
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
    flag: '',
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
    flag: '',
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
 * Liste des faux numéros / séquences de test interdits
 */
const FAKE_PHONE_PATTERNS = [
  /^(\d)\1+$/, // Tous les chiffres identiques: 0000000000, 1111111111, etc.
  /^0123456789$/,
  /^0987654321$/,
  /^0600000000$/,
  /^0700000000$/,
  /^0612345678$/,
  /^0712345678$/,
  /^0102030405$/,
  /^0601020304$/,
  /^0701020304$/,
  /^0400000000$/,
  /^0412345678$/,
  /^1234567890$/,
];

/**
 * Valide rigoureusement un numéro de téléphone réel pour France, Belgique, Luxembourg, Suisse
 * @param {string} phone 
 * @param {'FR' | 'BE' | 'LU' | 'CH'} countryCode 
 * @returns {{ valid: boolean, message?: string, formatted?: string }}
 */
export function validatePhoneNumber(phone, countryCode = 'FR') {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { valid: false, message: 'Le numéro de téléphone est obligatoire.' };
  }

  // Nettoyage: enlever espaces, points, tirets, parenthèses
  let clean = phone.trim().replace(/[\s.\-_/()]/g, '');

  // Vérifier qu'il n'y a que des chiffres et éventuellement un '+' au début
  if (!/^\+?\d+$/.test(clean)) {
    return { valid: false, message: 'Le numéro de téléphone ne doit contenir que des chiffres.' };
  }

  // Convertir 0033... en +33...
  if (clean.startsWith('00')) {
    clean = '+' + clean.slice(2);
  }

  const digitsOnly = clean.replace(/\D/g, '');

  // Vérification des faux numéros génériques
  if (FAKE_PHONE_PATTERNS.some(pat => pat.test(digitsOnly) || pat.test(clean))) {
    return { valid: false, message: 'Veuillez saisir un véritable numéro de téléphone valide.' };
  }

  // Vérifier qu'il n'y a pas que 2 chiffres répétés en boucle (ex: 0606060606)
  if (/^(\d{2})\1{4,}$/.test(digitsOnly)) {
    return { valid: false, message: 'Numéro invalide (séquence répétitive non autorisée).' };
  }

  switch (countryCode) {
    case 'FR': {
      // France : +33 ou 0 suivi de 1 à 9, 10 chiffres au format national
      let national = clean;
      if (clean.startsWith('+33')) {
        national = '0' + clean.slice(3);
      }
      if (!/^0[1-9]\d{8}$/.test(national)) {
        return { 
          valid: false, 
          message: 'Numéro français invalide. Saisissez un numéro à 10 chiffres (ex: 06 12 34 56 78).' 
        };
      }
      return { valid: true, formatted: national };
    }

    case 'BE': {
      // Belgique : +32 ou 0, 9 ou 10 chiffres
      let national = clean;
      if (clean.startsWith('+32')) {
        national = '0' + clean.slice(3);
      }
      if (!/^0[1-9]\d{7,8}$/.test(national)) {
        return { 
          valid: false, 
          message: 'Numéro belge invalide. Saisissez un numéro à 9 ou 10 chiffres (ex: 0470 12 34 56).' 
        };
      }
      return { valid: true, formatted: national };
    }

    case 'LU': {
      // Luxembourg : +352 ou numéro local de 8 à 11 chiffres
      let digits = digitsOnly;
      if (clean.startsWith('+352')) {
        digits = clean.slice(4);
      } else if (clean.startsWith('352')) {
        digits = clean.slice(3);
      }
      if (digits.length < 8 || digits.length > 11) {
        return { 
          valid: false, 
          message: 'Numéro luxembourgeois invalide. Saisissez un numéro valide (ex: +352 621 123 456).' 
        };
      }
      return { valid: true, formatted: clean.startsWith('+') ? clean : `+352 ${digits}` };
    }

    case 'CH': {
      // Suisse : +41 ou 0, 10 chiffres au format national
      let national = clean;
      if (clean.startsWith('+41')) {
        national = '0' + clean.slice(3);
      }
      if (!/^0[1-9]\d{8}$/.test(national)) {
        return { 
          valid: false, 
          message: 'Numéro suisse invalide. Saisissez un numéro à 10 chiffres (ex: 079 123 45 67).' 
        };
      }
      return { valid: true, formatted: national };
    }

    default: {
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        return { valid: false, message: 'Veuillez saisir un numéro de téléphone international valide.' };
      }
      return { valid: true, formatted: clean };
    }
  }
}

/**
 * Valide qu'une adresse sélectionnée est bien une adresse officielle et non du texte approximatif
 * @param {{ address: string, city: string, postalCode: string, isVerified?: boolean, fullLabel?: string }} addressInfo 
 * @param {'FR' | 'BE' | 'LU' | 'CH'} countryCode 
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateAddress(addressInfo, countryCode = 'FR') {
  if (!addressInfo) {
    return { valid: false, message: "L'adresse est obligatoire." };
  }

  const { address, city, postalCode } = addressInfo;

  if (!city || !city.trim() || !postalCode || !postalCode.trim()) {
    return { 
      valid: false, 
      message: 'Veuillez obligatoirement sélectionner une adresse valide dans la liste suggérée.' 
    };
  }

  const cleanPostal = postalCode.trim();
  const countryConfig = COUNTRIES[countryCode] || COUNTRIES.FR;

  if (countryConfig.postalCodeRegex && !countryConfig.postalCodeRegex.test(cleanPostal)) {
    return {
      valid: false,
      message: `Le code postal "${cleanPostal}" est invalide pour ${countryConfig.name}.`,
    };
  }

  // Vérifier la longueur minimale et exclure les textes approximatifs / bidons
  const dummyTexts = ['test', 'nulle part', 'fake', 'inconnu', 'adresse', 'rue', 'xxx', 'aaa', '123', 'aucun', 'rien'];
  const lowerCity = city.trim().toLowerCase();
  const lowerAddr = (address || '').trim().toLowerCase();

  if (dummyTexts.includes(lowerCity) || dummyTexts.includes(lowerAddr) || lowerCity.length < 2) {
    return { 
      valid: false, 
      message: 'Adresse approximative non acceptée. Veuillez sélectionner une véritable adresse existante.' 
    };
  }

  return { valid: true };
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

/**
 * Calcule l'âge en années révolues à partir d'une date de naissance (YYYY-MM-DD)
 * @param {string | Date} birthDate
 * @returns {number | null}
 */
export function calculateAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 && age < 120 ? age : null;
}
