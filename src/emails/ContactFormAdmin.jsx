import { Button, Text, Section } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

export default function ContactFormAdmin({
  name,
  email,
  phone,
  role,
  subject,
  message,
}) {
  const roleLabel =
    role === 'recruiter'
      ? '🏢 Entreprise / Transporteur'
      : role === 'candidate'
      ? '🚚 Chauffeur / Candidat'
      : '🤝 Partenaire / Autre';

  return (
    <BaseLayout
      previewText={`Nouveau message de contact : ${name} (${subject})`}
      heading="Nouveau Message de Contact 📬"
    >
      <Text style={text}>
        Un visiteur vient de soumettre le formulaire de contact sur <strong>FretTalent</strong> :
      </Text>

      <Section style={infoBox}>
        <Text style={infoRow}><strong>Nom / Prénom :</strong> {name}</Text>
        <Text style={infoRow}><strong>E-mail :</strong> {email}</Text>
        <Text style={infoRow}><strong>Téléphone :</strong> {phone || 'Non renseigné'}</Text>
        <Text style={infoRow}><strong>Profil :</strong> {roleLabel}</Text>
        <Text style={infoRow}><strong>Sujet :</strong> {subject}</Text>
      </Section>

      <Section style={highlightBox}>
        <Text style={highlightTitle}>Message transmis :</Text>
        <Text style={highlightText}>
          &ldquo;{message}&rdquo;
        </Text>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}>
          Répondre par E-mail à {name}
        </Button>
      </Section>
    </BaseLayout>
  );
}

const text = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const infoBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '20px',
};

const infoRow = {
  color: '#475569',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '4px 0',
};

const highlightBox = {
  backgroundColor: '#fff7ed',
  borderLeft: '4px solid #f97316',
  padding: '16px 20px',
  marginBottom: '24px',
  borderRadius: '8px',
};

const highlightTitle = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#ea580c',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

const highlightText = {
  color: '#0f172a',
  fontSize: '14px',
  lineHeight: '22px',
  fontStyle: 'italic',
  whiteSpace: 'pre-line',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '24px',
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#ea580c',
  color: '#ffffff',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 24px',
};
