import { motion } from 'framer-motion';

// Dramatic scale-in card shown before each round begins.
export default function RoundIntro({ intro }) {
  if (!intro) return null;
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <motion.div
        initial={{ scale: 0.4, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="fq-card neon-border w-full max-w-lg p-8 text-center"
        style={{ borderColor: `${intro.tint}88`, boxShadow: `0 0 40px ${intro.tint}55` }}
      >
        <div className="text-text-secondary font-bold tracking-widest">
          ROUND {intro.index + 1} / {intro.total}
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="my-4 text-7xl"
        >
          {intro.icon}
        </motion.div>
        <h2 className="font-display text-4xl" style={{ color: intro.tint }}>
          {intro.name}
        </h2>
        <p className="mt-3 text-text-secondary">{intro.description}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1">⏱ {intro.timer}s / question</span>
          <span className="rounded-full bg-white/10 px-3 py-1">🎯 {intro.questions} questions</span>
          <span className="rounded-full bg-white/10 px-3 py-1">⭐ {intro.basePoints} base pts</span>
          {intro.suddenDeath && <span className="rounded-full bg-danger/30 px-3 py-1 text-danger">💀 Sudden Death</span>}
        </div>
      </motion.div>
    </div>
  );
}
