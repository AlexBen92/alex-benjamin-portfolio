'use client';

import { motion } from 'framer-motion';

interface SkillItem {
  name: string;
  level: number; // out of 5
}

interface SkillColumn {
  title: string;
  colorClass: string;
  dotColor: string;
  skills: SkillItem[];
}

const columns: SkillColumn[] = [
  {
    title: 'Systems & Backend',
    colorClass: 'text-cyan',
    dotColor: 'bg-cyan',
    skills: [
      { name: 'Rust (tokio, async)', level: 5 },
      { name: 'HFT / Market Making', level: 4 },
      { name: 'WebSocket / Streams', level: 4 },
      { name: 'Next.js / React', level: 4 },
      { name: 'PHP / SQL (ERP)', level: 3 },
      { name: 'Cursor / Claude Code', level: 5 },
    ],
  },
  {
    title: 'Blockchain & Web3',
    colorClass: 'text-[#A78BFA]',
    dotColor: 'bg-[#A78BFA]',
    skills: [
      { name: 'Solidity / Foundry', level: 5 },
      { name: 'Solana / Anchor', level: 4 },
      { name: 'Arbitrum Stylus', level: 3 },
      { name: 'ERC-4337 / AA', level: 4 },
      { name: 'DeFi Protocols (AMM, Vault)', level: 4 },
      { name: 'Cross-chain / CCIP', level: 3 },
    ],
  },
  {
    title: 'AI Agents & Quant',
    colorClass: 'text-[#FCD34D]',
    dotColor: 'bg-[#FCD34D]',
    skills: [
      { name: 'ElizaOS / LangChain', level: 4 },
      { name: 'OpenAI API', level: 5 },
      { name: 'OpenRouter (free models)', level: 4 },
      { name: 'HMM Regime Detection', level: 3 },
      { name: 'Bi-LSTM / Monte Carlo', level: 3 },
      { name: 'Bolt / v0 / Lovable', level: 4 },
    ],
  },
];

function SkillDots({ level, dotColor }: { level: number; dotColor: string }) {
  return (
    <div className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= level ? dotColor : 'bg-[rgba(255,255,255,0.1)]'
          }`}
        />
      ))}
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="relative z-[1] px-6 md:px-12 py-24 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="font-mono text-[11px] tracking-[0.15em] text-cyan mb-3">Technical Skills</div>
        <h2 className="text-[clamp(28px,3vw,38px)] font-extrabold leading-[1.15]">
          No progress bars. Honest levels.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col, colIdx) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: colIdx * 0.1, duration: 0.5 }}
            className="bg-surf border border-[rgba(0,212,255,0.12)] p-7"
          >
            <div className={`font-mono text-xs tracking-[0.1em] uppercase mb-5 pb-3 border-b border-[rgba(255,255,255,0.06)] ${col.colorClass}`}>
              {col.title}
            </div>
            {col.skills.map((skill) => (
              <div
                key={skill.name}
                className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.03)]"
              >
                <span className="text-[13px] text-txt">{skill.name}</span>
                <SkillDots level={skill.level} dotColor={col.dotColor} />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
