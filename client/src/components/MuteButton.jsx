import { useGame } from '../context/GameContext.jsx';

// Fixed top-right global mute toggle.
export default function MuteButton() {
  const { state, updateSettings } = useGame();
  const muted = state.settings.muted;
  return (
    <button
      onClick={() => updateSettings({ muted: !muted })}
      className="fixed top-3 right-3 z-50 fq-card w-11 h-11 grid place-items-center text-xl hover:scale-105 transition-transform"
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      aria-pressed={muted}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
