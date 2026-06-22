import { motion } from 'framer-motion';
import RoomCodeDisplay from '../components/RoomCodeDisplay.jsx';
import PlayerPod from '../components/PlayerPod.jsx';
import ChatBox from '../components/ChatBox.jsx';
import Button from '../components/Button.jsx';
import { useGame } from '../context/GameContext.jsx';
import { TOPICS } from '@shared/constants.js';

const TOPIC_TITLE = Object.fromEntries(TOPICS.map((t) => [t.id, t.title]));

function HostPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-sm ${active ? 'bg-primary' : 'bg-white/10'}`}>
      {children}
    </button>
  );
}

export default function Lobby() {
  const { state, me, isHost, toggleReady, startGame, updateRoomConfig, leaveRoom } = useGame();
  const { players, code, config, playerId } = state.mp;
  if (!code) return null;

  const cfg = config || {};
  const canStart = players.length >= 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={leaveRoom} className="text-text-secondary hover:text-white">← Leave</button>
        <h1 className="font-display text-3xl">Lobby</h1>
        <div className="w-12" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <RoomCodeDisplay code={code} />
          <div className="fq-card p-4 text-sm">
            <div className="mb-2 font-bold text-text-secondary">Game settings</div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1">📚 {cfg.topic === 'mixed' ? 'Mixed' : TOPIC_TITLE[cfg.topic] || cfg.topic}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">🎚 {cfg.difficulty}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">🔁 {cfg.rounds} rounds</span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {cfg.source === 'classic' ? '🌍 Global' : cfg.source === 'cultural' ? '🇮🇳 Cultural' : '🌍🇮🇳 All'}
              </span>
              {cfg.suddenDeath && <span className="rounded-full bg-danger/30 px-3 py-1 text-danger">💀 Sudden Death</span>}
            </div>
            {isHost && (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                <div className="text-xs text-text-secondary">Host quick-edit</div>
                <div className="flex flex-wrap gap-2">
                  {[3, 5, 7].map((r) => (
                    <HostPill key={r} active={cfg.rounds === r} onClick={() => updateRoomConfig({ ...cfg, rounds: r })}>{r}R</HostPill>
                  ))}
                  <HostPill active={cfg.suddenDeath} onClick={() => updateRoomConfig({ ...cfg, suddenDeath: !cfg.suddenDeath })}>💀 SD</HostPill>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="fq-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl">Players ({players.length}/10)</h2>
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-sm text-text-secondary">
                Waiting for players…
              </motion.span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {players.map((p) => (
                <PlayerPod key={p.id} player={p} isMe={p.id === playerId} crown={p.isHost} />
              ))}
            </div>
          </div>

          <ChatBox />

          <div className="flex flex-col items-stretch gap-3 sm:flex-row">
            {me && (
              <Button variant={me.ready ? 'ghost' : 'accent'} className="flex-1" onClick={() => toggleReady(!me.ready)}>
                {me.ready ? '✓ Ready' : 'Mark Ready'}
              </Button>
            )}
            {isHost && (
              <Button variant="success" className="flex-1" onClick={startGame} disabled={!canStart}>
                ▶ Start Game
              </Button>
            )}
          </div>
          {isHost && players.length < 2 && (
            <p className="text-center text-sm text-text-secondary">You can start solo, or share the code to add players (up to 10).</p>
          )}
          {!isHost && <p className="text-center text-sm text-text-secondary">Waiting for the host to start…</p>}
        </div>
      </div>
    </div>
  );
}
