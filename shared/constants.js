// Shared constants used by both the FizzQuiz client and server.
// Pure ESM, no dependencies, importable from either side.

export const COLORS = {
  primary: '#6C4EF2',
  accent: '#F2A84E',
  success: '#4ECF7A',
  danger: '#F25E5E',
  background: '#0F0F1A',
  card: '#1A1A2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
};

// The 15 topics. `tint` drives the per-topic background color tint and badge.
export const TOPICS = [
  { id: 'music', title: 'Music', icon: '🎵', tint: '#F25E9E', difficulty: 2 },
  { id: 'movies', title: 'Movies & TV', icon: '🎬', tint: '#F2A84E', difficulty: 2 },
  { id: 'history', title: 'History', icon: '🏛️', tint: '#C9A24E', difficulty: 3 },
  { id: 'science', title: 'Science', icon: '🔬', tint: '#4ECFC9', difficulty: 3 },
  { id: 'geography', title: 'Geography', icon: '🌍', tint: '#4ECF7A', difficulty: 2 },
  { id: 'sports', title: 'Sports', icon: '⚽', tint: '#5E9EF2', difficulty: 2 },
  { id: 'food', title: 'Food & Drink', icon: '🍲', tint: '#F27A5E', difficulty: 1 },
  { id: 'technology', title: 'Technology', icon: '💻', tint: '#6C4EF2', difficulty: 2 },
  { id: 'popculture', title: 'Pop Culture', icon: '🌟', tint: '#F2D14E', difficulty: 1 },
  { id: 'ott', title: 'OTT & Web Series', icon: '📺', tint: '#9E5EF2', difficulty: 2 },
  { id: 'art', title: 'Art & Literature', icon: '🎨', tint: '#F25E5E', difficulty: 3 },
  { id: 'nature', title: 'Nature & Animals', icon: '🦁', tint: '#4ECF7A', difficulty: 2 },
  { id: 'mythology', title: 'Mythology', icon: '⚡', tint: '#C94EF2', difficulty: 3 },
  { id: 'math', title: 'Mathematics', icon: '➗', tint: '#4E8AF2', difficulty: 3 },
  { id: 'language', title: 'Language & Words', icon: '🔤', tint: '#4ECFA0', difficulty: 2 },
];

export const TOPIC_IDS = TOPICS.map((t) => t.id);

export const DIFFICULTIES = ['easy', 'medium', 'hard'];

export const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'mixed'];

export const SOURCES = ['classic', 'cultural'];

// The 7 round types. `key` matches the round component on the client.
export const ROUND_TYPES = [
  {
    key: 'classic',
    name: 'Classic',
    icon: '🎯',
    description: 'Standard four-option trivia. Answer fast for bonus points.',
    timer: 15,
    questions: 10,
    basePoints: 100,
    speedBonus: 50,
    tint: '#6C4EF2',
  },
  {
    key: 'image',
    name: 'Image Round',
    icon: '🖼️',
    description: 'Identify what is shown as the image clears from a blur.',
    timer: 15,
    questions: 10,
    basePoints: 100,
    speedBonus: 50,
    tint: '#4ECFC9',
  },
  {
    key: 'cropped',
    name: 'Cropped Image',
    icon: '🔍',
    description: 'Guess the picture from a tiny crop that zooms out over time.',
    timer: 30,
    questions: 8,
    basePoints: 300,
    speedBonus: 0,
    tint: '#F2A84E',
  },
  {
    key: 'audio',
    name: 'Audio Round',
    icon: '🎧',
    description: 'Listen to the clip and pick what you heard.',
    timer: 20,
    questions: 8,
    basePoints: 100,
    speedBonus: 50,
    tint: '#F25E9E',
  },
  {
    key: 'speed',
    name: 'Speed Round',
    icon: '⚡',
    description: 'Eight seconds. Double points. Chain combos for a 3× multiplier.',
    timer: 8,
    questions: 15,
    basePoints: 200,
    speedBonus: 60,
    tint: '#F2D14E',
  },
  {
    key: 'truefalse',
    name: 'True or False',
    icon: '⚖️',
    description: 'One statement, two choices. Trust your gut.',
    timer: 10,
    questions: 12,
    basePoints: 100,
    speedBonus: 0,
    tint: '#4ECF7A',
  },
  {
    key: 'final',
    name: 'Final Countdown',
    icon: '👑',
    description: 'The boss round. Five seconds. Hardest questions. Sudden death optional.',
    timer: 5,
    questions: 10,
    basePoints: 200,
    speedBonus: 80,
    tint: '#F25E5E',
  },
];

export const ROUND_KEYS = ROUND_TYPES.map((r) => r.key);

// Streak bonus thresholds (per correct question while the streak holds).
export const STREAK_BONUS = [
  { min: 10, bonus: 200 },
  { min: 5, bonus: 100 },
  { min: 3, bonus: 50 },
];

export function streakBonusFor(streak) {
  for (const tier of STREAK_BONUS) {
    if (streak >= tier.min) return tier.bonus;
  }
  return 0;
}

// Speed combo multiplier for the Speed round: 3x when 5+ correct in a row.
export const SPEED_COMBO_THRESHOLD = 5;
export const SPEED_COMBO_MULTIPLIER = 3;

// Final round: remaining players share this bonus equally if all are correct.
export const FINAL_SHARED_BONUS = 500;

export const MAX_PLAYERS = 10;
export const ROOM_CODE_LENGTH = 6;
export const TIMER_OPTIONS = [10, 15, 20, 30];
export const ROUND_COUNT_OPTIONS = [3, 5, 7];
export const SCOREBOARD_COUNTDOWN = 5; // seconds between rounds
export const REVEAL_DURATION = 4; // seconds the answer reveal stays up
export const ROOM_CLEANUP_MS = 60_000; // delete empty rooms after 60s

export const AVATAR_COLORS = [
  '#6C4EF2', '#F2A84E', '#4ECF7A', '#F25E5E', '#4ECFC9', '#F25E9E',
  '#F2D14E', '#9E5EF2', '#5E9EF2', '#F27A5E', '#4ECFA0', '#C94EF2',
];

export const AVATAR_EMOJIS = [
  '🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐧', '🦄', '🐙', '🦖',
  '🐳', '🦉', '🐲', '🦋', '🐝', '🦩', '🐬', '🦔', '🐨', '🐰',
  '🐺', '🦇', '🦅', '🐢', '🦂', '🦞', '🐡', '🦕', '🐊', '🐌',
];

export const SOURCE_TAGS = {
  classic: { label: 'Global', flag: '🌍' },
  cultural: { label: 'Cultural', flag: '🇮🇳' },
};

// Question mix filter values for Settings.
export const QUESTION_MIX = {
  ALL: 'all',
  GLOBAL: 'classic',
  CULTURAL: 'cultural',
};
