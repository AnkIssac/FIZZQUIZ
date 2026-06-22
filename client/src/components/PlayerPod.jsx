import { motion } from 'framer-motion';
import StreakBadge from './StreakBadge.jsx';

// Avatar + name + score chip. Used in lobby and live game side panels.
export default function PlayerPod({ player, showScore, highlight, crown, answered, isMe }) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
        highlight ? 'bg-white/15 ring-2 ring-accent' : 'bg-white/5'
      } ${player.eliminated ? 'opacity-40' : ''}`}
    >
      <div
        className="relative shrink-0 w-10 h-10 rounded-xl grid place-items-center text-xl"
        style={{ background: player.avatar?.color || '#6C4EF2' }}
      >
        {player.avatar?.emoji || '🙂'}
        {answered && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success grid place-items-center text-[9px] text-black">✓</span>
        )}
        {!player.connected && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-danger" title="Disconnected" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold">
            {crown && <span aria-label="Leader">👑 </span>}
            {player.name}
            {isMe && <span className="text-text-secondary font-normal"> (you)</span>}
          </span>
          {player.isHost && <span className="text-xs rounded bg-accent/20 text-accent px-1.5 py-0.5">HOST</span>}
        </div>
        <div className="flex items-center gap-2">
          {player.ready && !showScore && <span className="text-xs text-success">● Ready</span>}
          <StreakBadge streak={player.streak} />
        </div>
      </div>
      {showScore && (
        <div className="text-right">
          <div className="font-display text-lg leading-none">{player.score}</div>
          {player.lastDelta > 0 && <div className="text-xs text-success">+{player.lastDelta}</div>}
        </div>
      )}
    </motion.div>
  );
}
