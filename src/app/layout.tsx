import type { Metadata } from "next";
import { Geist_Mono, Inter, Bricolage_Grotesque } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieBanner } from "@/components/CookieBanner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter is the single sans-serif across the app; Bricolage is the display face.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], display: "swap" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Evvy — Share your events, beautifully",
    template: "%s | Evvy",
  },
  description:
    "Create shareable event and calendar pages in seconds. Let guests add events to Google Calendar, Apple, Outlook, and more — with one click.",
  openGraph: {
    type: "website",
    siteName: "Evvy",
    title: "Evvy — Share your events, beautifully",
    description:
      "Create shareable event and calendar pages in seconds. Let guests add events to Google Calendar, Apple, Outlook, and more — with one click.",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Evvy — Share your events, beautifully",
    description:
      "Create shareable event and calendar pages in seconds. Let guests add events to Google Calendar, Apple, Outlook, and more — with one click.",
  },
  alternates: {
    canonical: APP_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = (await cookies()).get("minical_lang")?.value === "fr" ? "fr" : "en";

  return (
    <html
      lang={lang}
      className={`${geistMono.variable} ${inter.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
