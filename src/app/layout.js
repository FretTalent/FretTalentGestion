import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FretTalent - Recrutez vos chauffeurs routiers en 1 clic",
  description: "Plateforme de mise en relation directe et recrutement anonyme pour chauffeurs routiers et entreprises de transport en France.",
  verification: {
    google: "HaOFAtVy2hTWaEMQwIe99GOYa82kYu0inM7cgWsnIp4",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "FretTalent - Recrutement Chauffeurs Routiers",
    description: "Mise en relation directe sans intermédiaire. 100% gratuit pour les chauffeurs, paiement au contact pour les entreprises.",
    url: "https://fret-talent-gestion.vercel.app",
    siteName: "FretTalent",
    images: [
      {
        url: "https://fret-talent-gestion.vercel.app/logo.png",
        width: 800,
        height: 600,
        alt: "FretTalent Logo",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
