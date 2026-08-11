import { resend } from './resend';
import { render } from '@react-email/render';

// Templates
import NewCandidateNotification from '../emails/NewCandidateNotification';
import PaymentConfirmation from '../emails/PaymentConfirmation';
import AccountVerified from '../emails/AccountVerified';
import MissingDocuments from '../emails/MissingDocuments';

const FROM_EMAIL = 'FretTalent <support@frettalent.fr>';
const ADMIN_EMAIL = 'support@frettalent.fr'; // A envoyer aux admins de FretTalent

/**
 * Envoie une notification à l'admin lorsqu'un nouveau candidat s'inscrit
 */
export async function sendNewCandidateNotification(candidate) {
  try {
    const html = await render(
      <NewCandidateNotification
        candidateName={candidate.first_name || 'Candidat'}
        candidateId={candidate.id}
        location={candidate.postal_code || 'Non spécifié'}
      />,
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: 'Nouveau chauffeur inscrit sur FretTalent 🚀',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendNewCandidateNotification:', error);
    return { success: false, error };
  }
}

/**
 * Envoie une confirmation de paiement à une entreprise
 */
export async function sendPaymentConfirmation(email, paymentDetails) {
  try {
    const html = await render(
      <PaymentConfirmation
        companyName={paymentDetails.companyName}
        amount={paymentDetails.amount}
        planName={paymentDetails.planName}
        receiptUrl={paymentDetails.receiptUrl}
        date={new Date().toLocaleDateString('fr-FR')}
      />,
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Confirmation de votre paiement - FretTalent',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendPaymentConfirmation:', error);
    return { success: false, error };
  }
}

/**
 * Envoie un email au candidat pour l'informer que son compte est vérifié et en ligne
 */
export async function sendAccountVerifiedEmail(email, candidateName) {
  try {
    const html = await render(
      <AccountVerified candidateName={candidateName} />,
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Votre compte FretTalent est validé ! ✅',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendAccountVerifiedEmail:', error);
    return { success: false, error };
  }
}

/**
 * Envoie un email au candidat pour lui demander des documents supplémentaires
 */
export async function sendMissingDocumentsEmail(
  email,
  candidateName,
  missingList,
) {
  try {
    const html = await render(
      <MissingDocuments
        candidateName={candidateName}
        missingList={missingList}
      />,
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Action requise : Documents manquants sur FretTalent ⚠️',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendMissingDocumentsEmail:', error);
    return { success: false, error };
  }
}
