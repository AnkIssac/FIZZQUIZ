import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import AnswerButton from './AnswerButton.jsx';
import SourceTag from './SourceTag.jsx';
import FloatingScore from './FloatingScore.jsx';
import { playMelody, melodyDuration } from '../lib/audio.js';

const HOTKEYS = ['a', 'b', 'c', 'd'];

// Determine the visual state of an option given the current reveal/selection.
function optionState(i, { reveal, mySelection }) {
  if (reveal) {
    if (i === reveal.correctIndex) return 'correct';
    if (i === mySelection && i !== reveal.correctIndex) return 'wrong';
    return 'dim';
  }
  return i === mySelection ? 'selected' : 'default';
}

// ---- Image round: emoji that de-blurs over ~3s ----
function BlurImage({ emoji, reveal }) {
  const [clear, setClear] = useState(false);
  useEffect(() => {
    setClear(false);
    const raf = requestAnimationFrame(() => setClear(true));
    return () => cancelAnimationFrame(raf);
  }, [emoji]);
  return (
    <div className="grid place-items-center h-48 md:h-56 overflow-hidden rounded-2xl bg-black/30">
      <span
        className="text-[8rem] md:text-[10rem] leading-none"
        style={{
          filter: reveal ? 'blur(0px)' : clear ? 'blur(0px)' : 'blur(28px)',
          transition: 'filter 3s ease-out',
        }}
      >
        {emoji}
      </span>
    </div>
  );
}

// ---- Cropped round: emoji starts massively zoomed-in and slowly zooms out ----
function CroppedImage({ emoji, reveal, seconds }) {
  const [zoomOut, setZoomOut] = useState(false);
  useEffect(() => {
    setZoomOut(false);
    const raf = requestAnimationFrame(() => setZoomOut(true));
    return () => cancelAnimationFrame(raf);
  }, [emoji]);
  const scale = reveal ? 1 : zoomOut ? 1.2 : 6;
  return (
    <div className="grid place-items-center h-48 md:h-56 overflow-hidden rounded-2xl bg-black/40">
      <span
        className="text-[8rem] md:text-[10rem] leading-none"
        style={{ transform: `scale(${scale})`, transition: `transform ${reveal ? 0.4 : seconds}s linear` }}
      >
        {emoji}
      </span>
    </div>
  );
}

// ---- Audio round: auto-plays the melody, with a progress bar + replay ----
function AudioPlayer({ melody, qid }) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef(null);
  const rafRef = useRef(null);
  const total = melodyDuration(melody);

  const play = () => {
    if (playing) return;
    setPlaying(true);
    setProgress(0);
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / (total * 1000));
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    stopRef.current = playMelody(melody, { onDone: () => setPlaying(false) });
  };

  useEffect(() => {
    const t = setTimeout(play, 350); // auto-play shortly after the question appears
    return () => {
      clearTimeout(t);
      if (stopRef.current) stopRef.current();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qid]);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="text-6xl animate-fizz" aria-hidden>🎧</div>
      <button onClick={play} disabled={playing} className="btn-pop bg-primary px-5 py-2 disabled:opacity-60">
        {playing ? '🔊 Playing…' : '▶ Replay clip'}
      </button>
      <div className="w-full max-w-sm h-3 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

export default function QuestionCard({ question, reveal, mySelection, locked, onSelect, colorblind, accent }) {
  const isTrueFalse = question.type === 'truefalse';

  // Keyboard hotkeys (A/B/C/D, and T/F for true-false).
  useEffect(() => {
    const handler = (e) => {
      if (locked || reveal) return;
      const k = e.key.toLowerCase();
      if (isTrueFalse) {
        if (k === 't') onSelect(0);
        if (k === 'f') onSelect(1);
      }
      const idx = HOTKEYS.indexOf(k);
      if (idx >= 0 && idx < question.options.length) onSelect(idx);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [locked, reveal, isTrueFalse, question.options.length, onSelect]);

  const myDelta = reveal?.results?.find?.((r) => r.correct && (r.id === 'me' || r.chosenIndex === mySelection))?.delta;

  return (
    <motion.div
      key={question.qid}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative fq-card neon-border p-5 md:p-7"
      style={{ borderColor: `${accent}55` }}
    >
      <FloatingScore value={reveal ? myDelta : 0} />

      <div className="mb-4 flex items-center justify-between gap-2">
        <SourceTag source={question.source} />
        <span className="text-sm text-text-secondary">
          {question.roundName} · {question.difficulty}
        </span>
      </div>

      {question.type === 'image' && <BlurImage emoji={question.emoji} reveal={!!reveal} />}
      {question.type === 'cropped' && <CroppedImage emoji={question.emoji} reveal={!!reveal} seconds={question.timer} />}
      {question.type === 'audio' && <AudioPlayer melody={question.melody} qid={question.qid} />}

      <h2 className="mt-4 mb-5 text-center font-display text-xl md:text-3xl leading-snug">{question.question}</h2>

      {isTrueFalse ? (
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((opt, i) => {
            const base = i === 0 ? 'bg-success text-black' : 'bg-danger';
            let cls = base;
            if (reveal) {
              if (i === reveal.correctIndex) cls = 'bg-success text-black animate-pulseGlow ring-4 ring-white';
              else if (i === mySelection) cls = 'bg-danger animate-shake';
              else cls = 'opacity-40 ' + base;
            } else if (i === mySelection) {
              cls = base + ' ring-4 ring-white';
            }
            return (
              <button
                key={i}
                disabled={locked || !!reveal}
                onClick={() => onSelect(i)}
                className={`btn-pop ${cls} py-10 text-3xl font-display ${colorblind && reveal && i === reveal.correctIndex ? 'cb-correct' : ''}`}
              >
                {i === 0 ? '✔ ' : '✗ '}{opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {question.options.map((opt, i) => (
            <AnswerButton
              key={i}
              index={i}
              text={opt}
              state={optionState(i, { reveal, mySelection })}
              disabled={locked || !!reveal}
              colorblind={colorblind}
              onClick={() => onSelect(i)}
            />
          ))}
        </div>
      )}

      {reveal && reveal.explanation && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-5 rounded-2xl bg-white/5 p-3 text-center text-text-secondary"
        >
          💡 {reveal.explanation}
        </motion.p>
      )}
    </motion.div>
  );
}
