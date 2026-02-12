'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiMoon, HiSun } from 'react-icons/hi';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0e27]/80 backdrop-blur-lg shadow-lg shadow-purple-500/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => scrollToSection('home')}
          >
            AB
          </motion.div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Portfolio', 'Skills', 'Contact'].map((item) => (
              <motion.button
                key={item}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-gray-300 hover:text-amber-500 transition-colors duration-300 font-medium"
              >
                {item}
              </motion.button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-white"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <HiSun size={20} /> : <HiMoon size={20} />}
          </motion.button>
        </div>
      </nav>
    </motion.header>
  );
}
