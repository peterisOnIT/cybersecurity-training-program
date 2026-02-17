import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "CyberBlather - Cybersecurity Word Guessing Party Game",
  description:
    "A multiplayer party game where players describe cybersecurity terms using sentence templates while others race to guess. Learn about phishing, encryption, and more through play.",
  keywords: [
    "cybersecurity",
    "cyberblather",
    "blather round",
    "word guessing",
    "party game",
    "multiplayer",
    "training",
    "security awareness",
  ],
  authors: [{ name: "CyberBlather" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CyberBlather",
    title: "CyberBlather - Cybersecurity Word Guessing Party Game",
    description:
      "Describe cybersecurity terms, guess what others describe, and learn through play in this multiplayer party game.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0F1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${jetbrainsMono.variable} font-sans antialiased`}
        style={{ background: "#0B0F1A" }}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          style={{ background: "#00E5FF", color: "#0B0F1A" }}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
