import { useMemo } from 'react';
import { useGame } from './context/GameContext.jsx';
import Background from './components/Background.jsx';
import MuteButton from './components/MuteButton.jsx';
import Home from './screens/Home.jsx';
import ConfigScreen from './screens/ConfigScreen.jsx';
import Lobby from './screens/Lobby.jsx';
import GameScreen from './screens/GameScreen.jsx';
import Results from './screens/Results.jsx';
import { ROUND_TYPES } from '@shared/constants.js';

const ROUND_BY_KEY = Object.fromEntries(ROUND_TYPES.map((r) => [r.key, r]));

function initialRoomCode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || '';
}

export default function App() {
  const { state } = useGame();
  const { screen, settings, live } = state;

  // Background tint follows the current round's color.
  const tint = useMemo(() => {
    const key = live.question?.roundKey || live.roundIntro?.roundKey;
    return key ? ROUND_BY_KEY[key]?.tint : null;
  }, [live.question, live.roundIntro]);

  const initialJoin = useMemo(initialRoomCode, []);

  return (
    <div className={settings.highContrast ? 'high-contrast' : ''}>
      <Background tint={tint} />
      <MuteButton />
      {screen === 'home' && <Home initialJoinCode={initialJoin} />}
      {screen === 'config' && <ConfigScreen />}
      {screen === 'lobby' && <Lobby />}
      {screen === 'game' && <GameScreen />}
      {screen === 'results' && <Results />}
    </div>
  );
}
