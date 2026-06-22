// A/B/C/D answer option with states: default, selected, correct, wrong.
// Supports colorblind mode (adds shape glyphs) and keyboard hotkeys handled by parent.
const LABELS = ['A', 'B', 'C', 'D'];

export default function AnswerButton({
  index,
  text,
  state = 'default', // default | selected | correct | wrong | dim
  onClick,
  disabled,
  colorblind,
  hotkey,
}) {
  let cls = 'bg-card border-2 border-white/10 hover:border-white/30';
  let cb = '';
  if (state === 'selected') cls = 'bg-primary border-2 border-white/40';
  if (state === 'correct') {
    cls = 'bg-success border-2 border-white text-[#0F0F1A] animate-pulseGlow';
    cb = colorblind ? 'cb-correct' : '';
  }
  if (state === 'wrong') {
    cls = 'bg-danger border-2 border-white animate-shake';
    cb = colorblind ? 'cb-wrong' : '';
  }
  if (state === 'dim') cls = 'bg-card border-2 border-white/10 opacity-40';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-pop ${cls} ${cb} w-full text-left px-4 py-4 flex items-center gap-3 font-body font-bold text-base md:text-lg disabled:cursor-default`}
      style={{ boxShadow: '0 5px 0 0 rgba(0,0,0,0.35)' }}
    >
      <span className="shrink-0 w-9 h-9 grid place-items-center rounded-xl bg-black/25 font-display text-lg">
        {hotkey || LABELS[index]}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  );
}
