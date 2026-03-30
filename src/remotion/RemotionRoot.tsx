import { Composition } from 'remotion';
import { HeroTerminal } from './compositions/HeroTerminal';
import { StatsCounter } from './compositions/StatsCounter';
import { ProjectCardReveal } from './compositions/ProjectCardReveal';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HeroTerminal"
      component={HeroTerminal}
      durationInFrames={180}
      fps={30}
      width={520}
      height={280}
    />
    <Composition
      id="StatsCounter"
      component={StatsCounter}
      durationInFrames={90}
      fps={30}
      width={1200}
      height={100}
    />
    <Composition
      id="ProjectCardReveal"
      component={ProjectCardReveal}
      durationInFrames={60}
      fps={30}
      width={1200}
      height={60}
    />
  </>
);
