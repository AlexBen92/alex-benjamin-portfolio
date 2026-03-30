'use client';

import { motion } from 'framer-motion';

const badgeGroups = [
  {
    title: 'Systems & Infra',
    badges: [
      { label: 'Rust Expert', variant: 'cyan' as const },
      { label: 'tokio / async', variant: 'cyan' as const },
      { label: 'HFT', variant: 'cyan' as const },
      { label: 'Market Making', variant: 'cyan' as const },
      { label: 'WebSocket', variant: 'cyan' as const },
    ],
  },
  {
    title: 'Blockchain & Web3',
    badges: [
      { label: 'Solidity Expert', variant: 'vio' as const },
      { label: 'Solana / Anchor', variant: 'vio' as const },
      { label: 'Arbitrum Stylus', variant: 'vio' as const },
      { label: 'ERC-4337', variant: 'vio' as const },
      { label: 'Foundry', variant: 'vio' as const },
      { label: 'Hardhat', variant: 'vio' as const },
    ],
  },
  {
    title: 'AI Agents & Quant',
    badges: [
      { label: 'ElizaOS', variant: 'ora' as const },
      { label: 'LangChain', variant: 'ora' as const },
      { label: 'OpenAI API', variant: 'ora' as const },
      { label: 'HMM Regime', variant: 'ora' as const },
      { label: 'Bi-LSTM', variant: 'ora' as const },
      { label: 'Monte Carlo', variant: 'ora' as const },
    ],
  },
];

const badgeStyles = {
  cyan: 'border-[rgba(0,212,255,0.25)] text-cyan bg-[rgba(0,212,255,0.05)]',
  vio: 'border-[rgba(124,58,237,0.35)] text-[#A78BFA] bg-[rgba(124,58,237,0.08)]',
  ora: 'border-[rgba(245,158,11,0.3)] text-[#FCD34D] bg-[rgba(245,158,11,0.06)]',
};

export default function About() {
  return (
    <section id="about" className="relative z-[1] px-6 md:px-12 py-24 max-w-[1200px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 items-start">
        {/* Left — Terminal */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-[420px] flex-shrink-0"
        >
          <div className="bg-surf border border-[rgba(0,212,255,0.25)] shadow-[0_0_40px_rgba(0,212,255,0.07)]">
            <div className="bg-surf2 px-3.5 py-2.5 flex items-center gap-2 border-b border-[rgba(0,212,255,0.12)]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              <span className="font-mono text-[11px] text-muted ml-2">about_alex.toml</span>
            </div>
            <div className="px-[18px] py-5 font-mono text-xs leading-[2]">
              <div className="text-cyan">[identity]</div>
              <div><span className="text-muted">name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span className="text-muted2">=</span><span className="text-txt"> &quot;Alex Benjamin&quot;</span></div>
              <div><span className="text-muted">location&nbsp;</span><span className="text-muted2">=</span><span className="text-txt"> &quot;Villiers-le-Bel, France&quot;</span></div>
              <div><span className="text-muted">role&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span className="text-muted2">=</span><span className="text-txt"> &quot;Blockchain Engineer&quot;</span></div>
              <div><span className="text-muted">github&nbsp;&nbsp;&nbsp;</span><span className="text-muted2">=</span><span className="text-cyan"> &quot;AlexBen92&quot;</span></div>
              <br />
              <div className="text-cyan">[stack]</div>
              <div><span className="text-muted">systems&nbsp;&nbsp;</span><span className="text-muted2">=</span><span className="text-txt"> [&quot;Rust&quot;, &quot;tokio&quot;, &quot;HFT&quot;]</span></div>
              <div><span className="text-muted">contracts</span><span className="text-muted2">=</span><span className="text-txt"> [&quot;Solidity&quot;, &quot;Anchor&quot;]</span></div>
              <div><span className="text-muted">l2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span className="text-muted2">=</span><span className="text-txt"> [&quot;Arbitrum Stylus&quot;, &quot;ERC-4337&quot;]</span></div>
              <div><span className="text-muted">ai&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span className="text-muted2">=</span><span className="text-txt"> [&quot;ElizaOS&quot;, &quot;OpenRouter&quot;]</span></div>
              <br />
              <div className="text-cyan">[workflow]</div>
              <div><span className="text-muted">tools&nbsp;&nbsp;&nbsp;&nbsp;</span><span className="text-muted2">=</span><span className="text-txt"> [&quot;Cursor&quot;, &quot;Claude Code&quot;, &quot;Bolt&quot;]</span></div>
              <div><span className="text-muted">boost&nbsp;&nbsp;&nbsp;&nbsp;</span><span className="text-muted2">=</span><span className="text-[#22C55E]"> &quot;2-3x delivery speed&quot;</span></div>
            </div>
          </div>
        </motion.div>

        {/* Right — Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <div className="font-mono text-[11px] tracking-[0.15em] text-cyan mb-3">About</div>
          <h2 className="text-[clamp(28px,3vw,38px)] font-extrabold mb-5 leading-[1.15]">
            Self-taught. Audit-grade.<br />AI-accelerated.
          </h2>
          <p className="text-base text-muted leading-[1.75] mb-8">
            I design execution engines and smart contract architectures for DeFi protocols — built for correctness, speed, and longevity. Self-taught across Rust, Solidity, and Solana/Anchor, with hands-on experience shipping delta-neutral strategies, HFT market makers, and autonomous on-chain AI agents.
          </p>
          <p className="text-base text-muted leading-[1.75] mb-8 -mt-3">
            I run an AI-augmented workflow (Cursor + Claude Code + Bolt) that compresses development cycles by 2–3× while maintaining audit-grade quality — because in DeFi, speed without security is worthless.
          </p>

          {/* Badge Groups */}
          {badgeGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <div className="font-mono text-[11px] text-muted2 tracking-[0.1em] uppercase mb-2.5">
                {group.title}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.badges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`font-mono text-xs px-3 py-1 border ${badgeStyles[badge.variant]}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
