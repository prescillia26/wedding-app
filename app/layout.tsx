import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes, Cormorant_Garamond, Playfair_Display, Bellefair } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const bellefair = Bellefair({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-bellefair",
});

export const metadata: Metadata = {
  // ✅ CRUCIAL : permet à toutes les URLs relatives d'être transformées en URLs absolues.
  // Sans ça, WhatsApp/Facebook ne peuvent pas résoudre les images OG.
  metadataBase: new URL(
   process.env.NEXT_PUBLIC_SITE_URL || "https://getlovit.fr"
  ),

  // ✅ Titre avec template : les pages enfant (comme /[slug]) peuvent définir leur propre titre,
  // sinon fallback sur le title "default"
  title: {
    default: "Lov'it — Invitations de mariage élégantes",
    template: "%s · Lov'it",
  },

  description:
    "Créez votre faire-part de mariage digital élégant en quelques minutes et partagez-le avec vos proches sur WhatsApp, iMessage ou par email.",

  // ✅ Métadonnées OG par défaut (pour la page d'accueil et pages sans OG custom)
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Lov'it",
    title: "Lov'it — Invitations de mariage élégantes",
    description:
      "Créez votre faire-part de mariage digital élégant en quelques minutes et partagez-le avec vos proches.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lov'it — Invitations de mariage élégantes",
    description: "Créez votre faire-part de mariage digital élégant en quelques minutes.",
  },

  // ✅ Icônes du site (si tu as un favicon.ico dans /app il sera détecté automatiquement,
  // sinon tu peux spécifier ici)
  icons: {
    icon: "/favicon.ico",
  },

  // ✅ Métadonnées additionnelles utiles
  applicationName: "Lov'it",
  authors: [{ name: "Lov'it" }],
  creator: "Lov'it",
  publisher: "Lov'it",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${cormorantGaramond.variable} ${playfairDisplay.variable} ${bellefair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}