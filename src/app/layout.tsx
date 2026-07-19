import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a2e4c",
};

export const metadata: Metadata = {
  title: "Praja Rakshak · Clean Up + Speak Up | Telangana Social Impact AI",
  description:
    "Praja Rakshak: Clean Up with vision AI for waste segregation, Speak Up with AI complaint drafting for bribery, FIR refusal, and corruption — filed on official Telangana portals.",
  keywords: [
    "Praja Rakshak",
    "Telangana",
    "social impact",
    "waste segregation",
    "Clean Up",
    "Speak Up",
    "ACB",
    "GHMC",
  ],
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
