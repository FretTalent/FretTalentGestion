import { Button, Section, Text, Hr } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://www.frettalent.fr';

export default function PaymentConfirmation({
  companyName,
  amount,
  planName,
  receiptUrl,
  date,
}) {
  return (
    <BaseLayout
      previewText="Confirmation de votre paiement sur FretTalent"
      heading="Paiement Confirmé 🎉"
    >
      <Text style={text}>
        Bonjour <strong>{companyName}</strong>,
      </Text>
      <Text style={text}>
        Nous vous confirmons la bonne réception de votre paiement pour les
        services FretTalent. Merci de votre confiance !
      </Text>

      <Section style={card}>
        <Text style={cardTitle}>Détails de la transaction :</Text>
        <Hr style={hrSmall} />
        <Text style={cardRow}>
          <strong>Offre :</strong> {planName}
        </Text>
        <Text style={cardRow}>
          <strong>Montant payé :</strong> {amount} €
        </Text>
        <Text style={cardRow}>
          <strong>Date :</strong> {date}
        </Text>
      </Section>

      <Text style={text}>
        Vos nouveaux avantages sont désormais actifs sur votre compte. Vous
        pouvez commencer à recruter dès maintenant.
      </Text>

      <Section style={btnContainer}>
        {receiptUrl && (
          <Button style={buttonOutline} href={receiptUrl}>
            Télécharger la facture
          </Button>
        )}
        <span style={{ margin: '0 8px' }}></span>
        <Button style={button} href={`${baseUrl}/dashboard/recruiter`}>
          Accéder à mon espace
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

const hrSmall = {
  borderColor: '#cbd5e1',
  margin: '8px 0 16px',
};

const cardRow = {
  fontSize: '15px',
  color: '#475569',
  margin: '0 0 10px',
  lineHeight: '1.4',
  display: 'flex',
  justifyContent: 'space-between',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '32px',
};

const button = {
  backgroundColor: '#f97316', // orange-500
  borderRadius: '9999px', // full
  color: '#fff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 24px',
  boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)',
};

const buttonOutline = {
  backgroundColor: 'transparent',
  border: '2px solid #e2e8f0',
  borderRadius: '9999px',
  color: '#334155',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '10px 24px',
};
