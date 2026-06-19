import React from 'react'
import { useGameStore } from '@/store/gameStore'
import departments from '@/data/departments.json'
import styles from './Department.module.css'

export default function TransferPanel() {
  const gamePhase    = useGameStore(s => s.gamePhase)
  const activeNode   = useGameStore(s => s.activeNode)
  const flags        = useGameStore(s => s.flags)
  const transferCall = useGameStore(s => s.transferCall)
  const advanceNode  = useGameStore(s => s.advanceNode)

  if (gamePhase !== 'TRANSFER') return null

  // If the node specifies a fixed department, show confirmation
  const fixedDept = activeNode?.department
  if (fixedDept) {
    const dept = departments.find(d => d.id === fixedDept)
    return (
      <div className={styles.panel}>
        <div className={styles.label}>Transfiriendo a</div>
        <div className={styles.deptCard} style={{ borderColor: 'var(--teal)' }}>
          <span className={styles.emoji}>{dept?.emoji}</span>
          <div>
            <div className={styles.deptName}>{dept?.name}</div>
            <div className={styles.deptExt}>Ext. {dept?.extension}</div>
          </div>
        </div>
        <button
          className={styles.confirmBtn}
          onClick={() => transferCall(fixedDept)}
        >
          Confirmar transferencia
        </button>
      </div>
    )
  }

  // Free-choice transfer
  return (
    <div className={styles.panel}>
      <div className={styles.label}>Seleccionar departamento</div>
      <div className={styles.grid}>
        {departments.map(dept => {
          const isUnknown = dept.id === 'unknown'
          const chaos = useGameStore.getState().stats.chaos
          if (isUnknown && chaos < 15 && !flags['used_unknown_dept']) return null
          return (
            <button
              key={dept.id}
              className={`${styles.deptBtn} ${isUnknown ? styles.unknown : ''}`}
              onClick={() => transferCall(dept.id)}
            >
              <span className={styles.emoji}>{dept.emoji}</span>
              <div className={styles.deptInfo}>
                <div className={styles.deptName}>{dept.shortName}</div>
                <div className={styles.deptExt}>Ext. {dept.extension}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
