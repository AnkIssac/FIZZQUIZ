// In-memory room registry. All multiplayer game state lives here on the server.
import { ROOM_CODE_LENGTH, MAX_PLAYERS, AVATAR_COLORS, AVATAR_EMOJIS } from '../../shared/constants.js';

const rooms = new Map(); // code -> room

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars

export function generateRoomCode() {
  let code;
  do {
    code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
  } while (rooms.has(code));
  return code;
}

export function defaultConfig() {
  return {
    topic: 'mixed',
    difficulty: 'mixed',
    source: 'all', // all | classic | cultural
    rounds: 7,
    timer: null, // optional per-question override (s) for the classic round
    suddenDeath: false,
  };
}

export function createRoom(hostSocketId) {
  const code = generateRoomCode();
  const room = {
    code,
    hostId: null, // set to the host player's id when they join
    hostSocketId,
    players: new Map(), // playerId -> player
    config: defaultConfig(),
    phase: 'lobby', // lobby | roundIntro | question | reveal | scoreboard | final
    chat: [],
    // live game state
    roundKeys: [],
    roundIndex: -1,
    questionIndex: -1,
    questions: [], // served questions for the current round
    current: null, // current served question (with answer)
    usedIds: new Set(),
    answers: new Map(), // playerId -> { index, timeMs }
    questionStart: 0,
    timer: null, // active setTimeout handle
    cleanupTimer: null,
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  if (!code) return null;
  return rooms.get(code.toUpperCase()) || null;
}

export function deleteRoom(code) {
  const room = rooms.get(code);
  if (room) {
    if (room.timer) clearTimeout(room.timer);
    if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
    rooms.delete(code);
  }
}

export function makePlayer({ id, socketId, name, avatar, isHost }) {
  return {
    id,
    socketId,
    name,
    avatar: avatar || randomAvatar(),
    isHost: !!isHost,
    ready: false,
    connected: true,
    score: 0,
    streak: 0,
    bestStreak: 0,
    comboCount: 0,
    correct: 0,
    answered: 0,
    eliminated: false,
    lastDelta: 0,
  };
}

export function randomAvatar() {
  return {
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
  };
}

export function roomIsFull(room) {
  return room.players.size >= MAX_PLAYERS;
}

// A serializable snapshot of the room for clients (never includes answers).
export function publicRoomState(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    config: room.config,
    players: [...room.players.values()].map(publicPlayer),
    chat: room.chat.slice(-50),
    roundIndex: room.roundIndex,
    totalRounds: room.roundKeys.length || room.config.rounds,
  };
}

export function publicPlayer(p) {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    isHost: p.isHost,
    ready: p.ready,
    connected: p.connected,
    score: p.score,
    streak: p.streak,
    bestStreak: p.bestStreak,
    correct: p.correct,
    answered: p.answered,
    eliminated: p.eliminated,
    lastDelta: p.lastDelta,
  };
}

export function allRooms() {
  return rooms;
}
