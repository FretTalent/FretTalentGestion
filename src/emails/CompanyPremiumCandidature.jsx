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
  Link,
} from '@react-email/components';

export default function CompanyPremiumCandidature({
  companyName = 'Transporteur',
  candidateName = 'Jean Dupont',
  candidateCity = 'Lyon',
  candidatePostalCode = '69000',
  distanceKm = 18.5,
  licenses = ['SPL', 'CE'],
  certifications = ['FIMO', 'FCO', 'Carte Chrono'],
  specialties = ['Tautliner', 'Frigo'],
  experienceYears = 6,
  availability = 'Immédiate',
  phone = '06 12 34 56 78',
  email = 'jean.dupont@email.com',
  bio = 'Chauffeur expérimenté en semi-remorque frigorifique et bâché, rigoureux et autonome.',
  candidateId = '',
  trackingUrl = '',
  summaryPdfHtmlUrl = '',
  docs = [],
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';

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
            <Text style={badgeText}>⭐ Candidat Certifié Premium</Text>
          </Section>

          {/* Main Card */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Candidature directe : {candidateName}
            </Heading>
            <Text style={subHeading}>
              Chauffeur <strong>{licenses.join(' / ')}</strong> situé à <strong>{distanceKm} km</strong> de vos dépôts ({candidatePostalCode} {candidateCity}).
            </Text>

            <Section style={card}>
              <Text style={cardRow}>
                <strong>📍 Localisation :</strong> {candidatePostalCode} {candidateCity} ({distanceKm} km)
              </Text>
              <Text style={cardRow}>
                <strong>🚛 Permis :</strong> {licenses.join(', ')}
              </Text>
              <Text style={cardRow}>
                <strong>📋 Certifications :</strong> {certifications.join(', ')}
              </Text>
              <Text style={cardRow}>
                <strong>⏱️ Disponibilité :</strong> {availability}
              </Text>
              <Text style={cardRow}>
                <strong>⭐ Expérience :</strong> {experienceYears} an(s)
              </Text>
              {specialties.length > 0 && (
                <Text style={cardRow}>
                  <strong>📦 Spécialités :</strong> {specialties.join(', ')}
                </Text>
              )}
            </Section>

            {bio && (
              <Section style={bioBox}>
                <Text style={bioText}>&ldquo;{bio}&rdquo;</Text>
              </Section>
            )}

            {/* Direct Contact */}
            <Section style={contactSection}>
              <Text style={contactTitle}>Coordonnées directes du candidat :</Text>
              <Text style={contactInfo}>
                📞 Téléphone : <strong style={{ color: '#0f172a' }}>{phone}</strong>
              </Text>
              <Text style={contactInfo}>
                ✉️ Email : <strong style={{ color: '#0f172a' }}>{email}</strong>
              </Text>
            </Section>

            {/* Actions */}
            <Section style={buttonContainer}>
              <Button style={primaryButton} href={`tel:${phone.replace(/\s+/g, '')}`}>
                Appeler le chauffeur directement
              </Button>
            </Section>

            {summaryPdfHtmlUrl && (
              <Section style={{ textAlign: 'center', marginTop: '12px' }}>
                <Link href={summaryPdfHtmlUrl} style={secondaryLink}>
                  📄 Télécharger la fiche de synthèse complète
                </Link>
              </Section>
            )}
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Cette candidature certifiée vous est transmise en exclusivité via FretTalent.
            </Text>
            <Text style={footerText}>
              FretTalent — La plateforme de recrutement direct Transport & Logistique.
            </Text>
          </Section>

          {/* Tracking Pixel 1x1 */}
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
  color: '#ea580c',
  backgroundColor: '#fff7ed',
  padding: '4px 10px',
  borderRadius: '9999px',
  margin: '0',
};

const contentSection = {
  padding: '32px',
};

const heading = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0 0 8px 0',
};

const subHeading = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 24px 0',
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

const bioBox = {
  borderLeft: '3px solid #f97316',
  padding: '10px 16px',
  backgroundColor: '#fffaf5',
  borderRadius: '0 8px 8px 0',
  marginBottom: '24px',
};

const bioText = {
  fontSize: '13px',
  color: '#7c2d12',
  fontStyle: 'italic',
  margin: '0',
  lineHeight: '1.5',
};

const contactSection = {
  backgroundColor: '#f1f5f9',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '24px',
};

const contactTitle = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 8px 0',
};

const contactInfo = {
  fontSize: '14px',
  color: '#334155',
  margin: '4px 0',
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

const secondaryLink = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#f97316',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const footer = {
  padding: '24px 32px',
  backgroundColor: '#f8fafc',
  textAlign: 'center',
};

const footerText = {
  fontSize: '11px',
  color: '#94a3b8',
  margin: '4px 0',
};
