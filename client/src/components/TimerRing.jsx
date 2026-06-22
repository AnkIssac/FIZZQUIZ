import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio.js';

// Animated SVG countdown ring. Remount it per-question via a `key` to restart.
export default function TimerRing({ seconds = 15, size = 84, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [remaining, setRemaining] = useState(seconds);
  const [fill, setFill] = useState(false);
  const startRef = useRef(Date.now());
  const lastTickRef = useRef(Math.ceil(seconds));

  useEffect(() => {
    startRef.current = Date.now();
    // trigger the stroke transition on next frame
    const raf = requestAnimationFrame(() => setFill(true));
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, seconds - elapsed);
      setRemaining(left);
      const whole = Math.ceil(left);
      if (whole !== lastTickRef.current) {
        lastTickRef.current = whole;
        if (whole <= 3 && whole > 0) sfx.tick();
      }
      if (left <= 0) clearInterval(id);
    }, 100);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, [seconds]);

  const display = Math.ceil(remaining);
  const danger = remaining <= 3;
  const color = danger ? '#F25E5E' : remaining <= seconds * 0.4 ? '#F2A84E' : '#4ECF7A';

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="timer" aria-label={`${display} seconds left`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={fill ? circumference : 0}
          style={{ transition: `stroke-dashoffset ${seconds}s linear, stroke 0.3s ease` }}
        />
      </svg>
      <span className={`absolute font-display text-2xl ${danger ? 'text-danger animate-pulse' : 'text-white'}`}>{display}</span>
    </div>
  );
}
