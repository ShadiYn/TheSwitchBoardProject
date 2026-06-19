import React from 'react'
import { useGameStore } from '@/store/gameStore'
import { getVisibleChoices } from '@/engines/flagEngine'
import styles from './Dialogue.module.css'

export default function ChoicePanel() {
  const gamePhase  = useGameStore(s => s.gamePhase)
  const activeNode = useGameStore(s => s.activeNode)
  const flags      = useGameStore(s => s.flags)
  const stats      = useGameStore(s => s.stats)
  const runNumber  = useGameStore(s => s.runNumber)
  const makeChoice = useGameStore(s => s.makeChoice)

  if (gamePhase !== 'CHOOSING' || !activeNode?.choices) return null

  const visible = getVisibleChoices(activeNode, flags, stats, runNumber)

  return (
    <div className={styles.choicePanel}>
      <div className={styles.choicePrompt}>¿Qué haces?</div>
      <div className={styles.choices}>
        {visible.map(c => (
          <button
            key={c.id}
            className={styles.choiceBtn}
            onClick={() => makeChoice(c)}
          >
            <span className={styles.choiceArrow}>›</span>
            <span>{c.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
