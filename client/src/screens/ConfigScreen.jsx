import { useState } from 'react';
import TopicGrid from '../components/TopicGrid.jsx';
import Button from '../components/Button.jsx';
import SettingsModal from '../components/SettingsModal.jsx';
import { useGame } from '../context/GameContext.jsx';
import { SOURCE_TAGS } from '@shared/constants.js';

const DIFFS = [
  { v: 'easy', label: 'Easy' },
  { v: 'medium', label: 'Medium' },
  { v: 'hard', label: 'Hard' },
  { v: 'mixed', label: 'Mixed' },
];
const MIX_LABEL = { all: 'All (🌍 + 🇮🇳)', classic: '🌍 Global only', cultural: '🇮🇳 Cultural only' };

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`btn-pop px-4 py-2 text-base ${active ? 'bg-primary' : 'bg-white/10'}`}
      style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.35)' }}
    >
      {children}
    </button>
  );
}

export default function ConfigScreen() {
  const { state, setSetup, createRoom, updateRoomConfig, startSolo, dispatch } = useGame();
  const { setup, topicsData, mode, settings } = state;
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const topics = topicsData?.topics || [];
  const isSolo = mode === 'solo';

  const start = async () => {
    setBusy(true);
    const finalConfig = { ...setup, source: settings.questionMix };
    if (isSolo) {
      await startSolo(finalConfig);
    } else {
      const res = await createRoom();
      if (res?.ok) updateRoomConfig(finalConfig);
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => dispatch({ type: 'PATCH', payload: { screen: 'home', mode: null } })} className="text-text-secondary hover:text-white">
          ← Back
        </button>
        <h1 className="font-display text-3xl">{isSolo ? '🎯 Solo Setup' : '🎉 New Lobby'}</h1>
        <button onClick={() => setSettingsOpen(true)} className="text-text-secondary hover:text-white">⚙️</button>
      </div>

      <h2 className="mb-3 font-display text-xl">Pick a topic</h2>
      <TopicGrid topics={topics} selected={setup.topic} onSelect={(topic) => setSetup({ topic })} />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-display text-lg">Difficulty</h3>
          <div className="flex flex-wrap gap-2">
            {DIFFS.map((d) => (
              <Pill key={d.v} active={setup.difficulty === d.v} onClick={() => setSetup({ difficulty: d.v })}>{d.label}</Pill>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-display text-lg">Rounds</h3>
          <div className="flex flex-wrap gap-2">
            {(topicsData?.roundCounts || [3, 5, 7]).map((r) => (
              <Pill key={r} active={setup.rounds === r} onClick={() => setSetup({ rounds: r })}>{r} rounds</Pill>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-display text-lg">Timer (Classic/Image)</h3>
          <div className="flex flex-wrap gap-2">
            <Pill active={setup.timer === null} onClick={() => setSetup({ timer: null })}>Default</Pill>
            {(topicsData?.timers || [10, 15, 20, 30]).map((t) => (
              <Pill key={t} active={setup.timer === t} onClick={() => setSetup({ timer: t })}>{t}s</Pill>
            ))}
          </div>
          <p className="mt-1 text-xs text-text-secondary">Other rounds keep signature timings (Speed 8s, Final 5s…).</p>
        </div>

        <div>
          <h3 className="mb-2 font-display text-lg">Question mix</h3>
          <div className="rounded-2xl bg-white/5 px-4 py-3">
            <div className="font-bold">{MIX_LABEL[settings.questionMix]}</div>
            <button onClick={() => setSettingsOpen(true)} className="text-sm text-accent underline">Change in Settings</button>
          </div>
        </div>

        {!isSolo && (
          <div className="md:col-span-2">
            <button
              onClick={() => setSetup({ suddenDeath: !setup.suddenDeath })}
              className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
            >
              <span>💀 Sudden Death in Final Round <span className="text-text-secondary text-sm">(wrong answer = eliminated)</span></span>
              <span className={`relative h-6 w-11 rounded-full ${setup.suddenDeath ? 'bg-danger' : 'bg-white/20'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${setup.suddenDeath ? 'left-5' : 'left-0.5'}`} />
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant={isSolo ? 'success' : 'primary'} className="px-10" onClick={start} disabled={busy}>
          {busy ? 'Loading…' : isSolo ? '🚀 Start Solo' : '🎉 Create Lobby'}
        </Button>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
