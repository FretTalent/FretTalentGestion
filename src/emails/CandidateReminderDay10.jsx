import { Button, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.com';

export default function CandidateReminderDay10({ candidateName = 'Chauffeur' }) {
  return (
    <BaseLayout
      previewText="🔴 Dernier rappel avant clôture de votre compte FretTalent"
      heading="Dernier avis avant clôture ⚠️"
    >
      <Text style={text}>
        Bonjour <strong>{candidateName}</strong>,
      </Text>

      <Text style={text}>
        Vous vous êtes inscrit sur <strong>FretTalent</strong> il y a 10 jours, mais vous n'avez pas encore déposé vos justificatifs de conduite (permis, carte conducteur ou FIMO).
      </Text>

      <Section style={card}>
        <Text style={cardTitle}>🔴 Suppression imminente de votre compte</Text>
        <Hr style={hrSmall} />
        <Text style={cardText}>
          Afin de garantir un réseau 100% qualifié et disponible aux transporteurs en <strong>France, Suisse, Belgique et Luxembourg</strong>, les profils inactifs sans documents sont automatiquement clôturés sous 24h.
        </Text>
        <Text style={cardTextDanger}>
          Si vous cherchez toujours un emploi ou des missions en direct, déposez vos documents dès aujourd'hui pour maintenir votre compte actif.
        </Text>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}/dashboard/candidate/documents`}>
          Maintenir mon profil actif 📸
        </Button>
      </Section>

      <Text style={footerNote}>
        Si vous n'êtes plus en recherche d'opportunités, vous pouvez ignorer cet e-mail. Votre profil sera automatiquement supprimé.
      </Text>
    </BaseLayout>
  );
}

const text = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const card = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
};

const cardTitle = {
  fontSize: '15px',
  fontWeight: '800',
  color: '#dc2626',
  margin: '0 0 10px',
};

const cardText = {
  fontSize: '14px',
  color: '#991b1b',
  lineHeight: '22px',
  margin: '0 0 10px',
};

const cardTextDanger = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#b91c1c',
  lineHeight: '20px',
  margin: '0',
  backgroundColor: '#fee2e2',
  padding: '10px 14px',
  borderRadius: '10px',
};

const hrSmall = {
  borderColor: '#fca5a5',
  margin: '8px 0 14px',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '28px',
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '9999px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
};

const footerNote = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center',
  margin: '0',
};
