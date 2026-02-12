'use client';

import { motion } from 'framer-motion';
import { FaBriefcase } from 'react-icons/fa';

interface Experience {
  year: string;
  company: string;
  role: string;
  description: string[];
  color: string;
}

export default function Experience() {
  const experiences: Experience[] = [
    {
      year: '2024 - Present',
      company: 'ArbitrageX',
      role: 'Développeur Blockchain',
      description: [
        'Développement de systèmes d\'arbitrage cross-chain',
        'Implémentation de stratégies delta-neutral',
        'Optimisation des smart contracts pour gas efficiency',
        'Monitoring temps réel des opportunités d\'arbitrage',
      ],
      color: 'from-amber-500 to-orange-600',
    },
    {
      year: '2023 - 2024',
      company: 'Spartos.AI',
      role: 'Lead Developer',
      description: [
        'Architecture et développement d\'applications React Native',
        'Intégration OpenAI API pour features d\'IA',
        'Lead technique équipe de 5 développeurs',
        'Mise en place CI/CD et best practices',
      ],
      color: 'from-purple-500 to-violet-600',
    },
    {
      year: '2022 - 2023',
      company: 'Euro Computer',
      role: 'Full Stack Developer',
      description: [
        'Développement applications web PHP/JavaScript',
        'Gestion bases de données SQL complexes',
        'Création d\'APIs RESTful',
        'Maintenance et refactoring code legacy',
      ],
      color: 'from-blue-500 to-cyan-600',
    },
  ];

  return (
    <section id="experience" className="relative py-32 px-6 bg-[#0a0e27]/50">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
            Expériences
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-purple-600 mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-purple-600 to-cyan-600" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col md:gap-8`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 border-4 border-[#0a0e27] z-10" />

                {/* Content Card */}
                <div className={`w-full md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:pl-8'} pl-20 md:pl-0`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-[#1a1f3a] rounded-xl p-6 border border-gray-700 hover:border-amber-500 transition-all duration-300 shadow-xl"
                  >
                    <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'md:justify-end' : 'justify-start'}`}>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${exp.color} flex items-center justify-center`}>
                        <FaBriefcase size={24} className="text-white" />
                      </div>
                      <div className={index % 2 === 0 ? 'md:text-right' : 'text-left'}>
                        <h3 className="text-2xl font-bold text-white">{exp.company}</h3>
                        <p className="text-amber-500 font-semibold">{exp.role}</p>
                      </div>
                    </div>

                    <p className="text-purple-400 font-semibold mb-4">{exp.year}</p>

                    <ul className={`space-y-2 ${index % 2 === 0 ? 'md:text-right' : 'text-left'}`}>
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-gray-300 flex items-start gap-2">
                          <span className="text-amber-500 mt-1">→</span>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
