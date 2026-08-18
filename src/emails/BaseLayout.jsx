import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.com';

export default function BaseLayout({ previewText, heading, children, trackingUrl }) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            {/* Si un logo externe est disponible, utiliser son URL. Sinon utiliser le texte */}
            <Text style={logoText}>
              Fret<span style={logoAccent}>Talent</span>
            </Text>
          </Section>

          <Section style={content}>
            {heading && <Heading style={h1}>{heading}</Heading>}
            {children}
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} FretTalent. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              Cet e-mail vous a été envoyé car vous êtes inscrit sur FretTalent.
              <br />
              <Link
                href={`${baseUrl}/legal/confidentialite`}
                style={footerLink}
              >
                Politique de confidentialité
              </Link>
              {' • '}
              <Link
                href={`${baseUrl}/legal/mentions-legales`}
                style={footerLink}
              >
                Mentions légales
              </Link>
            </Text>

            {/* Pixel transparent de tracking d'ouverture */}
            {trackingUrl && (
              <Img
                src={trackingUrl}
                alt=""
                width="1"
                height="1"
                style={{ display: 'none', width: '1px', height: '1px', opacity: 0 }}
              />
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f8fafc', // slate-50
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  maxWidth: '100%',
};

const header = {
  padding: '24px',
  backgroundColor: '#ffffff',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
  borderBottom: '1px solid #f1f5f9', // slate-100
  textAlign: 'center',
};

const logoText = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#0f172a', // slate-900
  margin: '0',
  letterSpacing: '-0.5px',
};

const logoAccent = {
  color: '#f97316', // orange-500
};

const content = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderBottomLeftRadius: '12px',
  borderBottomRightRadius: '12px',
  boxShadow:
    '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
};

const h1 = {
  color: '#0f172a', // slate-900
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px',
  padding: '0',
};

const hr = {
  borderColor: '#e2e8f0', // slate-200
  margin: '24px 0',
};

const footer = {
  padding: '0 24px',
  textAlign: 'center',
};

const footerText = {
  color: '#64748b', // slate-500
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
};

const footerLink = {
  color: '#64748b', // slate-500
  textDecoration: 'underline',
};
