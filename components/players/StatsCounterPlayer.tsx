'use client';

import { Player, PlayerRef } from '@remotion/player';
import { StatsCounter } from '@/src/remotion/compositions/StatsCounter';
import { useEffect, useRef, useState } from 'react';

export default function StatsCounterPlayer() {
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
        component={StatsCounter}
        durationInFrames={90}
        fps={30}
        compositionWidth={1200}
        compositionHeight={100}
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
