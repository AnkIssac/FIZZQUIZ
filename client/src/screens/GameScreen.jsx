import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoundIntro from '../components/RoundIntro.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import TimerRing from '../components/TimerRing.jsx';
import ScoreBoard from '../components/ScoreBoard.jsx';
import AnswerIndicators from '../components/AnswerIndicators.jsx';
import { useGame } from '../context/GameContext.jsx';
import { ROUND_TYPES } from '@shared/constants.js';

const ROUND_BY_KEY = Object.fromEntries(ROUND_TYPES.map((r) => [r.key, r]));

// Players list shaped for the side scoreboard, for either mode.
function useLivePlayers() {
  const { state } = useGame();
  if (state.mode === 'solo') {
    const s = state.solo;
    return [{
      id: 'me', name: state.settings.name || 'You', avatar: state.settings.avatar,
      score: s.score, streak: s.streak, bestStreak: s.bestStreak, lastDelta: 0,
    }];
  }
  return state.mp.players;
}

function ScoreboardView({ scoreboard, myId }) {
  const [count, setCount] = useState(scoreboard.countdown || 5);
  useEffect(() => {
    setCount(scoreboard.countdown || 5);
    const id = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [scoreboard]);
  const nextDef = ROUND_BY_KEY[scoreboard.nextRoundKey];
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h2 className="mb-1 text-center font-display text-3xl">Scoreboard</h2>
      <p className="mb-5 text-center text-text-secondary">
        Round {scoreboard.roundIndex + 1} of {scoreboard.totalRounds} complete
      </p>
      <ScoreBoard players={scoreboard.players} myId={myId} />
      {nextDef && (
        <motion.div
          key={count}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 text-center"
        >
          <div className="text-text-secondary">Next up: {nextDef.icon} {nextDef.name}</div>
          <div className="font-display text-4xl text-accent">Next round in {count}…</div>
        </motion.div>
      )}
    </div>
  );
}

export default function GameScreen() {
  const { state, submitAnswer } = useGame();
  const { live, mode, settings } = state;
  const livePlayers = useLivePlayers();
  const myId = mode === 'solo' ? 'me' : state.mp.playerId;

  if (!live.phase) return <div className="grid min-h-screen place-items-center text-text-secondary">Loading…</div>;

  if (live.phase === 'roundIntro') return <RoundIntro intro={live.roundIntro} />;
  if (live.phase === 'scoreboard') return <ScoreboardView scoreboard={live.scoreboard} myId={myId} />;

  // question / reveal share a layout
  const q = live.question;
  if (!q) return <div className="grid min-h-screen place-items-center text-text-secondary">Loading…</div>;
  const reveal = live.phase === 'reveal' ? live.reveal : null;
  const roundDef = ROUND_BY_KEY[q.roundKey];
  const isSpeed = q.roundKey === 'speed';

  return (
    <div className={`mx-auto max-w-5xl px-4 py-6 ${isSpeed ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}>
      {/* header: round progress + timer */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="font-display text-2xl" style={{ color: roundDef?.tint }}>
            {q.roundIcon} {q.roundName}
          </div>
          <div className="mt-1 h-2 w-44 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{ width: `${((q.index + 1) / q.total) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-sm text-text-secondary">Question {q.index + 1} / {q.total}</div>
        </div>
        {!reveal && <TimerRing key={q.qid} seconds={q.remaining || q.timer} />}
        {reveal && <div className="font-display text-3xl text-success">{reveal.correctOption ? '✓' : ''}</div>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div>
          <AnimatePresence mode="wait">
            <QuestionCard
              key={q.qid}
              question={q}
              reveal={reveal}
              mySelection={live.mySelection}
              locked={live.locked}
              onSelect={submitAnswer}
              colorblind={settings.colorblind}
              accent={roundDef?.tint || '#6C4EF2'}
              myId={myId}
            />
          </AnimatePresence>

          {mode === 'mp' && !reveal && (
            <div className="mt-4">
              <AnswerIndicators players={state.mp.players} answeredIds={live.answeredIds} />
            </div>
          )}

          {reveal && reveal.sharedBonus > 0 && (
            <div className="mt-4 rounded-2xl bg-success/20 p-3 text-center font-bold text-success">
              🤝 Everyone nailed it! Shared bonus +{reveal.sharedBonus} each
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="fq-card p-3">
            <div className="mb-2 text-sm font-bold text-text-secondary">Live standings</div>
            <ScoreBoard players={livePlayers} myId={myId} compact />
          </div>
          {mode === 'solo' && (
            <div className="fq-card mt-3 p-3 text-center">
              <div className="text-sm text-text-secondary">Your streak</div>
              <div className="font-display text-3xl text-accent">🔥 {state.solo.streak}</div>
            </div>
          )}
        </aside>
      </div>

      {/* mobile bottom standings */}
      <div className="mt-5 lg:hidden">
        <ScoreBoard players={livePlayers} myId={myId} compact />
      </div>
    </div>
  );
}
