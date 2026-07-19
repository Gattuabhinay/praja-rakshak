import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = "https://praja-rakshak.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a2e4c",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Praja Rakshak · Clean Up + Speak Up | Telangana",
    template: "%s · Praja Rakshak",
  },
  description:
    "Praja Rakshak: Clean Up with vision AI for waste segregation, Speak Up with AI complaint drafting for bribery, FIR refusal, and corruption — filed on official Telangana portals.",
  applicationName: BRAND.name,
  keywords: [
    "Praja Rakshak",
    "Telangana",
    "Government of Telangana",
    "social impact",
    "waste segregation",
    "Clean Up",
    "Speak Up",
    "ACB",
    "GHMC",
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  icons: {
    icon: [
      { url: "/brand/praja-rakshak-logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/brand/praja-rakshak-logo.png"],
    apple: [{ url: "/brand/telangana-emblem.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: BRAND.name,
    title: "Praja Rakshak · Clean Up + Speak Up | Telangana",
    description:
      "Official Telangana civic AI guide: Clean Up waste with vision AI, Speak Up with complaint drafts, then file on government portals.",
    images: [
      {
        url: "/brand/telangana-emblem.png",
        width: 409,
        height: 409,
        alt: "Official Government of Telangana emblem — Praja Rakshak",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Praja Rakshak · Clean Up + Speak Up | Telangana",
    description:
      "Telangana civic AI: Clean Up + Speak Up. AI prepares. Official portals file.",
    images: ["/brand/telangana-emblem.png"],
  },
  other: {
    "og:image:alt": "Official Government of Telangana emblem — Praja Rakshak",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
