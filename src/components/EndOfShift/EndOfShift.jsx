import React from 'react'
import { useGameStore } from '@/store/gameStore'
import styles from './EndOfShift.module.css'

export default function EndOfShift() {
  const gamePhase    = useGameStore(s => s.gamePhase)
  const currentShift = useGameStore(s => s.currentShift)
  const callHistory  = useGameStore(s => s.callHistory)
  const cluesFound   = useGameStore(s => s.cluesFound)
  const endShift     = useGameStore(s => s.endShift)

  if (gamePhase !== 'END_OF_SHIFT') return null

  // Calls from this shift
  const thisCalls = callHistory.filter(c => c.shift === currentShift)

  // Simple world event based on call history
  const event = worldEvent(callHistory, currentShift)

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>FIN DEL TURNO</span>
          <span className={styles.shiftNum}>{currentShift}</span>
        </div>

        <div className={styles.sep} />

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Llamadas atendidas</div>
          <div className={styles.callCount}>{thisCalls.length}</div>
        </div>

        {cluesFound.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Pistas encontradas</div>
            <div className={styles.clueCount}>{cluesFound.length} total</div>
          </div>
        )}

        {event && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>En las noticias</div>
            <p className={styles.eventText}>{event}</p>
          </div>
        )}

        <div className={styles.sep} />

        <button className={styles.nextBtn} onClick={endShift}>
          {currentShift >= 30 ? 'Terminar' : `Turno ${currentShift + 1} →`}
        </button>
      </div>
    </div>
  )
}

function worldEvent(history, shift) {
  // Simple deterministic events based on shift number and choices made
  const events = {
    3:  'Avistamientos de luces extrañas en el barrio. Vecinos sin explicación.',
    5:  'Un local de la calle principal cerró misteriosamente durante la noche.',
    8:  'Corte eléctrico no programado en cuatro manzanas a las 3:33.',
    10: 'Archivos históricos del municipio: 1952 marcado como "año sin registros".',
    14: 'Un vecino asegura haber escuchado el mismo teléfono sonar dos veces a la vez.',
    17: 'Silencio inusual. Ninguna noticia. Como si el mundo esperara algo.',
  }
  return events[shift] ?? null
}
