'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Skill {
  name: string;
  level: number;
  color: string;
}

export default function Skills() {
  const [isVisible, setIsVisible] = useState(false);

  const skills: Skill[] = [
    { name: 'Rust', level: 95, color: 'from-orange-500 to-red-600' },
    { name: 'Solidity', level: 90, color: 'from-blue-500 to-purple-600' },
    { name: 'TypeScript / React', level: 85, color: 'from-blue-400 to-cyan-500' },
    { name: 'Smart Contracts', level: 90, color: 'from-purple-500 to-pink-600' },
    { name: 'Trading Systems', level: 95, color: 'from-amber-500 to-orange-600' },
    { name: 'DeFi Protocols', level: 88, color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <section id="skills" className="relative py-32 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          onViewportEnter={() => setIsVisible(true)}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
            Compétences
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-purple-600 mx-auto rounded-full" />
        </motion.div>

        <div className="space-y-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-semibold text-white">{skill.name}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isVisible ? 1 : 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="text-lg font-bold bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent"
                >
                  {skill.level}%
                </motion.span>
              </div>

              <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isVisible ? `${skill.level}%` : 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${skill.color} rounded-full relative`}
                >
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-[#1a1f3a] rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-amber-500 mb-4">Backend</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Rust (tokio, async/await)</li>
              <li>• Node.js / Express</li>
              <li>• PostgreSQL / MongoDB</li>
              <li>• Redis / RabbitMQ</li>
            </ul>
          </div>

          <div className="bg-[#1a1f3a] rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-purple-500 mb-4">Blockchain</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Solana / Anchor</li>
              <li>• Ethereum / Hardhat</li>
              <li>• Web3.js / ethers.js</li>
              <li>• IPFS / The Graph</li>
            </ul>
          </div>

          <div className="bg-[#1a1f3a] rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-cyan-500 mb-4">Trading</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• HFT / Market Making</li>
              <li>• FIX Protocol</li>
              <li>• WebSocket / UDP</li>
              <li>• DPDK / DMA</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
