'use client';

import { useState, useEffect } from 'react';

export default function PresentationMode() {
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  useEffect(() => {
    // Load preference from localStorage
    const stored = localStorage.getItem('presentationMode');
    if (stored === 'true') {
      setIsPresentationMode(true);
      document.body.classList.add('presentation-mode');
    }
  }, []);

  const togglePresentationMode = () => {
    const newValue = !isPresentationMode;
    setIsPresentationMode(newValue);
    localStorage.setItem('presentationMode', String(newValue));

    if (newValue) {
      document.body.classList.add('presentation-mode');
    } else {
      document.body.classList.remove('presentation-mode');
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50">
      <button
        onClick={togglePresentationMode}
        className={`font-mono text-[10px] px-3 py-1.5 border transition-all duration-200 ${
          isPresentationMode
            ? 'bg-[rgba(34,197,94,0.1)] border-[#22C55E] text-[#4ADE80]'
            : 'bg-[rgba(0,212,255,0.06)] border-[rgba(0,212,255,0.25)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.12)]'
        }`}
      >
        {isPresentationMode ? '▶ Normal Mode' : '📺 Presentation Mode'}
      </button>
    </div>
  );
}