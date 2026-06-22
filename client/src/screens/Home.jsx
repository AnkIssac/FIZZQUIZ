import { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo.jsx';
import Button from '../components/Button.jsx';
import SettingsModal from '../components/SettingsModal.jsx';
import { useGame } from '../context/GameContext.jsx';
import { loadPersonalBests } from '../lib/storage.js';

const MASCOTS = ['🦊', '🐼', '🦄', '🐸', '🐙', '🦖'];

export default function Home({ initialJoinCode }) {
  const { state, dispatch, updateSettings, joinRoom } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(!!initialJoinCode);
  const [code, setCode] = useState(initialJoinCode || '');
  const [joining, setJoining] = useState(false);
  const name = state.settings.name;
  const pbCount = Object.keys(loadPersonalBests()).length;

  const ensureName = () => {
    if (!name.trim()) updateSettings({ name: `Player${Math.floor(Math.random() * 900 + 100)}` });
  };

  const go = (mode) => {
    ensureName();
    dispatch({ type: 'PATCH', payload: { screen: 'config', mode } });
  };

  const doJoin = async () => {
    if (!code.trim()) return;
    ensureName();
    setJoining(true);
    const res = await joinRoom(code.trim().toUpperCase());
    setJoining(false);
    if (!res?.ok) return; // error shown via state.error
    setJoinOpen(false);
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      {/* decorative mascots */}
      {MASCOTS.map((m, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute text-5xl opacity-50"
          style={{ left: `${8 + i * 15}%`, top: `${15 + ((i * 27) % 60)}%` }}
          animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        >
          {m}
        </motion.div>
      ))}

      <div className="relative z-10 w-full max-w-md text-center">
        <Logo />
        <p className="mt-3 text-text-secondary">Global 🌍 + Malayali 🇮🇳 trivia. Grab your crew. Fizz it out.</p>

        <div className="mx-auto mt-6 max-w-xs">
          <input
            value={name}
            onChange={(e) => updateSettings({ name: e.target.value.slice(0, 18) })}
            placeholder="Enter your nickname"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-center text-lg outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button variant="primary" className="w-full" onClick={() => go('mp')}>🎉 Create Lobby</Button>
          <Button variant="accent" className="w-full" onClick={() => setJoinOpen(true)}>🔑 Join Game</Button>
          <Button variant="success" className="w-full" onClick={() => go('solo')}>🎯 Solo Play</Button>
        </div>

        <button onClick={() => setSettingsOpen(true)} className="mt-5 text-text-secondary hover:text-white">
          ⚙️ Settings {pbCount > 0 && <span className="ml-1 text-xs">· {pbCount} personal best{pbCount > 1 ? 's' : ''}</span>}
        </button>

        {state.error && <div className="mt-4 rounded-xl bg-danger/20 px-3 py-2 text-danger">{state.error}</div>}
      </div>

      {joinOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setJoinOpen(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="fq-card w-full max-w-sm p-6 text-center"
          >
            <h2 className="font-display text-2xl">Join a Game</h2>
            <input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ROOM CODE"
              className="my-4 w-full rounded-2xl bg-white/10 px-4 py-3 text-center font-display text-2xl tracking-[0.3em] outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && doJoin()}
            />
            {state.error && <div className="mb-3 text-danger">{state.error}</div>}
            <Button variant="accent" className="w-full" onClick={doJoin} disabled={joining || code.length < 4}>
              {joining ? 'Joining…' : 'Join'}
            </Button>
          </motion.div>
        </div>
      )}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
