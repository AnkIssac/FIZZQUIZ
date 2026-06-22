import { motion } from 'framer-motion';

// "FizzQuiz" wordmark with each letter bobbing like a fizzy bubble.
const LETTERS = 'FizzQuiz'.split('');
const COLORS = ['#6C4EF2', '#F2A84E', '#4ECF7A', '#F25E9E', '#4ECFC9', '#F2D14E', '#9E5EF2', '#5E9EF2'];

export default function Logo({ size = 'text-6xl md:text-8xl' }) {
  return (
    <h1 className={`font-display ${size} flex items-end justify-center select-none`} aria-label="FizzQuiz">
      <span className="mr-2 animate-fizz" aria-hidden>🫧</span>
      {LETTERS.map((ch, i) => (
        <motion.span
          key={i}
          style={{ color: COLORS[i % COLORS.length], textShadow: '0 4px 0 rgba(0,0,0,0.3)' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        >
          {ch}
        </motion.span>
      ))}
    </h1>
  );
}
