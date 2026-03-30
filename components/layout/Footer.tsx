'use client';

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[rgba(0,212,255,0.12)] px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
      <span className="font-mono text-xs text-muted2">
        © 2026 Alex Benjamin
      </span>
      <span className="font-mono text-xs text-muted">
        Open to DeFi, AI agent & Rust infrastructure missions
      </span>
      <div className="flex gap-5">
        <a
          href="https://github.com/AlexBen92"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-muted hover:text-cyan transition-colors duration-200"
        >
          GitHub
        </a>
        <a
          href="https://alex-benjamin-portfolio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-muted hover:text-cyan transition-colors duration-200"
        >
          Portfolio
        </a>
        <button
          onClick={() => scrollTo('hero')}
          className="font-mono text-xs text-muted hover:text-cyan transition-colors duration-200"
        >
          Top ↑
        </button>
      </div>
    </footer>
  );
}
