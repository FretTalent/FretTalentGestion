import { Button, Text, Section } from '@react-email/components';
import * as React from 'react';
import BaseLayout from './BaseLayout';

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://www.frettalent.fr';

export default function AccountVerified({ candidateName }) {
  return (
    <BaseLayout
      previewText="Votre compte FretTalent est maintenant en ligne !"
      heading="Compte Validé ✅"
    >
      <Text style={text}>
        Félicitations <strong>{candidateName}</strong> !
      </Text>

      <Text style={text}>
        Notre équipe a examiné vos documents. Votre compte chauffeur est
        désormais <strong>validé et 100% en ligne</strong> sur la plateforme
        FretTalent.
      </Text>

      <Section style={highlightBox}>
        <Text style={highlightText}>
          Votre profil est maintenant visible (de manière anonymisée) par des
          centaines d'entreprises de transport à la recherche de vos
          compétences.
        </Text>
      </Section>

      <Text style={text}>
        Assurez-vous que vos disponibilités sont à jour pour maximiser vos
        chances d'être contacté.
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}/dashboard/candidate`}>
          Mettre à jour mes disponibilités
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

const highlightBox = {
  backgroundColor: '#fff7ed', // orange-50
  borderLeft: '4px solid #f97316', // orange-500
  padding: '16px 20px',
  marginBottom: '24px',
};

const highlightText = {
  color: '#9a3412', // orange-800
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center',
  marginTop: '32px',
};

const button = {
  backgroundColor: '#0f172a', // slate-900
  borderRadius: '9999px', // full
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 28px',
};
