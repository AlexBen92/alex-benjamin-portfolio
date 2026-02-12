'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import type { Project } from '@/lib/projects';
import MiniDashboard from '@/components/ui/MiniDashboard';
import ArbitrageDashboard from '@/components/ui/ArbitrageDashboard';
import RiskDashboard from '@/components/ui/RiskDashboard';
import LSTMDashboard from '@/components/ui/LSTMDashboard';
import DeFiDashboard from '@/components/ui/DeFiDashboard';

export default function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0a0e27]/80 backdrop-blur-lg border-b border-gray-800/50">
        <div className="container mx-auto max-w-5xl px-6 py-4">
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors duration-300 group"
          >
            <FaArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">Retour aux projets</span>
          </Link>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-start gap-5 mb-12"
        >
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-2xl shrink-0`}>
            <span className="text-4xl md:text-5xl">{project.icon}</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
              {project.title}
            </h1>
            <p className="text-gray-400 text-lg">{project.shortTitle}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {project.tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`px-3 py-1 ${project.tagColors[i] || 'bg-gray-700/50 text-gray-300'} text-xs rounded-full font-medium`}
                >
                  {tag}
                </span>
              ))}
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
          <h2 className="text-xl font-semibold text-amber-500 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Contexte
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg">
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
          <h2 className="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Étapes du projet
          </h2>
          <div className="space-y-3">
            {project.steps.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#1a1f3a]/60 border border-gray-700/40 hover:border-gray-600/40 transition-colors duration-300"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${project.color} flex items-center justify-center shrink-0 text-white font-bold text-sm`}>
                  {step.number}
                </div>
                <p className="text-gray-300 leading-relaxed pt-1">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Dashboard - per project */}
        {project.hasDashboard && project.slug === 'market-making-bot' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
            <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
            <h2 className="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
            <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
            <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
          <h2 className="text-xl font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Compétences
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-purple-500/10 text-purple-300 rounded-lg text-sm font-medium border border-purple-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xl font-semibold text-amber-500 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, i) => (
              <span
                key={tag}
                className={`px-4 py-2 ${project.tagColors[i] || 'bg-gray-700/50 text-gray-300'} rounded-lg text-sm font-medium border border-white/5`}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-center pb-8"
        >
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
          >
            <FaArrowLeft size={14} />
            Retour aux projets
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
