import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Alex Benjamin | Rust Blockchain Developer",
  description: "Développeur blockchain spécialisé en Rust et Solidity, expert en trading haute fréquence (HFT) et DeFi. Portfolio de projets innovants en finance décentralisée.",
  keywords: ["Rust", "Blockchain", "Solidity", "DeFi", "HFT", "Trading", "Smart Contracts", "Solana"],
  authors: [{ name: "Alex Benjamin" }],
  openGraph: {
    title: "Alex Benjamin | Rust Blockchain Developer",
    description: "Expert en développement blockchain et trading haute fréquence",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
