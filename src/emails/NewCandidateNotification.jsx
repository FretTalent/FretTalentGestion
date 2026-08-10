import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.com';

export default function NewCandidateNotification({ candidateName, candidateId, location }) {
  return (
    <BaseLayout 
      previewText="Une nouvelle inscription sur FretTalent !"
      heading="Nouveau Candidat Inscrit 🚀"
    >
      <Text style={text}>
        Un nouveau chauffeur vient de s'inscrire sur la plateforme FretTalent.
      </Text>
      
      <Section style={card}>
        <Text style={cardTitle}>Détails du profil :</Text>
        <Text style={cardRow}><strong>ID :</strong> {candidateId}</Text>
        <Text style={cardRow}><strong>Nom/Pseudo :</strong> {candidateName}</Text>
        <Text style={cardRow}><strong>Localisation :</strong> {location}</Text>
      </Section>
      
      <Text style={text}>
        Vous pouvez vérifier ce profil et ses documents depuis le tableau de bord administrateur.
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}/dashboard/admin/candidats/${candidateId}`}>
          Voir le profil
        </Button>
      </Section>
    </BaseLayout>
  );
}

const text = {
  color: '#334155', // slate-700
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '20px',
};

const card = {
  backgroundColor: '#f8fafc', // slate-50
  border: '1px solid #e2e8f0', // slate-200
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const cardTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const cardRow = {
  fontSize: '15px',
  color: '#475569',
  margin: '0 0 8px',
  lineHeight: '1.4',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '32px',
};

const button = {
  backgroundColor: '#f97316', // orange-500
  borderRadius: '9999px', // full
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
  boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2), 0 2px 4px -1px rgba(249, 115, 22, 0.1)',
};
