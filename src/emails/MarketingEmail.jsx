import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

export default function MarketingEmail({
  type = "custom", // 'promo', 'update', 'custom'
  title = "Nouvelle annonce FretTalent",
  message = "Voici un message de FretTalent.",
  ctaText = "Découvrir",
  ctaLink = "https://frettalent.fr",
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fret-talent-gestion.vercel.app";
  
  // Custom styles and emojis based on type
  let badgeText = "Annonce";
  let badgeColor = "bg-slate-100 text-slate-800";
  let titleColor = "text-slate-900";
  let buttonColor = "bg-orange-500 text-white";
  
  if (type === "promo") {
    badgeText = "🎉 Offre Spéciale";
    badgeColor = "bg-purple-100 text-purple-700";
    titleColor = "text-purple-900";
    buttonColor = "bg-purple-600 text-white";
  } else if (type === "update") {
    badgeText = "🚀 Nouveauté";
    badgeColor = "bg-blue-100 text-blue-700";
    titleColor = "text-blue-900";
    buttonColor = "bg-blue-600 text-white";
  }

  const previewText = title;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-slate-200 rounded-xl my-[40px] mx-auto p-[20px] bg-white w-full max-w-xl shadow-sm">
            <Section className="mt-[10px] mb-[20px] text-center">
              <Img
                src="https://frettalent.fr/images/logo_fret_talent.png"
                width="150"
                alt="FretTalent"
                className="my-0 mx-auto"
              />
            </Section>

            <Section className="text-center mb-[20px]">
              <Text className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColor} m-0`}>
                {badgeText}
              </Text>
            </Section>

            <Heading className={`${titleColor} text-[24px] font-bold text-center p-0 mt-0 mb-[30px] mx-0`}>
              {title}
            </Heading>

            <Text className="text-slate-600 text-[16px] leading-[26px] whitespace-pre-line">
              {message}
            </Text>

            {ctaText && ctaLink && (
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className={`${buttonColor} rounded-lg text-center text-[14px] font-bold no-underline py-4 px-8`}
                  href={ctaLink}
                >
                  {ctaText}
                </Button>
              </Section>
            )}

            <Hr className="border border-slate-100 my-[20px] mx-0" />
            
            <Text className="text-slate-400 text-[12px] leading-[20px]">
              Vous recevez cet e-mail car vous êtes inscrit sur FretTalent. <br/>
              Si vous avez des questions, vous pouvez nous contacter à support@frettalent.fr.
            </Text>
            <Text className="text-slate-400 text-[12px] leading-[20px] text-center mt-[20px]">
              &copy; {new Date().getFullYear()} FretTalent. Tous droits réservés.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
