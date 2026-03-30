import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

function typeWriter(text: string, frame: number, startFrame: number, endFrame: number): string {
  const progress = interpolate(frame, [startFrame, endFrame], [0, text.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return text.slice(0, Math.floor(progress));
}

function LineReveal({
  text,
  frame,
  startFrame,
  endFrame,
  color = '#8B9EC7',
}: {
  text: string;
  frame: number;
  startFrame: number;
  endFrame: number;
  color?: string;
}) {
  const typed = typeWriter(text, frame, startFrame, endFrame);
  const opacity = interpolate(frame, [startFrame, startFrame + 3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity, color, fontSize: 12, lineHeight: '20px', whiteSpace: 'pre' }}>
      {typed}
      {frame >= startFrame && frame <= endFrame && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 12,
            backgroundColor: '#00D4FF',
            marginLeft: 1,
            opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}

export const HeroTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal chrome opacity
  const chromeOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Availability dot pulse
  const dotSpring = spring({ frame: frame - 130, fps, config: { damping: 8, stiffness: 80 } });
  const dotVisible = frame >= 130 ? (Math.floor(frame / 15) % 2 === 0 ? 1 : 0.3) : 0;

  // Stats lines
  const stats = [
    { text: '  contracts_deployed : 12', start: 110, end: 116, color: '#00D4FF' },
    { text: '  volume_traded      : $2.4M+', start: 116, end: 122, color: '#F59E0B' },
    { text: '  avg_latency        : < 10μs', start: 122, end: 128, color: '#00D4FF' },
    { text: '  exploits           : 0', start: 128, end: 133, color: '#22C55E' },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0D1421',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        fontFamily: '"JetBrains Mono", monospace',
        overflow: 'hidden',
      }}
    >
      {/* Terminal chrome */}
      <div
        style={{
          opacity: chromeOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          borderBottom: '1px solid rgba(0, 212, 255, 0.12)',
          backgroundColor: '#111827',
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
        <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
        <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#27C93F' }} />
        <span style={{ fontSize: 10, color: '#8B9EC7', marginLeft: 6 }}>live_status.rs</span>
      </div>

      {/* Terminal body */}
      <div style={{ padding: '14px 16px', opacity: chromeOpacity }}>
        {/* Init line */}
        <LineReveal
          text='> initializing alex_benjamin.portfolio...'
          frame={frame}
          startFrame={10}
          endFrame={25}
          color="#00D4FF"
        />

        {/* Loaded modules */}
        {frame >= 25 && (
          <LineReveal
            text='  [✓] rust_systems       loaded'
            frame={frame}
            startFrame={25}
            endFrame={40}
            color="#22C55E"
          />
        )}
        {frame >= 40 && (
          <LineReveal
            text='  [✓] solidity_contracts  loaded'
            frame={frame}
            startFrame={40}
            endFrame={55}
            color="#22C55E"
          />
        )}
        {frame >= 55 && (
          <LineReveal
            text='  [✓] defi_protocols      loaded'
            frame={frame}
            startFrame={55}
            endFrame={70}
            color="#22C55E"
          />
        )}
        {frame >= 70 && (
          <LineReveal
            text='  [✓] ai_agents           loaded'
            frame={frame}
            startFrame={70}
            endFrame={90}
            color="#22C55E"
          />
        )}

        {/* Separator */}
        {frame >= 90 && (
          <div
            style={{
              color: '#4A5568',
              fontSize: 12,
              lineHeight: '20px',
              opacity: interpolate(frame, [90, 95], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            ─────────────────────────────────────
          </div>
        )}

        {/* Stats */}
        {stats.map((stat) =>
          frame >= stat.start ? (
            <LineReveal
              key={stat.text}
              text={stat.text}
              frame={frame}
              startFrame={stat.start}
              endFrame={stat.end}
              color={stat.color}
            />
          ) : null,
        )}

        {/* Status line */}
        {frame >= 133 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span
              style={{
                color: '#8B9EC7',
                fontSize: 12,
                opacity: interpolate(frame, [133, 140], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              {typeWriter('  status : AVAILABLE FOR MISSIONS', frame, 133, 150)}
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#00D4FF',
                opacity: dotVisible,
                transform: `scale(${dotSpring})`,
                boxShadow: '0 0 8px #00D4FF',
              }}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
