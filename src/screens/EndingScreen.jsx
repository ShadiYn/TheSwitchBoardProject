import React, { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { evaluateEnding } from '@/engines/endingEngine'
import styles from './EndingScreen.module.css'

export default function EndingScreen() {
  const flags      = useGameStore(s => s.flags)
  const stats      = useGameStore(s => s.stats)
  const runNumber  = useGameStore(s => s.runNumber)
  const [ending, setEndingObj] = useState(null)

  useEffect(() => {
    if (!ending) {
      const result = evaluateEnding(flags, stats, runNumber)
      setEndingObj(result)
    }
  }, [])

  function handleNewGamePlus() {
    const store = useGameStore.getState()
    store.startNewGame(store.saveSlot)
    // Mark NG+ — runNumber increments
    useGameStore.setState(s => { s.runNumber = runNumber + 1; s.flags['ng_plus'] = true })
  }

  function handleTitle() {
    useGameStore.setState({ gamePhase: 'TITLE' })
  }

  if (!ending) return null

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={`${styles.categoryTag} ${styles[ending.category]}`}>
          {categoryLabel(ending.category)}
        </div>
        <h1 className={styles.title}>{ending.name}</h1>
        <p className={styles.text}>{ending.text}</p>

        <div className={styles.statsRow}>
          <Stat label="Empatía"    value={stats.empathy} />
          <Stat label="Eficiencia" value={stats.efficiency} />
          <Stat label="Curiosidad" value={stats.curiosity} />
          <Stat label="Caos"       value={stats.chaos} />
        </div>

        <div className={styles.buttons}>
          <button className={styles.btnPrimary} onClick={handleNewGamePlus}>
            Nueva partida + ↻
          </button>
          <button className={styles.btnSecondary} onClick={handleTitle}>
            Volver al título
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function categoryLabel(cat) {
  return {
    good: 'Final · Luz', tragic: 'Final · Sombra',
    neutral: 'Final · Ciclo', secret: 'Final · Secreto',
  }[cat] ?? 'Final'
}
