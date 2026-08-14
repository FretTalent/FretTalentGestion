import { Button, Text, Section } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.fr';

export default function SupportNewConversationAdmin({
  userName,
  userEmail,
  userRole,
  subject,
  previewMessage,
  isReply = false,
}) {
  const roleLabel = userRole === 'recruiter' ? 'Entreprise / Recruteur' : 'Chauffeur / Candidat';
  const chatUrl = `${baseUrl}/dashboard/admin/chat`;

  const previewText = isReply
    ? `Nouveau message de ${userName} (${roleLabel})`
    : `Nouveau ticket support de ${userName} (${roleLabel})`;

  const heading = isReply
    ? 'Nouveau message sur le Support 💬'
    : 'Nouvelle demande de Support 🚨';

  const introText = isReply
    ? <>Un utilisateur vient d&apos;envoyer un nouveau message dans le tchat support :</>
    : <>Une nouvelle conversation de support vient d&apos;être ouverte sur la plateforme :</>;

  const highlightTitle = isReply ? 'Message reçu :' : 'Message initial :';

  return (
    <BaseLayout
      previewText={previewText}
      heading={heading}
    >
      <Text style={text}>
        {introText}
      </Text>

      <Section style={infoBox}>
        <Text style={infoRow}><strong>Utilisateur :</strong> {userName}</Text>
        <Text style={infoRow}><strong>E-mail :</strong> {userEmail}</Text>
        <Text style={infoRow}><strong>Profil :</strong> {roleLabel}</Text>
        <Text style={infoRow}><strong>Sujet :</strong> {subject}</Text>
      </Section>

      <Section style={highlightBox}>
        <Text style={highlightTitle}>{highlightTitle}</Text>
        <Text style={highlightText}>
          &ldquo;{previewMessage}&rdquo;
        </Text>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href={chatUrl}>
          Ouvrir le Tchat Admin
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
