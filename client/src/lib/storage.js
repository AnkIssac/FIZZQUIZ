// localStorage-backed settings and personal-best tracking.
const SETTINGS_KEY = 'fizzquiz.settings';
const PB_KEY = 'fizzquiz.personalBest';

const AVATAR_COLORS = [
  '#6C4EF2', '#F2A84E', '#4ECF7A', '#F25E5E', '#4ECFC9', '#F25E9E',
  '#F2D14E', '#9E5EF2', '#5E9EF2', '#F27A5E', '#4ECFA0', '#C94EF2',
];
const AVATAR_EMOJIS = [
  '🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐧', '🦄', '🐙', '🦖',
  '🐳', '🦉', '🐲', '🦋', '🐝', '🦩', '🐬', '🦔', '🐨', '🐰',
  '🐺', '🦇', '🦅', '🐢', '🦂', '🦞', '🐡', '🦕', '🐊', '🐌',
];

export const AVATAR_PALETTE = AVATAR_COLORS;
export const AVATAR_GLYPHS = AVATAR_EMOJIS;

export function defaultSettings() {
  return {
    name: '',
    avatar: {
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
    },
    volume: 0.6,
    muted: false,
    colorblind: false,
    highContrast: false,
    questionMix: 'all', // all | classic | cultural
  };
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota errors */
  }
}

export function loadPersonalBests() {
  try {
    return JSON.parse(localStorage.getItem(PB_KEY) || '{}');
  } catch {
    return {};
  }
}

// Records and returns whether `score` is a new best for the topic.
export function recordPersonalBest(topic, score) {
  const pb = loadPersonalBests();
  const prev = pb[topic] || 0;
  const isBest = score > prev;
  if (isBest) {
    pb[topic] = score;
    try {
      localStorage.setItem(PB_KEY, JSON.stringify(pb));
    } catch {
      /* ignore */
    }
  }
  return { isBest, best: Math.max(prev, score) };
}
