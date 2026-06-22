import { motion } from 'framer-motion';

function Stars({ n }) {
  return (
    <span className="text-xs" aria-label={`difficulty ${n} of 3`}>
      {'★'.repeat(n)}
      <span className="opacity-30">{'★'.repeat(3 - n)}</span>
    </span>
  );
}

// Grid of topic cards (plus a "Mixed" card) for the host to choose from.
export default function TopicGrid({ topics, selected, onSelect }) {
  const mixed = { id: 'mixed', title: 'Mixed', icon: '🎲', tint: '#A0A0C0', difficulty: 2, questionCount: 1050 };
  const all = [mixed, ...topics];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {all.map((t) => {
        const active = selected === t.id;
        return (
          <motion.button
            key={t.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(t.id)}
            className={`fq-card relative p-4 text-left transition-all ${active ? 'ring-2' : 'ring-0'}`}
            style={{ boxShadow: active ? `0 0 26px ${t.tint}99` : undefined, ['--tw-ring-color']: t.tint }}
          >
            <span
              className="absolute right-3 top-3 h-3 w-3 rounded-full"
              style={{ background: t.tint }}
              aria-hidden
            />
            <div className="text-4xl">{t.icon}</div>
            <div className="mt-2 font-display text-lg leading-tight">{t.title}</div>
            <div className="mt-1 flex items-center justify-between text-text-secondary">
              <Stars n={t.difficulty} />
              <span className="text-xs">{t.questionCount} Qs</span>
            </div>
            {active && <div className="absolute left-3 top-3 text-success">✓</div>}
          </motion.button>
        );
      })}
    </div>
  );
}
