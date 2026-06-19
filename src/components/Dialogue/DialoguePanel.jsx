import React, { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useDialogue } from '@/hooks/useDialogue'
import styles from './Dialogue.module.css'

export default function DialoguePanel() {
  const activeCall  = useGameStore(s => s.activeCall)
  const activeNode  = useGameStore(s => s.activeNode)
  const gamePhase   = useGameStore(s => s.gamePhase)
  const settings    = useGameStore(s => s.settings)
  const advanceNode = useGameStore(s => s.advanceNode)

  const text = activeNode?.text ?? ''
  const { displayed, done, skip } = useDialogue(text, settings.textSpeed)

  // Auto-advance system nodes
  useEffect(() => {
    if (activeNode?.type === 'system' && done) {
      const timer = setTimeout(() => advanceNode(activeNode.next), 1200)
      return () => clearTimeout(timer)
    }
  }, [activeNode, done, advanceNode])

  if (!['IN_CALL', 'CHOOSING', 'TRANSFER'].includes(gamePhase) || !activeNode) return null
  if (activeNode.type === 'choice' || activeNode.type === 'transfer' || activeNode.type === 'end') return null

  const speakerLabel = {
    caller:   activeCall ? getCallerFirstName(activeCall.callerId) : 'Caller',
    operator: 'Operador',
    system:   null,
  }[activeNode.speaker ?? 'caller']

  return (
    <div className={styles.panel} onClick={done ? undefined : skip}>
      <div className={`${styles.bubble} ${styles[activeNode.speaker ?? 'caller']}`}>
        {speakerLabel && (
          <div className={styles.speaker}>{speakerLabel}</div>
        )}
        <p className={styles.text}>
          {displayed}
          {!done && <span className={styles.cursor}>▋</span>}
        </p>
      </div>

      {done && activeNode.next && activeNode.type !== 'system' && (
        <button
          className={styles.continueBtn}
          onClick={() => advanceNode(activeNode.next)}
        >
          Continuar ↓
        </button>
      )}

      {!done && (
        <button className={styles.skipBtn} onClick={skip}>
          [Saltar]
        </button>
      )}
    </div>
  )
}

function getCallerFirstName(callerId) {
  const names = {
    harold_finch: 'Harold', margaret_hoffstead: 'Margaret', zipi: 'Zipi',
    vladímir: 'Vladímir', tomas: 'Tomás', unknown_caller: '???',
    self_caller: '[Tú]', ramona_flash: 'Ramona', aria4: 'ARIA-4',
    don_severino: 'Severino', yuki: 'Yuki', foxglove: 'Foxglove',
    insomnio: '...', neptuno_jr: 'Neptuno', cronista: 'Ernesto',
  }
  return names[callerId] ?? callerId
}
