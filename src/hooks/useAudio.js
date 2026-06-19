import { useRef, useEffect, useCallback } from 'react'

// ── Ambient ───────────────────────────────────────────
const ambientAudio = new Audio('/assets/ambient_sound.mp3')
ambientAudio.loop   = true
ambientAudio.volume = 0.35

export function useAmbient(playing = true) {
  useEffect(() => {
    if (playing) ambientAudio.play().catch(() => {})
    else         ambientAudio.pause()
  }, [playing])

  const fadeOut = useCallback((duration = 1500) => {
    const original = ambientAudio.volume
    const step = original / (duration / 50)
    const t = setInterval(() => {
      if (ambientAudio.volume > step) {
        ambientAudio.volume = Math.max(0, ambientAudio.volume - step)
      } else {
        ambientAudio.volume = 0
        ambientAudio.pause()
        ambientAudio.currentTime = 0
        ambientAudio.volume = original
        clearInterval(t)
      }
    }, 50)
  }, [])

  return { fadeOut }
}

// ── SFX simples ───────────────────────────────────────
function playSfx(src, volume = 1) {
  const audio = new Audio(src)
  audio.volume = volume
  audio.play().catch(() => {})
}

export function useBlip() {
  return useCallback(() => playSfx('/assets/blip_ui.mp3', 0.6), [])
}

export function useFlipPage() {
  return useCallback(() => playSfx('/assets/flip_page.mp3', 0.8), [])
}

// ── Animal Crossing voice ─────────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

const VOICE_PROFILES = {
  harold_finch:       { freq: 130, type: 'sine',     duration: 0.07 },
  margaret_hoffstead: { freq: 280, type: 'sine',     duration: 0.06 },
  zipi:               { freq: 520, type: 'square',   duration: 0.05 },
  vladímir:           { freq: 110, type: 'sawtooth', duration: 0.08 },
  tomas:              { freq: 200, type: 'sine',     duration: 0.06 },
  unknown_caller:     { freq:  90, type: 'sawtooth', duration: 0.09 },
  self_caller:        { freq: 180, type: 'sine',     duration: 0.06 },
  ramona_flash:       { freq: 320, type: 'sine',     duration: 0.05 },
  aria4:              { freq: 440, type: 'square',   duration: 0.05 },
  don_severino:       { freq: 105, type: 'sine',     duration: 0.09 },
  yuki:               { freq: 300, type: 'sine',     duration: 0.06 },
  foxglove:           { freq: 260, type: 'sine',     duration: 0.07 },
  insomnio:           { freq:  80, type: 'sine',     duration: 0.10 },
  neptuno_jr:         { freq: 160, type: 'sine',     duration: 0.07 },
  cronista:           { freq: 115, type: 'sawtooth', duration: 0.09 },
}

const DEFAULT_PROFILE = { freq: 200, type: 'sine', duration: 0.07 }

export function playCharacterBlip(callerId, char) {
  if (!char || char === ' ' || char === '\n') return
  const profile = VOICE_PROFILES[callerId] ?? DEFAULT_PROFILE

  try {
    const osc    = audioCtx.createOscillator()
    const gain   = audioCtx.createGain()
    const now    = audioCtx.currentTime

    // Variación leve de pitch por carácter para que no sea monótono
    const pitchVariation = 1 + (char.charCodeAt(0) % 7 - 3) * 0.015
    osc.frequency.value = profile.freq * pitchVariation
    osc.type = profile.type

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + profile.duration)

    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(now)
    osc.stop(now + profile.duration)
  } catch {}
}

// ── Voces por personaje ───────────────────────────────
const MALE_CALLERS = new Set([
  'harold_finch', 'tomas', 'vladímir', 'don_severino', 'neptuno_jr', 'cronista', 'insomnio'
])
const FEMALE_CALLERS = new Set([
  'margaret_hoffstead', 'ramona_flash', 'yuki', 'foxglove', 'aria4'
])
// unknown_caller y self_caller → random

function getVoiceSrc(callerId) {
  if (callerId === 'zipi') return '/assets/voice_zipi.mp3'
  if (callerId === 'harold_finch') return '/assets/voice_harold.mp3'
  if (callerId === 'margaret_hoffstead') return '/assets/voice_margaret.mp3'
  if (MALE_CALLERS.has(callerId))   return '/assets/voice_harold.mp3'
  if (FEMALE_CALLERS.has(callerId)) return '/assets/voice_margaret.mp3'
  // desconocido/self → random
  return Math.random() < 0.5 ? '/assets/voice_harold.mp3' : '/assets/voice_margaret.mp3'
}

// ── Tono del teléfono ─────────────────────────────────
const phoneAudio = new Audio('/assets/phone_tone.mp3')
phoneAudio.loop   = true
phoneAudio.volume = 0.7

export function usePhoneTone() {
  const play = useCallback(() => {
    phoneAudio.currentTime = 0
    phoneAudio.play().catch(() => {})
  }, [])

  const stop = useCallback(() => {
    phoneAudio.pause()
    phoneAudio.currentTime = 0
  }, [])

  return { play, stop }
}

// Una sola instancia de voz activa a la vez
let activeVoice = null

function stopVoice() {
  if (activeVoice) {
    activeVoice.pause()
    activeVoice.currentTime = 0
    activeVoice = null
  }
}

function playVoice(callerId) {
  stopVoice()
  const src = getVoiceSrc(callerId)
  const audio = new Audio(src)
  audio.volume = 0.75
  activeVoice = audio
  audio.play().catch(() => {})
}

// Hook para usar en DialoguePanel
export function useCallerVoice() {
  return { playVoice, stopVoice }
}
