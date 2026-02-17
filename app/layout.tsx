import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "CyberShield - Cyber Security Party Games",
  description:
    "Real-time multiplayer party games for cybersecurity awareness. Spot phishing emails, describe cyber terms, rate passwords, and outscore your opponents.",
  keywords: [
    "cybersecurity",
    "phishing",
    "game",
    "training",
    "multiplayer",
    "party game",
    "cybershield",
    "cyberblather",
    "blather round",
  ],
  authors: [{ name: "CyberShield" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CyberShield",
    title: "CyberShield - Cyber Security Party Games",
    description:
      "Real-time multiplayer party games for cybersecurity awareness training",
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
