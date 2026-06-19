import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { loadCall } from '@/engines/callQueue'
import styles from './Office.module.css'

const CALLER_NAMES = {
  harold_finch:       'Harold Finch',
  margaret_hoffstead: 'Margaret Hoffstead',
  zipi:               'Zyx-7 "Zipi"',
  vladímir:           'Vladímir Sorokin',
  tomas:              'Tomás',
  unknown_caller:     'Número desconocido',
  self_caller:        '???',
  ramona_flash:       'Ramona Flash',
  aria4:              'ARIA-4',
  don_severino:       'Don Severino',
  yuki:               'Yuki Tanaka',
  foxglove:           'Srta. Foxglove',
  insomnio:           'El Insomnio',
  neptuno_jr:         'Neptuno Jr.',
  cronista:           'Voz antigua',
}

export default function OfficeScene() {
  const gamePhase        = useGameStore(s => s.gamePhase)
  const flags            = useGameStore(s => s.flags)
  const currentShift     = useGameStore(s => s.currentShift)
  const beginShift       = useGameStore(s => s.beginShift)
  const shiftCallQueue   = useGameStore(s => s.shiftCallQueue)
  const currentCallIndex = useGameStore(s => s.currentCallIndex)
  const answerCall       = useGameStore(s => s.answerCall)
  const finishCall       = useGameStore(s => s.finishCall)
  const officeState      = useGameStore(s => s.officeState)

  const [callData, setCallData] = useState(null)
  const [ring, setRing]         = useState(0)
  const [popup, setPopup]       = useState(null)

  const callId = shiftCallQueue[currentCallIndex]

  useEffect(() => {
    if (gamePhase !== 'RINGING' || !callId) return
    setCallData(null)
    loadCall(callId).then(setCallData)
  }, [callId, gamePhase])

  useEffect(() => {
    if (gamePhase !== 'RINGING') { setRing(0); return }
    const t = setInterval(() => setRing(r => r + 1), 700)
    return () => clearInterval(t)
  }, [gamePhase])

  if (gamePhase !== 'IDLE' && gamePhase !== 'RINGING') return null

  const isRinging = gamePhase === 'RINGING'
  const callerName = callData ? (CALLER_NAMES[callData.callerId] ?? callData.callerId) : null

  function handlePhoneClick() {
    if (isRinging && callData) answerCall(callData)
    else if (!isRinging) beginShift()
  }

  return (
    <div className={styles.scene}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.shiftLabel}>Turno {currentShift}</span>
        <span className={`${styles.status} ${isRinging ? styles.statusRinging : ''}`}>
          {isRinging ? '☎ Entrando llamada…' : 'En espera'}
        </span>
      </div>

      {/* Desk */}
      <div className={styles.deskWrap}>
        <img
          src={isRinging ? '/assets/desk_ringing.png' : '/assets/desk_idle.png'}
          alt="Escritorio"
          className={styles.deskImg}
        />

        {/* ── Hotspot teléfono ── */}
        <button
          className={`${styles.hotspot} ${styles.hotspotPhone} ${isRinging ? styles.hotspotRinging : ''}`}
          onClick={handlePhoneClick}
          title={isRinging ? 'Descolgar' : 'Contestar teléfono'}
        >
          {isRinging && (
            <div className={styles.ringPulse} />
          )}
          {isRinging && callerName && (
            <div className={styles.callerBubble}>{callerName}</div>
          )}
          {isRinging && (
            <div className={styles.ringDots}>
              {[0,1,2].map(i => (
                <span key={i} className={`${styles.ringDot} ${ring % 3 === i ? styles.ringDotActive : ''}`} />
              ))}
            </div>
          )}
        </button>

        {/* Anomalías */}
        {officeState.lightFlicker && (
          <div className={styles.anomalyOverlay}>⚡ La luz parpadea.</div>
        )}
      </div>

      {/* Popup genérico */}
      {popup && (
        <div className={styles.popup} onClick={() => setPopup(null)}>
          <p className={styles.popupText}>{popup}</p>
          <span className={styles.popupClose}>[cerrar]</span>
        </div>
      )}
    </div>
  )
}
