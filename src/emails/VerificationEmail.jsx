import {
  Body,
  Button,
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

export default function VerificationEmail({ confirmationUrl }) {
  const href = confirmationUrl || '{{ .ConfirmationURL }}';

  return (
    <Html>
      <Head />
      <Preview>Activez votre compte FretTalent en un clic 🚚</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header avec Bannière Dégradée & Logo */}
          <Section style={headerSection}>
            <Text style={logoText}>
              Fret<span style={logoAccent}>Talent</span>
            </Text>
            <Text style={tagline}>La plateforme n°1 du recrutement transport & logistique</Text>
          </Section>

          {/* Carte Principale */}
          <Section style={contentCard}>
            {/* Badge de Bienvenue */}
            <div style={badgeContainer}>
              <span style={badge}>✉️ Validation de votre adresse e-mail</span>
            </div>

            <Heading style={h1}>Bienvenue sur FretTalent ! 👋</Heading>

            <Text style={text}>
              Merci de nous rejoindre. Pour finaliser la création de votre compte et accéder à la plateforme de recrutement transport, veuillez confirmer votre adresse e-mail.
            </Text>

            {/* Encadré d'action prioritaire */}
            <Section style={ctaBox}>
              <Text style={ctaTitle}>Confirmez votre compte dès maintenant :</Text>
              <Button style={button} href={href}>
                Activer mon compte FretTalent →
              </Button>
              <Text style={textSubtle}>
                Ce lien est sécurisé et valable pendant 24 heures.
              </Text>
            </Section>

            {/* Lien alternatif au cas où le bouton ne fonctionne pas */}
            <Section style={altLinkSection}>
              <Text style={altLinkText}>
                Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
              </Text>
              <Link href={href} style={rawLink}>
                {href}
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Section Fonctionnalités Rapides */}
            <Text style={featuresTitle}>Ce qui vous attend sur FretTalent :</Text>
            <table width="100%" cellPadding="0" cellSpacing="0" style={featureTable}>
              <tr>
                <td style={featureItem}>
                  <strong style={featureHeading}>🚛 Chauffeurs & Conducteurs</strong>
                  <br />
                  Accédez à des centaines d'offres ciblées (Permis C, CE, FIMO, FCO).
                </td>
              </tr>
              <tr>
                <td style={featureItem}>
                  <strong style={featureHeading}>🏢 Recruteurs & Transporteure</strong>
                  <br />
                  Débloquez directement les profils qualifiés et vérifiés.
                </td>
              </tr>
            </table>

            <Text style={textMuted}>
              Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail en toute sécurité.
            </Text>
          </Section>

          {/* Footer Professionnel */}
          <Section style={footer}>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} FretTalent. Tous droits réservés.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://www.frettalent.com/legal/confidentialite" style={footerLink}>
                Confidentialité
              </Link>
              {' • '}
              <Link href="https://www.frettalent.com/legal/mentions-legales" style={footerLink}>
                Mentions légales
              </Link>
              {' • '}
              <Link href="https://www.frettalent.com/faq" style={footerLink}>
                Centre d'aide
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ================= Styles CSS-in-JS =================

const main = {
  backgroundColor: '#f1f5f9', // slate-100
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '40px 10px',
};

const container = {
  margin: '0 auto',
  maxWidth: '560px',
  width: '100%',
};

const headerSection = {
  backgroundColor: '#0f172a', // slate-900
  borderRadius: '20px 20px 0 0',
  padding: '36px 32px 28px',
  textAlign: 'center',
  backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
};

const logoText = {
  fontSize: '28px',
  fontWeight: '900',
  color: '#ffffff',
  margin: '0 0 6px',
  letterSpacing: '-0.5px',
};

const logoAccent = {
  color: '#f97316', // orange-500
};

const tagline = {
  color: '#94a3b8', // slate-400
  fontSize: '13px',
  margin: '0',
  fontWeight: '500',
};

const contentCard = {
  backgroundColor: '#ffffff',
  padding: '36px 36px 32px',
  borderRadius: '0 0 20px 20px',
  boxShadow:
    '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
};

const badgeContainer = {
  marginBottom: '20px',
};

const badge = {
  backgroundColor: '#fff7ed', // orange-50
  color: '#c2410c', // orange-700
  border: '1px solid #ffedd5', // orange-100
  borderRadius: '9999px',
  padding: '6px 14px',
  fontSize: '12px',
  fontWeight: '700',
  display: 'inline-block',
};

const h1 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '800',
  margin: '0 0 16px',
  letterSpacing: '-0.3px',
};

const text = {
  color: '#334155', // slate-700
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const ctaBox = {
  backgroundColor: '#f8fafc', // slate-50
  border: '1px solid #e2e8f0', // slate-200
  borderRadius: '16px',
  padding: '24px',
  textAlign: 'center',
  margin: '28px 0',
};

const ctaTitle = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const button = {
  backgroundColor: '#f97316', // orange-500
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '800',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
};

const textSubtle = {
  color: '#64748b',
  fontSize: '12px',
  marginTop: '14px',
  marginBottom: '0',
};

const altLinkSection = {
  margin: '20px 0',
  wordBreak: 'break-all',
};

const altLinkText = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0 0 4px',
};

const rawLink = {
  color: '#f97316',
  fontSize: '12px',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '28px 0',
};

const featuresTitle = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: '700',
  margin: '0 0 12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const featureTable = {
  margin: '0 0 24px',
};

const featureItem = {
  backgroundColor: '#f8fafc',
  borderLeft: '3px solid #f97316',
  padding: '12px 16px',
  borderRadius: '0 10px 10px 0',
  fontSize: '13px',
  color: '#475569',
  marginBottom: '10px',
  lineHeight: '20px',
};

const featureHeading = {
  color: '#0f172a',
};

const textMuted = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '18px',
  marginTop: '20px',
  marginBottom: '0',
};

const footer = {
  padding: '24px 16px 0',
  textAlign: 'center',
};

const footerCopyright = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0 0 8px',
};

const footerLinks = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
};

const footerLink = {
  color: '#64748b',
  textDecoration: 'none',
  fontWeight: '600',
};
