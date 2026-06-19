import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { listSlots, deleteSlot } from '@/engines/saveLoad'
import styles from './TitleScreen.module.css'

export default function TitleScreen() {
  const startNewGame = useGameStore(s => s.startNewGame)
  const loadSave     = useGameStore(s => s.loadSave)
  const [slots, setSlots]   = useState([])
  const [view,  setView]    = useState('title') // 'title' | 'slots' | 'load'

  useEffect(() => { setSlots(listSlots()) }, [view])

  function handleNew(slot) {
    startNewGame(slot)
  }

  function handleLoad(slot) {
    loadSave(slot)
  }

  function handleDelete(slot) {
    deleteSlot(slot)
    setSlots(listSlots())
  }

  function fmtDate(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        {view === 'title' && (
          <>
            <div className={styles.eyebrow}>Una centralita misteriosa · Turno de noche</div>
            <h1 className={styles.title}>The Switchboard</h1>
            <p className={styles.tagline}>Cada llamada tiene una historia.<br />Algunas no deberían ser posibles.</p>
            <div className={styles.buttons}>
              <button className={styles.btnPrimary} onClick={() => setView('slots')}>
                Nueva partida
              </button>
              <button className={styles.btnSecondary} onClick={() => setView('load')}>
                Cargar partida
              </button>
            </div>
            <div className={styles.footer}>
              <span>Noche de guardia: 00:00</span>
            </div>
          </>
        )}

        {view === 'slots' && (
          <>
            <div className={styles.backRow}>
              <button className={styles.backBtn} onClick={() => setView('title')}>← Volver</button>
              <span className={styles.sectionTitle}>Seleccionar ranura</span>
            </div>
            <div className={styles.slotList}>
              {slots.map(s => (
                <button
                  key={s.slot}
                  className={styles.slotBtn}
                  onClick={() => handleNew(s.slot)}
                >
                  <span className={styles.slotNum}>Ranura {s.slot + 1}</span>
                  {s.empty
                    ? <span className={styles.slotEmpty}>— vacía —</span>
                    : <span className={styles.slotMeta}>
                        Turno {s.shift} · {fmtDate(s.savedAt)}
                        <span className={styles.slotOverwrite}>(sobrescribir)</span>
                      </span>
                  }
                </button>
              ))}
            </div>
          </>
        )}

        {view === 'load' && (
          <>
            <div className={styles.backRow}>
              <button className={styles.backBtn} onClick={() => setView('title')}>← Volver</button>
              <span className={styles.sectionTitle}>Cargar partida</span>
            </div>
            <div className={styles.slotList}>
              {slots.map(s => (
                <div key={s.slot} className={styles.slotRow}>
                  <button
                    className={styles.slotBtn}
                    disabled={s.empty}
                    onClick={() => !s.empty && handleLoad(s.slot)}
                  >
                    <span className={styles.slotNum}>Ranura {s.slot + 1}</span>
                    {s.empty
                      ? <span className={styles.slotEmpty}>— vacía —</span>
                      : <span className={styles.slotMeta}>Turno {s.shift} · {fmtDate(s.savedAt)}</span>
                    }
                  </button>
                  {!s.empty && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(s.slot)}
                      title="Borrar"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
