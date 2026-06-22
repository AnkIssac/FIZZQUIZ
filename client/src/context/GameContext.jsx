import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useCallback } from 'react';
import { getSocket, emitWithAck } from '../lib/socket.js';
import { getTopics, buildSoloGame } from '../lib/api.js';
import { loadSettings, saveSettings, recordPersonalBest } from '../lib/storage.js';
import { sfx, setMuted, setVolume, unlockAudio } from '../lib/audio.js';
import { burstConfetti } from '../lib/confetti.js';
import { ROUND_TYPES, REVEAL_DURATION, SCOREBOARD_COUNTDOWN } from '@shared/constants.js';
import { computeScore, accuracyPct } from '@shared/scoring.js';

const ROUND_BY_KEY = Object.fromEntries(ROUND_TYPES.map((r) => [r.key, r]));
const ROUND_INTRO_MS = 4500;

const GameContext = createContext(null);
export const useGame = () => useContext(GameContext);

const initialState = {
  screen: 'home', // home | config | lobby | game | results
  mode: null, // 'mp' | 'solo'
  settings: loadSettings(),
  topicsData: null,
  setup: { topic: 'mixed', difficulty: 'mixed', source: 'all', rounds: 7, timer: null, suddenDeath: false },
  error: null,
  // multiplayer room state
  mp: { code: null, playerId: null, players: [], config: null, hostId: null, chat: [], roundIndex: -1, totalRounds: 7 },
  // unified live game state (shared by mp + solo)
  live: { phase: null, roundIntro: null, question: null, reveal: null, scoreboard: null, gameEnd: null, answeredIds: [], mySelection: null, locked: false },
  // solo summary mirror
  solo: { score: 0, streak: 0, bestStreak: 0, correct: 0, answered: 0, personalBest: null, isBest: false },
};

function reducer(state, action) {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_SETUP':
      return { ...state, setup: { ...state.setup, ...action.payload } };
    case 'MP_PATCH':
      return { ...state, mp: { ...state.mp, ...action.payload } };
    case 'LIVE':
      return { ...state, live: { ...state.live, ...action.payload } };
    case 'SOLO_PATCH':
      return { ...state, solo: { ...state.solo, ...action.payload } };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Solo engine internal state + timers (kept in a ref to avoid stale closures).
  const soloRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);
  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // ---- settings persistence + audio sync ----
  useEffect(() => {
    saveSettings(state.settings);
    setMuted(state.settings.muted);
    setVolume(state.settings.volume);
  }, [state.settings]);

  const updateSettings = useCallback((patch) => dispatch({ type: 'SET_SETTINGS', payload: patch }), []);
  const setSetup = useCallback((patch) => dispatch({ type: 'SET_SETUP', payload: patch }), []);
  const goto = useCallback((screen) => dispatch({ type: 'PATCH', payload: { screen } }), []);

  // ---- load topics once ----
  useEffect(() => {
    getTopics().then((data) => dispatch({ type: 'PATCH', payload: { topicsData: data } })).catch(() => {});
  }, []);

  const playReveal = useCallback((correct) => {
    if (correct) {
      sfx.correct();
      burstConfetti();
    } else {
      sfx.wrong();
    }
  }, []);

  // ============ MULTIPLAYER ============
  useEffect(() => {
    const socket = getSocket();

    const onRoomUpdate = (room) => {
      dispatch({
        type: 'MP_PATCH',
        payload: {
          code: room.code,
          players: room.players,
          config: room.config,
          hostId: room.hostId,
          chat: room.chat,
          roundIndex: room.roundIndex,
          totalRounds: room.totalRounds,
        },
      });
    };
    const onChat = (msg) => {
      const cur = stateRef.current.mp.chat;
      dispatch({ type: 'MP_PATCH', payload: { chat: [...cur, msg].slice(-100) } });
    };
    const onRoundIntro = (intro) => {
      sfx.fanfare();
      dispatch({ type: 'PATCH', payload: { screen: 'game' } });
      dispatch({ type: 'LIVE', payload: { phase: 'roundIntro', roundIntro: intro, question: null, reveal: null, scoreboard: null } });
    };
    const onQuestion = (q) => {
      dispatch({ type: 'PATCH', payload: { screen: 'game' } });
      dispatch({ type: 'LIVE', payload: { phase: 'question', question: q, reveal: null, answeredIds: [], mySelection: null, locked: !!q.alreadyAnswered } });
    };
    const onPlayerAnswered = ({ playerId }) => {
      const cur = stateRef.current.live.answeredIds;
      if (!cur.includes(playerId)) dispatch({ type: 'LIVE', payload: { answeredIds: [...cur, playerId] } });
    };
    const onReveal = (data) => {
      const myId = stateRef.current.mp.playerId;
      const mine = data.results.find((r) => r.id === myId);
      playReveal(!!(mine && mine.correct));
      if (data.players) dispatch({ type: 'MP_PATCH', payload: { players: data.players } });
      dispatch({ type: 'LIVE', payload: { phase: 'reveal', reveal: data } });
    };
    const onScoreboard = (data) => {
      if (data.players) dispatch({ type: 'MP_PATCH', payload: { players: data.players } });
      dispatch({ type: 'LIVE', payload: { phase: 'scoreboard', scoreboard: data } });
    };
    const onGameEnd = (data) => {
      sfx.celebrate();
      dispatch({ type: 'PATCH', payload: { screen: 'results' } });
      dispatch({ type: 'LIVE', payload: { phase: 'gameEnd', gameEnd: data } });
    };
    const onReturnLobby = () => {
      dispatch({ type: 'PATCH', payload: { screen: 'lobby' } });
      dispatch({ type: 'LIVE', payload: { phase: null, roundIntro: null, question: null, reveal: null, scoreboard: null, gameEnd: null } });
    };

    socket.on('room_update', onRoomUpdate);
    socket.on('chat_message', onChat);
    socket.on('round_intro', onRoundIntro);
    socket.on('question', onQuestion);
    socket.on('player_answered', onPlayerAnswered);
    socket.on('reveal', onReveal);
    socket.on('scoreboard', onScoreboard);
    socket.on('game_end', onGameEnd);
    socket.on('returned_to_lobby', onReturnLobby);

    return () => {
      socket.off('room_update', onRoomUpdate);
      socket.off('chat_message', onChat);
      socket.off('round_intro', onRoundIntro);
      socket.off('question', onQuestion);
      socket.off('player_answered', onPlayerAnswered);
      socket.off('reveal', onReveal);
      socket.off('scoreboard', onScoreboard);
      socket.off('game_end', onGameEnd);
      socket.off('returned_to_lobby', onReturnLobby);
    };
  }, [playReveal]);

  const createRoom = useCallback(async () => {
    unlockAudio();
    const { name, avatar } = stateRef.current.settings;
    const res = await emitWithAck('create_room', { name, avatar });
    if (res?.ok) {
      dispatch({ type: 'MP_PATCH', payload: { code: res.code, playerId: res.playerId } });
      dispatch({ type: 'PATCH', payload: { mode: 'mp', screen: 'lobby', error: null } });
    } else {
      dispatch({ type: 'PATCH', payload: { error: res?.error || 'Could not create room' } });
    }
    return res;
  }, []);

  const joinRoom = useCallback(async (code) => {
    unlockAudio();
    const { name, avatar } = stateRef.current.settings;
    const res = await emitWithAck('join_room', { code, name, avatar });
    if (res?.ok) {
      dispatch({ type: 'MP_PATCH', payload: { code: res.code, playerId: res.playerId } });
      const phase = res.room?.phase;
      dispatch({ type: 'PATCH', payload: { mode: 'mp', screen: phase && phase !== 'lobby' ? 'game' : 'lobby', error: null } });
    } else {
      dispatch({ type: 'PATCH', payload: { error: res?.error || 'Could not join room' } });
    }
    return res;
  }, []);

  const updateRoomConfig = useCallback((config) => {
    getSocket().emit('update_config', { config });
  }, []);
  const toggleReady = useCallback((ready) => getSocket().emit('player_ready', { ready }), []);
  const startGame = useCallback(() => {
    unlockAudio();
    getSocket().emit('start_game');
  }, []);
  const sendChat = useCallback((text) => getSocket().emit('chat_message', { text }), []);
  const playAgainMp = useCallback(() => getSocket().emit('play_again'), []);
  const leaveRoom = useCallback(() => {
    getSocket().emit('leave_room');
    dispatch({ type: 'MP_PATCH', payload: { code: null, playerId: null, players: [], chat: [] } });
    dispatch({ type: 'PATCH', payload: { screen: 'home', mode: null } });
    dispatch({ type: 'LIVE', payload: { phase: null, roundIntro: null, question: null, reveal: null, scoreboard: null, gameEnd: null } });
  }, []);

  const submitMpAnswer = useCallback((optionIndex) => {
    if (stateRef.current.live.locked) return;
    sfx.select();
    dispatch({ type: 'LIVE', payload: { mySelection: optionIndex, locked: true } });
    getSocket().emit('submit_answer', { index: optionIndex });
  }, []);

  // ============ SOLO ENGINE ============
  const runSoloRound = useCallback((roundIndex) => {
    const eng = soloRef.current;
    if (!eng || roundIndex >= eng.rounds.length) {
      finishSolo();
      return;
    }
    eng.roundIndex = roundIndex;
    const round = eng.rounds[roundIndex];
    sfx.fanfare();
    dispatch({
      type: 'LIVE',
      payload: {
        phase: 'roundIntro',
        roundIntro: {
          roundKey: round.roundKey, name: round.name, icon: round.icon, description: round.description,
          tint: round.tint, index: roundIndex, total: eng.rounds.length, questions: round.questions.length,
          timer: round.timer, basePoints: round.basePoints, suddenDeath: false,
        },
        reveal: null, scoreboard: null, question: null,
      },
    });
    later(() => runSoloQuestion(roundIndex, 0), ROUND_INTRO_MS);
  }, [later]);

  const runSoloQuestion = useCallback((roundIndex, qIndex) => {
    const eng = soloRef.current;
    const round = eng.rounds[roundIndex];
    const served = round.questions[qIndex];
    if (!served) {
      showSoloScoreboard(roundIndex);
      return;
    }
    eng.questionIndex = qIndex;
    eng.questionStart = Date.now();
    eng.currentTimer = round.timer;
    const clientQ = {
      qid: served.qid, type: served.type, topic: served.topic, source: served.source, difficulty: served.difficulty,
      question: served.question, options: served.options, emoji: served.emoji, melody: served.melody,
      round: roundIndex, roundKey: round.roundKey, roundName: round.name, roundIcon: round.icon,
      index: qIndex, total: round.questions.length, timer: round.timer,
    };
    dispatch({ type: 'LIVE', payload: { phase: 'question', question: clientQ, reveal: null, mySelection: null, locked: false, answeredIds: [] } });
    later(() => gradeSolo(null), round.timer * 1000);
  }, [later]);

  const gradeSolo = useCallback((selectedIndex) => {
    clearTimers();
    const eng = soloRef.current;
    if (!eng) return;
    const round = eng.rounds[eng.roundIndex];
    const served = round.questions[eng.questionIndex];
    const def = ROUND_BY_KEY[round.roundKey];
    const correct = selectedIndex != null && selectedIndex === served.correctIndex;
    const timeMs = Math.min(round.timer * 1000, Date.now() - eng.questionStart);

    eng.answered += 1;
    if (correct) {
      eng.streak += 1;
      eng.bestStreak = Math.max(eng.bestStreak, eng.streak);
      eng.correct += 1;
    } else {
      eng.streak = 0;
    }
    const { points } = computeScore({
      roundDef: def, correct, timeMs, timerSec: round.timer,
      streakAfter: eng.streak, comboCount: eng.streak, roundKey: round.roundKey,
    });
    eng.score += points;
    eng.lastDelta = points;

    playReveal(correct);
    dispatch({ type: 'SOLO_PATCH', payload: { score: eng.score, streak: eng.streak, bestStreak: eng.bestStreak, correct: eng.correct, answered: eng.answered } });
    dispatch({
      type: 'LIVE',
      payload: {
        phase: 'reveal',
        reveal: {
          qid: served.qid, correctIndex: served.correctIndex, correctOption: served.options[served.correctIndex],
          explanation: served.explanation,
          results: [{ id: 'me', correct, delta: points, score: eng.score, streak: eng.streak, chosenIndex: selectedIndex, played: true }],
          solo: { correct, delta: points, score: eng.score, streak: eng.streak },
        },
        mySelection: selectedIndex,
        locked: true,
      },
    });
    later(() => {
      const nextQ = eng.questionIndex + 1;
      if (nextQ < round.questions.length) runSoloQuestion(eng.roundIndex, nextQ);
      else showSoloScoreboard(eng.roundIndex);
    }, REVEAL_DURATION * 1000);
  }, [clearTimers, later, playReveal, runSoloQuestion]);

  const submitSoloAnswer = useCallback((optionIndex) => {
    if (stateRef.current.live.locked) return;
    sfx.select();
    gradeSolo(optionIndex);
  }, [gradeSolo]);

  const showSoloScoreboard = useCallback((roundIndex) => {
    clearTimers();
    const eng = soloRef.current;
    const isLast = roundIndex >= eng.rounds.length - 1;
    if (isLast) {
      finishSolo();
      return;
    }
    dispatch({
      type: 'LIVE',
      payload: {
        phase: 'scoreboard',
        scoreboard: {
          players: [{ id: 'me', name: stateRef.current.settings.name || 'You', avatar: stateRef.current.settings.avatar, score: eng.score, streak: eng.streak, bestStreak: eng.bestStreak, correct: eng.correct, answered: eng.answered }],
          roundIndex, totalRounds: eng.rounds.length, nextRoundKey: eng.rounds[roundIndex + 1].roundKey, countdown: SCOREBOARD_COUNTDOWN,
        },
      },
    });
    later(() => runSoloRound(roundIndex + 1), SCOREBOARD_COUNTDOWN * 1000);
  }, [clearTimers, later, runSoloRound]);

  const finishSolo = useCallback(() => {
    clearTimers();
    const eng = soloRef.current;
    sfx.celebrate();
    const me = {
      id: 'me', name: stateRef.current.settings.name || 'You', avatar: stateRef.current.settings.avatar,
      score: eng.score, correct: eng.correct, answered: eng.answered, bestStreak: eng.bestStreak,
      accuracy: accuracyPct(eng.correct, eng.answered),
    };
    const { isBest, best } = recordPersonalBest(eng.topic, eng.score);
    dispatch({ type: 'SOLO_PATCH', payload: { personalBest: best, isBest } });
    dispatch({ type: 'PATCH', payload: { screen: 'results' } });
    dispatch({ type: 'LIVE', payload: { phase: 'gameEnd', gameEnd: { podium: [me], standings: [me], solo: true } } });
  }, [clearTimers]);

  const startSolo = useCallback(async (overrideConfig) => {
    unlockAudio();
    const setup = overrideConfig || stateRef.current.setup;
    const res = await buildSoloGame(setup);
    if (!res?.ok) {
      dispatch({ type: 'PATCH', payload: { error: 'Could not start solo game' } });
      return;
    }
    soloRef.current = {
      rounds: res.rounds, roundIndex: 0, questionIndex: 0, score: 0, streak: 0, bestStreak: 0,
      correct: 0, answered: 0, lastDelta: 0, topic: setup.topic, questionStart: 0, currentTimer: 0,
    };
    dispatch({ type: 'SOLO_PATCH', payload: { score: 0, streak: 0, bestStreak: 0, correct: 0, answered: 0, personalBest: null, isBest: false } });
    dispatch({ type: 'PATCH', payload: { mode: 'solo', screen: 'game', error: null } });
    runSoloRound(0);
  }, [runSoloRound]);

  const restartSolo = useCallback(() => {
    clearTimers();
    startSolo();
  }, [clearTimers, startSolo]);

  const backToMenu = useCallback(() => {
    clearTimers();
    if (stateRef.current.mode === 'mp') {
      getSocket().emit('leave_room');
    }
    dispatch({ type: 'MP_PATCH', payload: { code: null, playerId: null, players: [], chat: [] } });
    dispatch({ type: 'PATCH', payload: { screen: 'home', mode: null } });
    dispatch({ type: 'LIVE', payload: { phase: null, roundIntro: null, question: null, reveal: null, scoreboard: null, gameEnd: null } });
  }, [clearTimers]);

  // submit routes to the right engine
  const submitAnswer = useCallback((optionIndex) => {
    if (stateRef.current.mode === 'solo') submitSoloAnswer(optionIndex);
    else submitMpAnswer(optionIndex);
  }, [submitSoloAnswer, submitMpAnswer]);

  const me = useMemo(
    () => state.mp.players.find((p) => p.id === state.mp.playerId) || null,
    [state.mp.players, state.mp.playerId],
  );
  const isHost = !!me?.isHost || state.mp.hostId === state.mp.playerId;

  const value = {
    state, dispatch, me, isHost,
    updateSettings, setSetup, goto,
    createRoom, joinRoom, updateRoomConfig, toggleReady, startGame, sendChat, playAgainMp, leaveRoom,
    startSolo, restartSolo, backToMenu, submitAnswer,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
