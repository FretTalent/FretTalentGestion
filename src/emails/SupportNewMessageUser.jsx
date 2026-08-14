import { Button, Text, Section } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.fr';

export default function SupportNewMessageUser({ userName, subject, previewMessage, userRole = 'candidate' }) {
  const rolePath = userRole === 'recruiter' ? 'recruiter' : 'candidate';
  const supportUrl = `${baseUrl}/dashboard/${rolePath}/support`;

  return (
    <BaseLayout
      previewText={`Nouveau message du support FretTalent : ${subject}`}
      heading="Nouveau message du Support 💬"
    >
      <Text style={text}>
        Bonjour <strong>{userName}</strong>,
      </Text>

      <Text style={text}>
        L&apos;équipe support de FretTalent vous a répondu concernant votre demande : <strong>« {subject} »</strong>.
      </Text>

      <Section style={highlightBox}>
        <Text style={highlightTitle}>Extrait du message :</Text>
        <Text style={highlightText}>
          &ldquo;{previewMessage}&rdquo;
        </Text>
      </Section>

      <Text style={text}>
        Vous pouvez consulter l&apos;intégralité de la conversation et répondre en direct depuis votre espace :
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href={supportUrl}>
          Accéder à mon espace Support
        </Button>
      </Section>

      <Text style={footerNote}>
        Note : Pour éviter d&apos;encombrer votre boîte mail, vous ne recevrez pas d&apos;autre notification pour chaque message intermédiaire de cet échange.
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
  color: '#1e293b',
  fontSize: '14px',
  fontStyle: 'italic',
  lineHeight: '22px',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center',
  marginBottom: '24px',
  marginTop: '20px',
};

const button = {
  backgroundColor: '#f97316',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
  borderRadius: '12px',
};

const footerNote = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '18px',
  marginTop: '20px',
  textAlign: 'center',
};
