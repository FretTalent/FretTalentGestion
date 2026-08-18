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

export default function CompanyRelanceDay7({
  companyName = 'Transporteur',
  candidateName = 'Jean Dupont',
  candidateCity = 'Lyon',
  candidatePostalCode = '69000',
  distanceKm = 18.5,
  licenses = ['SPL', 'CE'],
  phone = '06 12 34 56 78',
  email = 'jean.dupont@email.com',
  availability = 'Immédiate',
  trackingUrl = '',
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
            <Text style={badgeText}>Rappel Disponibilité</Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Rappel : Le chauffeur {candidateName} est toujours disponible
            </Heading>
            <Text style={subHeading}>
              Nous vous avions transmis la candidature de <strong>{candidateName}</strong> il y a 7 jours. Ce chauffeur <strong>{licenses.join(' / ')}</strong> situé à <strong>{distanceKm} km</strong> ({candidatePostalCode} {candidateCity}) est actuellement toujours à la recherche d&apos;un poste.
            </Text>

            <Section style={card}>
              <Text style={cardRow}>
                <strong>🚛 Permis :</strong> {licenses.join(', ')}
              </Text>
              <Text style={cardRow}>
                <strong>📍 Localisation :</strong> {candidatePostalCode} {candidateCity} ({distanceKm} km)
              </Text>
              <Text style={cardRow}>
                <strong>⏱️ Disponibilité :</strong> {availability}
              </Text>
              <Text style={cardRow}>
                <strong>📞 Téléphone direct :</strong> <strong style={{ color: '#ea580c' }}>{phone}</strong>
              </Text>
              <Text style={cardRow}>
                <strong>✉️ Email :</strong> {email}
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={primaryButton} href={`tel:${phone.replace(/\s+/g, '')}`}>
                Appeler le chauffeur ({phone})
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Relance automatique programmée via FretTalent pour optimiser vos recrutements sans intermédiaire.
            </Text>
          </Section>

          {trackingUrl && (
            <img
              src={trackingUrl}
              alt=""
              width="1"
              height="1"
              style={{ display: 'none', width: '1px', height: '1px' }}
            />
          )}
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoText = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#ffffff',
  margin: '0',
};

const badgeText = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#ffffff',
  backgroundColor: '#ea580c',
  padding: '4px 10px',
  borderRadius: '9999px',
  margin: '0',
};

const contentSection = {
  padding: '32px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const subHeading = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 20px 0',
  lineHeight: '1.5',
};

const card = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '16px 20px',
  marginBottom: '20px',
};

const cardRow = {
  fontSize: '13px',
  color: '#334155',
  margin: '6px 0',
};

const buttonContainer = {
  textAlign: 'center',
  margin: '20px 0 10px 0',
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
