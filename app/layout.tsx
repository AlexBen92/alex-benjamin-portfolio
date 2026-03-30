import type { Metadata } from "next";
import { JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Alex Benjamin — Blockchain Developer",
  description: "Blockchain Engineer specializing in Rust, Solidity, Solana, and AI Agents. Smart contracts, HFT trading systems and autonomous AI agents.",
  keywords: ["Rust", "Blockchain", "Solidity", "DeFi", "HFT", "Trading", "Smart Contracts", "Solana", "AI Agents"],
  authors: [{ name: "Alex Benjamin" }],
  openGraph: {
    title: "Alex Benjamin — Blockchain Developer",
    description: "Smart contracts, HFT trading systems and autonomous AI agents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${syne.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
