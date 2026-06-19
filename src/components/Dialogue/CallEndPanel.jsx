import React from 'react'
import { useGameStore } from '@/store/gameStore'
import styles from './Dialogue.module.css'

export default function CallEndPanel() {
  const gamePhase  = useGameStore(s => s.gamePhase)
  const activeCall = useGameStore(s => s.activeCall)
  const activeNode = useGameStore(s => s.activeNode)
  const finishCall = useGameStore(s => s.finishCall)

  if (gamePhase !== 'CALL_END') return null

  // Show the final line of dialogue if any
  const finalText = activeNode?.text ?? activeCall?.notebookSummary ?? ''

  return (
    <div className={styles.panel}>
      {finalText && (
        <div className={`${styles.bubble} ${styles.system}`}>
          <p className={styles.text}>{finalText}</p>
        </div>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:4 }}>
        <div style={{ flex:1, height:'0.5px', background:'var(--border-lo)' }} />
        <span style={{ fontSize:11, color:'var(--text-lo)', fontFamily:'var(--font-mono)' }}>— llamada finalizada —</span>
        <div style={{ flex:1, height:'0.5px', background:'var(--border-lo)' }} />
      </div>
      <button className={styles.continueBtn} onClick={finishCall}>
        Siguiente ↓
      </button>
    </div>
  )
}
