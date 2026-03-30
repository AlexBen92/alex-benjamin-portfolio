import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const ProjectCardReveal: React.FC = () => {
  const frame = useCurrentFrame();

  // Scan line position: sweeps left to right over 40 frames
  const scanX = interpolate(frame, [0, 40], [-100, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scanOpacity = interpolate(frame, [35, 40], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Text typewriter after scan
  const fullText = '// 6 projects — filtered by impact';
  const textProgress = interpolate(frame, [40, 60], [0, fullText.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const typedText = fullText.slice(0, Math.floor(textProgress));

  const textOpacity = interpolate(frame, [40, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Scan line */}
      {frame <= 40 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${scanX}%`,
            transform: 'translateY(-50%)',
            width: '30%',
            height: 2,
            opacity: scanOpacity,
            background: 'linear-gradient(90deg, transparent, #00D4FF 30%, #00D4FF 70%, transparent)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2)',
          }}
        />
      )}

      {/* Typed text */}
      {frame >= 40 && (
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            color: '#00D4FF',
            opacity: textOpacity,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {typedText}
          {frame < 60 && (
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 14,
                backgroundColor: '#00D4FF',
                marginLeft: 2,
                opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0,
              }}
            />
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
