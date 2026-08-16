import { Button, Text, Section } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.frettalent.fr';

export default function ContactFormConfirmationUser({
  name,
  subject,
  message,
}) {
  return (
    <BaseLayout
      previewText="Nous avons bien reçu votre message — FretTalent"
      heading="Message bien reçu ! 🚀"
    >
      <Text style={text}>
        Bonjour <strong>{name}</strong>,
      </Text>
      <Text style={text}>
        Merci d&apos;avoir contacté <strong>FretTalent</strong>. Notre équipe support et commerciale a bien pris en compte votre demande concernant : <strong>&laquo; {subject} &raquo;</strong>.
      </Text>
      <Text style={text}>
        Un conseiller dédié analyse votre message et reviendra vers vous par e-mail dans les plus brefs délais (délai moyen constaté : <strong>moins de 2 heures</strong>).
      </Text>

      <Section style={highlightBox}>
        <Text style={highlightTitle}>Rappel de votre message :</Text>
        <Text style={highlightText}>
          &ldquo;{message}&rdquo;
        </Text>
      </Section>

      <Text style={text}>
        En attendant, vous pouvez également nous contacter directement sur notre bot <strong>Telegram (@Frettalent)</strong> ou sur notre page <strong>Facebook officielle</strong> :
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}/candidats-disponibles`}>
          Explorer la Plateforme FretTalent
        </Button>
      </Section>

      <Text style={footerNote}>
        Besoin d&apos;une réponse ultra-rapide ? Écrivez-nous directement sur Telegram : <a href="https://t.me/Frettalent" style={{ color: '#0284c7' }}>@Frettalent</a>
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
  backgroundColor: '#f8fafc',
  borderLeft: '4px solid #0284c7',
  padding: '16px 20px',
  marginBottom: '24px',
  borderRadius: '8px',
};

const highlightTitle = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#0369a1',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

const highlightText = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '22px',
  fontStyle: 'italic',
  whiteSpace: 'pre-line',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '24px',
  marginBottom: '20px',
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

const footerNote = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '20px',
  marginTop: '16px',
};
