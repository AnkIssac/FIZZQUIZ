import { motion } from 'framer-motion';
import StreakBadge from './StreakBadge.jsx';

// Animated ranked list with layout transitions for rank changes.
export default function ScoreBoard({ players, myId, compact }) {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="flex flex-col gap-2">
      {ranked.map((p, i) => (
        <motion.div
          layout
          key={p.id}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
            p.id === myId ? 'bg-primary/25 ring-2 ring-primary' : 'bg-white/5'
          } ${p.eliminated ? 'opacity-40' : ''}`}
        >
          <span className="w-7 text-center font-display text-lg text-text-secondary">
            {i === 0 ? '👑' : i + 1}
          </span>
          <div
            className="w-9 h-9 rounded-xl grid place-items-center text-lg"
            style={{ background: p.avatar?.color || '#6C4EF2' }}
          >
            {p.avatar?.emoji || '🙂'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-bold">{p.name}</div>
            {!compact && <StreakBadge streak={p.bestStreak >= 3 ? p.bestStreak : p.streak} />}
          </div>
          <div className="text-right">
            <div className="font-display text-xl leading-none">{p.score}</div>
            {p.lastDelta > 0 && <div className="text-xs text-success">+{p.lastDelta}</div>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
