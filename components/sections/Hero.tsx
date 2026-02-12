'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [text, setText] = useState('');
  const fullText = 'Rust Blockchain Developer | Trading & DeFi Expert';
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText[index]);
        setIndex(index + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      {/* Animated Background Code */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="font-mono text-xs text-amber-500 whitespace-pre leading-relaxed"
        >
          {`fn execute_trade(order: &Order) -> Result<Trade, Error> {
    let latency = measure_latency();
    if latency < 10 { // microseconds
        process_order_dpdk(order)?;
        Ok(Trade::new(order))
    }
}

impl AmmPool {
    pub fn swap(&mut self, amount: u64) -> u64 {
        // Constant product formula
        let k = self.reserve_x * self.reserve_y;
        self.reserve_x += amount;
        self.reserve_y = k / self.reserve_x;
    }
}`}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
        >
          Alex Benjamin
        </motion.h1>

        {/* Typewriter Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="min-h-[80px] mb-12"
        >
          <p className="text-2xl md:text-3xl text-gray-300 font-light">
            {text}
            <span className="animate-pulse">|</span>
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('portfolio')}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold text-lg shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300"
          >
            Voir Portfolio
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('contact')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-lg font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300"
          >
            Contact Direct
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-amber-500 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-amber-500 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
