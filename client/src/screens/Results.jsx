import { useEffect } from 'react';
import Podium from '../components/Podium.jsx';
import StatCard from '../components/StatCard.jsx';
import Button from '../components/Button.jsx';
import { useGame } from '../context/GameContext.jsx';
import { celebrationConfetti } from '../lib/confetti.js';

export default function Results() {
  const { state, isHost, playAgainMp, restartSolo, backToMenu, dispatch } = useGame();
  const end = state.live.gameEnd;
  const isSolo = state.mode === 'solo';
  const myId = isSolo ? 'me' : state.mp.playerId;

  useEffect(() => {
    celebrationConfetti();
  }, []);

  if (!end) return null;
  const podium = end.podium || [];
  const standings = end.standings || [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-center font-display text-4xl">🏆 Final Results</h1>
      {isSolo && state.solo.isBest && (
        <p className="mb-4 text-center font-bold text-accent">🎉 New personal best!</p>
      )}
      {isSolo && !state.solo.isBest && state.solo.personalBest != null && (
        <p className="mb-4 text-center text-text-secondary">Personal best: {state.solo.personalBest}</p>
      )}

      <div className="mb-8 mt-6">
        <Podium podium={podium} />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-xl">Leaderboard</h2>
        {standings.map((p, i) => (
          <StatCard key={p.id} player={p} rank={i + 1} isMe={p.id === myId} />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {isSolo ? (
          <Button variant="success" className="flex-1" onClick={restartSolo}>🔁 Play Again</Button>
        ) : (
          isHost && <Button variant="success" className="flex-1" onClick={playAgainMp}>🔁 Play Again</Button>
        )}
        <Button
          variant="accent"
          className="flex-1"
          onClick={() => dispatch({ type: 'PATCH', payload: { screen: 'config' } })}
        >
          🎲 New Topic
        </Button>
        <Button variant="ghost" className="flex-1" onClick={backToMenu}>🏠 Back to Menu</Button>
      </div>
      {!isSolo && !isHost && (
        <p className="mt-3 text-center text-sm text-text-secondary">Waiting for the host to start a new game…</p>
      )}
    </div>
  );
}
