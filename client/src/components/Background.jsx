import { useMemo } from 'react';

// Animated gradient mesh + rising bubbles. `tint` shifts the hue per round type.
export default function Background({ tint }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        size: 20 + Math.random() * 70,
        left: Math.random() * 100,
        duration: 12 + Math.random() * 16,
        delay: Math.random() * 12,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="absolute inset-0 bg-mesh opacity-90" />
      {tint && (
        <div
          className="absolute inset-0 transition-colors duration-700"
          style={{ background: `radial-gradient(circle at 50% 0%, ${tint}33, transparent 55%)` }}
        />
      )}
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="bubble"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
