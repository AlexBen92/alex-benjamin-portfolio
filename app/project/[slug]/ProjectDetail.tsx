'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Project } from '@/lib/projects';
import MiniDashboard from '@/components/ui/MiniDashboard';
import ArbitrageDashboard from '@/components/ui/ArbitrageDashboard';
import RiskDashboard from '@/components/ui/RiskDashboard';
import LSTMDashboard from '@/components/ui/LSTMDashboard';
import DeFiDashboard from '@/components/ui/DeFiDashboard';
import DexAggregatorDashboard from '@/components/ui/DexAggregatorDashboard';

export default function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="min-h-screen bg-[#080C14]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#080C14]/80 backdrop-blur-xl border-b border-[rgba(0,212,255,0.08)]">
        <div className="max-w-[900px] mx-auto px-6 py-4">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 font-mono text-sm text-[#8B9EC7] hover:text-[#00D4FF] transition-colors duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to projects
          </Link>
        </div>
      </div>

      <main className="max-w-[900px] mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-start gap-5">
            <span className="text-5xl">{project.icon}</span>
            <div>
              <h1 className="text-3xl font-extrabold text-[#E8EDF5] mb-2">{project.title}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] px-2.5 py-0.5 bg-[#111827] border border-[rgba(255,255,255,0.06)] text-[#8B9EC7]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Context */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-mono text-xs tracking-[0.1em] text-[#00D4FF] uppercase mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
            Context
          </h2>
          <p className="text-[#8B9EC7] leading-relaxed text-base">
            {project.context}
          </p>
        </motion.section>

        {/* Steps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-mono text-xs tracking-[0.1em] text-[#00D4FF] uppercase mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
            Project Steps
          </h2>
          <div className="space-y-3">
            {project.steps.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-4 p-4 bg-[#0D1421] border border-[rgba(0,212,255,0.12)] hover:border-[rgba(0,212,255,0.25)] transition-colors duration-200"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.25)] text-[#00D4FF] font-mono text-sm font-bold shrink-0">
                  {step.number}
                </div>
                <p className="text-[#8B9EC7] leading-relaxed pt-1 text-sm">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Dashboard - per project */}
        {project.hasDashboard && project.slug === 'solana-dex-aggregator' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="font-mono text-xs tracking-[0.1em] text-[#00D4FF] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              DEX Aggregator — Live Route Simulation
            </h2>
            <DexAggregatorDashboard />
          </motion.section>
        )}

        {project.hasDashboard && project.slug === 'market-making-bot' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="font-mono text-xs tracking-[0.1em] text-[#00D4FF] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              Live Market Data — BTC/USDT
            </h2>
            <MiniDashboard />
          </motion.section>
        )}

        {project.hasDashboard && project.slug === 'crypto-arbitrage-backtester' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="font-mono text-xs tracking-[0.1em] text-[#A78BFA] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              Backtest Simulation
            </h2>
            <ArbitrageDashboard />
          </motion.section>
        )}

        {project.hasDashboard && project.slug === 'hft-risk-dashboard' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="font-mono text-xs tracking-[0.1em] text-[#00D4FF] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              Risk Monitor Live
            </h2>
            <RiskDashboard />
          </motion.section>
        )}

        {project.hasDashboard && project.slug === 'order-flow-lstm-predictor' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="font-mono text-xs tracking-[0.1em] text-[#4ADE80] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              LSTM Prediction Engine
            </h2>
            <LSTMDashboard />
          </motion.section>
        )}

        {project.hasDashboard && project.slug === 'defi-portfolio-optimizer' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="font-mono text-xs tracking-[0.1em] text-[#A78BFA] uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              Portfolio Optimizer Live
            </h2>
            <DeFiDashboard />
          </motion.section>
        )}

        {/* Skills */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-mono text-xs tracking-[0.1em] text-[#A78BFA] uppercase mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="font-mono text-xs px-3 py-1.5 bg-[rgba(124,58,237,0.08)] text-[#A78BFA] border border-[rgba(124,58,237,0.3)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-center pb-8 mt-8"
        >
          <Link
            href="/#projects"
            className="inline-block px-8 py-3 bg-[#00D4FF] text-[#080C14] font-mono text-[13px] font-bold tracking-[0.05em] hover:bg-[#00b8e0] transition-all duration-200"
          >
            ← Back to projects
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
