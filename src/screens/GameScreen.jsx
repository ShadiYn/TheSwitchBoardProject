import React from 'react'
import { useGameStore } from '@/store/gameStore'
import DialoguePanel  from '@/components/Dialogue/DialoguePanel'
import ChoicePanel    from '@/components/Dialogue/ChoicePanel'
import CallEndPanel   from '@/components/Dialogue/CallEndPanel'
import TransferPanel  from '@/components/Department/TransferPanel'
import OfficeScene    from '@/components/Office/OfficeScene'
import NotebookPanel  from '@/components/Notebook/NotebookPanel'
import EndOfShift     from '@/components/EndOfShift/EndOfShift'
import styles from './GameScreen.module.css'

export default function GameScreen() {
  const gamePhase = useGameStore(s => s.gamePhase)

  return (
    <div className={styles.layout}>
      {/* ── Main area ── */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <TopBar />
        </header>

        <div className={styles.content}>
          {/* Idle / between calls */}
          <OfficeScene />

          {/* Active call flow */}
          {(gamePhase === 'IN_CALL' || gamePhase === 'CHOOSING' || gamePhase === 'TRANSFER') && (
            <div className={styles.callArea}>
              <DialoguePanel />
              <ChoicePanel />
              <TransferPanel />
            </div>
          )}
          {gamePhase === 'CALL_END' && <CallEndPanel />}
        </div>
      </div>

      {/* ── Sidebar notebook ── */}
      <NotebookPanel />

      {/* ── End-of-shift overlay ── */}
      <EndOfShift />
    </div>
  )
}

function TopBar() {
  const currentShift = useGameStore(s => s.currentShift)
  const gamePhase    = useGameStore(s => s.gamePhase)
  const activeCall   = useGameStore(s => s.activeCall)
  const flags        = useGameStore(s => s.flags)

  const phaseLabel = {
    IDLE:          'En espera',
    RINGING:       'Entrando llamada…',
    IN_CALL:       'En llamada',
    CHOOSING:      'En llamada',
    TRANSFER:      'Transfiriendo…',
    CALL_END:      'Llamada finalizada',
    END_OF_SHIFT:  'Fin de turno',
  }[gamePhase] ?? gamePhase

  return (
    <>
      <div className={styles.topLeft}>
        <span className={styles.topDot} />
        <span className={styles.topTitle}>The Switchboard</span>
      </div>
      <div className={styles.topMid}>
        <span className={styles.phaseLabel}>{phaseLabel}</span>
        {activeCall && <span className={styles.callerTag}>— {activeCall.callerId}</span>}
      </div>
      <div className={styles.topRight}>
        <span className={styles.shiftBadge}>T{currentShift}/30</span>
        {flags['found_operator_files'] && <span className={styles.mysteryBadge}>⚠</span>}
      </div>
    </>
  )
}
