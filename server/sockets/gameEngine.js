// Server-authoritative game loop: round intro → questions → reveal → scoreboard → end.
// All timers run here on the server so clients cannot cheat on timing or scores.
import {
  ROUND_TYPES,
  REVEAL_DURATION,
  SCOREBOARD_COUNTDOWN,
  FINAL_SHARED_BONUS,
} from '../../shared/constants.js';
import { computeScore, accuracyPct } from '../../shared/scoring.js';
import { buildRoundQuestions, roundSequence, toClientQuestion } from '../db/questionService.js';
import { publicPlayer } from './rooms.js';

const ROUND_BY_KEY = Object.fromEntries(ROUND_TYPES.map((r) => [r.key, r]));
const ROUND_INTRO_MS = 4500;

function clearRoomTimer(room) {
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
}

function emit(io, room, event, payload) {
  io.to(room.code).emit(event, payload);
}

function activePlayers(room) {
  return [...room.players.values()];
}

function timerForRound(room, roundKey) {
  const def = ROUND_BY_KEY[roundKey];
  // The optional config timer override applies to the classic round only; the other
  // rounds keep their signature timings (speed = 8s, final = 5s, etc.).
  if (room.config.timer && (roundKey === 'classic' || roundKey === 'image')) {
    return room.config.timer;
  }
  return def.timer;
}

export function startGame(io, room) {
  clearRoomTimer(room);
  room.roundKeys = roundSequence(room.config.rounds);
  room.roundIndex = -1;
  room.usedIds = new Set();
  // Reset scores/stats for everyone.
  for (const p of room.players.values()) {
    p.score = 0;
    p.streak = 0;
    p.bestStreak = 0;
    p.comboCount = 0;
    p.correct = 0;
    p.answered = 0;
    p.eliminated = false;
    p.lastDelta = 0;
  }
  startRound(io, room);
}

function startRound(io, room) {
  clearRoomTimer(room);
  room.roundIndex += 1;
  if (room.roundIndex >= room.roundKeys.length) {
    endGame(io, room);
    return;
  }
  const roundKey = room.roundKeys[room.roundIndex];
  const def = ROUND_BY_KEY[roundKey];
  room.questions = buildRoundQuestions(
    roundKey,
    { topic: room.config.topic, difficulty: room.config.difficulty, source: room.config.source },
    room.usedIds,
  );
  room.questionIndex = 0;
  room.phase = 'roundIntro';

  emit(io, room, 'round_intro', {
    roundKey,
    name: def.name,
    icon: def.icon,
    description: def.description,
    tint: def.tint,
    index: room.roundIndex,
    total: room.roundKeys.length,
    questions: room.questions.length,
    timer: timerForRound(room, roundKey),
    basePoints: def.basePoints,
    suddenDeath: room.config.suddenDeath && roundKey === 'final',
  });

  room.timer = setTimeout(() => nextQuestion(io, room), ROUND_INTRO_MS);
}

function nextQuestion(io, room) {
  clearRoomTimer(room);
  const served = room.questions[room.questionIndex];
  if (!served) {
    showScoreboard(io, room);
    return;
  }
  const roundKey = room.roundKeys[room.roundIndex];
  const def = ROUND_BY_KEY[roundKey];
  const timer = timerForRound(room, roundKey);

  room.current = served;
  room.currentTimer = timer;
  room.answers = new Map();
  room.phase = 'question';
  room.questionStart = Date.now();

  emit(io, room, 'question', toClientQuestion(served, {
    round: room.roundIndex,
    index: room.questionIndex,
    total: room.questions.length,
    roundKey,
    roundName: def.name,
    roundIcon: def.icon,
    timer,
  }));

  room.timer = setTimeout(() => endQuestion(io, room), timer * 1000);
}

export function submitAnswer(io, room, playerId, index) {
  if (room.phase !== 'question' || !room.current) return;
  const player = room.players.get(playerId);
  if (!player || player.eliminated) return;
  if (room.answers.has(playerId)) return;

  const timeMs = Date.now() - room.questionStart;
  room.answers.set(playerId, { index, timeMs });
  emit(io, room, 'player_answered', { playerId });

  // End early if every non-eliminated, connected player has answered.
  const waiting = activePlayers(room).filter(
    (p) => p.connected && !p.eliminated && !room.answers.has(p.id),
  );
  if (waiting.length === 0) {
    endQuestion(io, room);
  }
}

function endQuestion(io, room) {
  clearRoomTimer(room);
  if (room.phase !== 'question' || !room.current) return;
  room.phase = 'reveal';

  const roundKey = room.roundKeys[room.roundIndex];
  const def = ROUND_BY_KEY[roundKey];
  const current = room.current;
  const results = [];
  const participants = []; // non-eliminated players who faced this question

  for (const p of room.players.values()) {
    if (p.eliminated) {
      results.push({ id: p.id, correct: false, delta: 0, score: p.score, streak: 0, chosenIndex: null, eliminated: true, played: false });
      continue;
    }
    participants.push(p);
    p.answered += 1;
    const ans = room.answers.get(p.id);
    const correct = !!ans && ans.index === current.correctIndex;

    let delta = 0;
    if (correct) {
      p.streak += 1;
      p.bestStreak = Math.max(p.bestStreak, p.streak);
      p.correct += 1;
      const { points } = computeScore({
        roundDef: def,
        correct: true,
        timeMs: ans.timeMs,
        timerSec: room.currentTimer,
        streakAfter: p.streak,
        comboCount: p.streak,
        roundKey,
      });
      delta = points;
    } else {
      p.streak = 0;
      if (room.config.suddenDeath && roundKey === 'final') {
        p.eliminated = true;
      }
    }
    p.score += delta;
    p.lastDelta = delta;
    results.push({
      id: p.id,
      correct,
      delta,
      score: p.score,
      streak: p.streak,
      chosenIndex: ans ? ans.index : null,
      eliminated: p.eliminated,
      played: true,
    });
  }

  // Final round shared bonus: if every participant answered correctly, split 500.
  let sharedBonus = 0;
  if (roundKey === 'final' && participants.length > 0) {
    const allCorrect = participants.every((p) => {
      const ans = room.answers.get(p.id);
      return ans && ans.index === current.correctIndex;
    });
    if (allCorrect) {
      sharedBonus = Math.floor(FINAL_SHARED_BONUS / participants.length);
      for (const p of participants) {
        p.score += sharedBonus;
        p.lastDelta += sharedBonus;
        const r = results.find((x) => x.id === p.id);
        if (r) {
          r.delta += sharedBonus;
          r.score = p.score;
        }
      }
    }
  }

  emit(io, room, 'reveal', {
    qid: current.qid,
    correctIndex: current.correctIndex,
    correctOption: current.options[current.correctIndex],
    explanation: current.explanation,
    results,
    sharedBonus,
    players: activePlayers(room).map(publicPlayer),
  });

  room.timer = setTimeout(() => afterReveal(io, room), REVEAL_DURATION * 1000);
}

function afterReveal(io, room) {
  clearRoomTimer(room);
  room.questionIndex += 1;
  if (room.questionIndex < room.questions.length) {
    nextQuestion(io, room);
  } else {
    showScoreboard(io, room);
  }
}

function rankedPlayers(room) {
  return activePlayers(room)
    .map(publicPlayer)
    .sort((a, b) => b.score - a.score);
}

function showScoreboard(io, room) {
  clearRoomTimer(room);
  const isLastRound = room.roundIndex >= room.roundKeys.length - 1;
  if (isLastRound) {
    endGame(io, room);
    return;
  }
  room.phase = 'scoreboard';
  emit(io, room, 'scoreboard', {
    players: rankedPlayers(room),
    roundIndex: room.roundIndex,
    totalRounds: room.roundKeys.length,
    nextRoundKey: room.roundKeys[room.roundIndex + 1],
    countdown: SCOREBOARD_COUNTDOWN,
  });
  room.timer = setTimeout(() => startRound(io, room), SCOREBOARD_COUNTDOWN * 1000);
}

function endGame(io, room) {
  clearRoomTimer(room);
  room.phase = 'final';
  const ranked = activePlayers(room)
    .map((p) => ({
      ...publicPlayer(p),
      accuracy: accuracyPct(p.correct, p.answered),
    }))
    .sort((a, b) => b.score - a.score);

  emit(io, room, 'game_end', {
    podium: ranked.slice(0, 3),
    standings: ranked,
  });
}

// Reset a finished game back to the lobby so the host can start again.
export function resetToLobby(io, room) {
  clearRoomTimer(room);
  room.phase = 'lobby';
  room.roundIndex = -1;
  room.questionIndex = -1;
  room.questions = [];
  room.current = null;
  room.usedIds = new Set();
  for (const p of room.players.values()) {
    p.score = 0;
    p.streak = 0;
    p.bestStreak = 0;
    p.comboCount = 0;
    p.correct = 0;
    p.answered = 0;
    p.eliminated = false;
    p.lastDelta = 0;
    p.ready = false;
  }
}
