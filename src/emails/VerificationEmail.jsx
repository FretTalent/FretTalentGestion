import { Button, Text, Section } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

export default function VerificationEmail({ confirmationUrl }) {
  // En mode production, confirmationUrl est injecté par Supabase via le tag {{ .ConfirmationURL }}
  const href = confirmationUrl || '{{ .ConfirmationURL }}';
  
  return (
    <BaseLayout 
      previewText="Vérifiez votre adresse e-mail FretTalent"
      heading="Bienvenue sur FretTalent !"
    >
      <Text style={text}>
        Merci de vous être inscrit sur FretTalent. Pour valider votre compte et commencer à utiliser la plateforme, veuillez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous.
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href={href}>
          Vérifier mon e-mail
        </Button>
      </Section>
      
      <Text style={textMuted}>
        Si vous n'avez pas créé de compte sur FretTalent, vous pouvez ignorer cet e-mail.
      </Text>
    </BaseLayout>
  );
}

const text = {
  color: '#334155', // slate-700
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '20px',
};

const textMuted = {
  color: '#64748b', // slate-500
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
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
  boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)',
};
