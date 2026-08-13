import { z } from 'zod';
import { validateCompanyIdFormat } from './country';

/**
 * Schéma Zod pour l'inscription d'un candidat
 */
export const CandidateRegisterSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  country: z.enum(['FR', 'BE', 'LU', 'CH'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un pays valide (FR, BE, LU, CH)' }),
  }),
  lastName: z.string().min(1, 'Le nom de famille est obligatoire'),
  firstName: z.string().min(1, 'Le prénom est obligatoire'),
  phone: z.string().min(6, 'Numéro de téléphone invalide'),
  address: z.string().min(2, "L'adresse est obligatoire"),
  city: z.string().min(1, 'La ville est obligatoire'),
  postalCode: z.string().min(2, 'Le code postal est obligatoire'),
  rgpdConsent: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter la politique de confidentialité RGPD',
  }),
});

/**
 * Schéma Zod pour l'inscription d'une entreprise / recruteur
 */
export const RecruiterRegisterSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  country: z.enum(['FR', 'BE', 'LU', 'CH'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un pays valide (FR, BE, LU, CH)' }),
  }),
  companyName: z.string().min(2, "Le nom de l'entreprise est obligatoire"),
  companyIdentifier: z.string().min(1, "L'identifiant d'entreprise est obligatoire"),
  address: z.string().min(2, "L'adresse du siège est obligatoire"),
  city: z.string().min(1, 'La ville est obligatoire'),
  postalCode: z.string().min(2, 'Le code postal est obligatoire'),
  rgpdConsent: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter la politique de confidentialité RGPD',
  }),
}).superRefine((data, ctx) => {
  const result = validateCompanyIdFormat(data.country, data.companyIdentifier);
  if (!result.valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['companyIdentifier'],
      message: result.message || "Identifiant d'entreprise invalide pour ce pays",
    });
  }
});
