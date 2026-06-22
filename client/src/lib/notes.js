// Note-name → frequency (Hz) map for synthesizing audio-round melodies.
const A4 = 440;
const SEMITONE = Math.pow(2, 1 / 12);
const NOTE_INDEX = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };

export function noteToFreq(note) {
  const match = /^([A-G]#?)(\d)$/.exec(note);
  if (!match) return A4;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const semitonesFromA4 = NOTE_INDEX[name] + (octave - 4) * 12;
  return A4 * Math.pow(SEMITONE, semitonesFromA4);
}
