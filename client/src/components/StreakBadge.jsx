import { motion } from 'framer-motion';

// 🔥 fire badge shown when a player has a streak of 3+.
export default function StreakBadge({ streak }) {
  if (!streak || streak < 3) return null;
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-sm font-bold text-accent"
      title={`${streak} in a row`}
    >
      🔥 {streak}
    </motion.span>
  );
}
