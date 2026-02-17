import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "CyberFib - Cybersecurity Guessing Game for Kids",
  description:
    "A fun multiplayer party game where kids make up fake answers to cybersecurity questions, then everyone votes on which one is real. Learn online safety while having a blast!",
  keywords: [
    "cybersecurity",
    "fibbage",
    "cyberfib",
    "trivia",
    "party game",
    "multiplayer",
    "kids",
    "K-12",
    "online safety",
    "security awareness",
    "educational game",
  ],
  authors: [{ name: "CyberFib" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CyberFib",
    title: "CyberFib - Cybersecurity Guessing Game for Kids",
    description:
      "Can you spot the real answer? Make up your own and see who falls for it! A fun multiplayer game to learn about online safety.",
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
