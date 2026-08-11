import { Button, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.com';

export default function MissingDocuments({ candidateName, missingList }) {
  return (
    <BaseLayout
      previewText="Action requise : Documents manquants sur FretTalent"
      heading="Action Requise ⚠️"
    >
      <Text style={text}>
        Bonjour <strong>{candidateName}</strong>,
      </Text>

      <Text style={text}>
        Nous avons étudié votre dossier d'inscription sur FretTalent. Afin de
        pouvoir mettre en ligne votre profil et vous présenter aux recruteurs,{' '}
        <strong>
          certains documents obligatoires sont manquants ou non valides
        </strong>
        .
      </Text>

      <Section style={card}>
        <Text style={cardTitle}>Documents à fournir :</Text>
        <Hr style={hrSmall} />
        <ul style={list}>
          {missingList &&
            missingList.map((doc, index) => (
              <li key={index} style={listItem}>
                {doc}
              </li>
            ))}
          {(!missingList || missingList.length === 0) && (
            <li style={listItem}>
              Veuillez vérifier votre espace candidat pour plus de détails.
            </li>
          )}
        </ul>
      </Section>

      <Text style={text}>
        Sans ces documents, votre profil restera invisible pour les entreprises.
        Merci de les télécharger au plus vite depuis votre espace personnel.
      </Text>

      <Section style={btnContainer}>
        <Button
          style={button}
          href={`${baseUrl}/dashboard/candidate/documents`}
        >
          Ajouter mes documents
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
  backgroundColor: '#fff1f2', // rose-50
  border: '1px solid #fecdd3', // rose-200
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const cardTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#be123c', // rose-700
  margin: '0 0 12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const hrSmall = {
  borderColor: '#fda4af',
  margin: '8px 0 16px',
};

const list = {
  margin: '0',
  padding: '0 0 0 20px',
  color: '#881337', // rose-900
};

const listItem = {
  fontSize: '15px',
  lineHeight: '1.5',
  marginBottom: '8px',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '32px',
};

const button = {
  backgroundColor: '#e11d48', // rose-600
  borderRadius: '9999px', // full
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
  boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.2)',
};
