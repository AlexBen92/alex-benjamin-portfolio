'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { projects } from '@/lib/projects';

const ProjectScanPlayer = dynamic(
  () => import('@/components/players/ProjectScanPlayer'),
  {
    ssr: false,
    loading: () => <div className="w-full h-[60px]" />,
  }
);

const categoryStyles: Record<string, string> = {
  'cat-rust': 'bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.25)] text-[#FCD34D]',
  'cat-sol': 'bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.3)] text-[#A78BFA]',
  'cat-ai': 'bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.2)] text-[#4ADE80]',
};

export default function Portfolio() {
  return (
    <section id="projects" className="relative z-[1] px-6 md:px-12 py-24 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <div className="font-mono text-[11px] tracking-[0.15em] text-cyan mb-3">Selected Work</div>
        <h2 className="text-[clamp(28px,3vw,38px)] font-extrabold mb-2 leading-[1.15]">
          6 projects — filtered by impact
        </h2>
      </motion.div>

      {/* Remotion scan animation */}
      <div className="mb-8">
        <ProjectScanPlayer />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project, index) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Link
              href={`/project/${project.slug}`}
              className="group block bg-surf border border-[rgba(0,212,255,0.12)] p-7 relative transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,212,255,0.35)] hover:shadow-[0_8px_32px_rgba(0,212,255,0.07)] h-full"
            >
              {/* Top row */}
              <div className="flex justify-between items-start mb-4">
                <span className={`font-mono text-[10px] px-2.5 py-0.5 tracking-[0.1em] border ${categoryStyles[project.categoryStyle] || ''}`}>
                  {project.category}
                </span>
                <span className="font-mono text-[10px] flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    project.status === 'live'
                      ? 'bg-[#22C55E] shadow-[0_0_6px_#22C55E]'
                      : 'bg-ora'
                  }`} />
                  <span className={project.status === 'live' ? 'text-[#4ADE80]' : 'text-ora'}>
                    {project.statusLabel}
                  </span>
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[17px] font-bold mb-2.5 leading-[1.3] group-hover:text-cyan transition-colors duration-200">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-[13px] text-muted leading-[1.65] mb-4">
                {project.shortDescription}
              </p>

              {/* Stack pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.stackPills.map((pill) => (
                  <span
                    key={pill}
                    className="font-mono text-[11px] px-2 py-0.5 bg-surf2 border border-[rgba(255,255,255,0.06)] text-muted"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              {/* Bottom */}
              <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.04)] pt-3.5">
                <span className="font-mono text-[11px] text-cyan">{project.metric}</span>
                <div className="flex gap-4">
                  <span className="font-mono text-[11px] text-muted group-hover:text-cyan transition-colors duration-200">
                    View Detail →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
