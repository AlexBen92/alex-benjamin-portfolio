'use client';

import { motion } from 'framer-motion';
import { SiRust, SiSolidity, SiTypescript, SiReact } from 'react-icons/si';
import { FaRocket, FaChartLine, FaNetworkWired } from 'react-icons/fa';

export default function About() {
  const badges = [
    { icon: SiRust, label: 'Rust', color: 'from-orange-500 to-red-600' },
    { icon: SiSolidity, label: 'Solidity', color: 'from-blue-500 to-purple-600' },
    { icon: SiTypescript, label: 'TypeScript', color: 'from-blue-400 to-blue-600' },
    { icon: SiReact, label: 'React', color: 'from-cyan-400 to-blue-500' },
    { icon: FaRocket, label: 'Zero-Latency', color: 'from-amber-500 to-orange-600' },
    { icon: FaChartLine, label: 'HFT Trading', color: 'from-green-500 to-emerald-600' },
    { icon: FaNetworkWired, label: 'DeFi', color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <section id="about" className="relative py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
            À Propos
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-purple-600 mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Avatar/Photo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 blur-xl opacity-50"
              />
              <div className="relative w-80 h-80 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 p-1">
                <div className="w-full h-full rounded-full bg-[#1a1f3a] flex items-center justify-center text-8xl font-bold text-gray-300">
                  AB
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-300 leading-relaxed">
              Développeur blockchain passionné, spécialisé dans la construction de{' '}
              <span className="text-amber-500 font-semibold">systèmes ultra-performants</span> en Rust
              pour le trading haute fréquence.
            </p>

            <p className="text-lg text-gray-300 leading-relaxed">
              Expert en <span className="text-purple-500 font-semibold">smart contracts Solidity</span> et
              architectures DeFi, je conçois des solutions innovantes combinant{' '}
              <span className="text-amber-500 font-semibold">latence microseconde</span> et sécurité blockchain.
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200">Expertises Clés:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  Systèmes zero-latency avec Rust (tokio, crossbeam, mio)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                  Smart contracts Solidity optimisés pour gas efficiency
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  Trading HFT, market-making, et stratégies arbitrage
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                  Protocoles DeFi: AMM, lending, staking, yield farming
                </li>
              </ul>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 pt-6">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} text-white font-semibold text-sm flex items-center gap-2 shadow-lg cursor-pointer`}
                >
                  <badge.icon size={18} />
                  {badge.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
