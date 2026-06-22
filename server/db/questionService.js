// Serves questions for both multiplayer (server-authoritative) and solo modes.
// - Pulls text questions from SQLite only (no network calls).
// - Filters by topic + difficulty + source mix.
// - Shuffles answer order on every serve.
// - Caller tracks used question ids to avoid repeats within a game.
import { getDb } from './database.js';
import { pictogramQuestions, audioQuestions } from './specialQuestions.js';
import { ROUND_TYPES, TOPIC_IDS } from '../../shared/constants.js';

const LETTER_INDEX = { A: 0, B: 1, C: 2, D: 3 };
const ROUND_BY_KEY = Object.fromEntries(ROUND_TYPES.map((r) => [r.key, r]));

let textCache = null;

function loadCache() {
  if (textCache) return textCache;
  const rows = getDb().prepare('SELECT * FROM questions').all();
  textCache = rows.map((r) => ({
    id: r.id,
    topic: r.topic,
    difficulty: r.difficulty,
    source: r.source,
    question: r.question,
    options: [r.option_a, r.option_b, r.option_c, r.option_d],
    correctIndex: LETTER_INDEX[r.correct],
    explanation: r.explanation || '',
  }));
  return textCache;
}

export function refreshCache() {
  textCache = null;
  return loadCache();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns the filtered pool of raw text questions for the given config.
function filterPool({ topic, difficulty, source }) {
  const cache = loadCache();
  return cache.filter((q) => {
    if (topic && topic !== 'mixed' && q.topic !== topic) return false;
    if (difficulty && difficulty !== 'mixed' && q.difficulty !== difficulty) return false;
    if (source && source !== 'all' && q.source !== source) return false;
    return true;
  });
}

// Pick `count` items not already in usedSet; if the pool runs dry, allow reuse so a
// game never stalls (relevant for single-topic long games).
function pickUnique(pool, count, usedSet) {
  const fresh = shuffle(pool.filter((q) => !usedSet.has(q.id)));
  const chosen = fresh.slice(0, count);
  if (chosen.length < count) {
    const extra = shuffle(pool).filter((q) => !chosen.includes(q));
    chosen.push(...extra.slice(0, count - chosen.length));
  }
  chosen.forEach((q) => usedSet.add(q.id));
  return chosen;
}

// Convert a raw text question into a served MCQ with freshly shuffled options.
function serveMcq(raw, roundKey) {
  const correctText = raw.options[raw.correctIndex];
  const options = shuffle(raw.options);
  return {
    qid: `${roundKey}-${raw.id}-${Math.random().toString(36).slice(2, 7)}`,
    sourceId: raw.id,
    type: 'mcq',
    topic: raw.topic,
    source: raw.source,
    difficulty: raw.difficulty,
    question: raw.question,
    options,
    correctIndex: options.indexOf(correctText),
    explanation: raw.explanation,
  };
}

// Build a True/False item from an MCQ: present the question with a stated answer,
// which is TRUE half the time (the real answer) and otherwise FALSE (a distractor).
function serveTrueFalse(raw, roundKey) {
  const stateCorrect = Math.random() < 0.5;
  let stated;
  if (stateCorrect) {
    stated = raw.options[raw.correctIndex];
  } else {
    const wrong = raw.options.filter((_, i) => i !== raw.correctIndex);
    stated = wrong[Math.floor(Math.random() * wrong.length)];
  }
  return {
    qid: `${roundKey}-${raw.id}-${Math.random().toString(36).slice(2, 7)}`,
    sourceId: raw.id,
    type: 'truefalse',
    topic: raw.topic,
    source: raw.source,
    difficulty: raw.difficulty,
    question: `${raw.question}  →  "${stated}"`,
    options: ['True', 'False'],
    correctIndex: stateCorrect ? 0 : 1,
    explanation: stateCorrect
      ? `Correct — the answer is "${stated}".`
      : `False — the correct answer is "${raw.options[raw.correctIndex]}".`,
  };
}

// Media questions (image / cropped / audio) come from the offline special sets.
function serveMedia(raw, roundKey, type) {
  const correctText = raw.o[raw.c];
  const options = shuffle(raw.o);
  const served = {
    qid: `${roundKey}-${type}-${Math.random().toString(36).slice(2, 7)}`,
    sourceId: `${type}-${raw.q}`,
    type,
    topic: 'mixed',
    source: 'classic',
    difficulty: 'medium',
    question: raw.q,
    options,
    correctIndex: options.indexOf(correctText),
    explanation: raw.e,
  };
  if (type === 'audio') served.melody = raw.melody;
  else served.emoji = raw.emoji;
  return served;
}

function pickMedia(pool, count, usedSet, keyName) {
  const fresh = shuffle(pool.filter((q) => !usedSet.has(q[keyName])));
  const chosen = fresh.slice(0, count);
  if (chosen.length < count) {
    const extra = shuffle(pool);
    for (const item of extra) {
      if (chosen.length >= count) break;
      if (!chosen.includes(item)) chosen.push(item);
    }
  }
  chosen.forEach((q) => usedSet.add(q[keyName]));
  return chosen;
}

/**
 * Build the list of served questions for one round.
 * config: { topic, difficulty, source, questionsPerRound? }
 * usedSet: Set of ids already used this game (mutated).
 */
export function buildRoundQuestions(roundKey, config, usedSet) {
  const def = ROUND_BY_KEY[roundKey] || ROUND_BY_KEY.classic;
  const count = config.questionsPerRound || def.questions;

  if (roundKey === 'image' || roundKey === 'cropped') {
    const picks = pickMedia(pictogramQuestions, count, usedSet, 'emoji');
    return picks.map((p) => serveMedia(p, roundKey, roundKey === 'image' ? 'image' : 'cropped'));
  }

  if (roundKey === 'audio') {
    const picks = pickMedia(audioQuestions, count, usedSet, 'q');
    return picks.map((p) => serveMedia(p, roundKey, 'audio'));
  }

  // Text-based rounds.
  const difficulty = roundKey === 'final' ? 'hard' : config.difficulty;
  let pool = filterPool({ topic: config.topic, difficulty, source: config.source });
  // Fallback: if a hard-only pool is too thin for the final round, widen it.
  if (pool.length < count) {
    pool = filterPool({ topic: config.topic, difficulty: 'mixed', source: config.source });
  }
  const picks = pickUnique(pool, count, usedSet);
  if (roundKey === 'truefalse') return picks.map((p) => serveTrueFalse(p, roundKey));
  return picks.map((p) => serveMcq(p, roundKey));
}

// The sequence of round keys for a game with N rounds (uses the first N of the 7 types).
export function roundSequence(numRounds) {
  return ROUND_TYPES.slice(0, numRounds).map((r) => r.key);
}

// Strip answer info before sending a question to clients (anti-cheat for multiplayer).
export function toClientQuestion(served, { round, index, total, roundKey, roundName, roundIcon, timer }) {
  return {
    qid: served.qid,
    type: served.type,
    topic: served.topic,
    source: served.source,
    difficulty: served.difficulty,
    question: served.question,
    options: served.options,
    emoji: served.emoji,
    melody: served.melody,
    round,
    roundKey,
    roundName,
    roundIcon,
    index,
    total,
    timer,
  };
}

// Build a complete solo game (runs client-side). Includes answers + explanations,
// since solo play has no anti-cheat requirement.
export function buildSoloGame(config) {
  const used = new Set();
  const keys = roundSequence(config.rounds || 7);
  return keys.map((roundKey, i) => {
    const def = ROUND_BY_KEY[roundKey];
    const timer = config.timer && (roundKey === 'classic' || roundKey === 'image')
      ? config.timer
      : def.timer;
    const questions = buildRoundQuestions(
      roundKey,
      { topic: config.topic, difficulty: config.difficulty, source: config.source },
      used,
    );
    return {
      roundKey,
      index: i,
      name: def.name,
      icon: def.icon,
      description: def.description,
      tint: def.tint,
      timer,
      basePoints: def.basePoints,
      speedBonus: def.speedBonus,
      questions,
    };
  });
}

export const KNOWN_TOPICS = TOPIC_IDS;
