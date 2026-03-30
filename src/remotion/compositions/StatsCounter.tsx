import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface StatConfig {
  label: string;
  targetValue: string;
  countType: 'integer' | 'decimal' | 'typewriter' | 'instant';
  numericTarget?: number;
  suffix?: string;
  delay: number;
  flashColor?: string;
}

const STATS: StatConfig[] = [
  {
    label: 'Smart Contracts',
    targetValue: '12',
    countType: 'integer',
    numericTarget: 12,
    delay: 0,
  },
  {
    label: 'Volume Routed',
    targetValue: '$2.4M+',
    countType: 'decimal',
    numericTarget: 2.4,
    suffix: 'M+',
    delay: 15,
  },
  {
    label: 'Avg Latency',
    targetValue: '< 10μs',
    countType: 'typewriter',
    delay: 30,
  },
  {
    label: 'Exploits',
    targetValue: '0',
    countType: 'instant',
    delay: 45,
    flashColor: '#22C55E',
  },
];

function AnimatedStat({
  stat,
  frame,
  fps,
}: {
  stat: StatConfig;
  frame: number;
  fps: number;
}) {
  const localFrame = frame - stat.delay;
  if (localFrame < 0) return <StatPlaceholder label={stat.label} />;

  const entrance = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 100 } });

  let displayValue = '';

  switch (stat.countType) {
    case 'integer': {
      const val = Math.round(
        interpolate(localFrame, [0, 60], [0, stat.numericTarget!], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      );
      displayValue = val.toString();
      break;
    }
    case 'decimal': {
      const val = interpolate(localFrame, [0, 60], [0, stat.numericTarget!], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      displayValue = `$${val.toFixed(1)}${stat.suffix || ''}`;
      break;
    }
    case 'typewriter': {
      const chars = Math.floor(
        interpolate(localFrame, [0, 40], [0, stat.targetValue.length], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      );
      displayValue = stat.targetValue.slice(0, chars);
      break;
    }
    case 'instant': {
      displayValue = stat.targetValue;
      break;
    }
  }

  // Green flash for exploits
  const flashOpacity =
    stat.flashColor && localFrame < 15
      ? interpolate(localFrame, [0, 15], [0.6, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        opacity: entrance,
        transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`,
        position: 'relative',
      }}
    >
      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: -10,
            backgroundColor: stat.flashColor,
            opacity: flashOpacity,
            borderRadius: 8,
            filter: 'blur(20px)',
          }}
        />
      )}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 32,
          fontWeight: 700,
          color: '#00D4FF',
          position: 'relative',
        }}
      >
        {displayValue}
      </span>
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          color: '#8B9EC7',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          position: 'relative',
        }}
      >
        {stat.label}
      </span>
    </div>
  );
}

function StatPlaceholder({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.2 }}>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 32, fontWeight: 700, color: '#00D4FF' }}>
        —
      </span>
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          color: '#8B9EC7',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StatDivider({ frame, delay }: { frame: number; delay: number }) {
  const opacity = interpolate(frame, [delay, delay + 10], [0, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <div style={{ width: 1, height: 40, backgroundColor: `rgba(0, 212, 255, ${opacity})` }} />;
}

export const StatsCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 40px',
      }}
    >
      {STATS.map((stat, i) => (
        <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <AnimatedStat stat={stat} frame={frame} fps={fps} />
          {i < STATS.length - 1 && <StatDivider frame={frame} delay={stat.delay + 10} />}
        </div>
      ))}
    </AbsoluteFill>
  );
};
