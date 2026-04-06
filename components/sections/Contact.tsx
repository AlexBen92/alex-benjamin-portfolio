'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setStatus('error');
      setStatusMessage('Please fill all fields.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          subject: `Mission inquiry from ${name}`,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setStatusMessage('Message sent successfully! I\'ll reply within 24h.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Failed to send message. Please try again or email directly.');
    }
  };

  return (
    <section id="contact" className="relative z-[1] px-6 md:px-12 py-24 max-w-[1200px] mx-auto">
      {/* Availability banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.2)] px-6 py-3.5 flex items-center gap-3 mb-14"
      >
        <div className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E] pulse-dot" />
        <span className="font-mono text-[13px] text-[#4ADE80]">
          Available for freelance missions & remote contracts — Typical reply: &lt; 24h
        </span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="font-mono text-[11px] tracking-[0.15em] text-cyan mb-3">Contact</div>
          <h3 className="text-[22px] font-bold mb-2">
            Let&apos;s build something<br />on-chain.
          </h3>

          <a
            href="mailto:Aleex.b95@gmail.com"
            className="block font-mono text-base text-cyan my-5 hover:opacity-75 transition-opacity duration-200"
          >
            Aleex.b95@gmail.com
          </a>

          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { label: 'GitHub ↗', href: 'https://github.com/AlexBen92' },
              { label: 'Portfolio ↗', href: 'https://alex-benjamin-portfolio.vercel.app' },
              { label: 'LinkedIn ↗', href: 'https://www.linkedin.com' },
              { label: 'X / Twitter ↗', href: 'https://twitter.com' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs px-4 py-2 border border-[rgba(0,212,255,0.12)] text-muted tracking-[0.05em] hover:border-[rgba(0,212,255,0.35)] hover:text-cyan hover:bg-[rgba(0,212,255,0.12)] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="font-mono text-xs text-muted2">
            Based in Paris region — Remote worldwide · 800 €/day
          </p>
        </motion.div>

        {/* Right — Terminal form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-surf border border-[rgba(0,212,255,0.25)]">
            {/* Terminal bar */}
            <div className="bg-surf2 px-3.5 py-2.5 flex items-center gap-2 border-b border-[rgba(0,212,255,0.12)]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              <span className="font-mono text-[11px] text-muted ml-2">send_message.sh</span>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="p-5">
              <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(0,212,255,0.06)]">
                <span className="font-mono text-[13px] text-cyan whitespace-nowrap">&gt; name_</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-txt placeholder:text-muted2"
                  required
                />
              </div>

              <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(0,212,255,0.06)]">
                <span className="font-mono text-[13px] text-cyan whitespace-nowrap">&gt; email_</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-txt placeholder:text-muted2"
                  required
                />
              </div>

              <div className="flex items-start gap-3 py-2.5">
                <span className="font-mono text-[13px] text-cyan whitespace-nowrap pt-0.5">&gt; message_</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message..."
                  rows={3}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-txt resize-none placeholder:text-muted2"
                  required
                />
              </div>

              {/* Status messages */}
              {status === 'loading' && (
                <div className="mt-3 font-mono text-[11px] text-[#F59E0B]">
                  &gt; Sending message...
                </div>
              )}

              {status === 'success' && (
                <div className="mt-3 font-mono text-[11px] text-[#22C55E]">
                  &gt; {statusMessage}
                </div>
              )}

              {status === 'error' && (
                <div className="mt-3 font-mono text-[11px] text-[#EF4444]">
                  &gt; {statusMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-4 w-full bg-transparent border border-[rgba(0,212,255,0.25)] font-mono text-[13px] text-cyan py-3 tracking-[0.05em] hover:bg-[rgba(0,212,255,0.08)] hover:border-cyan transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                [ send_message.sh --execute ]
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
