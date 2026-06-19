import React, { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useBlip, useFlipPage } from '@/hooks/useAudio'
import styles from './Notebook.module.css'

export default function NotebookPanel() {
  const notebookEntries = useGameStore(s => s.notebookEntries)
  const cluesFound      = useGameStore(s => s.cluesFound)
  const currentShift    = useGameStore(s => s.currentShift)
  const [tab, setTab]   = useState('log')
  const blip     = useBlip()
  const flipPage = useFlipPage()

  function changeTab(t) { flipPage(); setTab(t) }

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>📓 Cuaderno</span>
        <span className={styles.shift}>Turno {currentShift}</span>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab==='log'?styles.active:''}`} onClick={() => changeTab('log')}>Registro</button>
        <button className={`${styles.tab} ${tab==='clues'?styles.active:''}`} onClick={() => changeTab('clues')}>
          Pistas {cluesFound.length > 0 && <span className={styles.badge}>{cluesFound.length}</span>}
        </button>
      </div>

      <div className={styles.body}>
        {tab === 'log' && (
          notebookEntries.length === 0
            ? <p className={styles.empty}>Sin llamadas registradas.</p>
            : notebookEntries.slice(0, 20).map(e => (
                <div key={e.id} className={styles.entry}>
                  <div className={styles.entryShift}>T{e.shift}</div>
                  <p className={styles.entryText}>{e.text}</p>
                </div>
              ))
        )}
        {tab === 'clues' && (
          cluesFound.length === 0
            ? <p className={styles.empty}>Ninguna pista encontrada todavía.</p>
            : cluesFound.map(id => (
                <div key={id} className={styles.clue}>
                  <span className={styles.clueIcon}>❓</span>
                  <span className={styles.clueText}>{formatClue(id)}</span>
                </div>
              ))
        )}
      </div>
    </aside>
  )
}

function formatClue(id) {
  const map = {
    operator_files: 'Archivador: OPERADORES ANTERIORES — 7 fichas encontradas.',
    cat_mystery:    'El gato sabe cosas que no debería saber.',
    notebook_anomaly_1: 'Texto en el cuaderno que no escribí.',
  }
  return map[id] ?? id
}
