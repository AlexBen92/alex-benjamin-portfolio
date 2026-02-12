'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { projects } from '@/lib/projects';

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative py-32 px-6 bg-[#0a0e27]/50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
            Projets
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-4">
            Systèmes quantitatifs, trading algorithmique et recherche DeFi
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-purple-600 mx-auto rounded-full mt-4" />
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link
                href={`/project/${project.slug}`}
                className={`group block bg-[#1a1f3a] rounded-xl p-6 border border-gray-700 hover:border-amber-500/70 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden h-full`}
              >
                {/* Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <span className="text-3xl">{project.icon}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
                    {project.shortTitle}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {project.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={tag}
                        className={`px-2.5 py-1 ${project.tagColors[i] || 'bg-gray-700/50 text-gray-300'} text-xs rounded-full font-medium backdrop-blur-sm`}
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="px-2.5 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full font-medium">
                        +{project.tags.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-700/50">
                    <span className="text-amber-500/70 text-sm font-medium group-hover:text-amber-400 transition-colors duration-300 flex items-center gap-2">
                      Voir le détail →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
