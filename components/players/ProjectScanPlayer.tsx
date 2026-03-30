'use client';

import { Player, PlayerRef } from '@remotion/player';
import { ProjectCardReveal } from '@/src/remotion/compositions/ProjectCardReveal';
import { useEffect, useRef, useState } from 'react';

export default function ProjectScanPlayer() {
  const [hasPlayed, setHasPlayed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          setHasPlayed(true);
          playerRef.current?.play();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasPlayed]);

  return (
    <div ref={containerRef}>
      <Player
        ref={playerRef}
        component={ProjectCardReveal}
        durationInFrames={60}
        fps={30}
        compositionWidth={1200}
        compositionHeight={60}
        style={{ width: '100%' }}
        autoPlay={false}
        loop={false}
        controls={false}
        showVolumeControls={false}
        clickToPlay={false}
      />
    </div>
  );
}
