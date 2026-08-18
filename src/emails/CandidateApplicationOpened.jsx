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

export default function CandidateApplicationOpened({
  candidateName = 'Jean',
  companyName = 'Transports Durand',
  companyCity = 'Lyon',
  openedAt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
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
              🎉 Votre candidature a été ouverte !
            </Heading>
            <Text style={paragraph}>
              Bonjour <strong>{candidateName}</strong>,
            </Text>
            <Text style={paragraph}>
              L&apos;entreprise <strong>{companyName}</strong> ({companyCity}) vient d&apos;ouvrir et de consulter votre candidature à <strong>{openedAt}</strong>.
            </Text>

            <Section style={card}>
              <Text style={cardTitle}>Détail de la consultation :</Text>
              <Text style={cardText}>🏢 <strong>Entreprise :</strong> {companyName}</Text>
              <Text style={cardText}>📍 <strong>Secteur :</strong> {companyCity}</Text>
              <Text style={cardText}>🕒 <strong>Horodatage :</strong> {openedAt}</Text>
            </Section>

            <Text style={tipText}>
              💡 <strong>Conseil :</strong> Gardez votre téléphone à portée de main ! Le recruteur dispose de vos coordonnées directes pour vous contacter.
            </Text>

            <Section style={buttonContainer}>
              <Button style={primaryButton} href={dashboardUrl}>
                Voir mes statistiques sur FretTalent
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Notification automatique de suivi FretTalent — Auto-Candidature Premium.
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

const cardTitle = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#166534',
  textTransform: 'uppercase',
  margin: '0 0 8px 0',
};

const cardText = {
  fontSize: '13px',
  color: '#14532d',
  margin: '4px 0',
};

const tipText = {
  fontSize: '13px',
  color: '#b45309',
  backgroundColor: '#fefce8',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #fef08a',
  margin: '16px 0',
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
