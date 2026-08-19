import { Button, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.fr';

export default function CandidateReminderDay4({ candidateName = 'Chauffeur', trackingUrl }) {
  return (
    <BaseLayout
      previewText="⚠️ Opportunités d'embauche en attente sur votre profil FretTalent"
      heading="Ne manquez pas vos opportunités 🚛"
      trackingUrl={trackingUrl}
    >
      <Text style={text}>
        Bonjour <strong>{candidateName}</strong>,
      </Text>

      <Text style={text}>
        De nombreux transporteurs recrutent activement des chauffeurs routiers (PL, SPL, Frigo, Benne, Citerne, Tautliner) en <strong>France, Suisse, Belgique et Luxembourg</strong>.
      </Text>

      <Section style={card}>
        <Text style={cardTitle}>⚠️ Votre profil n'est pas encore vérifié</Text>
        <Hr style={hrSmall} />
        <Text style={cardText}>
          Sans vos justificatifs officiels (permis C/CE, carte chrono, FIMO), les recruteurs ne peuvent pas valider vos compétences ni débloquer votre contact pour vous proposer un poste.
        </Text>
        <Text style={cardTextAlert}>
          ⏳ <strong>Rappel :</strong> Prenez 1 minute pour déposer une photo de vos cartes depuis votre smartphone afin de rester visible auprès des entreprises.
        </Text>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}/dashboard/candidate/documents`}>
          Ajouter mes documents maintenant 📄
        </Button>
      </Section>

      <Text style={footerNote}>
        Besoin d'aide ? Notre support est joignable directement sur votre espace client ou par e-mail à support@frettalent.fr.
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
  backgroundColor: '#fefce8',
  border: '1px solid #fef08a',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
};

const cardTitle = {
  fontSize: '15px',
  fontWeight: '800',
  color: '#854d0e',
  margin: '0 0 10px',
};

const cardText = {
  fontSize: '14px',
  color: '#713f12',
  lineHeight: '22px',
  margin: '0 0 10px',
};

const cardTextAlert = {
  fontSize: '13px',
  color: '#854d0e',
  lineHeight: '20px',
  margin: '0',
  backgroundColor: '#fef08a',
  padding: '10px 14px',
  borderRadius: '10px',
};

const hrSmall = {
  borderColor: '#fde047',
  margin: '8px 0 14px',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '28px',
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#eab308',
  borderRadius: '9999px',
  color: '#000000',
  fontSize: '15px',
  fontWeight: '900',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
  boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
};

const footerNote = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center',
  margin: '0',
};
