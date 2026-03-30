'use client';

import { Player } from '@remotion/player';
import { HeroTerminal } from '@/src/remotion/compositions/HeroTerminal';

export default function HeroTerminalPlayer() {
  return (
    <Player
      component={HeroTerminal}
      durationInFrames={180}
      fps={30}
      compositionWidth={520}
      compositionHeight={280}
      style={{ width: '100%' }}
      autoPlay
      loop
      controls={false}
      showVolumeControls={false}
      clickToPlay={false}
    />
  );
}
