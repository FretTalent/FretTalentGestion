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
  candidateName = 'Jean',
  companiesCount = 18,
  radiusKm = 50,
  city = 'Lyon',
  dashboardUrl = 'https://www.frettalent.fr/dashboard/candidate',
}) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>
              Fret<span style={{ color: '#f97316' }}>Talent</span>
            </Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Votre Pack Auto-Candidature est activé ! 🚀
            </Heading>
            <Text style={paragraph}>
              Bonjour <strong>{candidateName}</strong>,
            </Text>
            <Text style={paragraph}>
              Votre profil et vos documents certifiés viennent d&apos;être transmis automatiquement à <strong>{companiesCount} entreprises de transport</strong> situées dans un rayon de <strong>{radiusKm} km</strong> autour de votre domicile ({city}).
            </Text>

            {/* Feature highlights */}
            <Section style={card}>
              <Text style={featureItem}>
                ✅ <strong>Envoi immédiat :</strong> {companiesCount} transporteurs ont reçu votre dossier complet.
              </Text>
              <Text style={featureItem}>
                🔔 <strong>Accusé d&apos;ouverture :</strong> Vous recevrez un email instantané dès qu&apos;une entreprise ouvre votre candidature.
              </Text>
              <Text style={featureItem}>
                ⭐ <strong>Badge Premium 48h :</strong> Votre profil est mis en avant en priorité sur la carte des recruteurs.
              </Text>
              <Text style={featureItem}>
                📅 <strong>Relance automatique J+7 :</strong> Une relance automatique sera envoyée dans 7 jours pour rappeler votre disponibilité.
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={primaryButton} href={dashboardUrl}>
                Accéder à mon espace Chauffeur
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              L&apos;équipe FretTalent vous souhaite une excellente réussite dans vos démarches professionnelles.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f4f6fb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  marginTop: '20px',
  marginBottom: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0',
};

const header = {
  padding: '24px 32px',
  backgroundColor: '#0a0f1e',
};

const logoText = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#ffffff',
  margin: '0',
};

const contentSection = {
  padding: '32px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '14px',
  color: '#334155',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const card = {
  backgroundColor: '#fffaf5',
  borderRadius: '12px',
  border: '1px solid #fed7aa',
  padding: '16px 20px',
  margin: '20px 0',
};

const featureItem = {
  fontSize: '13px',
  color: '#7c2d12',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center',
  margin: '24px 0 12px 0',
};

const primaryButton = {
  backgroundColor: '#f97316',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  padding: '14px 28px',
  borderRadius: '12px',
  textDecoration: 'none',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const footer = {
  padding: '20px 32px',
  backgroundColor: '#f8fafc',
  textAlign: 'center',
};

const footerText = {
  fontSize: '11px',
  color: '#94a3b8',
  margin: '0',
};
