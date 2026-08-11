/**
 * Central place to define which document types are required for a candidate
 * to be considered fully validated.
 *
 * Adjust the list according to your business rules.
 */
export const REQUIRED_DOCUMENT_TYPES = new Set([
  'id_card',
  'permits',
  'certificat_fimo',
  'diplome',
  'safety_training',
  // add more if needed
]);
