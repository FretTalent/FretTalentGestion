import { Button, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.com';

export default function CandidateReminderDay10({ candidateName = 'Chauffeur' }) {
  return (
    <BaseLayout
      previewText="🚛 Obtenez votre badge Vérifié et recevez des propositions d'embauche"
      heading="Boostez vos opportunités de recrutement 🚛"
    >
      <Text style={text}>
        Bonjour <strong>{candidateName}</strong>,
      </Text>

      <Text style={text}>
        Vous êtes inscrit sur <strong>FretTalent</strong>, la plateforme directe de recrutement pour les conducteurs routiers en France, Suisse, Belgique et Luxembourg.
      </Text>

      <Section style={card}>
        <Text style={cardTitle}>🛡️ Activez votre badge « Chauffeur 100% Vérifié »</Text>
        <Hr style={hrSmall} />
        <Text style={cardText}>
          Les transporteurs recherchent activement des conducteurs qualifiés et contactent en priorité les profils avec justificatifs validés (Permis C/CE, Carte Chrono, FIMO/FCO).
        </Text>
        <Text style={cardTextHighlight}>
          Prenez simplement vos justificatifs en photo avec votre téléphone (1 minute) pour maximiser votre visibilité auprès des recruteurs.
        </Text>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}/dashboard/candidate/documents`}>
          Déposer mes documents 📸
        </Button>
      </Section>

      <Text style={footerNote}>
        Votre profil reste actif et consultable. 100% gratuit et sans intermédiaire.
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
  backgroundColor: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
};

const cardTitle = {
  fontSize: '15px',
  fontWeight: '800',
  color: '#c2410c',
  margin: '0 0 10px',
};

const cardText = {
  fontSize: '14px',
  color: '#9a3412',
  lineHeight: '22px',
  margin: '0 0 10px',
};

const cardTextHighlight = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#ea580c',
  lineHeight: '20px',
  margin: '0',
  backgroundColor: '#ffedd5',
  padding: '10px 14px',
  borderRadius: '10px',
};

const hrSmall = {
  borderColor: '#fdba74',
  margin: '8px 0 14px',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '28px',
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '9999px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
};

const footerNote = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center',
  margin: '0',
};

