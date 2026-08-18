import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components';

export default function CandidatePremiumConfirmation({
  candidateName = 'Chauffeur',
  companiesCount = 18,
  radiusKm = 50,
  city = 'votre région',
  dashboardUrl = 'https://www.frettalent.fr/dashboard/candidate/cv-rapide',
}) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header avec Logo & Badge */}
          <Section style={header}>
            <Text style={logoText}>
              Fret<span style={{ color: '#f97316' }}>Talent</span>
            </Text>
            <Text style={headerSub}>Plateforme N°1 de Recrutement Transport Routier</Text>
          </Section>

          {/* Bannière Décorative d'activation */}
          <Section style={heroBanner}>
            <Text style={heroBadge}>⭐ OPTION CV RAPIDE ACTIVÉE</Text>
            <Heading style={heading}>
              Félicitations {candidateName} ! 🚀
            </Heading>
            <Text style={heroSubtitle}>
              Votre profil chauffeur et vos documents sont maintenant diffusés en priorité aux recruteurs.
            </Text>
          </Section>

          {/* Contenu principal */}
          <Section style={contentSection}>
            <Text style={paragraph}>
              Bonjour <strong>{candidateName}</strong>,
            </Text>
            <Text style={paragraph}>
              Nous vous confirmons la bonne réception de votre paiement. Votre <strong>Pack CV Rapide</strong> est immédiatement opérationnel dans un rayon de <strong>{radiusKm} km</strong> autour de <strong>{city}</strong>.
            </Text>

            {/* Carte Récapitulative des Avantages */}
            <Section style={card}>
              <Text style={cardTitle}>🎯 Ce qui est actuellement actif pour vous :</Text>

              <div style={featureRow}>
                <span style={featureIcon}>⭐</span>
                <div>
                  <strong style={featureTitle}>Badge Vedette Chauffeur (7 jours complets)</strong>
                  <p style={featureDesc}>
                    Votre profil est mis en avant tout en haut de la carte des transporteurs avec l&apos;étoile dorée prioritaire.
                  </p>
                </div>
              </div>

              <div style={featureRow}>
                <span style={featureIcon}>📨</span>
                <div>
                  <strong style={featureTitle}>Transmission directe aux Transporteurs ({companiesCount} entreprises)</strong>
                  <p style={featureDesc}>
                    Votre CV et vos justificatifs de conduite (Permis, Chrono, FIMO) sont transmis aux recruteurs de votre secteur.
                  </p>
                </div>
              </div>

              <div style={featureRow}>
                <span style={featureIcon}>🔔</span>
                <div>
                  <strong style={featureTitle}>Notification d&apos;Ouverture en Temps Réel</strong>
                  <p style={featureDesc}>
                    Vous recevrez une notification instantanée dès qu&apos;un transporteur consulte votre candidature.
                  </p>
                </div>
              </div>

              <div style={featureRow}>
                <span style={featureIcon}>🔄</span>
                <div>
                  <strong style={featureTitle}>Relance Automatique J+7</strong>
                  <p style={featureDesc}>
                    Un rappel de votre disponibilité sera automatiquement réémis aux entreprises sous 7 jours.
                  </p>
                </div>
              </div>
            </Section>

            {/* Bouton d'accès */}
            <Section style={buttonContainer}>
              <Button style={primaryButton} href={dashboardUrl}>
                Accéder à mon Suivi de Diffusions 📊
              </Button>
            </Section>

            <Text style={infoTip}>
              💡 <em>Conseil : Gardez votre téléphone à portée de main, les entreprises intéressées peuvent vous joindre directement par appel ou SMS.</em>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} FretTalent. Tous droits réservés.
            </Text>
            <Text style={footerSub}>
              Besoin d&apos;aide ? Notre équipe support est disponible 7j/7 depuis votre espace candidat ou par email à support@frettalent.fr
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f1f5f9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '20px 0',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e2e8f0',
};

const header = {
  padding: '24px 32px 20px 32px',
  backgroundColor: '#0a0f1e',
  textAlign: 'center',
};

const logoText = {
  fontSize: '26px',
  fontWeight: '900',
  color: '#ffffff',
  margin: '0',
  letterSpacing: '-0.5px',
};

const headerSub = {
  fontSize: '11px',
  color: '#94a3b8',
  margin: '4px 0 0 0',
  fontWeight: '500',
};

const heroBanner = {
  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #f59e0b 100%)',
  padding: '28px 32px',
  color: '#ffffff',
  textAlign: 'center',
};

const heroBadge = {
  display: 'inline-block',
  backgroundColor: 'rgba(0, 0, 0, 0.25)',
  padding: '4px 12px',
  borderRadius: '9999px',
  fontSize: '10px',
  fontWeight: '900',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 0 10px 0',
};

const heading = {
  fontSize: '22px',
  fontWeight: '900',
  color: '#ffffff',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const heroSubtitle = {
  fontSize: '13px',
  color: '#fff7ed',
  margin: '0',
  lineHeight: '1.5',
};

const contentSection = {
  padding: '32px',
};

const paragraph = {
  fontSize: '14px',
  color: '#334155',
  lineHeight: '1.6',
  margin: '0 0 14px 0',
};

const card = {
  backgroundColor: '#f8fafc',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  margin: '24px 0',
};

const cardTitle = {
  fontSize: '14px',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const featureRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '14px',
};

const featureIcon = {
  fontSize: '18px',
  lineHeight: '1',
  flexShrink: 0,
  marginTop: '2px',
};

const featureTitle = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#0f172a',
  display: 'block',
  marginBottom: '2px',
};

const featureDesc = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.4',
};

const buttonContainer = {
  textAlign: 'center',
  margin: '28px 0 16px 0',
};

const primaryButton = {
  backgroundColor: '#f97316',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '800',
  padding: '15px 32px',
  borderRadius: '14px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 6px 20px rgba(249, 115, 22, 0.35)',
};

const infoTip = {
  fontSize: '12px',
  color: '#64748b',
  textAlign: 'center',
  margin: '16px 0 0 0',
  lineHeight: '1.5',
};

const hr = {
  borderColor: '#f1f5f9',
  margin: '0',
};

const footer = {
  padding: '24px 32px',
  backgroundColor: '#f8fafc',
  textAlign: 'center',
};

const footerText = {
  fontSize: '11px',
  color: '#64748b',
  margin: '0 0 4px 0',
  fontWeight: '600',
};

const footerSub = {
  fontSize: '10px',
  color: '#94a3b8',
  margin: '0',
  lineHeight: '1.4',
};

