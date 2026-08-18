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

export default function CandidateRelanceSent({
  candidateName = 'Jean',
  companiesCount = 18,
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
              Votre relance automatique a été envoyée ! 📬
            </Heading>
            <Text style={paragraph}>
              Bonjour <strong>{candidateName}</strong>,
            </Text>
            <Text style={paragraph}>
              Comme prévu dans votre forfait Auto-Candidature Premium, une relance automatique à <strong>J+7</strong> vient d&apos;être transmise à l&apos;ensemble des <strong>{companiesCount} entreprises</strong> de votre secteur pour leur rappeler votre disponibilité immédiate.
            </Text>

            <Section style={card}>
              <Text style={cardText}>
                🔔 Vous continuerez de recevoir un email d&apos;accusé de réception à chaque nouvelle ouverture de votre dossier.
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={primaryButton} href={dashboardUrl}>
                Consulter mon tableau de bord
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              FretTalent — Accompagnement et recrutement des chauffeurs routiers.
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
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  border: '1px solid #bbf7d0',
  padding: '16px 20px',
  margin: '20px 0',
};

const cardText = {
  fontSize: '13px',
  color: '#14532d',
  lineHeight: '1.5',
  margin: '0',
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
