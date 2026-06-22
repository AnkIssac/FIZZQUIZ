// Scoring rules shared by the server (multiplayer) and the client (solo mode),
// so the two modes always agree on points.
import {
  streakBonusFor,
  SPEED_COMBO_THRESHOLD,
  SPEED_COMBO_MULTIPLIER,
} from './constants.js';

/**
 * Compute the points awarded for a single answered question.
 * @param {object} p
 * @param {object} p.roundDef   one of ROUND_TYPES (has basePoints, speedBonus)
 * @param {boolean} p.correct   was the answer correct
 * @param {number} p.timeMs     time taken to answer, in ms
 * @param {number} p.timerSec   the question's time limit, in seconds
 * @param {number} p.streakAfter the player's streak length AFTER this answer (>=1 if correct)
 * @param {number} p.comboCount  consecutive-correct count this round (for speed combo)
 * @param {string} p.roundKey    round key (e.g. 'speed')
 * @returns {{points:number, breakdown:object}}
 */
export function computeScore({
  roundDef,
  correct,
  timeMs,
  timerSec,
  streakAfter = 0,
  comboCount = 0,
  roundKey,
}) {
  if (!correct) {
    return { points: 0, breakdown: { base: 0, speed: 0, streak: 0, comboMult: 1 } };
  }

  const base = roundDef.basePoints;

  // Speed bonus scales linearly: full bonus at 0s elapsed, 0 at the time limit.
  const limitMs = Math.max(1, timerSec * 1000);
  const fraction = Math.max(0, Math.min(1, (limitMs - timeMs) / limitMs));
  const speed = Math.round((roundDef.speedBonus || 0) * fraction);

  const streak = streakBonusFor(streakAfter);

  let comboMult = 1;
  if (roundKey === 'speed' && comboCount >= SPEED_COMBO_THRESHOLD) {
    comboMult = SPEED_COMBO_MULTIPLIER;
  }

  const points = Math.round((base + speed + streak) * comboMult);
  return { points, breakdown: { base, speed, streak, comboMult } };
}

export function accuracyPct(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}
