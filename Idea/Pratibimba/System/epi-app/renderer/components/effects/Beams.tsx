import { CSSProperties, useMemo } from 'react';

interface BeamsProps {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  speed?: number;
  noiseIntensity?: number;
  scale?: number;
  rotation?: number;
  className?: string;
}

export function Beams({
  beamWidth = 0.5,
  beamHeight = 30,
  beamNumber = 27,
  lightColor = 'var(--nara-beam-color, #4a7855)',
  speed = 1.3,
  noiseIntensity = 1.75,
  scale = 0.7,
  rotation = 90,
  className = '',
}: BeamsProps) {
  const beams = useMemo(() => Array.from({ length: Math.max(1, beamNumber) }), [beamNumber]);

  const beamStride = 100 / Math.max(1, beamNumber);
  const duration = Math.max(6, 18 / Math.max(speed, 0.1));
  const segment = Math.max(14, beamHeight * Math.max(scale, 0.2));
  const noiseOpacity = Math.min(0.2, noiseIntensity / 14);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={
        {
          '--beam-color': lightColor,
          '--beam-noise-opacity': `${noiseOpacity}`,
        } as CSSProperties
      }
      aria-hidden
    >
      <div
        className="absolute inset-[-15%]"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        {beams.map((_, index) => {
          const left = beamStride * index + beamStride / 2;
          const delay = (index % 9) * 0.35;
          const opacity = (0.2 + ((index % 5) * 0.08)) * Math.max(0.55, Math.min(1, noiseIntensity / 2.2));
          return (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={`beam-${index}`}
              className="absolute top-[-20%] h-[140%] beam-line"
              style={
                {
                  left: `${left}%`,
                  width: `${beamWidth}px`,
                  '--beam-opacity': `${Math.min(0.85, opacity)}`,
                  '--beam-segment': `${segment}px`,
                  '--beam-duration': `${duration + (index % 4) * 1.25}s`,
                  '--beam-delay': `${delay}s`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
      <div className="absolute inset-0 beam-noise" />
    </div>
  );
}
