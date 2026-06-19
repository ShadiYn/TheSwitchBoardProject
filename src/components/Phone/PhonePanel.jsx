import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { loadCall } from '@/engines/callQueue'
import styles from './Phone.module.css'

export default function PhonePanel() {
  const gamePhase        = useGameStore(s => s.gamePhase)
  const shiftCallQueue   = useGameStore(s => s.shiftCallQueue)
  const currentCallIndex = useGameStore(s => s.currentCallIndex)
  const relationships    = useGameStore(s => s.relationships)
  const answerCall       = useGameStore(s => s.answerCall)
  const finishCall       = useGameStore(s => s.finishCall)

  const [callData, setCallData] = useState(null)
  const [ring,     setRing]     = useState(0)

  const callId = shiftCallQueue[currentCallIndex]

  // Load call data when queue advances
  useEffect(() => {
    if (!callId) return
    setCallData(null)
    loadCall(callId).then(setCallData)
  }, [callId])

  // Ring counter for animation
  useEffect(() => {
    if (gamePhase !== 'RINGING') return
    const t = setInterval(() => setRing(r => r + 1), 1200)
    return () => clearInterval(t)
  }, [gamePhase])

  if (gamePhase !== 'RINGING' || !callData) return null

  const rel = relationships[callData.callerId] ?? 0

  return (
    <div className={styles.panel}>
      <div className={`${styles.phone} ${styles.ringing}`}>
        {/* Ringing indicator */}
        <div className={styles.ringRow}>
          {[0,1,2].map(i => (
            <span key={i} className={`${styles.ringDot} ${ring % 3 === i ? styles.active : ''}`} />
          ))}
        </div>

        <div className={styles.callerCard}>
          <div className={styles.callerEmoji}>{getCallerEmoji(callData.callerId)}</div>
          <div className={styles.callerInfo}>
            <div className={styles.callerName}>{getCallerName(callData.callerId)}</div>
            <div className={styles.callerMood}>{moodLabel(callData.moodOnAnswer)}</div>
            {rel > 3 && <div className={styles.relHint}>☆ Caller conocido</div>}
          </div>
        </div>

        <div className={styles.buttons}>
          <button
            className={styles.btnAnswer}
            onClick={() => answerCall(callData)}
            disabled={!callData}
          >
            ↗ Contestar
          </button>
          <button
            className={styles.btnIgnore}
            onClick={finishCall}
          >
            ✕ Ignorar
          </button>
        </div>
      </div>
    </div>
  )
}

// Helpers — read from callers data at runtime via a simple lookup
const CALLER_META = {
  harold_finch:      { name: 'Harold Finch',     emoji: '🐉' },
  margaret_hoffstead:{ name: 'Margaret Hoffstead',emoji: '👩‍🦳' },
  zipi:              { name: 'Zyx-7 "Zipi"',     emoji: '👽' },
  vladímir:          { name: 'Vladímir Sorokin',  emoji: '🧛' },
  tomas:             { name: 'Tomás',             emoji: '👦' },
  unknown_caller:    { name: 'Número desconocido',emoji: '📵' },
  self_caller:       { name: '???',              emoji: '🔮' },
  ramona_flash:      { name: 'Ramona Flash',      emoji: '🎸' },
  aria4:             { name: 'ARIA-4',            emoji: '🤖' },
  don_severino:      { name: 'Don Severino',      emoji: '🏔' },
  yuki:              { name: 'Yuki Tanaka',       emoji: '🌸' },
  foxglove:          { name: 'Srta. Foxglove',    emoji: '🦊' },
  insomnio:          { name: 'El Insomnio',       emoji: '🌙' },
  neptuno_jr:        { name: 'Neptuno Jr.',       emoji: '🌊' },
  cronista:          { name: 'Voz antigua',       emoji: '👴' },
}

function getCallerName(id) { return CALLER_META[id]?.name ?? id }
function getCallerEmoji(id) { return CALLER_META[id]?.emoji ?? '📞' }

function moodLabel(mood) {
  const map = {
    worried: 'Preocupado/a', flustered: 'Atropellado/a', excited: 'Emocionado/a',
    urgent: 'Urgente', formal: 'Formal', confused: 'Confundido/a',
    serious: 'Serio/a', concerned: 'Preocupado/a', melancholy: 'Melancólico/a',
    eerie: 'Extraño', anxious: 'Ansioso/a', energetic: 'Energético/a',
    calm: 'Tranquilo/a', precise: 'Preciso/a', frightened_whisper: 'Asustado/a',
    sad_resolved: 'Decidido/a', slow_heavy: '... ...', anxious_fast: '¡Urgente!',
    old_urgent: 'Urgente', impossible: '???', controlled_angry: 'Contenido/a',
  }
  return map[mood] ?? mood
}
