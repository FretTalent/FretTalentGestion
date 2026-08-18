import { resend } from './resend';
import { render } from '@react-email/render';

// Templates
import NewCandidateNotification from '../emails/NewCandidateNotification';
import PaymentConfirmation from '../emails/PaymentConfirmation';
import AccountVerified from '../emails/AccountVerified';
import MissingDocuments from '../emails/MissingDocuments';
import SupportNewMessageUser from '../emails/SupportNewMessageUser';
import SupportNewConversationAdmin from '../emails/SupportNewConversationAdmin';
import CandidateReminderDay1 from '../emails/CandidateReminderDay1';
import CandidateReminderDay4 from '../emails/CandidateReminderDay4';
import CandidateReminderDay10 from '../emails/CandidateReminderDay10';
import ContactFormAdmin from '../emails/ContactFormAdmin';
import ContactFormConfirmationUser from '../emails/ContactFormConfirmationUser';
import VerificationEmail from '../emails/VerificationEmail';
import CompanyPremiumCandidature from '../emails/CompanyPremiumCandidature';
import CandidatePremiumConfirmation from '../emails/CandidatePremiumConfirmation';
import CandidateApplicationOpened from '../emails/CandidateApplicationOpened';
import CompanyRelanceDay7 from '../emails/CompanyRelanceDay7';
import CandidateRelanceSent from '../emails/CandidateRelanceSent';

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
  candidateId = null
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';
    const trackingToken = `doc-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
    const trackingUrl = `${baseUrl}/api/premium/open-tracking?t=${trackingToken}`;

    // Enregistrer dans candidature_emails pour le tracking d'ouverture
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      let validCandId = candidateId;
      if (!validCandId) {
        const { data: cand } = await supabaseAdmin.from('candidatures').select('id').limit(1).maybeSingle();
        validCandId = cand?.id || '2450981b-c623-4db2-b0f3-2b4a2c3dbca3';
      }

      await supabaseAdmin.from('candidature_emails').insert({
        candidature_id: validCandId,
        candidate_id: candidateId,
        company_name: candidateName || email,
        company_email: email,
        tracking_token: trackingToken,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('[MissingDocs] Warning enregistrement tracking:', dbErr.message);
    }

    const html = await render(
      <MissingDocuments
        candidateName={candidateName}
        missingList={missingList}
        trackingUrl={trackingUrl}
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

/**
 * Envoie le rappel J+1 (incitation bienveillante)
 */
export async function sendCandidateReminderDay1(email, candidateName, candidateId = null) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';
    const trackingToken = `remind-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
    const trackingUrl = `${baseUrl}/api/premium/open-tracking?t=${trackingToken}`;

    // Enregistrer pour le tracking Telegram
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      let validCandId = candidateId;
      if (!validCandId) {
        const { data: cand } = await supabaseAdmin.from('candidatures').select('id').limit(1).maybeSingle();
        validCandId = cand?.id || '2450981b-c623-4db2-b0f3-2b4a2c3dbca3';
      }

      await supabaseAdmin.from('candidature_emails').insert({
        candidature_id: validCandId,
        candidate_id: candidateId,
        company_name: candidateName || email,
        company_email: email,
        tracking_token: trackingToken,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('[ReminderDay1] Warning enregistrement tracking:', dbErr.message);
    }

    const html = await render(
      <CandidateReminderDay1
        candidateName={candidateName}
        trackingUrl={trackingUrl}
      />
    );
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Activez votre badge Chauffeur Vérifié sur FretTalent 🚛',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendCandidateReminderDay1:', error);
    return { success: false, error };
  }
}

/**
 * Envoie le rappel J+4 (opportunités d'embauche)
 */
export async function sendCandidateReminderDay4(email, candidateName, candidateId = null) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';
    const trackingToken = `remind-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
    const trackingUrl = `${baseUrl}/api/premium/open-tracking?t=${trackingToken}`;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      let validCandId = candidateId;
      if (!validCandId) {
        const { data: cand } = await supabaseAdmin.from('candidatures').select('id').limit(1).maybeSingle();
        validCandId = cand?.id || '2450981b-c623-4db2-b0f3-2b4a2c3dbca3';
      }

      await supabaseAdmin.from('candidature_emails').insert({
        candidature_id: validCandId,
        candidate_id: candidateId,
        company_name: candidateName || email,
        company_email: email,
        tracking_token: trackingToken,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('[ReminderDay4] Warning enregistrement tracking:', dbErr.message);
    }

    const html = await render(
      <CandidateReminderDay4
        candidateName={candidateName}
        trackingUrl={trackingUrl}
      />
    );
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: '⚠️ Des opportunités d\'embauche attendent vos documents sur FretTalent',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendCandidateReminderDay4:', error);
    return { success: false, error };
  }
}

/**
 * Envoie le rappel J+10 (opportunités & validation)
 */
export async function sendCandidateReminderDay10(email, candidateName, candidateId = null) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.frettalent.fr';
    const trackingToken = `remind-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
    const trackingUrl = `${baseUrl}/api/premium/open-tracking?t=${trackingToken}`;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      let validCandId = candidateId;
      if (!validCandId) {
        const { data: cand } = await supabaseAdmin.from('candidatures').select('id').limit(1).maybeSingle();
        validCandId = cand?.id || '2450981b-c623-4db2-b0f3-2b4a2c3dbca3';
      }

      await supabaseAdmin.from('candidature_emails').insert({
        candidature_id: validCandId,
        candidate_id: candidateId,
        company_name: candidateName || email,
        company_email: email,
        tracking_token: trackingToken,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('[ReminderDay10] Warning enregistrement tracking:', dbErr.message);
    }

    const html = await render(
      <CandidateReminderDay10
        candidateName={candidateName}
        trackingUrl={trackingUrl}
      />
    );
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: '🚛 Obtenez votre badge Vérifié et soyez contacté par les recruteurs',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendCandidateReminderDay10:', error);
    return { success: false, error };
  }
}

/**
 * Envoie le message du formulaire de contact à support@frettalent.fr
 * et envoie un accusé de réception automatique au demandeur
 */
export async function sendContactFormEmails({
  name,
  email,
  phone,
  role,
  subject,
  message,
}) {
  const results = { adminEmail: null, userEmail: null };

  // 1. Email vers l'équipe FretTalent (support@frettalent.fr)
  try {
    const adminHtml = await render(
      <ContactFormAdmin
        name={name}
        email={email}
        phone={phone}
        role={role}
        subject={subject}
        message={message}
      />
    );

    results.adminEmail = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `📬 Nouveau contact [${role === 'recruiter' ? 'Entreprise' : role === 'candidate' ? 'Chauffeur' : 'Autre'}] : ${subject}`,
      html: adminHtml,
    });
  } catch (err) {
    console.error('Erreur envoi email contact admin:', err);
    results.adminEmail = { error: err.message };
  }

  // 2. Accusé de réception automatique envoyé au demandeur
  try {
    const userHtml = await render(
      <ContactFormConfirmationUser
        name={name}
        subject={subject}
        message={message}
      />
    );

    results.userEmail = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `Confirmation de réception de votre message — FretTalent`,
      html: userHtml,
    });
  } catch (err) {
    console.error('Erreur envoi email contact confirmation utilisateur:', err);
    results.userEmail = { error: err.message };
  }

  return results;
}

/**
 * Envoie un email de vérification / confirmation de compte avec lien direct sécurisé
 */
export async function sendVerificationEmail(email, confirmationUrl) {
  try {
    const html = await render(
      <VerificationEmail confirmationUrl={confirmationUrl} />
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Activez votre compte FretTalent 🚚',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur email sendVerificationEmail:', error);
    return { success: false, error };
  }
}

/**
 * Envoie la candidature Premium d'un chauffeur à une entreprise ciblée
 */
export async function sendCompanyPremiumCandidatureEmail({
  toEmail,
  companyName,
  candidate,
  distanceKm,
  trackingUrl,
  summaryPdfHtmlUrl,
  attachments = [],
}) {
  try {
    const html = await render(
      <CompanyPremiumCandidature
        companyName={companyName}
        candidateName={candidate.full_name || 'Chauffeur'}
        candidateCity={candidate.city || 'France'}
        candidatePostalCode={candidate.postal_code || ''}
        distanceKm={distanceKm}
        licenses={candidate.licenses || ['SPL']}
        certifications={candidate.certifications || []}
        specialties={candidate.job_preferences || []}
        experienceYears={candidate.experience_years || 0}
        availability={candidate.availability === 'immediate' ? 'Immédiate' : candidate.availability_date || 'Sous préavis'}
        phone={candidate.phone || 'Non renseigné'}
        email={candidate.email || 'Non renseigné'}
        bio={candidate.bio || ''}
        candidateId={candidate.id}
        trackingUrl={trackingUrl}
        summaryPdfHtmlUrl={summaryPdfHtmlUrl}
      />
    );

    const emailOptions = {
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `⭐ Candidature Directe : ${candidate.full_name || 'Chauffeur'} (${(candidate.licenses || ['SPL']).join('/')}) à ${distanceKm} km`,
      html,
    };

    if (attachments && attachments.length > 0) {
      emailOptions.attachments = attachments;
    }

    const data = await resend.emails.send(emailOptions);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur sendCompanyPremiumCandidatureEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie la confirmation au chauffeur avec le nombre d'entreprises contactées
 */
export async function sendCandidatePremiumConfirmationEmail({
  email,
  candidateName,
  companiesCount,
  radiusKm = 50,
  city = 'votre secteur',
}) {
  try {
    const html = await render(
      <CandidatePremiumConfirmation
        candidateName={candidateName}
        companiesCount={companiesCount}
        radiusKm={radiusKm}
        city={city}
      />
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `🚀 Confirmation : Votre candidature a été transmise à ${companiesCount} entreprises !`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur sendCandidatePremiumConfirmationEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un accusé de réception au chauffeur quand une entreprise ouvre son dossier
 */
export async function sendCandidateApplicationOpenedEmail({
  email,
  candidateName,
  companyName,
  companyCity,
}) {
  try {
    const html = await render(
      <CandidateApplicationOpened
        candidateName={candidateName}
        companyName={companyName}
        companyCity={companyCity}
        openedAt={new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      />
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `🎉 ${companyName} (${companyCity}) vient d'ouvrir votre candidature !`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur sendCandidateApplicationOpenedEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie la relance J+7 aux entreprises
 */
export async function sendCompanyRelanceDay7Email({
  toEmail,
  companyName,
  candidate,
  distanceKm,
  trackingUrl,
}) {
  try {
    const html = await render(
      <CompanyRelanceDay7
        companyName={companyName}
        candidateName={candidate.full_name || 'Chauffeur'}
        candidateCity={candidate.city || 'France'}
        candidatePostalCode={candidate.postal_code || ''}
        distanceKm={distanceKm}
        licenses={candidate.licenses || ['SPL']}
        phone={candidate.phone || ''}
        email={candidate.email || ''}
        availability={candidate.availability === 'immediate' ? 'Immédiate' : candidate.availability_date || 'Sous préavis'}
        trackingUrl={trackingUrl}
      />
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `Rappel Disponibilité : Le chauffeur ${candidate.full_name || ''} (${(candidate.licenses || ['SPL']).join('/')}) à ${distanceKm} km`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur sendCompanyRelanceDay7Email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie la confirmation au chauffeur que sa relance J+7 a été transmise
 */
export async function sendCandidateRelanceSentEmail({
  email,
  candidateName,
  companiesCount,
}) {
  try {
    const html = await render(
      <CandidateRelanceSent
        candidateName={candidateName}
        companiesCount={companiesCount}
      />
    );

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `📬 Relance automatique J+7 transmise à ${companiesCount} transporteurs !`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur sendCandidateRelanceSentEmail:', error);
    return { success: false, error: error.message };
  }
}



