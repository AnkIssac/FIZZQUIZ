import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { getDb } from './db/database.js';
import { buildSoloGame } from './db/questionService.js';
import { registerSockets } from './sockets/index.js';
import {
  TOPICS,
  ROUND_TYPES,
  DIFFICULTY_OPTIONS,
  TIMER_OPTIONS,
  ROUND_COUNT_OPTIONS,
} from '../shared/constants.js';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Ensure the DB exists and schema is ready on boot.
const db = getDb();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'fizzquiz', time: Date.now() });
});

// Topic list with per-topic question counts for the topic-selection grid.
app.get('/api/topics', (_req, res) => {
  const counts = db
    .prepare('SELECT topic, COUNT(*) AS n FROM questions GROUP BY topic')
    .all()
    .reduce((acc, r) => ({ ...acc, [r.topic]: r.n }), {});
  const topics = TOPICS.map((t) => ({ ...t, questionCount: counts[t.id] || 0 }));
  res.json({
    topics,
    rounds: ROUND_TYPES,
    difficulties: DIFFICULTY_OPTIONS,
    timers: TIMER_OPTIONS,
    roundCounts: ROUND_COUNT_OPTIONS,
  });
});

app.get('/api/stats', (_req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS n FROM questions').get().n;
  const bySource = db.prepare('SELECT source, COUNT(*) AS n FROM questions GROUP BY source').all();
  res.json({ total, bySource });
});

// Build a full solo game on the server (same question engine), returned to the client.
app.post('/api/solo', (req, res) => {
  const body = req.body || {};
  const config = {
    topic: body.topic || 'mixed',
    difficulty: body.difficulty || 'mixed',
    source: body.source || 'all',
    rounds: ROUND_COUNT_OPTIONS.includes(body.rounds) ? body.rounds : 7,
    timer: TIMER_OPTIONS.includes(body.timer) ? body.timer : null,
  };
  try {
    const rounds = buildSoloGame(config);
    res.json({ ok: true, config, rounds });
  } catch (err) {
    console.error('Solo build failed:', err);
    res.status(500).json({ ok: false, error: 'Failed to build solo game' });
  }
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL === '*' ? true : [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'], methods: ['GET', 'POST'] },
});

registerSockets(io);

httpServer.listen(PORT, () => {
  console.log(`🫧  FizzQuiz server listening on http://localhost:${PORT}`);
  console.log(`    Allowing client origin: ${CLIENT_URL}`);
});
