'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach((s) => {
        const el = s as HTMLElement;
        if (window.scrollY >= el.offsetTop - 100) {
          current = el.id;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { label: 'About', id: 'about' },
    { label: 'Projects', id: 'projects' },
    { label: 'Skills', id: 'skills' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-4 flex items-center justify-between bg-[#080C14]/80 backdrop-blur-xl border-b border-[rgba(0,212,255,0.08)]">
      <button
        onClick={() => scrollTo('hero')}
        className="font-mono text-[13px] text-cyan tracking-[0.05em]"
      >
        alex<span className="text-muted">.</span>benjamin<span className="text-muted">()</span>
      </button>

      <ul className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollTo(item.id)}
              className={`font-mono text-[13px] tracking-[0.03em] transition-colors duration-200 ${
                activeSection === item.id ? 'text-cyan' : 'text-muted hover:text-txt'
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => scrollTo('contact')}
            className="px-5 py-2 border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.06)] text-cyan font-mono text-[13px] tracking-[0.05em] hover:bg-[rgba(0,212,255,0.14)] transition-all duration-200"
          >
            Hire Me →
          </button>
        </li>
      </ul>
    </nav>
  );
}
