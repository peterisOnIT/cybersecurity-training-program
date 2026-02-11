import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cyber Clash - The Phishing Party Game",
  description:
    "A Jackbox-style multiplayer party game for cybersecurity awareness training. Join with a room code and test your phishing detection skills!",
  keywords: [
    "cybersecurity",
    "phishing",
    "party game",
    "multiplayer",
    "jackbox",
    "training",
  ],
}

export const viewport: Viewport = {
  themeColor: "#2a1f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
