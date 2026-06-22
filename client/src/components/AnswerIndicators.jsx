// Shows who has answered (without revealing their choice) during the question phase.
export default function AnswerIndicators({ players, answeredIds }) {
  if (!players?.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {players.map((p) => {
        const done = answeredIds.includes(p.id);
        return (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-all ${
              done ? 'bg-success/25 ring-1 ring-success' : 'bg-white/5'
            }`}
            title={done ? `${p.name} answered` : `${p.name} is thinking…`}
          >
            <span
              className="w-6 h-6 rounded-lg grid place-items-center text-sm"
              style={{ background: p.avatar?.color || '#6C4EF2' }}
            >
              {p.avatar?.emoji || '🙂'}
            </span>
            <span className="max-w-[80px] truncate font-semibold">{p.name}</span>
            {done && <span className="text-success">✓</span>}
          </div>
        );
      })}
    </div>
  );
}
