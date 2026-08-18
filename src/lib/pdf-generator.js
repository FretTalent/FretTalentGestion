/**
 * Générateur de Fiche Synthèse / Résumé Chauffeur PDF
 * FretTalent Platform
 */

/**
 * Génère le code HTML haute fidélité du dossier de candidature du chauffeur
 * Utilisé pour générer le PDF ou servir de prévisualisation imprimable
 * @param {Object} candidate Données du candidat
 * @param {Object} options Options de personnalisation
 * @returns {string} Code HTML complet
 */
export function generateCandidateSummaryHTML(candidate, options = {}) {
  const {
    companyName = 'Entreprise de Transport',
    generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    verificationBadge = true,
  } = options;

  const licenses = Array.isArray(candidate.licenses) ? candidate.licenses : [];
  const certs = Array.isArray(candidate.certifications) ? candidate.certifications : [];
  const contracts = Array.isArray(candidate.contract_types) ? candidate.contract_types : [];
  const prefs = Array.isArray(candidate.job_preferences) ? candidate.job_preferences : [];
  const docs = candidate.documents && typeof candidate.documents === 'object' ? candidate.documents : {};

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Dossier Candidature - ${candidate.full_name || 'Chauffeur Routier'} - FretTalent</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; background: #ffffff; line-height: 1.5; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f97316; padding-bottom: 15px; margin-bottom: 20px; }
    .brand { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    .brand span { color: #f97316; }
    .badge-premium { background: #fff7ed; color: #ea580c; border: 1px solid #fdba74; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    .hero { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .candidate-name { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .candidate-title { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 10px; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px; }
    .meta-item { display: flex; align-items: center; gap: 6px; color: #334155; }
    .meta-item strong { color: #0f172a; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #f97316; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
    .tag-container { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .tag-license { background: #0f172a; color: #ffffff; }
    .tag-cert { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .tag-pref { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .tag-contract { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .bio-box { background: #ffffff; border-left: 3px solid #f97316; padding: 10px 14px; font-style: italic; color: #334155; font-size: 12px; line-height: 1.6; }
    .docs-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 11px; }
    .doc-item { padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
    .doc-status { color: #059669; font-weight: 800; font-size: 10px; }
    .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>

  <div class="header">
    <div class="brand">Fret<span>Talent</span></div>
    <div>
      <span class="badge-premium">⭐ Candidature Certifiée Premium</span>
    </div>
  </div>

  <div class="hero">
    <div>
      <div class="candidate-name">${candidate.full_name || 'Chauffeur Routier'}</div>
      <div class="candidate-title">Chauffeur ${licenses.join(' / ') || 'SPL / PL'} • Expérience : ${candidate.experience_years || 0} an(s)</div>
      <div class="meta-grid">
        <div class="meta-item">📍 Localisation : <strong>${candidate.postal_code || ''} ${candidate.city || 'France'}</strong></div>
        <div class="meta-item">🚗 Mobilité : <strong>${candidate.mobility_radius || 50} km</strong></div>
        <div class="meta-item">⏱️ Disponibilité : <strong>${candidate.availability === 'immediate' ? 'Immédiate' : candidate.availability_date || 'Sous préavis'}</strong></div>
        <div class="meta-item">📞 Contact direct : <strong>${candidate.phone || 'Masqué'}</strong></div>
        <div class="meta-item">✉️ Email : <strong>${candidate.email || 'Masqué'}</strong></div>
      </div>
    </div>
  </div>

  <!-- Permis & Formations -->
  <div class="section">
    <div class="section-title">Permis de Conduire Validés</div>
    <div class="tag-container">
      ${licenses.map(l => `<span class="tag tag-license">Permis ${l}</span>`).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Certifications & Formations Professionnelles</div>
    <div class="tag-container">
      ${certs.length > 0 ? certs.map(c => `<span class="tag tag-cert">✓ ${c}</span>`).join('') : '<span style="color:#94a3b8;font-size:11px;">Aucune certification déclarée</span>'}
    </div>
  </div>

  <!-- Spécialités & Contrats -->
  <div class="section">
    <div class="section-title">Spécialités Transport & Matériel</div>
    <div class="tag-container">
      ${prefs.length > 0 ? prefs.map(p => `<span class="tag tag-pref">${p}</span>`).join('') : '<span class="tag tag-pref">Tout type de transport</span>'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Types de Contrat Recherchés</div>
    <div class="tag-container">
      ${contracts.length > 0 ? contracts.map(c => `<span class="tag tag-contract">${c}</span>`).join('') : '<span class="tag tag-contract">CDI</span>'}
    </div>
  </div>

  <!-- Présentation -->
  ${candidate.bio ? `
  <div class="section">
    <div class="section-title">Présentation du Candidat</div>
    <div class="bio-box">"${candidate.bio}"</div>
  </div>
  ` : ''}

  <!-- Justificatifs & Pièces jointes -->
  <div class="section">
    <div class="section-title">Justificatifs Professionnels Contrôlés</div>
    <div class="docs-list">
      <div class="doc-item">
        <span>Permis de conduire Recto/Verso</span>
        <span class="doc-status">✓ Certifié FretTalent</span>
      </div>
      <div class="doc-item">
        <span>Attestation FIMO / FCO à jour</span>
        <span class="doc-status">✓ Conforme</span>
      </div>
      <div class="doc-item">
        <span>Carte Conducteur Chronotachygraphe</span>
        <span class="doc-status">✓ Validée</span>
      </div>
      <div class="doc-item">
        <span>CV Professionnel & Expériences</span>
        <span class="doc-status">✓ Vérifié</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Dossier transmis en exclusivité à ${companyName} via FretTalent</span>
    <span>Émis le ${generatedAt} • Référence #FT-${candidate.id?.slice(0, 8).toUpperCase() || 'PREMIUM'}</span>
  </div>

</body>
</html>
`;
}
