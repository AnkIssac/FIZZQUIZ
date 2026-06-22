import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import { AVATAR_PALETTE, AVATAR_GLYPHS } from '../lib/storage.js';
import { QUESTION_MIX } from '@shared/constants.js';

// Settings: name, avatar, sound, accessibility toggles, and the question-mix filter.
export default function SettingsModal({ open, onClose }) {
  const { state, updateSettings } = useGame();
  const s = state.settings;
  if (!open) return null;

  const setAvatar = (patch) => updateSettings({ avatar: { ...s.avatar, ...patch } });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="fq-card no-scrollbar max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">⚙️ Settings</h2>
          <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">✕</button>
        </div>

        <label className="mb-1 block text-sm font-bold text-text-secondary">Display name</label>
        <input
          value={s.name}
          onChange={(e) => updateSettings({ name: e.target.value.slice(0, 18) })}
          placeholder="Your nickname"
          className="mb-4 w-full rounded-xl bg-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm font-bold text-text-secondary">Avatar</span>
            <span className="w-9 h-9 rounded-xl grid place-items-center text-xl" style={{ background: s.avatar.color }}>
              {s.avatar.emoji}
            </span>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {AVATAR_PALETTE.map((c) => (
              <button key={c} onClick={() => setAvatar({ color: c })} className={`h-7 w-7 rounded-lg ${s.avatar.color === c ? 'ring-2 ring-white' : ''}`} style={{ background: c }} aria-label={`color ${c}`} />
            ))}
          </div>
          <div className="grid grid-cols-10 gap-1">
            {AVATAR_GLYPHS.map((g) => (
              <button key={g} onClick={() => setAvatar({ emoji: g })} className={`h-7 rounded-md text-lg ${s.avatar.emoji === g ? 'bg-white/20 ring-2 ring-white' : 'bg-white/5'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <label className="mb-1 block text-sm font-bold text-text-secondary">Sound volume</label>
        <input
          type="range" min="0" max="1" step="0.05" value={s.volume}
          onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
          className="mb-4 w-full accent-accent"
        />

        <div className="space-y-2">
          <Toggle label="🔇 Mute all sound" checked={s.muted} onChange={(v) => updateSettings({ muted: v })} />
          <Toggle label="🔶 Colorblind mode (shape icons)" checked={s.colorblind} onChange={(v) => updateSettings({ colorblind: v })} />
          <Toggle label="🌗 High contrast" checked={s.highContrast} onChange={(v) => updateSettings({ highContrast: v })} />
        </div>

        <div className="mt-5">
          <div className="mb-2 text-sm font-bold text-text-secondary">Question mix</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: QUESTION_MIX.ALL, label: 'All' },
              { v: QUESTION_MIX.GLOBAL, label: '🌍 Global' },
              { v: QUESTION_MIX.CULTURAL, label: '🇮🇳 Cultural' },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => updateSettings({ questionMix: o.v })}
                className={`btn-pop py-2 text-sm ${s.questionMix === o.v ? 'bg-primary' : 'bg-white/10'}`}
                style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.35)' }}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-secondary">Applies to Solo play and to new lobbies you host.</p>
        </div>
      </motion.div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2">
      <span>{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-success' : 'bg-white/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </span>
    </button>
  );
}
