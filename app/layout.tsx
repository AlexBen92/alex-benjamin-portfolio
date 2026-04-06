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
  title: {
    default: "Alex Benjamin — Blockchain Engineer & DeFi Developer",
    template: "%s | Alex Benjamin"
  },
  description: "Blockchain Engineer specializing in Rust, Solidity, Solana, and AI Agents. Expert in HFT trading systems, smart contracts, and DeFi protocols. Available for freelance missions.",
  keywords: ["Blockchain Engineer", "Rust Developer", "Solidity Developer", "Solana Development", "DeFi", "HFT Trading", "Smart Contracts", "AI Agents", "Web3", "Cryptocurrency", "Arbitrum", "ERC-4337", "Anchor Framework"],
  authors: [{ name: "Alex Benjamin", url: "https://github.com/AlexBen92" }],
  creators: ["Alex Benjamin"],
  publisher: "Alex Benjamin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://alexbenjamin.dev'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
    },
  },
  openGraph: {
    title: "Alex Benjamin — Blockchain Engineer & DeFi Developer",
    description: "Expert in Rust, Solidity, Solana. Building HFT trading systems, smart contracts, and autonomous AI agents. Available for freelance missions.",
    url: 'https://alexbenjamin.dev',
    siteName: 'Alex Benjamin Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Alex Benjamin - Blockchain Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alex Benjamin — Blockchain Engineer',
    description: 'Expert in Rust, Solidity, Solana. Building HFT trading systems and DeFi protocols.',
    images: ['/twitter-image.png'],
    creator: '@AlexBen92',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-token',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Alex Benjamin',
    jobTitle: 'Blockchain Engineer',
    description: 'Blockchain Engineer specializing in Rust, Solidity, Solana, and AI Agents',
    url: 'https://alexbenjamin.dev',
    image: 'https://alexbenjamin.dev/profile.jpg',
    sameAs: [
      'https://github.com/AlexBen92',
      'https://linkedin.com/in/alexbenjamin',
    ],
    knowsAbout: [
      'Blockchain Development',
      'Rust Programming',
      'Solidity Smart Contracts',
      'Solana Development',
      'DeFi Protocols',
      'High-Frequency Trading',
      'AI Agents',
      'Web3 Development',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Freelance',
    },
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${syne.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
