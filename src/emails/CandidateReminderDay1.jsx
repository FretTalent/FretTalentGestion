import { Button, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.com';

export default function CandidateReminderDay1({ candidateName = 'Chauffeur' }) {
  return (
    <BaseLayout
      previewText="Activez votre badge Chauffeur Vérifié 🛡️ sur FretTalent"
      heading="Bienvenue sur FretTalent 🚛"
    >
      <Text style={text}>
        Bonjour <strong>{candidateName}</strong>,
      </Text>

      <Text style={text}>
        Vous avez récemment créé votre profil chauffeur sur <strong>FretTalent</strong> et nous vous en remercions !
      </Text>

      <Section style={card}>
        <Text style={cardTitle}>🎯 Obtenez votre badge « Profil 100% Vérifié 🛡️ »</Text>
        <Hr style={hrSmall} />
        <Text style={cardText}>
          Les entreprises de transport en <strong>France, Belgique, Luxembourg et Suisse</strong> consultent et contactent en priorité les profils vérifiés.
        </Text>
        <Text style={cardTextSmall}>
          📱 <strong>Astuce rapide :</strong> Pas besoin de scanner ! Une simple photo nette de votre <strong>permis de conduire</strong>, <strong>carte conducteur (chrono)</strong> et <strong>FIMO</strong> prise avec votre smartphone suffit en 1 minute.
        </Text>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}/dashboard/candidate/documents`}>
          Prendre en photo mes documents 📸
        </Button>
      </Section>

      <Text style={footerNote}>
        🔒 Vos documents et coordonnées directes restent strictement confidentiels et anonymes.
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
  border: '1px solid #ffedd5',
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

const cardTextSmall = {
  fontSize: '13px',
  color: '#7c2d12',
  lineHeight: '20px',
  margin: '0',
  backgroundColor: '#ffedd5',
  padding: '10px 14px',
  borderRadius: '10px',
};

const hrSmall = {
  borderColor: '#fed7aa',
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
