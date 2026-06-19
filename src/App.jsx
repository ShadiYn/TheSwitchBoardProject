import React from 'react'
import { useGameStore } from '@/store/gameStore'
import TitleScreen  from '@/screens/TitleScreen'
import IntroScreen  from '@/screens/IntroScreen'
import GameScreen   from '@/screens/GameScreen'
import EndingScreen from '@/screens/EndingScreen'

export default function App() {
  const gamePhase = useGameStore(s => s.gamePhase)
  const settings  = useGameStore(s => s.settings)

  return (
    <div className={`app-root ${settings.crtEnabled ? 'crt-on' : ''}`}>
      {gamePhase === 'TITLE'  && <TitleScreen />}
      {gamePhase === 'INTRO'  && <IntroScreen />}
      {gamePhase === 'ENDING' && <EndingScreen />}
      {!['TITLE','INTRO','ENDING'].includes(gamePhase) && <GameScreen />}
    </div>
  )
}
