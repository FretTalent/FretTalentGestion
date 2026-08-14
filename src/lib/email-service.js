import { resend } from './resend';
import { render } from '@react-email/render';

// Templates
import NewCandidateNotification from '../emails/NewCandidateNotification';
import PaymentConfirmation from '../emails/PaymentConfirmation';
import AccountVerified from '../emails/AccountVerified';
import MissingDocuments from '../emails/MissingDocuments';
import SupportNewMessageUser from '../emails/SupportNewMessageUser';
import SupportNewConversationAdmin from '../emails/SupportNewConversationAdmin';

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
 * Envoie un email de compte vérifié au chauffeur
 */
export async function sendAccountVerifiedEmail(email, candidateName) {
  try {
    const html = await render(
      <AccountVerified candidateName={candidateName} />,
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Votre compte FretTalent est validé ! 🎉',
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

/**
 * Envoie un email d'alerte à l'administrateur lorsqu'un candidat ou recruteur ouvre une nouvelle conversation de support
 */
export async function sendSupportNewConversationAdmin({
  userName,
  userEmail,
  userRole,
  subject,
  previewMessage,
}) {
  try {
    const html = await render(
      <SupportNewConversationAdmin
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        subject={subject}
        previewMessage={previewMessage}
      />,
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `🚨 Support FretTalent : Nouveau ticket de ${userName} (${subject})`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendSupportNewConversationAdmin:', error);
    return { success: false, error };
  }
}

/**
 * Notifie l'admin par email lorsqu'un candidat ou recruteur répond / envoie un nouveau message dans le tchat
 */
export async function sendSupportNewMessageAdmin({
  userName,
  userEmail,
  userRole,
  subject,
  previewMessage,
}) {
  try {
    const html = await render(
      <SupportNewConversationAdmin
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        subject={subject}
        previewMessage={previewMessage}
        isReply={true}
      />,
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `💬 Support FretTalent : Nouveau message de ${userName} (${subject})`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendSupportNewMessageAdmin:', error);
    return { success: false, error };
  }
}

/**
 * Envoie 1 seul email au candidat ou recruteur lorsqu'un message du support lui est envoyé (1er message ou ouverture par l'admin)
 */
export async function sendSupportNewMessageUser({
  userEmail,
  userName,
  userRole,
  subject,
  previewMessage,
  isNewConversation = false,
}) {
  try {
    const emailSubject = isNewConversation
      ? `💬 Message de l'équipe FretTalent : ${subject}`
      : `💬 Réponse du Support FretTalent : ${subject}`;

    const html = await render(
      <SupportNewMessageUser
        userName={userName}
        subject={subject}
        previewMessage={previewMessage}
        userRole={userRole}
        isNewConversation={isNewConversation}
      />,
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: emailSubject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendSupportNewMessageUser:', error);
    return { success: false, error };
  }
}
