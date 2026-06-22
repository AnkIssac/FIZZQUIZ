// Per-player end-of-game stat row.
export default function StatCard({ player, rank, isMe }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${isMe ? 'bg-primary/20 ring-2 ring-primary' : 'bg-white/5'}`}>
      <span className="w-6 text-center font-display text-text-secondary">{rank}</span>
      <div className="w-10 h-10 rounded-xl grid place-items-center text-xl" style={{ background: player.avatar?.color || '#6C4EF2' }}>
        {player.avatar?.emoji || '🙂'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate font-bold">{player.name}</div>
        <div className="text-xs text-text-secondary">
          ✅ {player.correct}/{player.answered} correct · 🎯 {player.accuracy}% · 🔥 best {player.bestStreak}
        </div>
      </div>
      <div className="font-display text-xl">{player.score}</div>
    </div>
  );
}
