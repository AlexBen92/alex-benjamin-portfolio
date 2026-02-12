'use client';

import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12 px-6 bg-[#0a0e27] border-t border-gray-800">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="inline-block text-3xl font-bold bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent mb-6"
          >
            AB
          </motion.div>

          {/* Tagline */}
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Développeur blockchain passionné, créant des solutions innovantes à l'intersection de la finance décentralisée et du trading haute fréquence.
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {['Home', 'Portfolio', 'Skills', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  const element = document.getElementById(item.toLowerCase());
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-400 hover:text-amber-500 transition-colors duration-300"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800">
            <p className="text-gray-500 flex items-center justify-center gap-2 flex-wrap">
              <span>© {currentYear} Alex Benjamin. Tous droits réservés.</span>
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center gap-1">
                Fait avec <FaHeart className="text-red-500 animate-pulse" /> et Rust
              </span>
            </p>
          </div>

          {/* Tech Stack Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-xs text-gray-600"
          >
            Built with Next.js, TypeScript, Tailwind CSS & Framer Motion
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
