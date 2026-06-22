// Audio engine. SFX are synthesized with the Web Audio API (no audio files needed),
// and the audio round's melodies are played the same way. A global mute/volume applies.
import { noteToFreq } from './notes.js';

let ctx = null;
let masterGain = null;
let muted = false;
let volume = 0.6;

function ensureCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : volume;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setVolume(v) {
  volume = v;
  if (masterGain) masterGain.gain.value = muted ? 0 : volume;
}

export function setMuted(m) {
  muted = m;
  if (masterGain) masterGain.gain.value = muted ? 0 : volume;
}

function tone({ freq, start = 0, dur = 0.2, type = 'sine', peak = 0.4 }) {
  const ac = ensureCtx();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  correct() {
    tone({ freq: 523.25, dur: 0.18, type: 'triangle', peak: 0.4 });
    tone({ freq: 659.25, start: 0.1, dur: 0.18, type: 'triangle', peak: 0.4 });
    tone({ freq: 783.99, start: 0.2, dur: 0.28, type: 'triangle', peak: 0.45 });
  },
  wrong() {
    tone({ freq: 160, dur: 0.35, type: 'sawtooth', peak: 0.35 });
    tone({ freq: 120, start: 0.06, dur: 0.4, type: 'sawtooth', peak: 0.35 });
  },
  tick() {
    tone({ freq: 880, dur: 0.06, type: 'square', peak: 0.18 });
  },
  select() {
    tone({ freq: 440, dur: 0.08, type: 'sine', peak: 0.25 });
  },
  fanfare() {
    const seq = [523.25, 659.25, 783.99, 1046.5];
    seq.forEach((f, i) => tone({ freq: f, start: i * 0.12, dur: 0.22, type: 'triangle', peak: 0.4 }));
  },
  celebrate() {
    const seq = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    seq.forEach((f, i) => tone({ freq: f, start: i * 0.13, dur: 0.3, type: 'triangle', peak: 0.42 }));
  },
};

// Play a melody [[noteName, durSec], ...]. Calls onNote(index) as each note starts.
export function playMelody(melody, { onNote, onDone } = {}) {
  const ac = ensureCtx();
  if (!ac) return () => {};
  let when = 0;
  const timers = [];
  melody.forEach(([note, dur], i) => {
    tone({ freq: noteToFreq(note), start: when, dur: Math.max(0.12, dur * 0.9), type: 'sine', peak: 0.4 });
    if (onNote) timers.push(setTimeout(() => onNote(i), when * 1000));
    when += dur;
  });
  if (onDone) timers.push(setTimeout(onDone, when * 1000));
  return () => timers.forEach(clearTimeout);
}

export function melodyDuration(melody) {
  return melody.reduce((sum, [, d]) => sum + d, 0);
}

// Resume the audio context on the first user gesture (browsers require this).
export function unlockAudio() {
  ensureCtx();
}
