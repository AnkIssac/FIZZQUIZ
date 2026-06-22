// Socket.IO event wiring for FizzQuiz multiplayer.
import { randomUUID } from 'crypto';
import { ROUND_TYPES, MAX_PLAYERS, ROOM_CLEANUP_MS, ROUND_COUNT_OPTIONS, TIMER_OPTIONS } from '../../shared/constants.js';
import {
  createRoom,
  getRoom,
  deleteRoom,
  makePlayer,
  roomIsFull,
  publicRoomState,
  publicPlayer,
} from './rooms.js';
import { startGame, submitAnswer, resetToLobby } from './gameEngine.js';
import { toClientQuestion } from '../db/questionService.js';

const ROUND_BY_KEY = Object.fromEntries(ROUND_TYPES.map((r) => [r.key, r]));

function broadcastRoom(io, room) {
  io.to(room.code).emit('room_update', publicRoomState(room));
}

function isHost(room, playerId) {
  return room.hostId === playerId;
}

function sanitizeConfig(incoming, current) {
  const cfg = { ...current };
  if (typeof incoming.topic === 'string') cfg.topic = incoming.topic;
  if (['easy', 'medium', 'hard', 'mixed'].includes(incoming.difficulty)) cfg.difficulty = incoming.difficulty;
  if (['all', 'classic', 'cultural'].includes(incoming.source)) cfg.source = incoming.source;
  if (ROUND_COUNT_OPTIONS.includes(incoming.rounds)) cfg.rounds = incoming.rounds;
  if (incoming.timer === null || TIMER_OPTIONS.includes(incoming.timer)) cfg.timer = incoming.timer;
  if (typeof incoming.suddenDeath === 'boolean') cfg.suddenDeath = incoming.suddenDeath;
  return cfg;
}

// Send a reconnecting socket enough state to resume mid-game.
function syncSocket(socket, room, player) {
  socket.emit('room_update', publicRoomState(room));
  if (room.phase === 'question' && room.current) {
    const roundKey = room.roundKeys[room.roundIndex];
    const def = ROUND_BY_KEY[roundKey];
    const elapsed = Date.now() - room.questionStart;
    const remaining = Math.max(0, room.currentTimer - Math.floor(elapsed / 1000));
    socket.emit('question', {
      ...toClientQuestion(room.current, {
        round: room.roundIndex,
        index: room.questionIndex,
        total: room.questions.length,
        roundKey,
        roundName: def.name,
        roundIcon: def.icon,
        timer: room.currentTimer,
      }),
      remaining,
      alreadyAnswered: room.answers.has(player.id),
    });
  }
}

export function registerSockets(io) {
  io.on('connection', (socket) => {
    // ---- Create room ----
    socket.on('create_room', ({ name, avatar } = {}, cb) => {
      const room = createRoom(socket.id);
      const playerId = randomUUID();
      const player = makePlayer({ id: playerId, socketId: socket.id, name: cleanName(name), avatar, isHost: true });
      room.hostId = playerId;
      room.players.set(playerId, player);
      socket.join(room.code);
      socket.data = { code: room.code, playerId };
      respond(cb, { ok: true, code: room.code, playerId, room: publicRoomState(room) });
      broadcastRoom(io, room);
    });

    // ---- Join room (also handles reconnect by name) ----
    socket.on('join_room', ({ code, name, avatar } = {}, cb) => {
      const room = getRoom(code);
      if (!room) return respond(cb, { ok: false, error: 'Room not found' });

      const cleaned = cleanName(name);
      // Reconnect: an existing (possibly disconnected) player with the same name.
      const existing = [...room.players.values()].find(
        (p) => p.name.toLowerCase() === cleaned.toLowerCase(),
      );
      if (existing) {
        existing.socketId = socket.id;
        existing.connected = true;
        if (room.cleanupTimer) {
          clearTimeout(room.cleanupTimer);
          room.cleanupTimer = null;
        }
        socket.join(room.code);
        socket.data = { code: room.code, playerId: existing.id };
        respond(cb, { ok: true, code: room.code, playerId: existing.id, room: publicRoomState(room), reconnected: true });
        syncSocket(socket, room, existing);
        broadcastRoom(io, room);
        return;
      }

      if (roomIsFull(room)) return respond(cb, { ok: false, error: 'Room is full' });
      if (room.phase !== 'lobby') return respond(cb, { ok: false, error: 'Game already in progress' });

      const playerId = randomUUID();
      const player = makePlayer({ id: playerId, socketId: socket.id, name: cleaned, avatar, isHost: false });
      room.players.set(playerId, player);
      socket.join(room.code);
      socket.data = { code: room.code, playerId };
      respond(cb, { ok: true, code: room.code, playerId, room: publicRoomState(room) });
      io.to(room.code).emit('player_joined', publicPlayer(player));
      broadcastRoom(io, room);
    });

    // ---- Update game config (host only) ----
    socket.on('update_config', ({ config } = {}) => {
      const { room, player } = ctx(socket);
      if (!room || !player || !isHost(room, player.id) || room.phase !== 'lobby') return;
      room.config = sanitizeConfig(config || {}, room.config);
      broadcastRoom(io, room);
    });

    // ---- Ready toggle ----
    socket.on('player_ready', ({ ready } = {}) => {
      const { room, player } = ctx(socket);
      if (!room || !player) return;
      player.ready = !!ready;
      broadcastRoom(io, room);
    });

    // ---- Start game (host only) ----
    socket.on('start_game', () => {
      const { room, player } = ctx(socket);
      if (!room || !player || !isHost(room, player.id)) return;
      if (room.phase !== 'lobby') return;
      if (room.players.size < 1) return;
      startGame(io, room);
    });

    // ---- Submit an answer ----
    socket.on('submit_answer', ({ index } = {}) => {
      const { room, player } = ctx(socket);
      if (!room || !player) return;
      submitAnswer(io, room, player.id, index);
    });

    // ---- Lobby chat ----
    socket.on('chat_message', ({ text } = {}) => {
      const { room, player } = ctx(socket);
      if (!room || !player) return;
      const trimmed = String(text || '').slice(0, 200).trim();
      if (!trimmed) return;
      const msg = { id: randomUUID(), name: player.name, avatar: player.avatar, text: trimmed, at: Date.now() };
      room.chat.push(msg);
      if (room.chat.length > 100) room.chat.shift();
      io.to(room.code).emit('chat_message', msg);
    });

    // ---- Play again (host only) ----
    socket.on('play_again', () => {
      const { room, player } = ctx(socket);
      if (!room || !player || !isHost(room, player.id)) return;
      resetToLobby(io, room);
      broadcastRoom(io, room);
      io.to(room.code).emit('returned_to_lobby');
    });

    // ---- Explicit leave ----
    socket.on('leave_room', () => {
      handleLeave(io, socket);
    });

    // ---- Disconnect ----
    socket.on('disconnect', () => {
      const { room, player } = ctx(socket);
      if (!room || !player) return;
      player.connected = false;
      broadcastRoom(io, room);

      // If everyone has left, schedule room cleanup.
      const anyConnected = [...room.players.values()].some((p) => p.connected);
      if (!anyConnected) {
        room.cleanupTimer = setTimeout(() => deleteRoom(room.code), ROOM_CLEANUP_MS);
      } else if (isHost(room, player.id)) {
        // Reassign host to another connected player.
        const next = [...room.players.values()].find((p) => p.connected);
        if (next) {
          room.hostId = next.id;
          next.isHost = true;
          player.isHost = false;
          broadcastRoom(io, room);
        }
      }
    });
  });
}

function handleLeave(io, socket) {
  const { room, player } = ctx(socket);
  if (!room || !player) return;
  socket.leave(room.code);
  room.players.delete(player.id);
  socket.data = {};
  if (room.players.size === 0) {
    room.cleanupTimer = setTimeout(() => deleteRoom(room.code), ROOM_CLEANUP_MS);
  } else {
    if (room.hostId === player.id) {
      const next = [...room.players.values()][0];
      room.hostId = next.id;
      next.isHost = true;
    }
    io.to(room.code).emit('room_update', publicRoomState(room));
  }
}

function ctx(socket) {
  const data = socket.data || {};
  const room = getRoom(data.code);
  const player = room && data.playerId ? room.players.get(data.playerId) : null;
  return { room, player };
}

function cleanName(name) {
  const n = String(name || '').slice(0, 18).trim();
  return n || `Player${Math.floor(Math.random() * 900 + 100)}`;
}

function respond(cb, payload) {
  if (typeof cb === 'function') cb(payload);
}
