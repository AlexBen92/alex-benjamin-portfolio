'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const HeroTerminalPlayer = dynamic(
  () => import('@/components/players/HeroTerminalPlayer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[280px] bg-surf border border-[rgba(0,212,255,0.25)] animate-pulse" />
    ),
  }
);

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative z-[1] min-h-screen flex items-center px-6 md:px-12 pt-[120px] pb-20 gap-16"
    >
      {/* Left side */}
      <div className="flex-1 max-w-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block font-mono text-[11px] tracking-[0.15em] text-cyan border border-[rgba(0,212,255,0.2)] px-3.5 py-1.5 mb-8 bg-[rgba(0,212,255,0.04)]"
        >
          [ RUST · SOLIDITY · SOLANA · AI AGENTS ]
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-[clamp(36px,4.5vw,56px)] font-extrabold leading-[1.1] mb-6 text-txt"
        >
          I build DeFi infrastructure<br />that runs in{' '}
          <span className="text-cyan relative underline decoration-[rgba(0,212,255,0.4)] underline-offset-[6px]">
            microseconds.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[17px] text-muted leading-relaxed mb-4"
        >
          Smart contracts, HFT trading systems and autonomous AI agents — available for freelance missions and remote contracts.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-mono text-xs text-muted2 mb-10"
        >
          — Alex Benjamin, Paris · github.com/AlexBen92
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-6"
        >
          <a
            href="#projects"
            className="inline-block px-8 py-3.5 bg-cyan text-[#080C14] font-mono text-[13px] font-bold tracking-[0.05em] hover:bg-[#00b8e0] hover:-translate-y-0.5 transition-all duration-200"
          >
            View Projects →
          </a>
          <a
            href="/alex-benjamin-cv.pdf"
            download
            className="font-mono text-[13px] text-muted border-b border-transparent hover:text-cyan hover:border-[rgba(0,212,255,0.4)] transition-all duration-200"
          >
            Download CV ↗
          </a>
        </motion.div>
      </div>

      {/* Right side — Remotion animated terminal */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden lg:block flex-shrink-0 w-[520px]"
      >
        <HeroTerminalPlayer />
      </motion.div>
    </section>
  );
}
