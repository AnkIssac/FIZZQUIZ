import { motion } from 'framer-motion';

// Top-3 podium with staggered rise animations. Order on stage: 2nd, 1st, 3rd.
const ORDER = [1, 0, 2];
const HEIGHTS = ['h-24', 'h-36', 'h-20'];
const MEDALS = ['🥇', '🥈', '🥉'];
const COLORS = ['#F2D14E', '#C0C0D0', '#CD7F32'];

export default function Podium({ podium }) {
  return (
    <div className="flex items-end justify-center gap-3 md:gap-5">
      {ORDER.map((rank, slot) => {
        const p = podium[rank];
        if (!p) return <div key={slot} className="w-24" />;
        return (
          <motion.div
            key={p.id}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + slot * 0.2, type: 'spring', stiffness: 160, damping: 14 }}
            className="flex w-24 flex-col items-center md:w-28"
          >
            <div className="text-3xl">{MEDALS[rank]}</div>
            <div
              className="my-1 w-14 h-14 rounded-2xl grid place-items-center text-2xl"
              style={{ background: p.avatar?.color || '#6C4EF2' }}
            >
              {p.avatar?.emoji || '🙂'}
            </div>
            <div className="max-w-full truncate font-bold text-center">{p.name}</div>
            <div className="font-display text-lg" style={{ color: COLORS[rank] }}>{p.score}</div>
            <div
              className={`mt-2 w-full ${HEIGHTS[rank]} rounded-t-2xl grid place-items-start justify-center pt-2 font-display text-2xl text-black/70`}
              style={{ background: `linear-gradient(180deg, ${COLORS[rank]}, ${COLORS[rank]}88)` }}
            >
              {rank + 1}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
