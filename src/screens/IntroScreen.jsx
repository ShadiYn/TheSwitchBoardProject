import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useDialogue } from '@/hooks/useDialogue'
import { useAmbient, useBlip } from '@/hooks/useAudio'
import styles from './IntroScreen.module.css'

const NOTE_TEXT = `OPERADOR/A TURNO NOCHE
Centralita Municipal
00:00 — 06:00

Se requiere: paciencia.
No se requiere: experiencia.`

const LINES = [
  '...un trabajo.',
  'Turno de noche. Centralita Municipal.',
  'Nunca había oído hablar de este sitio.',
  '"Se requiere paciencia."',
  'Curioso que lo pongan por escrito.',
  '"No se requiere experiencia."',
  'Claro.',
  'Mañana empieza el turno.',
  'Supongo que iré.',
]

export default function IntroScreen() {
  const endIntro = useGameStore(s => s.endIntro)

  const [scene,   setScene]   = useState(0)
  const [visible, setVisible] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)

  const { fadeOut } = useAmbient(true)
  const blip = useBlip()

  const currentLine = scene === 1 ? LINES[lineIdx] : ''
  const { displayed, done, skip } = useDialogue(currentLine, 'normal')

  // Fade in al arrancar cada escena
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [scene])

  // Escena 0: avanza automático tras 2.5s
  useEffect(() => {
    if (scene !== 0) return
    const t = setTimeout(() => crossfadeTo(1), 2500)
    return () => clearTimeout(t)
  }, [scene])

  // Escena 2: fade out ambient + termina
  useEffect(() => {
    if (scene !== 2) return
    fadeOut(1200)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(() => endIntro(), 900)
    }, 2500)
    return () => clearTimeout(t)
  }, [scene])

  function crossfadeTo(next) {
    setVisible(false)
    setTimeout(() => { setScene(next); setLineIdx(0) }, 800)
  }

  function handleInteract() {
    if (scene === 0 || scene === 2) return
    if (!done) { skip(); return }
    blip()
    if (lineIdx < LINES.length - 1) {
      setLineIdx(i => i + 1)
    } else {
      crossfadeTo(2)
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (['Space','Enter','ArrowRight'].includes(e.code)) handleInteract()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scene, done, lineIdx])

  const isLastLine = lineIdx === LINES.length - 1

  return (
    <div
      className={`${styles.screen} ${visible ? styles.visible : ''}`}
      onClick={handleInteract}
    >
      {/* ── Escena 0: escritorio oscuro ── */}
      {scene === 0 && (
        <img src="/assets/desk_intro.png" alt="" className={styles.fullImg} />
      )}

      {/* ── Escena 1: sticky note + diálogo ── */}
      {scene === 1 && (
        <div className={styles.noteScene}>
          <div className={styles.noteWrap}>
            <img src="/assets/note_closeup.png" alt="Nota" className={styles.noteImg} />
            <pre className={styles.noteText}>{NOTE_TEXT}</pre>
          </div>
          <div className={styles.dialogueBox}>
            <span className={styles.cursor}>{'>'}</span>
            <span className={styles.playerText}>{displayed}</span>
            {done && (
              <span className={styles.continueHint}>
                {isLastLine ? '[continuar]' : '[siguiente]'}
              </span>
            )}
          </div>
          <div className={styles.lineCounter}>
            {LINES.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === lineIdx ? styles.dotActive : i < lineIdx ? styles.dotDone : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Escena 2: title card ── */}
      {scene === 2 && (
        <div className={styles.titleCard}>
          <p className={styles.titleText}>Al día siguiente.</p>
        </div>
      )}
    </div>
  )
}
